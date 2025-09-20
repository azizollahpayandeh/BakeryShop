const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://bakery-shop-*.vercel.app',
        'https://*.vercel.app',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
      ].filter(Boolean)
    : ['http://localhost:3001', 'http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                const pattern = allowedOrigin.replace(/\*/g, '.*');
                return new RegExp(`^${pattern}$`).test(origin);
            }
            return origin === allowedOrigin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// In-memory storage for serverless (replace with proper database in production)
let users = [];
let orders = [];
let nextUserId = 1;
let nextOrderId = 1;

// Simple authentication middleware using JWT-like tokens
function generateToken(userId) {
    return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

function verifyToken(token) {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        // Check if token is not older than 24 hours
        if (Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000) {
            return null;
        }
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        const userId = verifyToken(token);
        if (userId) {
            req.userId = userId;
            return next();
        }
    }
    res.status(401).json({ error: 'Authentication required' });
}

// Initialize sample data (for development)
function initializeData() {
    // Add some sample users for testing
    if (users.length === 0) {
        console.log('Initializing sample data...');
    }
}


// Routes

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, birthDate, password, confirmPassword,
            street, houseNumber, apartment, postalCode, city, state, newsletter
        } = req.body;

        // Validation
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: nextUserId++,
            firstName,
            lastName,
            email,
            phone,
            birthDate,
            password: hashedPassword,
            street,
            houseNumber,
            apartment,
            postalCode,
            city,
            state,
            country: 'Germany',
            newsletter: newsletter ? 1 : 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        res.json({ 
            success: true, 
            message: 'User registered successfully',
            userId: newUser.id 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({ 
            success: true, 
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                street: user.street,
                houseNumber: user.houseNumber,
                apartment: user.apartment,
                postalCode: user.postalCode,
                city: user.city,
                state: user.state,
                country: user.country,
                newsletter: user.newsletter
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User logout
app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
    try {
        const user = users.find(u => u.id === req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            birthDate: user.birthDate,
            street: user.street,
            houseNumber: user.houseNumber,
            apartment: user.apartment,
            postalCode: user.postalCode,
            city: user.city,
            state: user.state,
            country: user.country,
            newsletter: user.newsletter
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        const userId = verifyToken(token);
        if (userId) {
            return res.json({ authenticated: true, userId });
        }
    }
    res.json({ authenticated: false });
});

// Create order
app.post('/api/orders', requireAuth, (req, res) => {
    try {
        const {
            items, totalAmount, firstName, lastName, email, phone,
            street, houseNumber, apartment, postalCode, city, state,
            deliveryDate, deliveryTime, specialInstructions, paymentMethod
        } = req.body;

        const newOrder = {
            id: nextOrderId++,
            userId: req.userId,
            items: JSON.stringify(items),
            totalAmount,
            firstName,
            lastName,
            email,
            phone,
            street,
            houseNumber,
            apartment,
            postalCode,
            city,
            state,
            deliveryDate,
            deliveryTime,
            specialInstructions,
            paymentMethod,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);

        res.json({ 
            success: true, 
            message: 'Order created successfully',
            orderId: newOrder.id 
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get user orders
app.get('/api/orders', requireAuth, (req, res) => {
    try {
        const userOrders = orders
            .filter(order => order.userId === req.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(userOrders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize data
initializeData();

// Export for Vercel
module.exports = app;

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
