document.addEventListener('DOMContentLoaded', () => {
    console.log("Hotel Menu System Initializing...");

    // --- 1. DOM Element Selectors ---
    const bodyElement = document.body;
    const categoryTabsContainer = document.querySelector('.category-tabs');
    const menuItemsGrid = document.getElementById('menu-items-grid');
    const hotelTitleElement = document.getElementById('hotel-title');
    const welcomeTextElement = document.getElementById('welcome-text');
    const footerHotelNameElement = document.getElementById('footer-hotel-name');
    const currentYearElement = document.getElementById('current-year');
    const themeSwitcher = document.getElementById('theme-switcher');
    const toastNotification = document.getElementById('toast-notification');

    // Cart Elements
    const cartToggleButton = document.getElementById('cart-toggle-button');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    // Item Details Modal Elements
    const itemDetailsModal = document.getElementById('item-details-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalAddToCartBtn = itemDetailsModal ? itemDetailsModal.querySelector('.modal-add-to-cart') : null;
    const closeItemDetailsModalButton = itemDetailsModal ? itemDetailsModal.querySelector('.item-modal-close') : null;


    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');
    const roomNumberInput = document.getElementById('room-number-input');
    const confirmOrderButton = document.getElementById('confirm-order-button');
    const closeCheckoutModalButton = checkoutModal ? checkoutModal.querySelector('.checkout-modal-close') : null;

    // Receipt Modal Elements
    const receiptModal = document.getElementById('receipt-modal');
    const receiptOrderIdEl = document.getElementById('receipt-order-id-val');
    const receiptRoomNumberEl = document.getElementById('receipt-room-number');
    const receiptDateEl = document.getElementById('receipt-date');
    const receiptTimeEl = document.getElementById('receipt-time');
    const receiptItemsTbody = document.getElementById('receipt-items-tbody');
    const receiptSubtotalEl = document.getElementById('receipt-subtotal-value');
    const receiptVatEl = document.getElementById('receipt-vat-value');
    const receiptGrandTotalValueEl = document.getElementById('receipt-grand-total-value');
    const printReceiptButton = document.getElementById('print-receipt-button');
    const saveReceiptImageButton = document.getElementById('save-receipt-image-button');
    const newOrderButton = document.getElementById('new-order-button');
    const closeReceiptModalButton = receiptModal ? receiptModal.querySelector('.receipt-modal-close') : null;


    // --- 2. State Variables ---
    let cart = [];
    let currentSelectedCategory = null;
    const VAT_RATE = 0.15;
    let html2canvasLoaded = false; // For saving receipt as image

    // --- 3. Initialization Functions ---
    function checkPrerequisites() {
        if (typeof menuCategories === 'undefined' || typeof hotelName === 'undefined' || typeof welcomeMessage === 'undefined') {
            console.error("CRITICAL ERROR: Essential data from menu-data.js is missing.");
            document.body.innerHTML = "<p style='text-align:center;color:red;font-size:1.5em;padding:50px;'>خطأ: فشل تحميل بيانات القائمة. يرجى مراجعة ملف menu-data.js أو الاتصال بالدعم.</p>";
            return false;
        }
        // Check if essential DOM elements exist
        if (!categoryTabsContainer || !menuItemsGrid || !cartSidebar || !itemDetailsModal || !checkoutModal || !receiptModal) {
            console.error("CRITICAL ERROR: One or more essential DOM elements are missing from the HTML.");
            // Optionally, display a user-friendly error message here too
            return false;
        }
        return true;
    }

    function initializeUI() {
        if (hotelTitleElement) hotelTitleElement.textContent = hotelName;
        if (footerHotelNameElement) footerHotelNameElement.textContent = hotelName;
        if (welcomeTextElement) welcomeTextElement.textContent = welcomeMessage;
        if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

        loadCartFromLocalStorage();
        updateCartDisplay();
        setupTheme();
        displayCategories();

        if (Object.keys(menuCategories).length > 0) {
            const firstCategory = Object.keys(menuCategories)[0];
            setActiveCategory(firstCategory);
        } else {
            if (menuItemsGrid) menuItemsGrid.innerHTML = "<p class='no-items-message'>لا توجد أقسام في القائمة حالياً.</p>";
            console.warn("No menu categories found in menu-data.js");
        }
    }

    // --- 4. Theme Management ---
    function setupTheme() {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', toggleTheme);
        }
    }

    function applyTheme(theme) {
        bodyElement.classList.toggle('dark-mode', theme === 'dark');
        if (themeSwitcher) {
            themeSwitcher.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            themeSwitcher.setAttribute('aria-label', theme === 'dark' ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي');
        }
    }

    function toggleTheme() {
        const newTheme = bodyElement.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // --- 5. Menu Display Functions ---
    function displayCategories() {
        if (!categoryTabsContainer) return;
        categoryTabsContainer.innerHTML = '';
        Object.keys(menuCategories).forEach(category => {
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = category;
            button.dataset.category = category;
            button.addEventListener('click', () => setActiveCategory(category));
            categoryTabsContainer.appendChild(button);
        });
    }

    function setActiveCategory(categoryName) {
        if (!menuCategories[categoryName]) {
            console.warn(`Category "${categoryName}" not found.`);
            return;
        }
        currentSelectedCategory = categoryName;
        displayMenuItems(menuCategories[categoryName]);

        document.querySelectorAll('.category-tabs .tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryName);
        });
    }

    function displayMenuItems(items) {
        if (!menuItemsGrid) return;
        // Fade out existing items
        Array.from(menuItemsGrid.children).forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
            }, index * 30);
        });

        setTimeout(() => {
            menuItemsGrid.innerHTML = '';
            if (!items || items.length === 0) {
                menuItemsGrid.innerHTML = `<p class="no-items-message">لا توجد أصناف في هذا القسم حالياً.</p>`;
                return;
            }
            items.forEach((item, index) => {
                const card = document.createElement('div');
                card.classList.add('menu-item-card');
                card.dataset.itemId = item.id;

                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png';">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="description">${item.description || ''}</p>
                        <div>
                            <p class="price">${parseFloat(item.price).toFixed(2)} ريال</p>
                            <button class="add-to-cart-button" data-item-id="${item.id}" aria-label="أضف ${item.name} إلى السلة">
                                <i class="fas fa-cart-plus"></i> أضف للسلة
                            </button>
                        </div>
                    </div>
                `;
                // Event listener for the card itself (to open details modal)
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.add-to-cart-button')) { // Don't open modal if add-to-cart is clicked
                        openItemDetailsModal(item);
                    }
                });
                // Event listener for the add-to-cart button on the card
                const cardAddToCartBtn = card.querySelector('.add-to-cart-button');
                if (cardAddToCartBtn) {
                    cardAddToCartBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent card click event
                        addToCart(item.id);
                    });
                }
                menuItemsGrid.appendChild(card);
                // Fade in new item
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, (index * 50) + 150); // Staggered animation
            });
        }, (menuItemsGrid.children.length * 30) + 50); // Wait for fade out to roughly finish
    }


    // --- 6. Cart Management ---
    function findItemById(itemId) {
        for (const categoryName in menuCategories) {
            const item = menuCategories[categoryName].find(i => i.id === itemId);
            if (item) return item;
        }
        return null;
    }

    function addToCart(itemId) {
        const itemToAdd = findItemById(itemId);
        if (!itemToAdd) {
            console.error(`Item with ID ${itemId} not found.`);
            showToast(`خطأ: الصنف غير موجود.`, 3000, 'error');
            return;
        }

        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCartAndStorage();
        showToast(`${itemToAdd.name} أضيف إلى السلة بنجاح!`, 2000, 'success');
    }

    function updateCartItemQuantity(itemId, change) { // change can be 1 or -1
        const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remove item if quantity is 0 or less
                 showToast(`${cart[itemIndex].name} أزيل من السلة.`, 2000);
            }
        }
        updateCartAndStorage();
    }
    
    function removeFromCart(itemId) {
        const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
        if (itemIndex > -1) {
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            updateCartAndStorage();
            showToast(`${itemName} أزيل من السلة.`, 2000);
        }
    }


    function updateCartDisplay() {
        if (!cartItemsList || !cartTotalPriceElement || !cartItemCountElement || !checkoutButton) {
            console.warn("One or more cart UI elements are missing.");
            return;
        }
        cartItemsList.innerHTML = '';
        let total = 0;
        let totalItemCount = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">سلتك فارغة حالياً. أضف بعض الأصناف الشهية!</p>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('div');
                listItem.classList.add('cart-item-entry');
                const itemTotal = parseFloat(item.price) * item.quantity;

                listItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='images/placeholder.png';">
                    <div class="cart-item-details">
                        <span>${item.name}</span>
                        <div class="item-quantity-controls">
                            <button class="quantity-change-btn" data-id="${item.id}" data-change="-1" aria-label="إنقاص الكمية">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-change-btn" data-id="${item.id}" data-change="1" aria-label="زيادة الكمية">+</button>
                        </div>
                        <span class="item-subtotal-price">الإجمالي: ${itemTotal.toFixed(2)} ريال</span>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-from-cart-btn" data-id="${item.id}" title="إزالة من السلة" aria-label="إزالة ${item.name} من السلة">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsList.appendChild(listItem);
                total += itemTotal;
                totalItemCount += item.quantity;
            });
        }

        cartTotalPriceElement.textContent = total.toFixed(2);
        cartItemCountElement.textContent = totalItemCount;
        checkoutButton.disabled = cart.length === 0;
    }
    
    function updateCartAndStorage() {
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('hotelMenuCart', JSON.stringify(cart));
    }

    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('hotelMenuCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }

    // --- 7. Modal Management ---
    function openModal(modalElement) {
        if (!modalElement) return;
        modalElement.style.display = 'flex';
        bodyElement.style.overflow = 'hidden';
        setTimeout(() => modalElement.classList.add('visible'), 10); // For CSS transition
    }

    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('visible');
        setTimeout(() => {
            modalElement.style.display = 'none';
            // Only restore body overflow if no other modals are visible
            if (!document.querySelector('.modal.visible')) {
                 bodyElement.style.overflow = 'auto';
            }
        }, 300); // Match CSS transition duration
    }

    function openItemDetailsModal(itemData) {
        if (!itemDetailsModal || !modalImg || !modalName || !modalDescription || !modalPrice || !modalAddToCartBtn) return;
        modalImg.src = itemData.image;
        modalImg.alt = itemData.name;
        modalName.textContent = itemData.name;
        modalDescription.textContent = itemData.description || "لا يوجد وصف متوفر.";
        modalPrice.textContent = `${parseFloat(itemData.price).toFixed(2)} ريال`;
        modalAddToCartBtn.dataset.itemId = itemData.id; // Set item ID for the modal's add to cart button
        openModal(itemDetailsModal);
    }

    function showCheckoutModal() {
        if (!checkoutModal || cart.length === 0) return;
        let summaryHTML = '<ul>';
        let grandTotal = 0;
        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            summaryHTML += `<li>${item.name} (×${item.quantity}) <span>${itemTotal.toFixed(2)} ريال</span></li>`;
            grandTotal += itemTotal;
        });
        summaryHTML += '</ul>';

        if (checkoutSummaryItems) checkoutSummaryItems.innerHTML = summaryHTML;
        if (checkoutGrandTotal) checkoutGrandTotal.innerHTML = `الإجمالي النهائي: <span>${grandTotal.toFixed(2)}</span> ريال`; // Updated to match HTML structure
        
        if (cartSidebar && cartSidebar.classList.contains('visible')) {
            closeModal(cartSidebar); // Close cart sidebar if open
        }
        openModal(checkoutModal);
    }

    function showReceiptModal(roomNumber, confirmedCart, orderId) {
        if (!receiptModal) return;
        if (receiptOrderIdEl) receiptOrderIdEl.textContent = orderId;
        if (receiptRoomNumberEl) receiptRoomNumberEl.textContent = roomNumber || "غير محدد";
        const now = new Date();
        if (receiptDateEl) receiptDateEl.textContent = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
        if (receiptTimeEl) receiptTimeEl.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (receiptItemsTbody) receiptItemsTbody.innerHTML = '';
        let subtotal = 0;
        confirmedCart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            const row = receiptItemsTbody.insertRow();
            row.innerHTML = `
                <td class="item-name-col">${item.name}</td>
                <td class="qty-col">${item.quantity}</td>
                <td class="price-col">${parseFloat(item.price).toFixed(2)} ريال</td>
                <td class="subtotal-col">${itemTotal.toFixed(2)} ريال</td>
            `;
            subtotal += itemTotal;
        });

        const vatAmount = subtotal * VAT_RATE;
        const grandTotalWithVat = subtotal + vatAmount;

        if (receiptSubtotalEl) receiptSubtotalEl.textContent = subtotal.toFixed(2);
        if (receiptVatEl) receiptVatEl.textContent = vatAmount.toFixed(2);
        if (receiptGrandTotalValueEl) receiptGrandTotalValueEl.textContent = grandTotalWithVat.toFixed(2);

        if (checkoutModal && checkoutModal.classList.contains('visible')) {
            closeModal(checkoutModal); // Close checkout modal if open
        }
        openModal(receiptModal);
    }

    // --- 8. Receipt Actions ---
    function generateOrderId() {
        return `ORD-${Date.now().toString().slice(-7)}`;
    }
    
    async function saveReceiptAsImage() {
        const receiptArea = document.getElementById('printable-receipt-area');
        if (!receiptArea || !saveReceiptImageButton) {
            showToast("خطأ: لم يتم العثور على منطقة الفاتورة أو زر الحفظ.", 3000, 'error');
            return;
        }

        if (!html2canvasLoaded) {
            try {
                await loadHtml2CanvasScript(); // Renamed for clarity
                html2canvasLoaded = true;
            } catch (error) {
                console.error("Failed to load html2canvas:", error);
                showToast("خطأ في تحميل مكتبة حفظ الصور. يرجى المحاولة مرة أخرى.", 3000, 'error');
                return;
            }
        }

        const originalButtonContent = saveReceiptImageButton.innerHTML;
        saveReceiptImageButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        saveReceiptImageButton.disabled = true;

        try {
            const canvas = await html2canvas(receiptArea, {
                scale: 2.5, // Increased scale for better quality
                logging: false,
                useCORS: true,
                backgroundColor: '#FFFFFF', // Ensure white background
                onclone: (clonedDoc) => {
                    const clonedReceipt = clonedDoc.getElementById('printable-receipt-area');
                    if (clonedReceipt) {
                        // Apply print-like styles for image capture for consistency
                        clonedReceipt.style.fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-receipt-print').trim();
                        clonedReceipt.style.fontSize = "9pt"; // Consistent with print
                        clonedReceipt.style.maxWidth = "76mm"; // Standard receipt width
                        clonedReceipt.style.padding = "3mm";
                        clonedReceipt.style.border = "none";
                        clonedReceipt.style.boxShadow = "none";
                        Array.from(clonedReceipt.querySelectorAll('*')).forEach(el => {
                            el.style.color = '#000000';
                            el.style.backgroundColor = 'transparent';
                        });
                         const logo = clonedReceipt.querySelector('.receipt-logo');
                        if(logo) logo.style.filter = 'grayscale(100%) contrast(180%)';
                    }
                }
            });
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.T-]/g, '').slice(0, -4); // Shorter timestamp
            link.download = `فاتورة_${hotelName.replace(/\s+/g, '_')}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);
            showToast("تم حفظ الفاتورة كصورة بنجاح!", 2500, 'success');
        } catch (error) {
            console.error('Error saving receipt as image:', error);
            showToast("حدث خطأ أثناء حفظ الفاتورة كصورة.", 3000, 'error');
        } finally {
            saveReceiptImageButton.innerHTML = originalButtonContent;
            saveReceiptImageButton.disabled = false;
        }
    }

    function loadHtml2CanvasScript() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; // Using CDN
            script.integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgHhsubOulPWS9EAUceKajiXsPqcAUbORtnHhpUcmXA==";
            script.crossOrigin="anonymous";
            script.referrerPolicy="no-referrer";
            script.onload = () => resolve();
            script.onerror = (err) => reject(new Error('Failed to load html2canvas.js: ' + err));
            document.head.appendChild(script);
        });
    }


    // --- 9. Helper Functions ---
    function showToast(message, duration = 3000, type = '') {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.className = 'toast-notification'; // Reset classes
        if (type) toastNotification.classList.add(type);
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }

    // --- 10. Event Listeners Setup ---
    function setupEventListeners() {
        // Cart Toggle
        if (cartToggleButton) cartToggleButton.addEventListener('click', () => {
            cartSidebar.classList.contains('visible') ? closeModal(cartSidebar) : openModal(cartSidebar);
        });
        if (closeCartButton) closeCartButton.addEventListener('click', () => closeModal(cartSidebar));

        // Cart Item Interactions (delegated)
        if (cartItemsList) {
            cartItemsList.addEventListener('click', (e) => {
                const quantityBtn = e.target.closest('.quantity-change-btn');
                const removeBtn = e.target.closest('.remove-from-cart-btn');
                if (quantityBtn) {
                    updateCartItemQuantity(quantityBtn.dataset.id, parseInt(quantityBtn.dataset.change));
                } else if (removeBtn) {
                    removeFromCart(removeBtn.dataset.id);
                }
            });
        }
        
        // Item Details Modal
        if (closeItemDetailsModalButton) closeItemDetailsModalButton.addEventListener('click', () => closeModal(itemDetailsModal));
        if (itemDetailsModal) itemDetailsModal.addEventListener('click', (e) => { // Click outside content to close
            if (e.target === itemDetailsModal) closeModal(itemDetailsModal);
        });
        if (modalAddToCartBtn) modalAddToCartBtn.addEventListener('click', () => {
            addToCart(modalAddToCartBtn.dataset.itemId);
            closeModal(itemDetailsModal); // Close modal after adding
        });

        // Checkout
        if (checkoutButton) checkoutButton.addEventListener('click', showCheckoutModal);
        if (closeCheckoutModalButton) closeCheckoutModalButton.addEventListener('click', () => closeModal(checkoutModal));
        if (checkoutModal) checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeModal(checkoutModal);
        });
        if (confirmOrderButton) confirmOrderButton.addEventListener('click', () => {
            const roomNum = roomNumberInput ? roomNumberInput.value.trim() : null;
            if (!roomNum) {
                showToast("الرجاء إدخال رقم الغرفة.", 3000, 'error');
                if (roomNumberInput) roomNumberInput.focus();
                return;
            }
            if (cart.length === 0) {
                showToast("سلة الطلبات فارغة!", 3000, 'error');
                return;
            }
            const currentOrderId = generateOrderId();
            showReceiptModal(roomNum, [...cart], currentOrderId); // Pass a copy of the cart
            cart = []; // Clear cart
            updateCartAndStorage();
            if (roomNumberInput) roomNumberInput.value = '';
        });

        // Receipt Modal
        if (closeReceiptModalButton) {
             closeReceiptModalButton.addEventListener('click', () => closeModal(receiptModal));
        } else if(receiptModal) {
            console.warn("Receipt modal close button (.receipt-modal-close) not found inside #receipt-modal, but receipt modal exists.");
        }

        if (receiptModal) receiptModal.addEventListener('click', (e) => { // Click outside content to close
            if (e.target === receiptModal) closeModal(receiptModal);
        });
        if (printReceiptButton) printReceiptButton.addEventListener('click', () => window.print());
        if (saveReceiptImageButton) saveReceiptImageButton.addEventListener('click', saveReceiptAsImage);
        if (newOrderButton) newOrderButton.addEventListener('click', () => {
            closeModal(receiptModal);
            // Optionally, navigate to the menu or reset other state
        });

        // Global Escape key handler for modals
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (itemDetailsModal && itemDetailsModal.classList.contains('visible')) closeModal(itemDetailsModal);
                else if (cartSidebar && cartSidebar.classList.contains('visible')) closeModal(cartSidebar);
                else if (checkoutModal && checkoutModal.classList.contains('visible')) closeModal(checkoutModal);
                else if (receiptModal && receiptModal.classList.contains('visible')) closeModal(receiptModal);
            }
        });
    }

    // --- 11. Application Start ---
    if (checkPrerequisites()) {
        initializeUI();
        setupEventListeners();
        console.log("Hotel Menu System Initialized Successfully.");
    } else {
        console.error("Hotel Menu System Initialization Failed due to missing prerequisites.");
    }
});