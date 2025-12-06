// File: ABC1/script.js

// Firebase Configuration


// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = 'dyvuqtegk';
const CLOUDINARY_UPLOAD_PRESET = 'Itemss';

// Make Call Function - Triggers phone dialer
function makeCall(phoneNumber) {
    if (!phoneNumber) {
        alert('Phone number not available');
        return;
    }
    // Create tel link and open it
    const telLink = 'tel:' + phoneNumber;
    window.location.href = telLink;
}

const firebaseConfig = {
  apiKey: "AIzaSyDh9MuoMlw7ni87mwNYSo0VgatD0zKY1u8",
  authDomain: "sustainable-marketplace-466a3.firebaseapp.com",
  projectId: "sustainable-marketplace-466a3",
  storageBucket: "sustainable-marketplace-466a3.firebasestorage.app",
  messagingSenderId: "786953426938",
  appId: "1:786953426938:web:9ec0be68ffda803104b643",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Ensure read access even when logged out by using anonymous auth (helps when Firestore rules require auth)
async function ensureReadAuth() {
  try {
    if (!auth.currentUser) {
      await auth.signInAnonymously();
    }
  } catch (err) {
    console.error("Anonymous auth failed:", err);
  }
}

// Global state
let currentUser = null;

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  // Check auth state
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      // Get user data from Firestore
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        currentUser = { ...user, ...userDoc.data() };
      }
    } else {
      // Only sign in anonymously if not in the middle of logging out
      const isLoggingOut = sessionStorage.getItem('isLoggingOut');
      if (!isLoggingOut) {
        await ensureReadAuth();
      }
    }
    updateAuthUI();
    initializePage();
    
    // Update stats after auth is ready
    await updateLiveStats();

  });
});

// Update authentication UI
function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userGreeting = document.getElementById("userGreeting");
  const dashboardLink = document.querySelector('a[href="dashboard.html"]');
  const addItemLink = document.querySelector('a[href="add-item.html"]');

 
  const signUpBtn = document.querySelector('a[href="register.html"]');
  const navLinks = document.querySelector('.nav-links'); 

  // Check if user is logged in AND not anonymous
  if (currentUser && !currentUser.isAnonymous) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signUpBtn) signUpBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (userGreeting) {
      userGreeting.textContent = `Hello, ${
        currentUser.displayName || currentUser.name || "User"
      }`;
      userGreeting.style.display = "inline";
    }
  } else {
    // User is logged out or anonymous
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (signUpBtn) signUpBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userGreeting) userGreeting.style.display = "none";
  }
}

// Initialize page-specific functionality
function initializePage() {
  const page = window.location.pathname.split("/").pop();

  switch (page) {
    case "index.html":
    case "":
      initHomePage();
      break;
    case "login.html":
      initLoginPage();
      break;
    case "register.html":
      initRegisterPage();
      break;
    case "add-item.html":
      initAddItemPage();
      break;
    case "marketplace.html":
      initMarketplacePage();
      break;
    case "dashboard.html":
      initDashboardPage();
      break;
    case "item-detail.html":
      initItemDetailPage();
      break;
    case "ngo-register.html":
      initNGORegisterPage();
      break;
    case "ngo-dashboard.html":
      initNGODashboardPage();
      break;
  }
}

// Home Page
async function initHomePage() {
  // Load featured items
  try {
    const itemsSnapshot = await db
      .collection("items")
      .where("status", "==", "available")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();

    const featuredItemsContainer = document.getElementById("featuredItems");

    if (featuredItemsContainer) {
        if (!itemsSnapshot.empty) {
          const items = [];
          itemsSnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });

          // Render the item cards
          featuredItemsContainer.innerHTML = items
            .map(
              (item) => `
                <div class="item-card">
                    <img src="${
                      item.imageUrls && item.imageUrls.length > 0
                        ? item.imageUrls[0]
                        : "https://via.placeholder.com/300x200/90EE90/2E8B57?text=" +
                          encodeURIComponent(item.name)
                    }" 
                         alt="${item.name}" class="item-image">
                    <div class="item-content">
                        <span class="item-category">${item.category}</span>
                        <h3 class="item-title">${item.name}</h3>
                        <p class="item-description">${
                          item.description
                            ? item.description.substring(0, 100) + "..."
                            : "No description available"
                        }</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                            <span style="font-weight: bold; color: var(--primary-green);">
                                <i class="fas fa-map-marker-alt"></i> ${
                                  item.location || "Unknown"
                                }
                            </span>
                            <a href="item-detail.html?id=${
                              item.id
                            }" class="btn btn-primary" style="padding: 5px 15px;">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            `
            )
            .join("");
        } else {
          // If no items are found, show a message and the List button
          featuredItemsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p style="margin-bottom: 1rem;">No items listed yet. Be the first to list an item!</p>
                    <a href="add-item.html" class="btn btn-primary">List First Item</a>
                </div>
            `;
        }
    }
  } catch (error) {
    console.error("Error loading featured items:", error);
    // Optionally, show a notification on error, but keeping silent is often better for a homepage component
  }
}

// Helper function for animation
function animateValue(obj, start, end, duration) {
    if (!obj) return; // FIX: Null check added here

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Handle large numbers and decimals for better display
        let value = progress * (end - start) + start;
        
        // Apply K abbreviation for numbers over 1000
        if (end > 1000) {
            obj.textContent = (Math.floor(value) / 1000).toFixed(1) + "K";
        } else {
            // Raw count for NGOs
            obj.textContent = Math.floor(value).toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure the final value is displayed accurately after animation
            if (end > 1000) {
                obj.textContent = (end / 1000).toFixed(1) + "K";
            } else {
                obj.textContent = end.toLocaleString();
            }
        }
    };
    window.requestAnimationFrame(step);
}

// Function to fetch and update all homepage stats dynamically
async function updateLiveStats() {
    // Get all required elements
    const totalItemsSavedElement = document.getElementById("totalItemsSaved");
    const totalCarbonReducedElement = document.getElementById("totalCarbonReduced");
    const activeNGOsElement = document.getElementById("activeNGOs");
    const communityMembersElement = document.getElementById("communityMembers");

    // If elements don't exist (not on homepage), exit early
    if (!totalItemsSavedElement || !totalCarbonReducedElement) {
        return;
    }

    // Initialize accumulators
    let totalCarbonSaved = 0;
    let activeNGOs = 0;
    let communityMembers = 0;
    let totalItems = 0; 
    
    try {
        // Ensure we have authentication (even anonymous)
        if (!auth.currentUser) {
            await ensureReadAuth();
        }

        // Fetch ALL users and ALL items in parallel
        const [usersSnapshot, itemsSnapshot] = await Promise.all([
            db.collection("users").get(),
            db.collection("items").get()
        ]);
        
        // 1. Calculate Total Items Saved
        totalItems = itemsSnapshot.size;

        // 2. Calculate Carbon, NGOs, and Members from users collection
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            totalCarbonSaved += (userData.carbonSaved || 0); // Sum carbon saved across all users
            
            if (userData.userType === 'ngo') {
                activeNGOs++;
            } else if (userData.userType === 'regular') {
                communityMembers++;
            }
        });

        // Update HTML with animation
        animateValue(totalItemsSavedElement, 0, totalItems, 2000);
        animateValue(totalCarbonReducedElement, 0, totalCarbonSaved, 2000);
        if (activeNGOsElement) animateValue(activeNGOsElement, 0, activeNGOs, 2000);
        if (communityMembersElement) animateValue(communityMembersElement, 0, communityMembers, 2000);

    } catch (error) {
        console.error("Error updating live stats:", error);
        // Fallback: Show default values
        if (totalItemsSavedElement) totalItemsSavedElement.textContent = "40";
        if (totalCarbonReducedElement) totalCarbonReducedElement.textContent = "40";
        if (activeNGOsElement) activeNGOsElement.textContent = "3";
        if (communityMembersElement) communityMembersElement.textContent = "2";
    }
}

// Login Page
function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      submitBtn.disabled = true;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(
          email,
          password
        );
        
        // 1. Fetch user data immediately to check userType
        const userDoc = await db.collection("users").doc(userCredential.user.uid).get();
        const userData = userDoc.data();
        
        showNotification("Login successful!", "success");
        setTimeout(() => {
          // 2. Redirect based on userType
          if (userData && userData.userType === 'ngo') {
             window.location.href = "ngo-dashboard.html"; // Redirect NGO to their dashboard
          } else {
             window.location.href = "dashboard.html"; // Default (regular) user dashboard
          }
        }, 1000);
      } catch (error) {
        showNotification("invalid Email or Password ","error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Register Page
function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
        userType: "regular",
      };

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Registering...';
      submitBtn.disabled = true;

      try {
        // Create user with email/password
        const userCredential = await auth.createUserWithEmailAndPassword(
          userData.email,
          userData.password
        );

        // Update profile with name
        await userCredential.user.updateProfile({
          displayName: userData.name,
        });

        // Create user document in Firestore
        await db.collection("users").doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          location: userData.location,
          userType: "regular",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          itemsListed: 0,
          carbonSaved: 0,
          waterSaved: 0,
          landfillReduced: 0,
        });

        showNotification("Registration successful!", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } catch (error) {
        showNotification(error.message, "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Add Item Page (RE-INTEGRATED LOGIC FOR RELIABILITY)
function initAddItemPage() {
    const addItemForm = document.getElementById("addItemForm");
    
    // Check if the current user is ready before binding the form logic
    if (!currentUser) {
        // If the user object is not yet available, show a temporary message 
        // and let the onAuthStateChanged listener handle the final state.
        // However, for immediate feedback on this page, the redirect is needed.
        // This is the intended FIX for the race condition.
        // We ensure we have the user BEFORE binding the submit listener.
        if (addItemForm) addItemForm.style.display = 'none'; // Hide form until user is confirmed
        
        // The onAuthStateChanged listener should eventually populate currentUser.
        // If this page is loaded directly and currentUser is null, this blocks submission.
        showNotification("Please wait for login status...", "info");
        
        // Add a secondary check after a short delay (in case onAuthStateChanged is slow)
        setTimeout(() => {
            if (!currentUser) {
                showNotification("Please login to list items", "error");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            }
        }, 500);

        return; // Exit if user is not ready
    }
    
    // If we reach here, currentUser is set, so we proceed to bind the form
    if (addItemForm) {
        addItemForm.style.display = 'block'; // Ensure form is visible
        
        addItemForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const actionType = document.querySelector('input[name="actionType"]:checked').value;
            const isDonation = actionType === 'donate';

            // 1. GATHER DATA
            let itemPrice = isDonation ? 0 : (document.getElementById("price").value || 0);
            itemPrice = parseFloat(itemPrice); 
            
            if (actionType === 'sell' && (isNaN(itemPrice) || itemPrice < 0)) {
                showNotification("Please enter a valid selling price (0 or higher).", "error");
                return;
            }
            if (isDonation || itemPrice === '') {
                itemPrice = 0;
            }

            const itemData = {
                name: document.getElementById("itemName").value,
                category: document.getElementById("category").value,
                condition: document.getElementById("condition").value,
                description: document.getElementById("description").value,
                materials: document.getElementById("materials").value,
                location: document.getElementById("location").value,
            };
            
            const images = document.getElementById("itemImages").files;
            
            const submitBtn = addItemForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listing Item...';
            submitBtn.disabled = true;

            try {
                const imageUrls = [];

                // UPLOAD IMAGES TO CLOUDINARY
                if (images && images.length > 0) {
                    for (const image of images) {
                        const formData = new FormData();
                        formData.append('file', image);
                        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                        formData.append('folder', 'items');
                        
                        const response = await fetch(
                            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                            { method: 'POST', body: formData }
                        );
                        
                        if (!response.ok) throw new Error(`Image upload failed: ${response.statusText}`);
                        const data = await response.json();
                        imageUrls.push(data.secure_url);
                    }
                } else {
                    imageUrls.push(`https://via.placeholder.com/400x300/90EE90/2E8B57?text=${encodeURIComponent(itemData.name)}`);
                }

                // DEFINE ITEM DATA with Price and Donation Status
                const itemDoc = {
                    ...itemData,
                    price: itemPrice, 
                    userId: currentUser.uid,
                    userName: currentUser.displayName || currentUser.name,
                    userEmail: currentUser.email,
                    imageUrls,
                    status: 'available',
                    donationStatus: isDonation ? 'Pending Donation' : `Listed for ₹${itemPrice.toFixed(2)}`,
                    isDonation: isDonation, 
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    views: 0,
                    likes: 0,
                };

                await db.collection("items").add(itemDoc);

                // UPDATE USER STATS
                const updateData = {
                    itemsListed: firebase.firestore.FieldValue.increment(1),
                    carbonSaved: firebase.firestore.FieldValue.increment(2.5),       
                    waterSaved: firebase.firestore.FieldValue.increment(1000),      
                    landfillReduced: firebase.firestore.FieldValue.increment(0.05), 
                };

                if (isDonation) {
                     updateData.itemsDonated = firebase.firestore.FieldValue.increment(1);
                }
                
                await db.collection("users").doc(currentUser.uid).update(updateData);
                
                showNotification(`Item listed as ${isDonation ? 'Donation' : 'Sale'} successfully!`, "success");
                setTimeout(() => {
                    window.location.href = "marketplace.html";
                }, 1500);
            } catch (error) {
                console.error("Add item error:", error);
                showNotification(error.message, "error"); 
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Get AI Recommendations from Add Item Form
window.getAIRecommendationsFromForm = async function() {
    const aiBtn = document.getElementById("aiRecommendBtn");
    const originalText = aiBtn ? aiBtn.innerHTML : '';
    
    if (aiBtn) {
        aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Recommendations...';
        aiBtn.disabled = true;
    }
    
    try {
        const itemData = {
            name: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            condition: document.getElementById("condition").value,
            description: document.getElementById("description").value,
            materials: document.getElementById("materials").value,
        };
        
        // Validate basic fields
        if (!itemData.name || !itemData.category || !itemData.condition) {
            showNotification("Please fill in item name, category, and condition", "error");
            if (aiBtn) {
                aiBtn.innerHTML = originalText;
                aiBtn.disabled = false;
            }
            return;
        }
        
        // Get recommendations based on item type
        const recommendations = getRecommendationsBasedOnItem(itemData);
        
        // Display AI recommendations
        const aiSection = document.getElementById("aiSection");
        const aiResults = document.getElementById("aiResults");
        
        if (aiSection && aiResults) {
            aiSection.style.display = "block";
            aiResults.innerHTML = `
                <div style="background: #f0f8ff; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--primary-green);">
                    <h4 style="color: var(--primary-green); margin-bottom: 0.5rem; margin-top: 0;">
                        <i class="fas fa-lightbulb"></i> Recommendation
                    </h4>
                    <p style="margin: 0; font-size: 1rem; font-weight: 600;">${recommendations.action}</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid var(--accent-blue);">
                    <h4 style="color: var(--accent-blue); margin-bottom: 0.5rem; margin-top: 0;">
                        <i class="fas fa-info-circle"></i> Why This Matters
                    </h4>
                    <p style="margin: 0;">${recommendations.reason}</p>
                </div>
                
                <div style="background: #fff8e1; padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--warning);">
                    <h4 style="color: var(--warning); margin-bottom: 0.5rem; margin-top: 0;">
                        <i class="fas fa-leaf"></i> Environmental Impact
                    </h4>
                    <p style="margin: 0;">${recommendations.impact}</p>
                </div>
            `;
        }
        
        // Show facility finder and display appropriate facilities
        const facilitiesSection = document.getElementById("facilitiesSection");
        if (facilitiesSection) {
            facilitiesSection.style.display = "block";
            const facilities = getNearbyFacilitiesForItem(itemData);
            displayFacilities(facilities);
        }
        
        showNotification("Recommendation loaded! Check facilities below.", "success");
        
        // Scroll to recommendations
        setTimeout(() => {
            if (aiSection) aiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
        
    } catch (error) {
        console.error("Error:", error);
        showNotification("Failed to get recommendation", "error");
    } finally {
        if (aiBtn) {
            aiBtn.innerHTML = originalText;
            aiBtn.disabled = false;
        }
    }
};

// Get recommendations based on item category and condition (Updated for better detail)
function getRecommendationsBasedOnItem(itemData) {
    const category = itemData.category?.toLowerCase();
    const condition = itemData.condition?.toLowerCase();
    const materials = itemData.materials?.toLowerCase() || '';
    
    // 1. Electronics - E-waste or Repair
    if (category === 'electronics') {
        if (condition === 'fair' || condition === 'needs-repair') {
            return {
                action: '🛠️ Take to E-Waste Recycling/Repair Center (5-10 km)',
                reason: `Due to the '${condition}' condition, your ${itemData.name} requires professional e-waste processing. Hazardous materials must be safely disposed of.`,
                impact: 'Prevents soil/water contamination and recovers valuable metals (copper, gold, aluminum).'
            };
        }
        return { // Default electronics recommendation (assuming better condition/reuse potential)
            action: '📦 List for Reuse or E-Waste Recycling (5-10 km)',
            reason: `Electronics like ${itemData.name} contain toxic materials. Reuse is best, but proper recycling prevents soil and water contamination.`,
            impact: 'Prevents 50+ kg CO₂ emissions and recovers valuable materials.'
        };
    }
    
    // 2. Furniture, Kitchen Items, and specified Materials
    const isMaterialItem = category === 'furniture' || category === 'kitchen' || 
                           materials.includes('plastic') || materials.includes('metal') || 
                           materials.includes('wood') || materials.includes('cotton');
                           
    if (isMaterialItem) {
        if (condition === 'good' || condition === 'like-new' || condition === 'new') {
            return {
                action: '🤝 Donate to Charity or Community Center (5-10 km)',
                reason: `Your ${itemData.name} is in good condition. Donating helps people in need while extending item lifespan and reducing manufacturing waste.`,
                impact: 'Saves 2,700 liters of water and 25+ kg CO₂ per donated item.'
            };
        } else {
            return {
                action: '♻️ Visit General Recycling Facility (5-10 km)',
                reason: `Your ${itemData.name} needs proper recycling. Materials like plastic, metal, wood, and cotton can be processed and reused in manufacturing.`,
                impact: 'Recovers raw materials and keeps items out of landfills.'
            };
        }
    }
    
    // 3. Clothing
    if (category === 'clothing') {
        if (condition === 'good' || condition === 'like-new' || condition === 'new') {
            return {
                action: '👕 Donate to Thrift Store or Shelter (5-10 km)',
                reason: `Your ${itemData.name} can help someone in need. Clothing donation supports vulnerable communities and reduces textile waste significantly.`,
                impact: 'Saves 2,700 liters of water and 25 kg CO₂ per garment.'
            };
        } else {
            return {
                action: '🧵 Visit Textile Recycling Center (5-10 km)',
                reason: 'Worn clothing can be turned into insulation, rags, or new fibers through textile recycling.',
                impact: 'Reduces landfill waste by 5% and supports circular economy.'
            };
        }
    }
    
    // 4. Books
    if (category === 'books') {
        return {
            action: '📚 Donate to Library or School (5-10 km)',
            reason: 'Books promote literacy and education. Libraries and schools always need donations to serve communities.',
            impact: 'Saves trees and keeps paper out of landfills while promoting knowledge sharing.'
        };
    }
    
    // Default
    return {
        action: '♻️ Find Nearby Recycling Facility (5-10 km)',
        reason: `Your ${itemData.name} can still have value. Find local recycling or donation centers nearby.`,
        impact: 'Every reused item saves manufacturing resources and reduces environmental impact.'
    };
}

// Get nearby facilities based on item type (Updated Filtering Logic)
function getNearbyFacilitiesForItem(itemData) {
    const category = itemData.category?.toLowerCase();
    const condition = itemData.condition?.toLowerCase();
    const materials = itemData.materials?.toLowerCase() || '';
    
    let facilityType = 'recycling'; // Default fallback type
    
    // 1. Electronics -> E-waste centers
    if (category === 'electronics') {
        facilityType = 'ewaste';
    }
    // 2. Donation/Reuse -> For good condition Clothing/Books/Furniture/Kitchen/Materials
    else if ((category === 'clothing' || category === 'books' || category === 'furniture' || category === 'kitchen' || 
             materials.includes('plastic') || materials.includes('metal') || 
             materials.includes('wood') || materials.includes('cotton')) && 
             (condition === 'good' || condition === 'like-new' || condition === 'new')) {
        facilityType = 'donation';
    }
    // 3. Recycling (The rest)
    else if (category === 'furniture' || category === 'kitchen' || category === 'clothing' || 
             materials.includes('plastic') || materials.includes('metal') || 
             materials.includes('wood') || materials.includes('cotton') || category === 'other') {
        facilityType = 'recycling';
    }
    
    // Filter facilities based on determined type
    return getAllDummyFacilities().filter(f => f.type === facilityType);
}

// Dummy facilities database (Updated with contact info and 'type' field)
function getAllDummyFacilities() {
    return [
        // E-Waste Recycling Centers (type: ewaste)
        {
            id: 1,
            name: "Green Electronics Recycling Hub",
            address: "123 Tech Park, Innovation District",
            phone: "7357613931",
            email: "recycle@greenetech.com",
            hours: "Mon-Sat: 8:00 AM - 6:00 PM",
            distance: "7.2 km",
            type: "ewaste",
            accepts: ["Electronics", "Computers", "Phones", "Batteries"]
        },
        {
            id: 2,
            name: "E-Waste Solutions Center",
            address: "456 Tech Avenue, Silicon Valley",
            phone: "+919876543210",
            email: "info@ewastesolutions.com",
            hours: "Tue-Sun: 9:00 AM - 5:00 PM",
            distance: "8.5 km",
            type: "ewaste",
            accepts: ["Laptops", "Tablets", "Phone Chargers", "Circuit Boards"]
        },
        {
            id: 3,
            name: "TechRecycle Processing Plant",
            address: "789 Industrial Blvd, Business Park",
            phone: "+919123456789",
            email: "contact@techrecycle.org",
            hours: "Mon-Fri: 7:00 AM - 4:00 PM",
            distance: "9.8 km",
            type: "ewaste",
            accepts: ["All Electronics", "Server Equipment", "Industrial Devices"]
        },
        
        // General Recycling Centers (type: recycling)
        {
            id: 4,
            name: "Community Recycling Center",
            address: "321 Green Street, Eco Park",
            phone: "+917357613931",
            email: "info@communityrecycle.com",
            hours: "Daily: 7:00 AM - 7:00 PM",
            distance: "5.3 km",
            type: "recycling",
            accepts: ["Plastic", "Metal", "Wood", "Cotton", "Paper", "Glass"]
        },
        {
            id: 5,
            name: "Sustainable Materials Recycling",
            address: "654 Eco Boulevard, Green Valley",
            phone: "7357613931",
            email: "process@susmaterials.org",
            hours: "Mon-Sat: 8:00 AM - 6:00 PM",
            distance: "6.8 km",
            type: "recycling",
            accepts: ["Furniture", "Kitchen Items", "Wood Products", "Metal Scrap"]
        },
        {
            id: 6,
            name: "Circular Economy Recycling Hub",
            address: "987 Recycle Lane, Sustainability District",
            phone: "+917357613931",
            email: "support@circularecohub.com",
            hours: "Tue-Sun: 10:00 AM - 8:00 PM",
            distance: "7.9 km",
            type: "recycling",
            accepts: ["Building Materials", "Appliances", "Textiles", "Composite Materials"]
        },
        
        // Donation/Reuse Centers (type: donation)
        {
            id: 7,
            name: "Goodwill Community Center",
            address: "111 Charity Street, Hope Valley",
            phone: "+917357613931",
            email: "donate@goodwillcenter.org",
            hours: "Daily: 9:00 AM - 9:00 PM",
            distance: "2.1 km",
            type: "donation",
            accepts: ["Clothing", "Books", "Furniture", "Household Items"]
        },
        {
            id: 8,
            name: "Salvation Army Donation Hub",
            address: "222 Helping Hands Ave, Community Plaza",
            phone: "+917788996655",
            email: "intake@salvationarmy.org",
            hours: "Mon-Sat: 10:00 AM - 6:00 PM",
            distance: "3.7 km",
            type: "donation",
            accepts: ["All Donated Items", "Furniture", "Clothing", "Electronics"]
        },
        {
            id: 9,
            name: "Community Sharing Library",
            address: "333 Knowledge Lane, Education District",
            phone: "+916677889900",
            email: "books@sharinglibrary.org",
            hours: "Daily: 11:00 AM - 7:00 PM",
            distance: "4.2 km",
            type: "donation",
            accepts: ["Books", "Educational Materials", "Knowledge Resources"]
        }
    ];
}

// Display facilities in the UI (Updated to use the new detailed facility data)
function displayFacilities(facilities) {
    const facilitiesListElement = document.getElementById("facilitiesList");
    const locationStatus = document.getElementById("locationStatus");
    
    if (!facilitiesListElement) return;
    
    if (facilities.length === 0) {
        facilitiesListElement.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; background: white; border-radius: 8px; border: 1px solid #ddd;">
                <p style="color: #999; font-size: 1.1rem; margin: 0;">
                    <i class="fas fa-search"></i> No facilities of this type found nearby. Showing all general options below.
                </p>
            </div>
        `;
        // Fallback to showing general donation/recycling if specific type not found
        const allFacilities = getAllDummyFacilities();
        if (allFacilities.length > 0) {
            facilitiesListElement.innerHTML += allFacilities.map(facility => renderFacilityCard(facility)).join('');
        }
        
        if (locationStatus) {
            locationStatus.innerHTML = '<i class="fas fa-info-circle"></i> Showing all general facilities (specific match not found).';
        }
        return;
    }
    
    if (locationStatus) {
        const typeMap = { 'ewaste': 'E-Waste', 'donation': 'Donation/Reuse', 'recycling': 'Recycling' };
        const facilityType = facilities[0]?.type;
        locationStatus.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Found ${facilities.length} relevant ${typeMap[facilityType] || 'Facility'} options.`;
    }
    
    facilitiesListElement.innerHTML = facilities.map(facility => renderFacilityCard(facility)).join('');
}

// Helper function to render a single facility card (Updated to use facility.accepts)
function renderFacilityCard(facility) {
    const iconMap = { 'ewaste': 'microchip', 'donation': 'hand-holding-heart', 'recycling': 'recycle' };
    const title = facility.type.charAt(0).toUpperCase() + facility.type.slice(1) + ' Center';

    return `
        <div style="background: white; border: 2px solid #ddd; border-radius: 10px; padding: 1.5rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: all 0.3s; hover:box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h4 style="color: var(--primary-green); margin: 0 0 1rem 0; font-size: 1.1rem;">
                <i class="fas fa-${iconMap[facility.type]}"></i> ${facility.name}
            </h4>
            
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 6px;">
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-map-pin" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Distance:</strong> ${facility.distance}
                </p>
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Address:</strong> ${facility.address}
                </p>
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-clock" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Hours:</strong> ${facility.hours}
                </p>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 6px; border-left: 3px solid var(--primary-green);">
                <p style="margin: 0; color: var(--primary-green); font-size: 0.9rem;"><strong>Accepts:</strong></p>
                <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    ${facility.accepts.map(item => `
                        <span style="background: var(--primary-green); color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                            ${item}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #fff3e0; border-radius: 6px;">
                <p style="margin: 0; color: #333; font-size: 0.9rem;">
                    <i class="fas fa-phone" style="margin-right: 0.5rem;"></i>
                    <a href="tel:${facility.phone}" style="color: var(--primary-green); text-decoration: none; font-weight: 600;">${facility.phone}</a>
                </p>
                <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.85rem;">
                    <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
                    <a href="mailto:${facility.email}" style="color: var(--primary-green); text-decoration: none;">${facility.email}</a>
                </p>
            </div>
                      
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <button 
                   onclick="makeCall("7357613931");"
                   class="btn btn-primary" 
                   style="padding: 0.8rem; text-align: center; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 1rem;">
                    <i class="fas fa-phone"></i> Call Now
                </button>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}" 
                   target="_blank" 
                   class="btn btn-secondary" 
                   style="padding: 0.8rem; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; display: block; cursor: pointer;">
                    <i class="fas fa-directions"></i> Get Directions
                </a>
            </div>
        </div>
    `;
}

// Keep manual facility finder button
window.findNearbyFacilities = function() {
    const statusElement = document.getElementById("locationStatus");
    const findBtn = document.getElementById("findFacilitiesBtn");
    
    if (findBtn) {
        findBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
        findBtn.disabled = true;
    }

    if ("geolocation" in navigator) {
        if (statusElement) statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting your location...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                if (statusElement) {
                    statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Location found! Showing all facilities.`;
                }
                displayFacilities(getAllDummyFacilities());
                
                if (findBtn) {
                    findBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                    findBtn.disabled = false;
                }
            },
            function(error) {
                console.error("Geolocation error:", error);
                if (statusElement) {
                    statusElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> Could not access location. Showing all facilities.`;
                }
                displayFacilities(getAllDummyFacilities());
                
                if (findBtn) {
                    findBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Try Again';
                    findBtn.disabled = false;
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> Geolocation not supported. Showing all facilities.`;
        }
        displayFacilities(getAllDummyFacilities());
        
        if (findBtn) {
            findBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
            findBtn.disabled = false;
        }
    }
};


// Marketplace Page helpers
async function loadMarketplaceItems() {
  const itemsContainer = document.getElementById("itemsContainer");
  const noResults = document.getElementById("noResults");

  // If the container is missing, silently exit to avoid throwing in inline handlers
  if (!itemsContainer) return;

  try {
    // Ensure we have at least anonymous auth in case rules require authentication
    await ensureReadAuth();

    let query = db.collection("items").where("status", "==", "available");

    const category = document.getElementById("categoryFilter")?.value;
    const location = document.getElementById("locationFilter")?.value;
    const condition = document.getElementById("conditionFilter")?.value;

    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    const itemsSnapshot = await query.get();

    let items = [];
    itemsSnapshot.forEach((doc) => {
      const item = { id: doc.id, ...doc.data() };
      
      // Client-side filtering
      let passesLocation = true;
      if (
        location &&
        item.location &&
        !item.location.toLowerCase().includes(location.toLowerCase())
      ) {
        passesLocation = false; 
      }
      
      let passesCondition = true;
      if (condition && item.condition !== condition) {
          passesCondition = false;
      }

      if (passesLocation && passesCondition) {
          items.push(item);
      }
    });

    // Client-side sorting by createdAt (newest first)
    items.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    if (items.length === 0) {
      itemsContainer.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    itemsContainer.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
      
    itemsContainer.innerHTML = items
      .map(
        (item) => {
          const displayPrice = item.price === 0 || item.price === undefined || isNaN(item.price)
                                ? 'Free' 
                                : `₹${parseFloat(item.price).toFixed(2)}`;
                                
          return `
                  <div class="item-card">
                      <img src="${
                        item.imageUrls && item.imageUrls.length > 0
                          ? item.imageUrls[0]
                          : "https://via.placeholder.com/300x200/90EE90/2E8B57?text=" +
                            encodeURIComponent(item.name)
                      }" 
                           alt="${item.name}" class="item-image">
                      <div class="item-content">
                          <span class="item-category">${
                            item.category
                          }</span>
                          <h3 class="item-title">${item.name}</h3>
                          <p class="item-description">${
                            item.description
                              ? item.description.substring(0, 100) + "..."
                              : "No description available"
                          }</p>
                          <p><strong>Price:</strong> ${displayPrice}</p>
                          <p><strong>Condition:</strong> ${
                            item.condition || "Unknown"
                          }</p>
                          <p><strong>Location:</strong> ${
                            item.location || "Unknown"
                          }</p>
                          
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                              <span style="font-size: 0.9rem; color: #666;">
                                  <i class="fas fa-user"></i> ${
                                    item.userName
                                  }
                              </span>
                              <div>
                                  <a href="item-detail.html?id=${
                                    item.id
                                  }" class="btn btn-primary" style="padding: 5px 15px;">
                                      <i class="fas fa-eye"></i> View
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
              `
        }
      )
      .join("");
  } catch (error) {
    console.error("Error loading items:", error);
    showNotification(`Error loading items: ${error.message || error}`, "error");
  }
}

// Attach marketplace wiring
async function initMarketplacePage() {
  const categoryFilter = document.getElementById("categoryFilter");
  const locationFilter = document.getElementById("locationFilter");
  const conditionFilter = document.getElementById("conditionFilter");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", loadMarketplaceItems);
  }

  if (locationFilter) {
    locationFilter.addEventListener("input", loadMarketplaceItems);
  }
  
  if (conditionFilter) {
    conditionFilter.addEventListener("change", loadMarketplaceItems);
  }

  await loadMarketplaceItems();
}

// Expose for inline filter handlers in the HTML
window.loadItems = loadMarketplaceItems;

// Helper to fetch only donated items
async function getUserDonatedItems(userId) {
    try {
        const q = db.collection("items")
            .where("userId", "==", userId)
            .where("isDonation", "==", true); // Filter by the new field set during submission
        
        const snapshot = await q.get();
        
        const items = [];
        snapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Client-side sorting by createdAt (newest first)
        items.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        return items;
    } catch (error) {
        console.error("Get donated items error:", error);
        return [];
    }
}


// Dashboard Page 
async function initDashboardPage() {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  try {
    // Get user data
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();

      // Update greeting
      const greeting = document.getElementById("userGreeting");
      if (greeting) {
        greeting.textContent = `Welcome back, ${userData.name || "User"}!`;
      }

      // Update stats (Metrics) with null guards so missing cards don't break the page
      const itemsListedEl = document.getElementById("itemsListed");
      if (itemsListedEl) {
        itemsListedEl.textContent = userData.itemsListed || 0;
      }
      
      // CO₂ Saved (Formatted to 1 decimal place)
      const co2SavedEl = document.getElementById("co2Saved");
      if (co2SavedEl) {
        co2SavedEl.textContent = `${(userData.carbonSaved || 0).toFixed(1)} kg`;
      }
      
      // New metric: Items Donated (Reads data from 'itemsDonated' field)
      const itemsDonatedEl = document.getElementById("itemsDonated");
      if (itemsDonatedEl) {
        itemsDonatedEl.textContent = userData.itemsDonated || 0;
      }
      
      // Landfill Reduced (Formatted to 2 decimal places)
      const landfillEl = document.getElementById("landfillReduced");
      if (landfillEl) {
        landfillEl.textContent = `${(userData.landfillReduced || 0).toFixed(2)} m³`;
      }

      // Load user's items (All items to allow for client-side filtering)
      const allItemsQuery = db
        .collection("items")
        .where("userId", "==", currentUser.uid)
        .orderBy("createdAt", "desc");
        
      const allItemsSnapshot = await allItemsQuery.get();
      const allUserItems = [];
      allItemsSnapshot.forEach(doc => allUserItems.push({ id: doc.id, ...doc.data() }));

      // Client-side filter to separate items listed for sale/free vs. dedicated donations
      const listedForSaleItems = allUserItems.filter(item => item.isDonation !== true);

      const myItemsContainer = document.getElementById("myItems");

      if (myItemsContainer) {
        if (listedForSaleItems.length === 0) {
          myItemsContainer.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <p>You haven't listed any items for sale or free yet.</p>
                            <a href="add-item.html" class="btn btn-primary">List Your First Item</a>
                        </div>
                    `;
        } else {
          myItemsContainer.innerHTML = listedForSaleItems
            .map(
              (item) => {
                // FIX: Safely display price, reading from item.price which might be undefined in old items
                const displayPrice = item.price === 0 || item.price === undefined || isNaN(item.price)
                                      ? 'Free' 
                                      : `₹${parseFloat(item.price).toFixed(2)}`;
                                      
                return `
                        <div class="item-card">
                            <img src="${
                              item.imageUrls && item.imageUrls.length > 0
                                ? item.imageUrls[0]
                                : "https://via.placeholder.com/300x200/90EE90/2E8B57?text=" +
                                  encodeURIComponent(item.name)
                            }" 
                                 alt="${item.name}" class="item-image">
                            <div class="item-content">
                                <span class="item-category">${
                                  item.category
                                }</span>
                                <h3 class="item-title">${item.name}</h3>
                                <p><strong>Price:</strong> ${displayPrice}</p>
                                <p><strong>Status:</strong> <span class="status-${
                                  item.status
                                }">${item.status}</span></p>
                                <div style="margin-top: 1rem; display: flex; gap: 10px;">
                                    <a href="item-detail.html?id=${
                                      item.id
                                    }" class="btn btn-primary" style="padding: 5px 15px;">
                                        View
                                    </a>
                                </div>
                            </div>
                        </div>
                    `
              }
            )
            .join("");
        }
      }
      
      // --- NEW LOGIC: LOAD DONATED ITEMS ---
      const donatedItemsContainer = document.getElementById("myDonationsList"); 
      const donatedItems = await getUserDonatedItems(currentUser.uid);
      
      if (donatedItemsContainer) {
          if (donatedItems.length === 0) {
              donatedItemsContainer.innerHTML = `
                  <div style="grid-column: 1 / -1; text-align: center; padding: 1rem;">
                      <p>You haven't made any donations yet.</p>
                      <a href="add-item.html" class="btn btn-primary">List a Donation</a>
                  </div>
              `;
          } else {
              donatedItemsContainer.innerHTML = donatedItems
                .map(
                  (item) => `
                        <div class="item-card">
                            <img src="${
                              item.imageUrls && item.imageUrls.length > 0
                                ? item.imageUrls[0]
                                : "https://via.placeholder.com/300x200/FFCC00/A0522D?text=Donation"
                            }" 
                                 alt="${item.name}" class="item-image">
                            <div class="item-content">
                                <span class="item-category" style="background: var(--warning); color: #FFF;">DONATION</span>
                                <h3 class="item-title">${item.name}</h3>
                                <p><strong>Status:</strong> <span class="status-donation">${item.donationStatus}</span></p>
                                <div style="margin-top: 1rem; display: flex; gap: 10px;">
                                    <a href="item-detail.html?id=${item.id}" class="btn btn-secondary" style="padding: 5px 15px;">
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    `
                )
                .join("");
          }
      }
      // -------------------------------------
      
      // --- LOAD ORDERS (PURCHASES) ---
      const ordersTableBody = document.getElementById("ordersTableBody");
      if (ordersTableBody) {
          try {
              const ordersQuery = db
                  .collection("orders")
                  .where("buyerId", "==", currentUser.uid);
              
              const ordersSnapshot = await ordersQuery.get();
              const orders = [];
              ordersSnapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
              orders.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
              
              if (orders.length === 0) {
                  ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No purchases yet. <a href="marketplace.html">Browse marketplace</a></td></tr>`;
              } else {
                  ordersTableBody.innerHTML = orders.map(order => {
                      const createdDate = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
                      const statusColor = order.status === 'completed' ? '#4caf50' : order.status === 'pending' ? '#ff9800' : '#f44336';
                      return `
                          <tr style="border-bottom: 1px solid #eee;">
                              <td style="padding: 1rem;">${order.itemName}</td>
                              <td style="padding: 1rem;">₹${order.itemPrice.toFixed(2)}</td>
                              <td style="padding: 1rem;"><span style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.9rem;">${order.status}</span></td>
                              <td style="padding: 1rem;">${createdDate}</td>
                              <td style="padding: 1rem; text-align: center;">
                                  <a href="order-detail.html?orderId=${order.id}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                                      <i class="fas fa-eye"></i> View
                                  </a>
                              </td>
                          </tr>
                      `;
                  }).join("");
              }
          } catch (error) {
              console.error("Error loading orders:", error);
              ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">Error loading orders</td></tr>`;
          }
      }
      // --------------------------

      // --- LOAD SALES HISTORY ---
      const salesTableBody = document.getElementById("salesTableBody");
      if (salesTableBody) {
          try {
              const salesQuery = db
                  .collection("orders")
                  .where("sellerId", "==", currentUser.uid);
              
              const salesSnapshot = await salesQuery.get();
              const sales = [];
              salesSnapshot.forEach(doc => sales.push({ id: doc.id, ...doc.data() }));
              sales.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
              
                if (sales.length === 0) {
                  salesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">You haven't sold anything yet</td></tr>`;
                } else {
                  salesTableBody.innerHTML = sales.map(sale => {
                    const createdDate = sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString() : 'N/A';
                    return `
                      <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 1rem;">${sale.itemName}</td>
                        <td style="padding: 1rem;">₹${sale.itemPrice.toFixed(2)}</td>
                        <td style="padding: 1rem;">${sale.buyerInfo.name}</td>
                        <td style="padding: 1rem;">${createdDate}</td>
                      </tr>
                    `;
                  }).join("");
                }
          } catch (error) {
              console.error("Error loading sales history:", error);
                salesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">Error loading sales</td></tr>`;
          }
      }
      // --------------------------

      // --- LOAD NGO INTERESTS IN DONATIONS (Donor View) ---
      // Only load if user has made donations
      const userHasDonations = allUserItems.some(item => item.isDonation === true);
      const ngoInterestsContainer = document.getElementById("ngoInterestsList");
      if (ngoInterestsContainer && userHasDonations) {
          try {
              // Query without orderBy to avoid index requirement
              const ngoInterestsQuery = db
                  .collection("ngoInterests")
                  .where("donorId", "==", currentUser.uid);
              
              const ngoInterestsSnapshot = await ngoInterestsQuery.get();
              const ngoInterests = [];
              ngoInterestsSnapshot.forEach(doc => ngoInterests.push({ id: doc.id, ...doc.data() }));
              
              // Sort client-side
              ngoInterests.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
              
              if (ngoInterests.length === 0) {
                  ngoInterestsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #999;">No NGO interests in your donations yet.</p>`;
              } else {
                  ngoInterestsContainer.innerHTML = ngoInterests.map(ngoInt => {
                      const createdDate = ngoInt.createdAt?.toDate ? ngoInt.createdAt.toDate().toLocaleDateString() : "N/A";
                      const statusColor = ngoInt.status === "accepted" ? "#4caf50" : ngoInt.status === "rejected" ? "#f44336" : "#ff9800";
                      return `
                          <div class="item-card">
                              <div class="item-content" style="padding: 1.5rem;">
                                  <h3 class="item-title" style="margin-bottom: 0.5rem;">${ngoInt.itemName}</h3>
                                  <p style="margin: 0.25rem 0;"><strong>Interested NGO:</strong> ${ngoInt.ngoName}</p>
                                  <p style="margin: 0.25rem 0;"><strong>Email:</strong> ${ngoInt.ngoEmail}</p>
                                  <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${createdDate}</p>
                                  <p style="margin: 0.5rem 0; color: #555;"><strong>Mission:</strong> ${ngoInt.message}</p>
                                  <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                                      <span style="padding: 0.25rem 0.75rem; background: ${statusColor}; color: white; border-radius: 4px; font-size: 0.9rem; font-weight: 600;">${ngoInt.status.toUpperCase()}</span>
                                      ${ngoInt.status === "pending" ? `
                                          <button onclick="acceptNGOClaim('${ngoInt.id}')" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                                            <i class="fas fa-check"></i> Accept
                                          </button>
                                          <button onclick="rejectNGOClaim('${ngoInt.id}')" class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                                            <i class="fas fa-times"></i> Reject
                                          </button>
                                      ` : ""}
                                  </div>
                              </div>
                          </div>
                      `;
                  }).join("");
              }
          } catch (error) {
              console.error("Error loading NGO interests:", error);
              ngoInterestsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #999;">No NGO interests yet.</p>`;
          }
      } else if (ngoInterestsContainer && !userHasDonations) {
          ngoInterestsContainer.parentElement.style.display = "none";
      }
      // --------------------------
      
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showNotification("Error loading dashboard", "error");
  }
}

// NGO Dashboard Page
async function initNGODashboardPage() {
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  
  // Redirect non-NGO users away from this page
  if (currentUser.userType !== 'ngo') {
      showNotification("Access denied. Redirecting to user dashboard.", "error");
      setTimeout(() => {
          window.location.href = "dashboard.html";
      }, 1500);
      return;
  }

  try {
    // Ensure read access for donation feed
    await ensureReadAuth();

    // Get NGO data
    const userDoc = await db.collection("users").doc(currentUser.uid).get();
    if (userDoc.exists) {
      const ngoData = userDoc.data();

      // Update greeting
      const greeting = document.getElementById("userGreeting");
      if (greeting) {
        // Update the greeting using the name from Firestore if available
        greeting.textContent = `Welcome, ${ngoData.name || currentUser.displayName || "NGO"}!`;
      }

      // Update stats
      // These elements rely on ngo-dashboard.html structure
      document.getElementById("itemsReceived").textContent = ngoData.itemsReceived || 0;
      document.getElementById("donationsClaimed").textContent = ngoData.donationsClaimed || 0;
      document.getElementById("impactScore").textContent = ngoData.impactScore || 0;
      
      // Calculate pending requests from ngoInterests collection
      try {
        const pendingSnapshot = await db
          .collection("ngoInterests")
          .where("ngoId", "==", currentUser.uid)
          .where("status", "==", "pending")
          .get();
        
        const pendingCount = pendingSnapshot.size;
        document.getElementById("pendingRequests").textContent = pendingCount;
      } catch (e) {
        console.log("Could not load pending requests:", e);
        document.getElementById("pendingRequests").textContent = "0";
      }

        // Load available donation items
        const donationsContainer = document.getElementById("itemsReceivedList");
        if (donationsContainer) {
          try {
            const donationSnapshot = await db
              .collection("items")
              .where("isDonation", "==", true)
              .where("status", "==", "available")
              .get();

            const donations = [];
            donationSnapshot.forEach(doc => donations.push({ id: doc.id, ...doc.data() }));
            
            // Filter out items that have already been claimed by this NGO
            const claimedItemsSnapshot = await db
              .collection("ngoInterests")
              .where("ngoId", "==", currentUser.uid)
              .get();
            
            const claimedItemIds = new Set();
            claimedItemsSnapshot.forEach(doc => {
              claimedItemIds.add(doc.data().itemId);
            });
            
            // Filter donations to exclude already claimed items
            const availableDonations = donations.filter(item => !claimedItemIds.has(item.id));
            availableDonations.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

            if (availableDonations.length === 0) {
              donationsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1;">No donation items available right now.</p>`;
            } else {
              donationsContainer.innerHTML = availableDonations.map(item => {
                const createdDate = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "";
                return `
                  <div class="item-card">
                    <img src="${
                    item.imageUrls && item.imageUrls.length > 0
                      ? item.imageUrls[0]
                      : "https://via.placeholder.com/300x200/FFCC00/A0522D?text=Donation"
                    }" alt="${item.name}" class="item-image">
                    <div class="item-content">
                      <span class="item-category" style="background: var(--warning); color: #FFF;">DONATION</span>
                      <h3 class="item-title">${item.name}</h3>
                      <p style="margin: 0.25rem 0;"><strong>Location:</strong> ${item.location || "Unknown"}</p>
                      <p style="margin: 0.25rem 0;"><strong>Listed:</strong> ${createdDate}</p>
                      <p style="margin: 0.25rem 0; color: #555;">${item.description ? item.description.substring(0, 80) + "..." : "No description provided."}</p>
                      <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.9rem; color: #666;"><i class="fas fa-user"></i> ${item.userName || "Donor"}</span>
                        <div style="display: flex; gap: 0.5rem;">
                          <a href="item-detail.html?id=${item.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;">View</a>
                          <button onclick="claimDonationForNGO('${item.id}')" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.9rem;">
                            <i class="fas fa-check"></i> Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join("");
            }
          } catch (donationErr) {
            console.error("Error loading donations for NGO dashboard:", donationErr);
            donationsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: #c00;">Unable to load donation items.</p>`;
          }
        }

    }
  } catch (error) {
    console.error("Error loading NGO dashboard:", error);
    showNotification("Error loading NGO dashboard", "error");
  }
}

// Item Detail Page
async function initItemDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  if (!itemId) {
    showNotification("Item not found", "error");
    setTimeout(() => {
      window.location.href = "marketplace.html";
    }, 1500);
    return;
  }

  try {
    const itemDoc = await db.collection("items").doc(itemId).get();

    if (!itemDoc.exists) {
      showNotification("Item not found", "error");
      setTimeout(() => {
        window.location.href = "marketplace.html";
      }, 1500);
      return;
    }

    const item = { id: itemDoc.id, ...itemDoc.data() };

    // Display item details
    const itemDetailContainer = document.getElementById("itemDetail");
    if (itemDetailContainer) {
      const createdAt = item.createdAt
        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
        : "Unknown";

      itemDetailContainer.innerHTML = `
                <div class="item-detail">
                    <div class="item-images">
                        <img src="${
                          item.imageUrls && item.imageUrls.length > 0
                            ? item.imageUrls[0]
                            : "https://via.placeholder.com/600x400/90EE90/2E8B57?text=" +
                              encodeURIComponent(item.name)
                        }" 
                             alt="${item.name}" class="detail-image">
                    </div>
                    <div class="item-info">
                        <span class="item-category">${item.category}</span>
                        <h1>${item.name}</h1>
                        <p class="item-condition"><strong>Condition:</strong> ${
                          item.condition
                        }</p>
                        <p class="item-location"><strong>Location:</strong> ${
                          item.location
                        }</p>
                        <p class="item-materials"><strong>Materials:</strong> ${
                          item.materials || "Not specified"
                        }</p>
                        ${item.isDonation
                            ? `<p class="item-price"><strong>Intent:</strong> Donation (Free)</p>`
                            : `<p class="item-price"><strong>Price:</strong> ${item.price === 0 || item.price === undefined ? 'Free' : `$${item.price.toFixed(2)}`}</p>`
                        }
                        
                        <div class="item-description">
                            <h3>Description</h3>
                            <p>${
                              item.description || "No description provided."
                            }</p>
                        </div>
                        
                        <div class="item-actions">
                            ${
                              currentUser && currentUser.uid === item.userId
                                ? `
                                <button onclick="editItem('${item.id}')" class="btn btn-secondary">
                                    <i class="fas fa-edit"></i> Edit Item
                                </button>
                                <button onclick="deleteItem('${item.id}')" class="btn btn-danger">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            `
                                : `
                                <button onclick="requestItem('${item.id}')" class="btn btn-primary">
                                    <i class="fas fa-handshake"></i> Request Item
                                </button>
                                <button onclick="window.getAIRecommendationsForItem('${item.id}')" class="btn btn-warning">
                                    <i class="fas fa-robot"></i> Get AI Recommendations
                                </button>
                            `
                            }
                        </div>
                        
                        <div class="item-meta">
                            <p><i class="fas fa-user"></i> Listed by: ${
                              item.userName
                            }</p>
                            <p><i class="fas fa-calendar"></i> Listed: ${createdAt}</p>
                        </div>
                        
                        <div class="ai-recommendations" id="itemDetailAISection" style="display: none;">
                          <h3><i class="fas fa-robot"></i> Sustainability Advice</h3>
                          <div id="itemDetailAIResults">
                              </div>
                        </div>

                    </div>
                </div>
            `;
            
      // Update element IDs to prevent collision with add-item page
      const aiSection = document.getElementById("itemDetailAISection");
      const aiResults = document.getElementById("itemDetailAIResults");
      
      // Override the global display function to target the new IDs if on this page (handled in global displayAIRecommendations)
      if (aiSection && aiResults) {
        window.displayAIRecommendationsForDetail = function(recommendations) {
          aiSection.style.display = "block";
          aiResults.innerHTML = `
              <div class="recommendations-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
                  ${recommendations.recommendations
                    .map(
                      (rec) => `
                      <div class="card">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                              <span class="recommendation-tag tag-${rec.type}">
                                  ${rec.type.toUpperCase()}
                              </span>
                              <span style="font-size: 0.9rem; color: #666;">
                                  ${rec.confidence}% match
                              </span>
                          </div>
                          <h4 style="margin-bottom: 0.5rem;">${rec.action}</h4>
                          <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${
                            rec.reason
                          }</p>
                          <div style="padding: 0.5rem; background: rgba(255,255,255,0.5); border-radius: 5px; font-size: 0.9rem;">
                              <i class="fas fa-leaf"></i> ${rec.estimatedImpact}
                          </div>
                      </div>
                  `
                    )
                    .join("")}
              </div>
              ${
                recommendations.localSuggestions
                  ? `
                  <div style="margin-top: 1rem;">
                      <h4>Local Resources:</h4>
                      <ul style="list-style: none; padding: 0;">
                          ${recommendations.localSuggestions
                            .map(
                              (suggestion) => `
                              <li style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${suggestion}</li>
                          `
                            )
                            .join("")}
                      </ul>
                  </div>
              `
                  : ""
              }
          `;
          aiSection.scrollIntoView({ behavior: 'smooth' });
        };
      }
      
    }
  } catch (error) {
    console.error("Error loading item:", error);
    showNotification("Error loading item", "error");
  }
}

// NGO Registration Page
function initNGORegisterPage() {
  const ngoForm = document.getElementById("ngoRegisterForm");
  if (ngoForm) {
    ngoForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const ngoData = {
        name: document.getElementById("ngoName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        mission: document.getElementById("mission").value,
        website: document.getElementById("website").value,
        userType: "ngo",
      };

      const submitBtn = ngoForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Registering NGO...';
      submitBtn.disabled = true;

      try {
        // Create user with email/password
        const userCredential = await auth.createUserWithEmailAndPassword(
          ngoData.email,
          ngoData.password
        );

        // Update profile with name
        await userCredential.user.updateProfile({
          displayName: ngoData.name,
        });

        // Create NGO document in Firestore
        await db.collection("users").doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          name: ngoData.name,
          email: ngoData.email,
          phone: ngoData.phone,
          address: ngoData.address,
          mission: ngoData.mission,
          website: ngoData.website,
          userType: "ngo",
          verified: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          itemsReceived: 0,
          donationsClaimed: 0,
          impactScore: 0,
        });

        showNotification("NGO registration submitted for approval!", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } catch (error) {
        showNotification(error.message, "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// AI Functions (Made Global with 'window.')
window.getAIRecommendations = async function(itemData) {
  try {
    // Use Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDKNZ7TlweKriVfA3TpzfQUrvHjGhpLklQ",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a highly specific sustainability and circular economy expert. Analyze the user's item based on its exact name, category, condition, and materials provided.

Item Name: ${itemData.name || "Unnamed item"}
Category: ${itemData.category || "General"}
Condition: ${itemData.condition || "Unknown"}
Materials: ${itemData.materials || "Not specified"}
Description: ${itemData.description || "No description provided"}

**Crucial Instruction**: Generate recommendations that are highly specific to the item's details. For the 'reason' field in the JSON, explicitly reference the **Condition** and **Materials** of the item.

Provide recommendations in this JSON format:
{
    "recommendations": [
        {
            "type": "reuse/recycle/donate/repair",
            "action": "Specific action to take (e.g., Repair cracked screen, Donate to a specific type of charity)",
            "confidence": 85,
            "reason": "Why this is environmentally beneficial, referencing its condition or materials (e.g., Due to the 'Good' condition, reuse is best.)",
            "estimatedImpact": "CO2 saved, water saved, etc."
        }
    ],
    "bestOption": "Type of best option",
    "localSuggestions": ["Local resource 1", "Local resource 2"]
}

Keep responses concise and practical.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("AI Error:", error);
    // Return fallback recommendations
    return window.getFallbackRecommendations(itemData.category);
  }
}

window.getFallbackRecommendations = function(category) {
  const recommendations = {
    electronics: {
      recommendations: [
        {
          type: "recycle",
          action: "Take to e-waste recycling center",
          confidence: 90,
          reason:
            "Electronics contain toxic materials that should be properly disposed",
          estimatedImpact: "Prevents soil and water contamination",
        },
        {
          type: "reuse",
          action: "Donate to schools or community centers",
          confidence: 75,
          reason: "Extends device lifespan and helps others",
          estimatedImpact: "Saves manufacturing resources",
        },
      ],
      bestOption: "recycle",
      localSuggestions: [
        "Best Buy recycling",
        "Staples e-waste program",
        "Local electronics repair shop",
      ],
    },
    clothing: {
      recommendations: [
        {
          type: "donate",
          action: "Donate to local shelter or thrift store",
          confidence: 95,
          reason: "Helps people in need and reduces textile waste",
          estimatedImpact: "Saves 2,700 liters of water per item",
        },
        {
          type: "recycle",
          action: "Textile recycling program",
          confidence: 80,
          reason: "Clothing can be turned into insulation or rags",
          estimatedImpact: "Reduces landfill waste by 5%",
        },
      ],
      bestOption: "donate",
      localSuggestions: ["Goodwill", "Salvation Army", "Local clothing banks"],
    },
    books: {
      recommendations: [
        {
          type: "donate",
          action: "Donate to libraries or schools",
          confidence: 98,
          reason: "Promotes literacy and education",
          estimatedImpact: "Saves trees and reduces paper waste",
        },
        {
          type: "reuse",
          action: "Community book swap",
          confidence: 85,
          reason: "Builds community and reduces consumption",
          estimatedImpact: "Extends book lifespan 5x",
        },
      ],
      bestOption: "donate",
      localSuggestions: [
        "Local library",
        "School donation drives",
        "Little Free Libraries",
      ],
    },
  };

  return (
    recommendations[category] || {
      recommendations: [
        {
          type: "reuse",
          action: "List on marketplace for someone else to use",
          confidence: 70,
          reason: "Gives item second life and reduces waste",
          estimatedImpact: "Reduces carbon footprint by 2.5kg",
        },
        {
          type: "recycle",
          action: "Find appropriate recycling facility",
          confidence: 60,
          reason: "Proper disposal prevents environmental harm",
          estimatedImpact: "Conserves natural resources",
        },
      ],
      bestOption: "reuse",
      localSuggestions: [
        "Local recycling center",
        "Community marketplace",
        "Online swap groups",
      ],
    }
  );
}

window.generateItemDescription = async function(itemName, category) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDKNZ7TlweKriVfA3TpzfQUrvHjGhpLklQ",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a compelling, eco-friendly description for a ${category} item named "${itemName}" for a sustainable marketplace. Include why reusing/recycling this item is environmentally beneficial. Keep it under 150 characters.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("API call failed");
  } catch (error) {
    return `A ${category} item that deserves a second life! Help reduce waste and promote circular economy by giving this item a new home.`;
  }
}

window.displayAIRecommendations = function(recommendations) {
  const aiSection = document.getElementById("aiSection");
  const aiResults = document.getElementById("aiResults");
  if (!aiSection || !aiResults) return;

  aiSection.style.display = "block";
  aiResults.innerHTML = `
        <h3><i class="fas fa-robot"></i> AI Sustainability Recommendations</h3>
        <div class="recommendations-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">
            ${recommendations.recommendations
              .map(
                (rec) => `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span class="recommendation-tag tag-${rec.type}">
                            ${rec.type.toUpperCase()}
                        </span>
                        <span style="font-size: 0.9rem; color: #666;">
                            ${rec.confidence}% match
                        </span>
                    </div>
                    <h4 style="margin-bottom: 0.5rem;">${rec.action}</h4>
                    <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">${
                      rec.reason
                    }</p>
                    <div style="padding: 0.5rem; background: rgba(255,255,255,0.5); border-radius: 5px; font-size: 0.9rem;">
                        <i class="fas fa-leaf"></i> ${rec.estimatedImpact}
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
        ${
          recommendations.localSuggestions
            ? `
            <div style="margin-top: 1rem;">
                <h4>Local Resources:</h4>
                <ul style="list-style: none; padding: 0;">
                    ${recommendations.localSuggestions
                      .map(
                        (suggestion) => `
                        <li style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${suggestion}</li>
                    `
                      )
                      .join("")}
                </ul>
            </div>
        `
            : ""
        }
    `;
}

// Helper Functions
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Global functions for HTML onclick
window.logout = async function () {
  try {
    // Set flag to prevent auto anonymous sign-in
    sessionStorage.setItem('isLoggingOut', 'true');
    
    await auth.signOut();
    showNotification("Logged out successfully", "success");
    
    // Clear the flag and redirect
    setTimeout(() => {
      sessionStorage.removeItem('isLoggingOut');
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
    sessionStorage.removeItem('isLoggingOut');
    showNotification(error.message, "error");
  }
};

window.editItem = function (itemId) {
  showNotification("Edit feature coming soon!", "info");
};

window.deleteItem = async function (itemId) {
  if (!confirm("Are you sure you want to delete this item?")) {
    return;
  }

  try {
    await db.collection("items").doc(itemId).delete();
    showNotification("Item deleted successfully!", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (error) {
    showNotification(error.message, "error");
  }
};

window.requestItem = async function (itemId) {
  if (!currentUser) {
    showNotification("Please login to request items", "warning");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  try {
    const itemDoc = await db.collection("items").doc(itemId).get();
    if (!itemDoc.exists) {
      showNotification("Item not found", "error");
      return;
    }

    const item = itemDoc.data();
    const sellerId = item.userId;

    // Create interest record
    await db.collection("interests").add({
      itemId: itemId,
      itemName: item.name,
      buyerId: currentUser.uid,
      buyerName: currentUser.displayName || currentUser.name || "Interested Buyer",
      buyerEmail: currentUser.email,
      sellerId: sellerId,
      sellerName: item.userName,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      message: `I am interested in your item: ${item.name}`,
    });

    showNotification("Interest sent to seller!", "success");
  } catch (error) {
    console.error("Error sending interest:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
};

// NGO Claim Donation Function
window.claimDonationForNGO = async function (itemId) {
  if (!currentUser) {
    showNotification("Please login to claim donations", "warning");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  try {
    const itemDoc = await db.collection("items").doc(itemId).get();
    if (!itemDoc.exists) {
      showNotification("Item not found", "error");
      return;
    }

    const item = itemDoc.data();
    const donorId = item.userId;

    // Get NGO data
    const ngoDoc = await db.collection("users").doc(currentUser.uid).get();
    if (!ngoDoc.exists) {
      showNotification("NGO profile not found", "error");
      return;
    }

    const ngoData = ngoDoc.data();

    // Create NGO interest record for donation
    await db.collection("ngoInterests").add({
      itemId: itemId,
      itemName: item.name,
      ngoId: currentUser.uid,
      ngoName: ngoData.name,
      ngoEmail: ngoData.email,
      donorId: donorId,
      donorName: item.userName,
      donorEmail: item.userEmail,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      message: ngoData.mission || "Interested in this donation for our community programs",
    });

    // Increment donations claimed for NGO
    await db.collection("users").doc(currentUser.uid).update({
      donationsClaimed: firebase.firestore.FieldValue.increment(1),
    });

    showNotification("Donation claimed! Donor will be notified.", "success");
    
    // Reload donations list
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error claiming donation:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
};

// Accept NGO Claim (Donor action)
window.acceptNGOClaim = async function (ngoInterestId) {
  try {
    // Get the ngoInterest record to find the NGO
    const ngoInterestDoc = await db.collection("ngoInterests").doc(ngoInterestId).get();
    if (!ngoInterestDoc.exists) {
      showNotification("Claim record not found", "error");
      return;
    }

    const ngoInterestData = ngoInterestDoc.data();
    const ngoId = ngoInterestData.ngoId;

    // Update the claim status to accepted
    await db.collection("ngoInterests").doc(ngoInterestId).update({
      status: "accepted",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Increment itemsReceived for the NGO (actual items received, not just claimed)
    await db.collection("users").doc(ngoId).update({
      itemsReceived: firebase.firestore.FieldValue.increment(1),
      impactScore: firebase.firestore.FieldValue.increment(10), // Each accepted donation = 10 impact points
    });

    showNotification("Donation claim accepted!", "success");
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error accepting claim:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
};

// Reject NGO Claim (Donor action)
window.rejectNGOClaim = async function (ngoInterestId) {
  try {
    await db.collection("ngoInterests").doc(ngoInterestId).update({
      status: "rejected",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    showNotification("Donation claim rejected.", "info");
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error rejecting claim:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
};

window.getAIRecommendationsForItem = async function (itemId) {
  const aiBtn = document.querySelector('.item-actions button.btn-warning');
  const originalText = aiBtn ? aiBtn.innerHTML : '';
  if(aiBtn) {
    aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    aiBtn.disabled = true;
  }

  try {
    const itemDoc = await db.collection("items").doc(itemId).get();
    if (itemDoc.exists) {
      const item = itemDoc.data();
      const recommendations = await window.getAIRecommendations(item);
      // Use item-detail specific function if available, otherwise global
      if (typeof window.displayAIRecommendationsForDetail === 'function') {
        window.displayAIRecommendationsForDetail(recommendations);
      } else if (typeof window.displayAIRecommendations === 'function') {
        window.displayAIRecommendations(recommendations);
      }
    }
  } catch (error) {
    showNotification("Failed to get AI recommendations", "error");
  } finally {
    if(aiBtn) {
      aiBtn.innerHTML = originalText;
      aiBtn.disabled = false;
    }
  }
};

// ==================== REUSE FACILITIES FINDER ====================
// Dummy facility data with complete contact information
function getAllDummyFacilities() {
    return [
        // E-Waste Recycling Centers (type: ewaste)
        {
            id: 1,
            name: "Green Electronics Recycling Hub",
            address: "123 Tech Park, Innovation District",
            phone: "+917357613931",
            email: "recycle@greenetech.com",
            hours: "Mon-Sat: 8:00 AM - 6:00 PM",
            distance: "7.2 km",
            type: "ewaste",
            accepts: ["Electronics", "Computers", "Phones", "Batteries"]
        },
        {
            id: 2,
            name: "E-Waste Solutions Center",
            address: "456 Tech Avenue, Silicon Valley",
            phone: "+919876543210",
            email: "info@ewastesolutions.com",
            hours: "Tue-Sun: 9:00 AM - 5:00 PM",
            distance: "8.5 km",
            type: "ewaste",
            accepts: ["Laptops", "Tablets", "Phone Chargers", "Circuit Boards"]
        },
        {
            id: 3,
            name: "TechRecycle Processing Plant",
            address: "789 Industrial Blvd, Business Park",
            phone: "+919123456789",
            email: "contact@techrecycle.org",
            hours: "Mon-Fri: 7:00 AM - 4:00 PM",
            distance: "9.8 km",
            type: "ewaste",
            accepts: ["All Electronics", "Server Equipment", "Industrial Devices"]
        },
        
        // General Recycling Centers (type: recycling)
        {
            id: 4,
            name: "Community Recycling Center",
            address: "321 Green Street, Eco Park",
            phone: "+918765432109",
            email: "info@communityrecycle.com",
            hours: "Daily: 7:00 AM - 7:00 PM",
            distance: "5.3 km",
            type: "recycling",
            accepts: ["Plastic", "Metal", "Wood", "Cotton", "Paper", "Glass"]
        },
        {
            id: 5,
            name: "Sustainable Materials Recycling",
            address: "654 Eco Boulevard, Green Valley",
            phone: "+917654321098",
            email: "process@susmaterials.org",
            hours: "Mon-Sat: 8:00 AM - 6:00 PM",
            distance: "6.8 km",
            type: "recycling",
            accepts: ["Furniture", "Kitchen Items", "Wood Products", "Metal Scrap"]
        },
        {
            id: 6,
            name: "Circular Economy Recycling Hub",
            address: "987 Recycle Lane, Sustainability District",
            phone: "+919988776655",
            email: "support@circularecohub.com",
            hours: "Tue-Sun: 10:00 AM - 8:00 PM",
            distance: "7.9 km",
            type: "recycling",
            accepts: ["Building Materials", "Appliances", "Textiles", "Composite Materials"]
        },
        
        // Donation/Reuse Centers (type: donation)
        {
            id: 7,
            name: "Goodwill Community Center",
            address: "111 Charity Street, Hope Valley",
            phone: "+918899776655",
            email: "donate@goodwillcenter.org",
            hours: "Daily: 9:00 AM - 9:00 PM",
            distance: "2.1 km",
            type: "donation",
            accepts: ["Clothing", "Books", "Furniture", "Household Items"]
        },
        {
            id: 8,
            name: "Salvation Army Donation Hub",
            address: "222 Helping Hands Ave, Community Plaza",
            phone: "+917788996655",
            email: "intake@salvationarmy.org",
            hours: "Mon-Sat: 10:00 AM - 6:00 PM",
            distance: "3.7 km",
            type: "donation",
            accepts: ["All Donated Items", "Furniture", "Clothing", "Electronics"]
        },
        {
            id: 9,
            name: "Community Sharing Library",
            address: "333 Knowledge Lane, Education District",
            phone: "+916677889900",
            email: "books@sharinglibrary.org",
            hours: "Daily: 11:00 AM - 7:00 PM",
            distance: "4.2 km",
            type: "donation",
            accepts: ["Books", "Educational Materials", "Knowledge Resources"]
        }
    ];
}

// Function to find and display nearby facilities
window.findNearbyFacilities = function() {
  const statusElement = document.getElementById("locationStatus");
  const facilitiesListElement = document.getElementById("facilitiesList");
  const findBtn = document.getElementById("findFacilitiesBtn");
  
  if (findBtn) {
    findBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    findBtn.disabled = true;
  }

  if ("geolocation" in navigator) {
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting your location...';
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        statusElement.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Location found! Showing all facilities.`;
        
        // Display facilities (no actual geo-filtering here, just displaying all dummy data)
        displayFacilities(getAllDummyFacilities());
        
        if (findBtn) {
          findBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Location';
          findBtn.disabled = false;
        }
      },
      function(error) {
        console.error("Geolocation error:", error);
        let errorMsg = "Unable to get your location. ";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
          default:
            errorMsg += "An unknown error occurred.";
        }
        
        statusElement.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${errorMsg} Showing all facilities.`;
        
        // Still display facilities even if location fails
        displayFacilities(getAllDummyFacilities());
        
        if (findBtn) {
          findBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Try Again';
          findBtn.disabled = false;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    statusElement.innerHTML = `<i class="fas fa-exclamation-circle" style="color: var(--danger);"></i> Geolocation is not supported by your browser. Showing all facilities.`;
    displayFacilities(getAllDummyFacilities());
    
    if (findBtn) {
      findBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
      findBtn.disabled = false;
    }
  }
};

// Function to display facilities in the UI (Updated for detailed rendering)
function displayFacilities(facilities) {
  const facilitiesListElement = document.getElementById("facilitiesList");
  const locationStatus = document.getElementById("locationStatus");
  
  if (!facilitiesListElement) return;
  
  if (facilities.length === 0) {
    facilitiesListElement.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; background: white; border-radius: 8px; border: 1px solid #ddd;">
        <p style="color: #999; font-size: 1.1rem; margin: 0;">
          <i class="fas fa-search"></i> No specific facilities found for this item type.
        </p>
      </div>
    `;
    if (locationStatus) {
        locationStatus.innerHTML = '<i class="fas fa-info-circle"></i> Showing no results for the current item criteria.';
    }
    return;
  }
  
  // Set status based on the filtering logic that resulted in these facilities
  if (locationStatus) {
        const typeMap = { 'ewaste': 'E-Waste', 'donation': 'Donation/Reuse', 'recycling': 'General Recycling' };
        const facilityType = facilities[0]?.type;
        locationStatus.innerHTML = `<i class="fas fa-check-circle" style="color: var(--primary-green);"></i> Filtered: Showing ${facilities.length} ${typeMap[facilityType] || 'Facility'} options.`;
    }
  
  facilitiesListElement.innerHTML = facilities.map(facility => renderFacilityCard(facility)).join('');
}

// Helper function to render a single facility card (Updated for detailed rendering)
function renderFacilityCard(facility) {
    const iconMap = { 'ewaste': 'microchip', 'donation': 'hand-holding-heart', 'recycling': 'recycle' };
    const title = facility.type.charAt(0).toUpperCase() + facility.type.slice(1) + ' Center';
    
    return `
        <div style="background: white; border: 2px solid #ddd; border-radius: 10px; padding: 1.5rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: all 0.3s; hover:box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h4 style="color: var(--primary-green); margin: 0 0 1rem 0; font-size: 1.1rem;">
                <i class="fas fa-${iconMap[facility.type]}"></i> ${facility.name}
            </h4>
            
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 6px;">
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-map-pin" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Distance:</strong> ${facility.distance}
                </p>
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Address:</strong> ${facility.address}
                </p>
                <p style="margin: 0.5rem 0; color: #555; font-size: 0.95rem;">
                    <i class="fas fa-clock" style="color: var(--primary-green); margin-right: 0.5rem; width: 16px;"></i>
                    <strong>Hours:</strong> ${facility.hours}
                </p>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #e8f5e9; border-radius: 6px; border-left: 3px solid var(--primary-green);">
                <p style="margin: 0; color: var(--primary-green); font-size: 0.9rem;"><strong>Accepts:</strong></p>
                <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    ${facility.accepts.map(item => `
                        <span style="background: var(--primary-green); color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                            ${item}
                        </span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: #fff3e0; border-radius: 6px;">
                <p style="margin: 0; color: #333; font-size: 0.9rem;">
                    <i class="fas fa-phone" style="margin-right: 0.5rem;"></i>
                    <a href="tel:${facility.phone}" style="color: var(--primary-green); text-decoration: none; font-weight: 600;">${facility.phone}</a>
                </p>
                <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.85rem;">
                    <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
                    <a href="mailto:${facility.email}" style="color: var(--primary-green); text-decoration: none;">${facility.email}</a>
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <button 
                   onclick="makeCall('${facility.phone}');"
                   class="btn btn-primary" 
                   style="padding: 0.8rem; text-align: center; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 1rem;">
                    <i class="fas fa-phone"></i> Call Now
                </button>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}" 
                   target="_blank" 
                   class="btn btn-secondary" 
                   style="padding: 0.8rem; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; display: block; cursor: pointer;">
                    <i class="fas fa-directions"></i> Get Directions
                </a>
            </div>
        </div>
    `;
}


