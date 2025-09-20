const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Session configuration
app.use(session({
    secret: 'artisan-bakery-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database setup
const db = new sqlite3.Database('./bakery.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        birthDate TEXT,
        password TEXT NOT NULL,
        street TEXT NOT NULL,
        houseNumber TEXT NOT NULL,
        apartment TEXT,
        postalCode TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT DEFAULT 'Germany',
        newsletter INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        items TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        street TEXT NOT NULL,
        houseNumber TEXT NOT NULL,
        apartment TEXT,
        postalCode TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        deliveryDate TEXT NOT NULL,
        deliveryTime TEXT NOT NULL,
        specialInstructions TEXT,
        paymentMethod TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    console.log('Database tables initialized');
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
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
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (row) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            db.run(
                `INSERT INTO users (firstName, lastName, email, phone, birthDate, password, 
                 street, houseNumber, apartment, postalCode, city, state, newsletter) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, email, phone, birthDate, hashedPassword,
                 street, houseNumber, apartment, postalCode, city, state, newsletter ? 1 : 0],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    res.json({ 
                        success: true, 
                        message: 'User registered successfully',
                        userId: this.lastID 
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.userEmail = user.email;

        res.json({ 
            success: true, 
            message: 'Login successful',
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
    });
});

// User logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

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
    });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, userId: req.session.userId });
    } else {
        res.json({ authenticated: false });
    }
});

// Create order
app.post('/api/orders', requireAuth, (req, res) => {
    const {
        items, totalAmount, firstName, lastName, email, phone,
        street, houseNumber, apartment, postalCode, city, state,
        deliveryDate, deliveryTime, specialInstructions, paymentMethod
    } = req.body;

    const itemsJson = JSON.stringify(items);

    db.run(
        `INSERT INTO orders (userId, items, totalAmount, firstName, lastName, email, phone,
         street, houseNumber, apartment, postalCode, city, state, 
         deliveryDate, deliveryTime, specialInstructions, paymentMethod) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.session.userId, itemsJson, totalAmount, firstName, lastName, email, phone,
         street, houseNumber, apartment, postalCode, city, state,
         deliveryDate, deliveryTime, specialInstructions, paymentMethod],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create order' });
            }

            res.json({ 
                success: true, 
                message: 'Order created successfully',
                orderId: this.lastID 
            });
        }
    );
});

// Get user orders
app.get('/api/orders', requireAuth, (req, res) => {
    db.all('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC', [req.session.userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(orders);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});
