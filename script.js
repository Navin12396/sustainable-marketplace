// Firebase Configuration
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
    }
    updateAuthUI();
    initializePage();
  });
});

// Update authentication UI
function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userGreeting = document.getElementById("userGreeting");
  // Dashboard and Add Item links must be fetched from the navbar structure
  // We'll use a safer selector if the structure is consistent
  const dashboardLink = document.querySelector('a[href="dashboard.html"]');
  const addItemLink = document.querySelector('a[href="add-item.html"]');

  // Find all Sign Up buttons/links and Login buttons/links
  const signUpBtn = document.querySelector('a[href="register.html"]');
  const navLinks = document.querySelector('.nav-links'); // Assuming this exists on all pages

  if (currentUser) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signUpBtn) signUpBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (userGreeting) {
      userGreeting.textContent = `Hello, ${
        currentUser.displayName || currentUser.name || "User"
      }`;
      userGreeting.style.display = "inline";
    }
    // Dashboard and Add Item links are always displayed in the nav for logged in users
  } else {
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

    if (featuredItemsContainer && !itemsSnapshot.empty) {
      const items = [];
      itemsSnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

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
    } else if (featuredItemsContainer) {
      featuredItemsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                    <p>No items listed yet. Be the first to list an item!</p>
                    <a href="add-item.html" class="btn btn-primary">List First Item</a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error loading featured items:", error);
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
        showNotification("Login successful!", "success");
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

// Add Item Page
function initAddItemPage() {
  // Check authentication
  if (!currentUser) {
    showNotification("Please login to list items", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  const addItemForm = document.getElementById("addItemForm");
  if (addItemForm) {
    // NOTE: AI Recommendations button logic is now handled in the HTML file's inline script
    // using the global window.getAIRecommendations function.

    // Form submission
    addItemForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const itemData = {
        name: document.getElementById("itemName").value,
        category: document.getElementById("category").value,
        condition: document.getElementById("condition").value,
        description: document.getElementById("description").value,
        materials: document.getElementById("materials").value,
        location: document.getElementById("location").value,
      };
      
      // Since the form does not include an image file input, we assume it's missing or simplified.
      // We will skip image upload for this fix, assuming the Firebase functions will use a placeholder as defined in firebase-config.js.
      
      const submitBtn = addItemForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Listing Item...';
      submitBtn.disabled = true;

      try {
        // Add item to Firestore
        const itemRef = await db.collection("items").add({
          ...itemData,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.name,
          userEmail: currentUser.email,
          imageUrls: [`https://via.placeholder.com/400x300/90EE90/2E8B57?text=${encodeURIComponent(itemData.name)}`], // Use placeholder
          status: "available",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          views: 0,
          likes: 0,
        });

        // Update user stats
        await db
          .collection("users")
          .doc(currentUser.uid)
          .update({
            itemsListed: firebase.firestore.FieldValue.increment(1),
            // The updateUserStats function logic from firebase-config.js is not easily accessible here.
            // We'll trust the rules to be updated on the server for full impact.
          });

        showNotification("Item listed successfully!", "success");
        setTimeout(() => {
          window.location.href = "marketplace.html";
        }, 1500);
      } catch (error) {
        showNotification(error.message, "error");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Marketplace Page
async function initMarketplacePage() {
  const itemsContainer = document.getElementById("itemsContainer");
  
  // Load all items initially
  await loadItems();

  // Filter functionality
  const categoryFilter = document.getElementById("categoryFilter");
  const locationFilter = document.getElementById("locationFilter");
  const conditionFilter = document.getElementById("conditionFilter"); // Added

  if (categoryFilter) {
    categoryFilter.addEventListener("change", loadItems);
  }

  if (locationFilter) {
    locationFilter.addEventListener("input", loadItems);
  }
  
  if (conditionFilter) {
    conditionFilter.addEventListener("change", loadItems);
  }

  async function loadItems() {
    try {
      let query = db.collection("items").where("status", "==", "available");

      const category = document.getElementById("categoryFilter")?.value;
      const location = document.getElementById("locationFilter")?.value;
      const condition = document.getElementById("conditionFilter")?.value;

      if (category && category !== "all") {
        query = query.where("category", "==", category);
      }

      // Querying for location will be challenging with Firestore index limitations.
      // We will perform client-side filtering for location and condition for now.

      const itemsSnapshot = await query.orderBy("createdAt", "desc").get();

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
      
      const noResults = document.getElementById('noResults');

      if (itemsContainer) {
        if (items.length === 0) {
          itemsContainer.style.display = 'none';
          if (noResults) noResults.style.display = 'block';
        } else {
          itemsContainer.style.display = 'grid';
          if (noResults) noResults.style.display = 'none';
            
          itemsContainer.innerHTML = items
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
                                <span class="item-category">${
                                  item.category
                                }</span>
                                <h3 class="item-title">${item.name}</h3>
                                <p class="item-description">${
                                  item.description
                                    ? item.description.substring(0, 100) + "..."
                                    : "No description available"
                                }</p>
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
            )
            .join("");
        }
      }
    } catch (error) {
      console.error("Error loading items:", error);
      showNotification("Error loading items", "error");
    }
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

      // Update stats
      document.getElementById("itemsListed").textContent =
        userData.itemsListed || 0;
      document.getElementById("co2Saved").textContent = `${(
        userData.carbonSaved || 0
      ).toFixed(1)} kg`;
      document.getElementById("waterSaved").textContent = `${(
        userData.waterSaved || 0
      ).toLocaleString()} L`;
      document.getElementById("landfillReduced").textContent = `${(
        userData.landfillReduced || 0
      ).toFixed(2)} m³`;

      // Load user's items
      const itemsSnapshot = await db
        .collection("items")
        .where("userId", "==", currentUser.uid)
        .orderBy("createdAt", "desc")
        .get();

      const myItemsContainer = document.getElementById("myItems");

      if (myItemsContainer) {
        if (itemsSnapshot.empty) {
          myItemsContainer.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <p>You haven't listed any items yet.</p>
                            <a href="add-item.html" class="btn btn-primary">List Your First Item</a>
                        </div>
                    `;
        } else {
          const items = [];
          itemsSnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });

          myItemsContainer.innerHTML = items
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
                                <span class="item-category">${
                                  item.category
                                }</span>
                                <h3 class="item-title">${item.name}</h3>
                                <p><strong>Status:</strong> <span class="status-${
                                  item.status
                                }">${item.status}</span></p>
                                <div style="margin-top: 1rem; display: flex; gap: 10px;">
                                    <a href="item-detail.html?id=${
                                      item.id
                                    }" class="btn btn-primary" style="padding: 5px 15px;">
                                        View
                                    </a>
                                    <button onclick="editItem('${
                                      item.id
                                    }')" class="btn btn-secondary" style="padding: 5px 15px;">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    `
            )
            .join("");
        }
      }
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showNotification("Error loading dashboard", "error");
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
      
      // Override the global display function to target the new IDs if on this page
      window.displayAIRecommendations = function(recommendations) {
          if (!aiSection || !aiResults) return;

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
          verified: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          itemsReceived: 0,
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
                  text: `You are a sustainability expert. Analyze this item for the most environmentally friendly disposal/reuse options:

Item: ${itemData.name || "Unnamed item"}
Category: ${itemData.category || "General"}
Condition: ${itemData.condition || "Unknown"}
Materials: ${itemData.materials || "Not specified"}
Description: ${itemData.description || "No description provided"}

Provide recommendations in this JSON format:
{
    "recommendations": [
        {
            "type": "reuse/recycle/donate/repair",
            "action": "Specific action to take",
            "confidence": 85,
            "reason": "Why this is environmentally beneficial",
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
    await auth.signOut();
    showNotification("Logged out successfully", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (error) {
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

window.requestItem = function (itemId) {
  if (!currentUser) {
    showNotification("Please login to request items", "warning");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }
  showNotification("Request feature coming soon!", "info");
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
      window.displayAIRecommendations(recommendations);
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