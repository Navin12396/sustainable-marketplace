# Sustainable Marketplace 

A web-based platform that promotes sustainable living by connecting users with recycling centers, donation facilities, and NGOs for responsible item disposal and reuse.

## 🌱 Features

### 1. **User Authentication**
- User registration and login
- NGO registration and dashboard
- Anonymous authentication for browsing
- Secure logout functionality

### 2. **Item Listing & Management**
- Add items for sale or donation
- Upload images via Cloudinary
- Item categorization (Electronics, Furniture, Kitchen, Materials, etc.)
- Item condition tracking (Good, Fair, Needs Repair)
- Real-time item editing and deletion

### 3. **AI-Powered Recommendations**
- Google Gemini AI integration for smart disposal recommendations
- Generates personalized suggestions based on:
  - Item type and category
  - Item condition
  - Material composition
- Displays confidence scores for recommendations

### 4. **Smart Facility Finder**
- Locate nearby recycling centers, donation centers, and e-waste facilities
- Facility details include:
  - Distance from user location
  - Address and hours of operation
  - Contact information (phone, email)
  - Accepted item types
- One-click calling functionality for facilities
- Google Maps integration for directions

### 5. **Live Impact Counter**
- Real-time statistics dashboard showing:
  - Total items saved from landfills
  - CO₂ emissions reduced (in kg)
  - Number of active NGOs
  - Community members engaged
- Works for both logged-in and anonymous users
- Animated counter display

### 6. **Marketplace**
- Browse available items
- View item details with images and descriptions
- Interest/order management
- User-to-user communication for transactions

### 7. **NGO Dashboard**
- Specialized interface for NGO partners
- View donation requests
- Manage NGO-specific interactions
- Track community impact

## 📁 Project Structure

```
ABC1/
├── index.html              # Homepage with impact stats
├── login.html              # User login page
├── user-register.html      # User registration
├── ngo-register.html       # NGO registration
├── ngo-dashboard.html      # NGO dashboard
├── dashboard.html          # User dashboard
├── marketplace.html        # Item marketplace
├── add-item.html          # Add/list items with AI recommendations
├── item-detail.html       # Individual item details
├── order-detail.html      # Order/transaction details
├── item-submission.js     # Item submission logic
├── script.js              # Main application logic
├── styles.css             # Global styling
├── firebase-config.js     # Firebase configuration
├── gemini-service.js      # Gemini AI service integration
├── firestore.rules        # Firestore security rules
└── README.md              # This file
```

## 🔧 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Responsive design

### Backend & Database
- **Firebase Authentication** - User management
- **Firestore Database** - Real-time data storage
- **Firebase Storage** - Image/file storage
- **Cloudinary** - Image hosting and optimization

### AI & APIs
- **Google Gemini AI** - Smart recommendations
- **Geolocation API** - Location-based services
- **Google Maps API** - Directions and facility search

## 📋 Collections & Data Structure

### Firestore Collections

#### `users`
```javascript
{
  name: String,
  email: String,
  userType: "regular" | "ngo",
  carbonSaved: Number,
  profileImage: String,
  createdAt: Timestamp
}
```

#### `items`
```javascript
{
  name: String,
  category: String,
  condition: String,
  description: String,
  price: Number,
  image: String,
  userId: String,
  createdAt: Timestamp
}
```

#### `interests`
```javascript
{
  buyerId: String,
  sellerId: String,
  itemId: String,
  status: String,
  createdAt: Timestamp
}
```

#### `ngoInterests`
```javascript
{
  ngoId: String,
  donorId: String,
  itemId: String,
  status: String,
  createdAt: Timestamp
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (for Firebase CLI)
- Firebase project setup
- Cloudinary account
- Google Gemini API key

### Installation

1. **Clone/Download the project**
   ```bash
   cd ABC1
   ```

2. **Initialize Firebase** (if not already done)
   ```bash
   firebase init
   ```

3. **Configure Firebase Config**
   - Update `firebase-config.js` with your Firebase credentials

4. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

5. **Serve locally** (optional)
   ```bash
   firebase serve
   ```

### Configuration Files

#### `firebase-config.js`
Update with your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### `gemini-service.js`
Configure with your Gemini API key for AI recommendations

#### Cloudinary Integration
Update in `script.js`:
```javascript
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';
```

## 🔐 Firestore Security Rules

The application uses the following security model:

- **Users Collection**: Public read (for stats), authenticated write
- **Items Collection**: Public read, authenticated create, user-only update/delete
- **Interests/Orders**: Authenticated users only
- **NGO Interests**: NGO and donor specific

Rules are defined in `firestore.rules` and deployed via Firebase CLI.

## 📞 Call Now Feature

The "Call Now" button on facility cards:
- Uses the `tel:` protocol for click-to-call
- Opens phone dialer on mobile devices
- Opens calling apps (Skype, Teams, etc.) on desktop
- Passes the facility's phone number automatically

## 🤖 AI Recommendation System

The system provides smart disposal recommendations based on:

1. **Category Detection**
   - Electronics → E-Waste centers
   - Furniture/Kitchen/Materials → Recycling centers
   - Any item in good condition → Donation centers

2. **Confidence Scoring**
   - Calculates match percentage based on item attributes
   - Displays confidence level to user

3. **Local Resources**
   - Shows nearby facilities that accept the item type
   - Includes distance, contact, hours, and accepted items

## 📊 Live Impact Counter

The homepage displays real-time statistics:

- **Items Saved**: Total count of all items listed
- **CO₂ Reduced**: Sum of carbon saved by all users
- **Active NGOs**: Count of registered NGO organizations
- **Community Members**: Count of regular users

Works for all users (logged in or anonymous) with automatic fallback values if Firestore is unavailable.

## 🔄 Authentication Flow

1. **Anonymous Users**
   - Browse marketplace
   - View facilities
   - See live impact stats
   - Cannot list items or make purchases

2. **Regular Users**
   - All anonymous features plus:
   - List items for sale/donation
   - Express interest in items
   - Access user dashboard
   - Track transactions

3. **NGO Users**
   - Access specialized NGO dashboard
   - Receive donation requests
   - Manage NGO interactions

## 🎨 Styling

The application uses CSS custom properties (variables) for consistent theming:

```css
--primary-green: #2D9D78
--light-green: #E8F5E9
--white: #FFFFFF
--gray: #F5F5F5
--shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
```

Responsive design with mobile-first approach for all screen sizes.

## 📱 Key Pages

### Homepage (`index.html`)
- Hero section with platform introduction
- Live impact statistics
- Featured items
- Call-to-action buttons

### Add Item (`add-item.html`)
- Form to list new items
- AI-powered recommendations
- Facility finder integration
- Image upload via Cloudinary

### Marketplace (`marketplace.html`)
- Browse all available items
- Filter and search functionality
- Item cards with key details
- Direct purchase/interest options

### Dashboards
- **User Dashboard** (`dashboard.html`): Orders, transactions, profile
- **NGO Dashboard** (`ngo-dashboard.html`): Donation requests, impact tracking

## 🐛 Troubleshooting

### Stats Counter Not Showing
- Ensure Firestore rules allow public read access to `users` collection
- Check browser console for authentication errors
- Verify Firebase project is initialized

### Call Now Button Not Working
- Check if phone number format is valid (should start with +)
- On desktop, ensure a calling app is installed
- Test on mobile device for native dialer

### Images Not Uploading
- Verify Cloudinary credentials are correct
- Check file size limits
- Ensure upload preset is publicly configured

### AI Recommendations Not Working
- Verify Gemini API key is set in `gemini-service.js`
- Check API quota limits
- Review browser console for API errors

## 🚀 Future Enhancements

- [ ] Payment gateway integration
- [ ] Advanced search and filtering
- [ ] User ratings and reviews
- [ ] Email notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] Video uploads for items
- [ ] Real-time chat for sellers/buyers
- [ ] Carbon offset tracking
- [ ] Leaderboard system
- [ ] Gamification elements

## 📄 License

This project is created for the Sustainable Marketplace initiative.

## 👥 Support

For issues or feature requests, please contact the development team.

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Active & Ready for Judge Evaluation

### Github link
