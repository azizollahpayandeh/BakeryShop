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

// Serve static files
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

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
        // Token never expires - permanent session
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.body.token || 
                  req.query.token;
    
    console.log('Auth token received:', token ? 'Yes' : 'No');
    
    if (token) {
        const userId = verifyToken(token);
        console.log('Token verified, userId:', userId);
        if (userId) {
            req.userId = userId;
            return next();
        }
    }
    console.log('Authentication failed');
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

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve CSS and JS files with proper headers
app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/languages.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, 'languages.js'));
});

// Handle all static files
app.get('*.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.png', (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.jpg', (req, res) => {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.jpeg', (req, res) => {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.gif', (req, res) => {
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.svg', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

app.get('*.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.join(__dirname, req.path));
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        
        const {
            firstName, lastName, phone,
            street, houseNumber, apartment, postalCode, city, state
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !phone || !street || !houseNumber || !postalCode || !city || !state) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Check if user already exists by phone
        const existingUser = users.find(user => user.phone === phone);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this phone number' });
        }

        // Create user
        const newUser = {
            id: nextUserId++,
            firstName: firstName || '',
            lastName: lastName || '',
            phone: phone || '',
            street: street || '',
            houseNumber: houseNumber || '',
            apartment: apartment || '',
            postalCode: postalCode || '',
            city: city || '',
            state: state || '',
            country: 'Deutschland',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        console.log('User created successfully:', newUser.id);

        // Generate permanent token (never expires)
        const token = generateToken(newUser.id);

        res.json({ 
            success: true, 
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
                street: newUser.street,
                houseNumber: newUser.houseNumber,
                apartment: newUser.apartment,
                postalCode: newUser.postalCode,
                city: newUser.city,
                state: newUser.state,
                country: newUser.country
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
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

// Create order (simple bread order) - with flexible auth for Vercel
app.post('/api/orders', (req, res) => {
    try {
        const { quantity, totalPrice, userId, userData } = req.body;
        
        console.log('Order creation request:', { quantity, totalPrice, userId, userData });
        
        let user;
        let finalUserId;
        
        // Try to get user from token first
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            const tokenUserId = verifyToken(token);
            if (tokenUserId) {
                user = users.find(u => u.id === tokenUserId);
                finalUserId = tokenUserId;
                console.log('User found via token:', user);
            }
        }
        
        // If no user found via token, try to use provided userData
        if (!user && userData) {
            // Find user by phone number from userData
            user = users.find(u => u.phone === userData.phone);
            if (user) {
                finalUserId = user.id;
                console.log('User found via userData:', user);
            }
        }
        
        // If still no user, try userId from request body
        if (!user && userId) {
            user = users.find(u => u.id === userId);
            finalUserId = userId;
            console.log('User found via userId:', user);
        }
        
        if (!user) {
            console.log('No user found. Available users:', users.map(u => ({ id: u.id, phone: u.phone, name: u.firstName + ' ' + u.lastName })));
            return res.status(404).json({ error: 'User not found' });
        }

        const newOrder = {
            id: nextOrderId++,
            userId: finalUserId,
            productName: 'Traditionelles Barbari-Brot',
            quantity: quantity || 1,
            totalPrice: totalPrice || 3.50,
            totalAmount: totalPrice || 3.50,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            street: user.street,
            houseNumber: user.houseNumber,
            apartment: user.apartment,
            postalCode: user.postalCode,
            city: user.city,
            state: user.state,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        console.log('Order created successfully:', newOrder.id);

        res.json({ 
            success: true, 
            message: 'Order created successfully',
            orderId: newOrder.id 
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }
});

// Get user orders - flexible auth for Vercel
app.get('/api/orders', (req, res) => {
    try {
        let user = null;
        let userId = null;
        
        // Try to get user from token
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            userId = verifyToken(token);
            if (userId) {
                user = users.find(u => u.id === userId);
            }
        }
        
        // If no user found via token, try to get from query params
        if (!user && req.query.userId) {
            userId = parseInt(req.query.userId);
            user = users.find(u => u.id === userId);
        }
        
        console.log('Get orders request - user:', user, 'userId:', userId);
        
        if (!user) {
            // Return all orders for admin panel (no specific user)
            const allOrders = orders.map(order => {
                const orderUser = users.find(u => u.id === order.userId);
                return {
                    id: order.id,
                    userId: order.userId,
                    firstName: order.firstName || orderUser?.firstName,
                    lastName: order.lastName || orderUser?.lastName,
                    phone: order.phone || orderUser?.phone,
                    productName: order.productName || 'Traditionelles Barbari-Brot',
                    quantity: order.quantity || 1,
                    totalPrice: order.totalPrice || order.totalAmount || 0,
                    totalAmount: order.totalAmount || order.totalPrice || 0,
                    street: order.street || orderUser?.street,
                    houseNumber: order.houseNumber || orderUser?.houseNumber,
                    apartment: order.apartment || orderUser?.apartment,
                    postalCode: order.postalCode || orderUser?.postalCode,
                    city: order.city || orderUser?.city,
                    state: order.state || orderUser?.state,
                    createdAt: order.createdAt,
                    status: order.status
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json({ success: true, orders: allOrders });
            return;
        }
        
        // Check if user is admin (Azizollah Payandeh - both English and Persian)
        if ((user.firstName === 'Azizollah' && user.lastName === 'Payandeh') || 
            (user.firstName === 'عزیزالله' && user.lastName === 'پاینده')) {
            // Admin can see all orders
            const allOrders = orders.map(order => {
                const orderUser = users.find(u => u.id === order.userId);
                return {
                    id: order.id,
                    userId: order.userId,
                    firstName: order.firstName || orderUser?.firstName,
                    lastName: order.lastName || orderUser?.lastName,
                    phone: order.phone || orderUser?.phone,
                    productName: order.productName || 'Traditionelles Barbari-Brot',
                    quantity: order.quantity || 1,
                    totalPrice: order.totalPrice || order.totalAmount || 0,
                    totalAmount: order.totalAmount || order.totalPrice || 0,
                    street: order.street || orderUser?.street,
                    houseNumber: order.houseNumber || orderUser?.houseNumber,
                    apartment: order.apartment || orderUser?.apartment,
                    postalCode: order.postalCode || orderUser?.postalCode,
                    city: order.city || orderUser?.city,
                    state: order.state || orderUser?.state,
                    createdAt: order.createdAt,
                    status: order.status
                };
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            res.json({ success: true, orders: allOrders });
        } else {
            // Regular user can only see their own orders
            const userOrders = orders
                .filter(order => order.userId === userId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            res.json({ success: true, orders: userOrders });
        }
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Admin endpoint to view database (without strict auth for now)
app.get('/api/admin/database', (req, res) => {
    try {
        console.log('Admin database request received');
        console.log('Users in database:', users.length);
        console.log('Orders in database:', orders.length);
        
        // For now, allow access to anyone (we'll check client-side)
        res.json({
            success: true,
            users: users,
            orders: orders,
            totalUsers: users.length,
            totalOrders: orders.length
        });
    } catch (error) {
        console.error('Database view error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Alternative admin endpoint with proper auth
app.get('/api/admin/database/secure', requireAuth, (req, res) => {
    try {
        const user = users.find(u => u.id === req.userId);
        
        // Check if user is admin
        if (user && ((user.firstName === 'Azizollah' && user.lastName === 'Payandeh') || 
                     (user.firstName === 'عزیزالله' && user.lastName === 'پاینده'))) {
            res.json({
                success: true,
                users: users,
                orders: orders,
                totalUsers: users.length,
                totalOrders: orders.length
            });
        } else {
            res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
    } catch (error) {
        console.error('Database view error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark order as delivered
app.post('/api/admin/mark-delivered', (req, res) => {
    try {
        const { orderId } = req.body;
        
        console.log('Marking order as delivered:', orderId);
        
        // Find the order
        const orderIndex = orders.findIndex(order => order.id === parseInt(orderId));
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Update order status
        orders[orderIndex].status = 'delivered';
        orders[orderIndex].deliveredAt = new Date().toISOString();
        
        console.log('Order marked as delivered successfully:', orderId);
        
        res.json({ 
            success: true, 
            message: 'Order marked as delivered successfully' 
        });
    } catch (error) {
        console.error('Mark delivered error:', error);
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
