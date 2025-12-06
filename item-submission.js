// This file contains the logic for submitting a new item listing.

function handleAddItemFormSubmission(form) {
    if (!form) return;
    
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Check authentication (currentUser, db, storage are assumed to be defined in script.js scope)
        if (!window.currentUser) {
            window.showNotification("Please login to list items", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
            return;
        }

        // 1. GATHER DATA
        const actionType = document.querySelector('input[name="actionType"]:checked').value;
        const isDonation = actionType === 'donate';

        // Get Price (will be null/empty string if hidden/not required)
        let itemPrice = isDonation ? 0 : (document.getElementById("price").value || 0);
        
        // Ensure price is treated as a number and validate if selling
        itemPrice = parseFloat(itemPrice); 
        
        if (actionType === 'sell' && (isNaN(itemPrice) || itemPrice < 0)) {
            window.showNotification("Please enter a valid selling price (0 or higher).", "error");
            return;
        }
        
        // Default price to 0 if it's a donation
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
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Listing Item...';
        submitBtn.disabled = true;

        try {
            const imageUrls = [];

            // 1. UPLOAD IMAGES TO CLOUDINARY
            if (images && images.length > 0) {
                for (const image of images) {
                    const formData = new FormData();
                    formData.append('file', image);
                    formData.append('upload_preset', window.CLOUDINARY_UPLOAD_PRESET || 'Itemss');
                    formData.append('folder', 'items');
                    
                    const response = await fetch(
                        `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME || 'dyvuqtegk'}/image/upload`,
                        { method: 'POST', body: formData }
                    );
                    
                    if (!response.ok) throw new Error(`Image upload failed: ${response.statusText}`);
                    const data = await response.json();
                    imageUrls.push(data.secure_url);
                }
            } else {
                // Use placeholder image if no image is uploaded
                imageUrls.push(`https://via.placeholder.com/400x300/90EE90/2E8B57?text=${encodeURIComponent(itemData.name)}`);
            }

            // 2. DEFINE ITEM DATA with Price and Donation Status
            
            const itemDoc = {
                ...itemData,
                price: itemPrice, // Price stored here
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.name,
                userEmail: currentUser.email,
                imageUrls,
                status: 'available',
                donationStatus: isDonation ? 'Pending Donation' : `Listed for $${itemPrice.toFixed(2)}`,
                isDonation: isDonation, 
                // Use global firebase.firestore.FieldValue.serverTimestamp()
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: 0,
            };

            // Use global db instance from script.js
            const docRef = await db.collection("items").add(itemDoc);

            // 3. UPDATE USER STATS
            const updateData = {
                itemsListed: firebase.firestore.FieldValue.increment(1),
                carbonSaved: firebase.firestore.FieldValue.increment(2.5),       
                waterSaved: firebase.firestore.FieldValue.increment(1000),      
                landfillReduced: firebase.firestore.FieldValue.increment(0.05), 
            };

            if (isDonation) {
                 // Increment the donated count only if it's a donation
                 updateData.itemsDonated = firebase.firestore.FieldValue.increment(1);
            }
            
            await db.collection("users").doc(currentUser.uid).update(updateData);
            
            window.showNotification(`Item listed as ${isDonation ? 'Donation' : 'Sale'} successfully!`, "success");
            setTimeout(() => {
                window.location.href = "marketplace.html";
            }, 1500);
        } catch (error) {
            console.error("Add item error:", error);
            window.showNotification(error.message, "error"); 
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Global function to be called from script.js
window.initAddItemPageForm = function() {
    const addItemForm = document.getElementById("addItemForm");
    if (addItemForm) {
        handleAddItemFormSubmission(addItemForm);
    }
};