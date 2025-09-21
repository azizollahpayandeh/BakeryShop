// Language translations
const translations = {
    de: {
        // Navigation
        bakery: "norbrot",
        logout: "Abmelden",
        
        // Registration
        registration: "Registrierung bei der Bäckerei",
        registrationSubtitle: "Registrieren Sie sich, um Barbari-Brot zu bestellen",
        personalInfo: "Persönliche Informationen",
        firstName: "Vorname",
        lastName: "Nachname",
        phone: "Telefonnummer",
        addressInfo: "Adressinformationen Deutschland",
        street: "Straßenname",
        houseNumber: "Hausnummer",
        apartment: "Wohnung/Einheit (optional)",
        postalCode: "Postleitzahl (PLZ)",
        city: "Stadt",
        state: "Bundesland",
        selectState: "Bundesland auswählen",
        registerButton: "Registrieren und Anmelden",
        
        // Products
        freshBread: "Frisches Barbari-Brot",
        price: "Preis",
        quantity: "Anzahl",
        confirmOrder: "Bestellung bestätigen",
        
        // Modal
        orderConfirmed: "Bestellung bestätigt!",
        product: "Produkt",
        pieces: "Stück",
        unitPrice: "Einzelpreis",
        totalPrice: "Gesamtpreis",
        paymentInfo: "Die Zahlung erfolgt bar bei der Lieferung.",
        close: "Schließen",
        
        // Messages
        registrationSuccess: "Registrierung erfolgreich! Sie werden angemeldet...",
        logoutSuccess: "Erfolgreich abgemeldet",
        languageChanged: "Sprache gewechselt zu: Deutsch"
    },
    
    tr: {
        // Navigation
        bakery: "norbrot",
        logout: "Çıkış",
        
        // Registration
        registration: "Fırına Kayıt",
        registrationSubtitle: "Barbari ekmeği sipariş etmek için kayıt olun",
        personalInfo: "Kişisel Bilgiler",
        firstName: "Ad",
        lastName: "Soyad",
        phone: "Telefon Numarası",
        addressInfo: "Almanya Adres Bilgileri",
        street: "Sokak Adı",
        houseNumber: "Ev Numarası",
        apartment: "Daire/Birim (isteğe bağlı)",
        postalCode: "Posta Kodu (PLZ)",
        city: "Şehir",
        state: "Eyalet",
        selectState: "Eyalet Seçin",
        registerButton: "Kayıt Ol ve Giriş Yap",
        
        // Products
        freshBread: "Taze Barbari Ekmeği",
        price: "Fiyat",
        quantity: "Miktar",
        confirmOrder: "Siparişi Onayla",
        
        // Modal
        orderConfirmed: "Sipariş Onaylandı!",
        product: "Ürün",
        pieces: "Adet",
        unitPrice: "Birim Fiyat",
        totalPrice: "Toplam Fiyat",
        paymentInfo: "Ödeme teslimat sırasında nakit olarak yapılacaktır.",
        close: "Kapat",
        
        // Messages
        registrationSuccess: "Kayıt başarılı! Giriş yapılıyor...",
        logoutSuccess: "Başarıyla çıkış yapıldı",
        languageChanged: "Dil değiştirildi: Türkçe"
    },
    
    en: {
        // Navigation
        bakery: "norbrot",
        logout: "Logout",
        adminPanel: "Admin Panel",
        
        // Registration
        registration: "Bakery Registration",
        registrationSubtitle: "Register to order Barbari bread",
        personalInfo: "Personal Information",
        firstName: "First Name",
        lastName: "Last Name",
        phone: "Phone Number",
        addressInfo: "German Address Information",
        street: "Street Name",
        houseNumber: "House Number",
        apartment: "Apartment/Unit (optional)",
        postalCode: "Postal Code (PLZ)",
        city: "City",
        state: "State",
        selectState: "Select State",
        registerButton: "Register and Login",
        
        // Products
        freshBread: "Fresh Barbari Bread",
        price: "Price",
        quantity: "Quantity",
        confirmOrder: "Confirm Order",
        total: "Total",
        
        // Modal
        orderConfirmed: "Order Confirmed!",
        product: "Product",
        pieces: "Pieces",
        unitPrice: "Unit Price",
        totalPrice: "Total Price",
        paymentInfo: "Payment will be made in cash upon delivery.",
        close: "Close",
        
        // Messages
        registrationSuccess: "Registration successful! Logging in...",
        logoutSuccess: "Successfully logged out",
        languageChanged: "Language changed to: English"
    },
    
    fa: {
        // Navigation
        bakery: "norbrot",
        logout: "خروج",
        adminPanel: "پنل مدیریت",
        
        // Registration
        registration: "ثبت نام در نانوایی",
        registrationSubtitle: "برای سفارش نان بربری ثبت نام کنید",
        personalInfo: "اطلاعات شخصی",
        firstName: "نام",
        lastName: "نام خانوادگی",
        phone: "شماره تلفن",
        addressInfo: "اطلاعات آدرس آلمان",
        street: "نام خیابان",
        houseNumber: "شماره خانه",
        apartment: "واحد/آپارتمان (اختیاری)",
        postalCode: "کد پستی (PLZ)",
        city: "شهر",
        state: "ایالت",
        selectState: "انتخاب ایالت",
        registerButton: "ثبت نام و ورود",
        
        // Products
        freshBread: "نان بربری تازه",
        price: "قیمت",
        quantity: "تعداد",
        confirmOrder: "تایید سفارش",
        total: "مجموع",
        
        // Modal
        orderConfirmed: "سفارش شما تایید شد!",
        product: "محصول",
        pieces: "عدد",
        unitPrice: "قیمت واحد",
        totalPrice: "مجموع",
        paymentInfo: "پرداخت به صورت نقدی در زمان تحویل انجام خواهد شد.",
        close: "بستن",
        
        // Messages
        registrationSuccess: "ثبت نام موفقیت آمیز بود! در حال ورود...",
        logoutSuccess: "خروج موفقیت آمیز بود",
        languageChanged: "زبان تغییر کرد به: فارسی"
    }
};

// Language switching function
function switchLanguage(lang) {
    // Store selected language
    localStorage.setItem('selectedLanguage', lang);
    
    // Update document language and direction
    document.documentElement.lang = lang;
    if (lang === 'fa') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
    
    // Update all text elements
    updatePageText(lang);
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Show notification
    showNotification(translations[lang].languageChanged);
}

// Update page text based on language
function updatePageText(lang) {
    const t = translations[lang];
    
    // Update navigation
    const bakeryElements = document.querySelectorAll('.nav-logo span');
    bakeryElements.forEach(el => el.textContent = t.bakery);
    
    const logoutElements = document.querySelectorAll('#logoutBtn');
    logoutElements.forEach(el => el.textContent = t.logout);
    
    // Update registration page
    if (document.querySelector('#registerForm')) {
        document.querySelector('h2').textContent = t.registration;
        document.querySelector('p').textContent = t.registrationSubtitle;
        
        // Update section titles
        const sectionTitles = document.querySelectorAll('h3');
        if (sectionTitles.length >= 2) {
            sectionTitles[0].textContent = t.personalInfo;
            sectionTitles[1].textContent = t.addressInfo;
        }
        
        // Update form labels
        const labels = {
            'firstName': t.firstName,
            'lastName': t.lastName,
            'phone': t.phone,
            'street': t.street,
            'houseNumber': t.houseNumber,
            'apartment': t.apartment,
            'postalCode': t.postalCode,
            'city': t.city,
            'state': t.state
        };
        
        Object.keys(labels).forEach(id => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = labels[id];
        });
        
        // Update button
        const button = document.querySelector('button[type="submit"]');
        if (button) button.textContent = t.registerButton;
    }
    
    // Update products page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = t.freshBread;
    }
    
    const productPrice = document.querySelector('.product-price-large');
    if (productPrice) {
        productPrice.textContent = `${t.price}: 3,50 €`;
    }
    
    const quantityLabel = document.querySelector('.quantity-label-large');
    if (quantityLabel) {
        quantityLabel.textContent = `${t.quantity}:`;
    }
    
    const orderBtn = document.querySelector('.order-btn-large');
    if (orderBtn) {
        orderBtn.innerHTML = `<i class="fas fa-check-circle"></i> ${t.confirmOrder}`;
    }
    
    const totalLabel = document.querySelector('.total-label');
    if (totalLabel) {
        totalLabel.textContent = t.total + ':';
    }
    
    // Update admin panel elements
    const adminPanelBtn = document.querySelector('#adminPanelBtn span');
    if (adminPanelBtn) {
        adminPanelBtn.textContent = t.adminPanel;
    }
    
    const adminTitle = document.querySelector('.admin-title');
    if (adminTitle) {
        adminTitle.textContent = t.adminPanel + ' - Orders';
    }
    
    // Update modal elements
    const successTitle = document.querySelector('.success-title');
    if (successTitle) {
        successTitle.textContent = t.orderConfirmed;
    }
    
    const paymentInfo = document.querySelector('.payment-info');
    if (paymentInfo) {
        paymentInfo.textContent = t.paymentInfo;
    }
    
    const closeBtn = document.querySelector('.btn-success');
    if (closeBtn) {
        closeBtn.innerHTML = `<i class="fas fa-times"></i> ${t.close}`;
    }
}
