const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware - Simplified CORS for Vercel
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        users: users.length,
        orders: orders.length
    });
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

// Admin endpoint to view database
app.get('/api/admin/database', (req, res) => {
    try {
        console.log('Admin database request received');
        console.log('Users in database:', users.length);
        console.log('Orders in database:', orders.length);
        
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

// Export for Vercel
module.exports = app;
