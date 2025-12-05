// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDh9MuoMlw7ni87mwNYSo0VgatD0zKY1u8",
    authDomain: "sustainable-marketplace-466a3.firebaseapp.com",
    projectId: "sustainable-marketplace-466a3",
    storageBucket: "sustainable-marketplace-466a3.firebasestorage.app",
    messagingSenderId: "786953426938",
    appId: "1:786953426938:web:9ec0be68ffda803104b643"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication Functions
export const registerUser = async (userData) => {
    try {
        // Create user with email/password
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );
        
        // Update profile with name
        await updateProfile(userCredential.user, {
            displayName: userData.name
        });
        
        // Create user document in Firestore
        const userDoc = {
            uid: userCredential.user.uid,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            location: userData.location || '',
            userType: userData.userType || 'regular',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            itemsListed: 0,
            itemsDonated: 0,
            carbonSaved: 0,
            waterSaved: 0,
            landfillReduced: 0,
            profileImage: ''
        };
        
        await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
        
        return {
            success: true,
            message: "Registration successful!",
            user: userCredential.user
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            success: true,
            message: "Login successful!",
            user: userCredential.user
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true, message: "Logged out successfully!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get additional user data from Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    resolve({
                        ...user,
                        ...userDoc.data()
                    });
                } else {
                    resolve(user);
                }
            } else {
                resolve(null);
            }
            unsubscribe();
        });
    });
};

// Firestore Functions
export const addItem = async (itemData, images) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // Upload images to Firebase Storage
        const imageUrls = [];
        if (images && images.length > 0) {
            for (const image of images) {
                const storageRef = ref(storage, `items/${Date.now()}_${image.name}`);
                await uploadBytes(storageRef, image);
                const url = await getDownloadURL(storageRef);
                imageUrls.push(url);
            }
        } else {
            // Use placeholder image
            imageUrls.push(`https://via.placeholder.com/400x300/90EE90/2E8B57?text=${encodeURIComponent(itemData.name)}`);
        }

        const itemDoc = {
            ...itemData,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userEmail: user.email,
            imageUrls,
            status: 'available',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0,
            likes: 0,
            location: itemData.location || 'Unknown'
        };

        const docRef = await addDoc(collection(db, "items"), itemDoc);
        
        // Update user's itemsListed count
        await updateUserStats(user.uid, { itemsListed: 1 });
        
        return {
            success: true,
            message: "Item added successfully!",
            itemId: docRef.id
        };
    } catch (error) {
        console.error("Add item error:", error);
        return {
            success: false,
            message: error.message
        };
    }
};

export const getAllItems = async (filters = {}) => {
    try {
        let itemsQuery = collection(db, "items");
        const constraints = [where("status", "==", "available")];
        
        if (filters.category && filters.category !== 'all') {
            constraints.push(where("category", "==", filters.category));
        }
        
        if (filters.location) {
            constraints.push(where("location", "==", filters.location));
        }
        
        constraints.push(orderBy("createdAt", "desc"));
        
        const q = query(itemsQuery, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return items;
    } catch (error) {
        console.error("Get items error:", error);
        return [];
    }
};

export const getItemById = async (itemId) => {
    try {
        const docRef = doc(db, "items", itemId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Get item error:", error);
        return null;
    }
};

export const getUserItems = async (userId) => {
    try {
        const q = query(
            collection(db, "items"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return items;
    } catch (error) {
        console.error("Get user items error:", error);
        return [];
    }
};

export const updateItem = async (itemId, updates) => {
    try {
        const docRef = doc(db, "items", itemId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        
        return { success: true, message: "Item updated successfully!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const deleteItem = async (itemId) => {
    try {
        const docRef = doc(db, "items", itemId);
        await deleteDoc(docRef);
        
        return { success: true, message: "Item deleted successfully!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const updateUserStats = async (userId, updates) => {
    try {
        const docRef = doc(db, "users", userId);
        const userDoc = await getDoc(docRef);
        
        if (userDoc.exists()) {
            const currentData = userDoc.data();
            
            // Calculate environmental impact
            let newCarbonSaved = currentData.carbonSaved || 0;
            let newWaterSaved = currentData.waterSaved || 0;
            let newLandfillReduced = currentData.landfillReduced || 0;
            
            if (updates.itemsListed) {
                // Per item: 2.5kg CO2, 1000L water, 0.05m³ landfill saved
                newCarbonSaved += updates.itemsListed * 2.5;
                newWaterSaved += updates.itemsListed * 1000;
                newLandfillReduced += updates.itemsListed * 0.05;
            }
            
            await updateDoc(docRef, {
                ...updates,
                carbonSaved: newCarbonSaved,
                waterSaved: newWaterSaved,
                landfillReduced: newLandfillReduced,
                updatedAt: serverTimestamp()
            });
            
            return { success: true };
        }
    } catch (error) {
        console.error("Update user stats error:", error);
        return { success: false, message: error.message };
    }
};

export const getUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Get user data error:", error);
        return null;
    }
};

// Export Firebase instances
export { auth, db, storage };