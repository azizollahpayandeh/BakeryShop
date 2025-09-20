# Artisan Bakery Website

A complete, responsive website for an online bakery shop specializing in traditional breads from around the world.

## Features

### 🏠 Homepage
- Beautiful landing page with bakery theme
- Hero section with call-to-action buttons
- Featured products showcase
- Key features highlighting (Fresh Daily, Fast Delivery, Premium Quality)

### 🍞 Products Page
- Complete bread collection including:
  - **Lavash** - Traditional Armenian flatbread (€2.50)
  - **Turkish Pide** - Authentic Turkish bread (€3.20)
  - **Afghan Naan** - Tandoor-baked bread (€2.80)
  - **Persian Barbari** - Sesame seed bread (€3.50)
  - **Artisan Sourdough** - 50-year starter culture (€4.20)
  - **Whole Wheat Loaf** - Organic nutritious bread (€3.80)
- Product descriptions with feature tags
- Order buttons for each product
- Shopping cart functionality

### 👤 User Authentication
- **Login Page**: Email/password authentication
- **Register Page**: Complete registration with German address standards:
  - Personal information (name, email, phone, birth date)
  - German address format (street, house number, postal code, city, state)
  - Password confirmation
  - Newsletter subscription
  - Terms and conditions agreement

### 🛒 Checkout System
- Order summary with cart items
- Delivery information form
- German address standards compliance
- Delivery options (date/time selection)
- Payment methods (Cash, Card, PayPal, Bank Transfer)
- Credit card details (when card payment selected)
- Order confirmation and processing

### ℹ️ About Us Page
- Company history and heritage
- Master baker story (Ahmed Hassan)
- Quality commitment details
- Team member profiles
- Contact information and hours
- Community involvement

## Technical Features

### 🎨 Design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional bakery-themed design
- **Color Scheme**: Warm browns (#8B4513) with gold accents (#FFD700)
- **Typography**: Playfair Display for headings, Open Sans for body text
- **Icons**: Font Awesome icons throughout

### 📱 Mobile Optimization
- Hamburger menu for mobile navigation
- Responsive grid layouts
- Touch-friendly buttons and forms
- Optimized images and layouts

### ⚡ Functionality
- **Shopping Cart**: Local storage-based cart system
- **Form Validation**: Client-side validation with visual feedback
- **Smooth Animations**: CSS transitions and hover effects
- **Notification System**: Toast notifications for user actions
- **Order Management**: Complete order flow from cart to checkout

## File Structure

```
├── server.js           # Backend server (Node.js + Express)
├── package.json        # Dependencies and scripts
├── bakery.db           # SQLite database (auto-created)
├── index.html          # Homepage
├── login.html          # Login page
├── register.html       # Registration page
├── profile.html        # User profile page
├── products.html       # Products catalog
├── about.html          # About us page
├── checkout.html       # Checkout/payment page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
├── README.md           # This file
└── SETUP.md            # Backend setup guide
```

## Getting Started

### Frontend Only (Static Website)
1. **Open the website**: Simply open `index.html` in your web browser
2. **Navigate**: Use the navigation menu to explore different pages
3. **Shop**: Browse products and add items to cart
4. **Register**: Create an account with German address standards
5. **Checkout**: Complete your order with delivery and payment information

### Full Stack (With Backend)
1. **Install dependencies**: Run `npm install` in the project directory
2. **Start server**: Run `npm start` or `npm run dev`
3. **Access website**: Go to `http://localhost:3000`
4. **Register**: Create an account (data will be saved to database)
5. **Login**: Use your credentials to access profile and place orders
6. **Profile**: View your information and order history
7. **Orders**: Only logged-in users can place orders

## Key Features Implemented

### Frontend Features
✅ **Complete Bread Collection**: Lavash, Turkish, Afghan, Barbari, and more  
✅ **German Address Standards**: Proper PLZ, Bundesland, street format  
✅ **Responsive Design**: Mobile-first approach  
✅ **Shopping Cart**: Add to cart, view summary, checkout  
✅ **Professional Design**: Bakery-themed, clean, modern  
✅ **High-Quality Images**: Professional bread photography

### Backend Features (NEW!)
✅ **User Registration**: Complete signup with German address standards  
✅ **User Authentication**: Secure login/logout with sessions  
✅ **Profile Management**: View user information and order history  
✅ **Order Protection**: Only logged-in users can place orders  
✅ **Database Storage**: SQLite database for users and orders  
✅ **Session Management**: Secure user sessions  
✅ **Password Security**: bcrypt encryption for passwords  
✅ **API Endpoints**: RESTful API for all operations  

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The website uses high-quality images from Unsplash
- All forms include proper validation
- German postal code format (5 digits) is enforced
- Shopping cart persists using localStorage
- Responsive design works on all screen sizes
- Professional bakery theme with warm, inviting colors

Enjoy your new bakery website! 🥖✨
