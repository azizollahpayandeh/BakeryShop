// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Check authentication status and update navigation
function checkAuthStatus() {
    fetch('/api/auth/status', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const authLink = document.getElementById('authLink');
        const profileLink = document.getElementById('profileLink');
        
        if (data.authenticated) {
            // User is logged in
            if (authLink) authLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        } else {
            // User is not logged in
            if (authLink) authLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking auth status:', error);
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            emailInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }

    // Password validation
    const passwordInput = form.querySelector('input[type="password"]');
    if (passwordInput && passwordInput.value) {
        if (passwordInput.value.length < 6) {
            passwordInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }

    // Password confirmation validation
    const confirmPasswordInput = form.querySelector('input[name="confirmPassword"]');
    if (confirmPasswordInput && confirmPasswordInput.value) {
        if (confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordInput.style.borderColor = '#e74c3c';
            isValid = false;
        }
    }

    return isValid;
}

// Order functionality
function addToCart(productName, price) {
    // Get product details from the product card
    const productCard = event.target.closest('.product-card') || event.target.closest('.product-item');
    const productImage = productCard.querySelector('img').src;
    const productDescription = productCard.querySelector('p').textContent;
    const productFeatures = Array.from(productCard.querySelectorAll('.feature-tag')).map(tag => tag.textContent);
    
    // Store selected product data
    const productData = {
        name: productName,
        price: parseFloat(price.replace('€', '')),
        image: productImage,
        description: productDescription,
        features: productFeatures
    };
    
    localStorage.setItem('selectedProduct', JSON.stringify(productData));
    
    showNotification(`${productName} added to cart!`);
    
    // Redirect to product payment page after showing notification
    setTimeout(() => {
        window.location.href = 'product-payment.html';
    }, 1500);
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #8B4513;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Checkout functionality
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Store cart data for checkout page
    localStorage.setItem('checkoutData', JSON.stringify(cart));
    window.location.href = 'payment.html';
}

// Logout function
function logout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Logged out successfully');
            // Update navigation
            checkAuthStatus();
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
        showNotification('Error logging out');
    });
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on page load
    checkAuthStatus();
    // Add order buttons functionality on products page
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card') || this.closest('.product-item');
            const productName = productCard.querySelector('h3').textContent;
            const price = productCard.querySelector('.price').textContent;
            addToCart(productName, price);
        });
    });

    // Handle form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                if (this.id === 'loginForm') {
                    handleLogin(this);
                } else if (this.id === 'registerForm') {
                    handleRegister(this);
                } else if (this.id === 'checkoutForm') {
                    handleCheckout(this);
                }
            } else {
                showNotification('Please fill in all required fields correctly.');
            }
        });
    });

    // Load cart data on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckoutData();
    }
});

// Load checkout data
function loadCheckoutData() {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || [];
    const orderSummary = document.querySelector('.order-summary');
    
    if (orderSummary && checkoutData.length > 0) {
        let total = 0;
        let itemsHtml = '';
        
        checkoutData.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHtml += `
                <div class="order-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>€${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
        
        orderSummary.innerHTML = `
            <h3>Order Summary</h3>
            ${itemsHtml}
            <div class="total">Total: €${total.toFixed(2)}</div>
        `;
    }
}

// Handle login
function handleLogin(form) {
    const formData = new FormData(form);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Login successful!');
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification(data.error || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.');
    });
}

// Handle registration
function handleRegister(form) {
    const formData = new FormData(form);
    const registerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        birthDate: formData.get('birthDate'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        street: formData.get('street'),
        houseNumber: formData.get('houseNumber'),
        apartment: formData.get('apartment'),
        postalCode: formData.get('postalCode'),
        city: formData.get('city'),
        state: formData.get('state'),
        newsletter: formData.get('newsletter') === 'on'
    };

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Registration successful! Please login.');
            form.reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showNotification(data.error || 'Registration failed');
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.');
    });
}

// Handle checkout
function handleCheckout(form) {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || [];
    
    if (checkoutData.length === 0) {
        showNotification('No items in cart!');
        return;
    }

    const formData = new FormData(form);
    const orderData = {
        items: checkoutData,
        totalAmount: checkoutData.reduce((total, item) => total + (item.price * item.quantity), 0),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        street: formData.get('street'),
        houseNumber: formData.get('houseNumber'),
        apartment: formData.get('apartment'),
        postalCode: formData.get('postalCode'),
        city: formData.get('city'),
        state: formData.get('state'),
        deliveryDate: formData.get('deliveryDate'),
        deliveryTime: formData.get('deliveryTime'),
        specialInstructions: formData.get('specialInstructions'),
        paymentMethod: formData.get('paymentMethod')
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Order placed successfully! Thank you for your purchase.');
            
            // Clear cart
            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutData');
            
            // Redirect to profile page
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
        } else {
            showNotification(data.error || 'Order failed');
        }
    })
    .catch(error => {
        console.error('Order error:', error);
        showNotification('Order failed. Please try again.');
    });
}

// Place order function (legacy)
function placeOrder() {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || [];
    
    if (checkoutData.length === 0) {
        alert('No items in cart!');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}
