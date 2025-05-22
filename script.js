document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Marriott Hotspot Menu & Ordering System (Elegant Version).");

    if (typeof menuCategories === 'undefined' || typeof hotelName === 'undefined' || typeof welcomeMessage === 'undefined') {
        console.error("CRITICAL ERROR: Essential data from menu-data.js is missing.");
        document.body.innerHTML = "<p style='text-align:center;color:red;font-size:1.5em;padding:50px;'>خطأ: فشل تحميل بيانات القائمة. يرجى مراجعة ملف menu-data.js.</p>";
        return;
    }

    const bodyElement = document.body;
    const categoryTabsContainer = document.querySelector('.category-tabs');
    const menuItemsGrid = document.getElementById('menu-items-grid');
    const hotelTitleElement = document.getElementById('hotel-title');
    const welcomeTextElement = document.getElementById('welcome-text');
    const footerHotelNameElement = document.getElementById('footer-hotel-name');
    const currentYearElement = document.getElementById('current-year');

    const itemDetailsModal = document.getElementById('item-details-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const itemModalCloseBtn = itemDetailsModal ? itemDetailsModal.querySelector('.item-modal-close') : null;

    const cartToggleButton = document.getElementById('cart-toggle-button');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');
    const roomNumberInput = document.getElementById('room-number-input');
    const confirmOrderButton = document.getElementById('confirm-order-button');
    const checkoutModalCloseBtn = checkoutModal ? checkoutModal.querySelector('.checkout-modal-close') : null;

    const receiptModal = document.getElementById('receipt-modal');
    // عناصر الفاتورة المحدثة
    const receiptRestaurantNameEl = document.getElementById('receipt-restaurant-name');
    const receiptOrderIdEl = document.getElementById('receipt-order-id-val');
    const receiptRoomNumberEl = document.getElementById('receipt-room-number');
    const receiptDateEl = document.getElementById('receipt-date');
    const receiptTimeEl = document.getElementById('receipt-time');
    const receiptCashierNameEl = document.getElementById('receipt-cashier-name'); // افترض أن لديك هذا العنصر في HTML
    const receiptItemsTbody = document.getElementById('receipt-items-tbody');
    const receiptSubtotalEl = document.getElementById('receipt-subtotal-value');
    const receiptVatEl = document.getElementById('receipt-vat-value');
    const receiptGrandTotalValueEl = document.getElementById('receipt-grand-total-value'); // هذا هو نفسه receiptGrandTotalValue في الكود السابق
    const printReceiptButton = document.getElementById('print-receipt-button');
    const saveReceiptImageButton = document.getElementById('save-receipt-image-button');
    const newOrderButton = document.getElementById('new-order-button');
    const receiptModalCloseBtn = receiptModal ? receiptModal.querySelector('.receipt-modal-close') : null;

    const toastNotification = document.getElementById('toast-notification');

    let cart = JSON.parse(localStorage.getItem('marriottCart')) || []; // تحميل السلة من LocalStorage
    let currentItemIndexInDetailsModal = 0;
    let itemsInCurrentCategoryForDetailsModal = [];
    const VAT_RATE = 0.15;

    if (hotelTitleElement) hotelTitleElement.textContent = hotelName; // اسم الفندق الرئيسي
    if (footerHotelNameElement) footerHotelNameElement.textContent = hotelName;
    if (welcomeTextElement) welcomeTextElement.textContent = welcomeMessage;
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

    const categories = Object.keys(menuCategories);

    const themeSwitcher = document.getElementById('theme-switcher');
    function applyTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-mode');
            if(themeSwitcher) themeSwitcher.innerHTML = '☀️'; // أو أيقونة شمس
        } else {
            bodyElement.classList.remove('dark-mode');
            if(themeSwitcher) themeSwitcher.innerHTML = '🌙'; // أو أيقونة قمر
        }
    }
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const newTheme = bodyElement.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    function showToast(message, duration = 3000, type = '') {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.className = 'toast-notification'; // Reset classes
        if (type) {
            toastNotification.classList.add(type); // 'success' or 'error'
        }
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }
    
    function saveCartToLocalStorage() {
        localStorage.setItem('marriottCart', JSON.stringify(cart));
    }

    function displayCategories() {
        if (!categoryTabsContainer) { console.error("Category tabs container not found!"); return; }
        categoryTabsContainer.innerHTML = '';
        if (categories.length === 0) { console.warn("No categories to display."); return; }

        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = category;
            button.dataset.category = category;
            categoryTabsContainer.appendChild(button);
        });
    }

    function displayMenuItems(category) {
        if (!menuItemsGrid) { console.error("Menu items grid not found!"); return; }

        Array.from(menuItemsGrid.children).forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
            }, index * 40);
        });

        setTimeout(() => {
            menuItemsGrid.innerHTML = '';
            const items = menuCategories[category];

            if (!items || items.length === 0) {
                menuItemsGrid.innerHTML = `<p class="no-items-message">لا توجد أصناف في هذا القسم حالياً.</p>`;
                return;
            }

            items.forEach((item, index) => {
                const card = document.createElement('div');
                card.classList.add('menu-item-card');
                card.dataset.itemId = item.id;
                card.dataset.categoryName = category;

                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='images/placeholder.png';">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="description">${item.description || ''}</p>
                        <div> <!-- حاوية السعر والزر -->
                            <p class="price">${item.price} ريال</p>
                            <button class="add-to-cart-button" data-item-id="${item.id}">أضف للسلة</button>
                        </div>
                    </div>
                `;
                menuItemsGrid.appendChild(card);

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, (index * 60) + 200); // تعديل التوقيت
            });
        }, 200 + (menuItemsGrid.children.length * 40));
    }

    function addToCart(itemId) {
        let itemToAdd = null;
        for (const categoryName in menuCategories) {
            itemToAdd = menuCategories[categoryName].find(item => item.id === itemId);
            if (itemToAdd) break;
        }
        if (!itemToAdd) { console.error(`Item with ID ${itemId} not found.`); return; }

        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCartDisplay();
        saveCartToLocalStorage();
        showToast(`${itemToAdd.name} أضيف إلى السلة!`, 2000, 'success');
    }

    function updateCartItemQuantity(itemId, newQuantity) {
        const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
        }
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function removeFromCart(itemId) {
        const itemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
        if (itemIndex > -1) {
            showToast(`${cart[itemIndex].name} أزيل من السلة.`, 2000);
            cart.splice(itemIndex, 1);
        }
        updateCartDisplay();
        saveCartToLocalStorage();
    }

    function updateCartDisplay() {
        if (!cartItemsList || !cartTotalPriceElement || !cartItemCountElement || !checkoutButton) return;
        cartItemsList.innerHTML = '';
        let total = 0;
        let totalItemCount = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">سلتك فارغة حالياً. أضف بعض الأصناف الشهية!</p>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('div');
                listItem.classList.add('cart-item-entry');
                const itemTotal = item.price * item.quantity;
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
                        <button class="remove-from-cart-btn" data-id="${item.id}" title="إزالة من السلة" aria-label="إزالة ${item.name} من السلة">×</button>
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

    function openItemDetailsModal(itemData) {
        if (!itemDetailsModal) return;
        modalImg.src = itemData.image;
        modalImg.alt = itemData.name;
        modalName.textContent = itemData.name;
        modalDescription.textContent = itemData.description || "لا يوجد وصف متوفر.";
        modalPrice.textContent = `${itemData.price} ريال`;
        
        itemDetailsModal.style.display = 'flex';
        bodyElement.style.overflow = 'hidden';
        setTimeout(() => itemDetailsModal.classList.add('visible'), 10);
    }
    function closeItemDetailsModal() {
        if (!itemDetailsModal) return;
        itemDetailsModal.classList.remove('visible');
        setTimeout(() => {
            itemDetailsModal.style.display = 'none';
            bodyElement.style.overflow = 'auto';
        }, 300); // تطابق سرعة انتقال CSS
    }

    function showCheckoutModal() {
        if (!checkoutModal || cart.length === 0) return;
        
        let summaryHTML = '<ul>';
        let grandTotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryHTML += `<li>${item.name} (×${item.quantity}) <span>${itemTotal.toFixed(2)} ريال</span></li>`;
            grandTotal += itemTotal;
        });
        summaryHTML += '</ul>';
        
        if(checkoutSummaryItems) checkoutSummaryItems.innerHTML = summaryHTML;
        if(checkoutGrandTotal) checkoutGrandTotal.textContent = grandTotal.toFixed(2);
        
        if(cartSidebar) cartSidebar.classList.remove('visible');
        checkoutModal.style.display = 'flex';
        bodyElement.style.overflow = 'hidden';
        setTimeout(() => checkoutModal.classList.add('visible'), 10);
    }
    function closeCheckoutModal() {
        if (!checkoutModal) return;
        checkoutModal.classList.remove('visible');
        setTimeout(() => {
            checkoutModal.style.display = 'none';
            bodyElement.style.overflow = 'auto';
        }, 300);
    }

    function showReceiptModal(roomNumber, confirmedCart, orderId) {
        if (!receiptModal) return;

        if (receiptRestaurantNameEl) receiptRestaurantNameEl.textContent = hotelName; // أو اسم مطعم مخصص
        if (receiptOrderIdEl) receiptOrderIdEl.textContent = orderId;
        if (receiptRoomNumberEl) receiptRoomNumberEl.textContent = roomNumber;
        
        const now = new Date();
        if (receiptDateEl) receiptDateEl.textContent = now.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (receiptTimeEl) receiptTimeEl.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (receiptCashierNameEl) receiptCashierNameEl.textContent = "نظام الطلبات"; // أو أي اسم عام

        if (receiptItemsTbody) receiptItemsTbody.innerHTML = '';
        let subtotal = 0;
        confirmedCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const row = receiptItemsTbody.insertRow();
            row.innerHTML = `
                <td class="item-name-col">${item.name}</td>
                <td class="qty-col">${item.quantity}</td>
                <td class="price-col">${item.price.toFixed(2)}</td>
                <td class="subtotal-col">${itemTotal.toFixed(2)}</td>
            `;
            subtotal += itemTotal;
        });

        const vatAmount = subtotal * VAT_RATE;
        const grandTotalWithVat = subtotal + vatAmount;

        if (receiptSubtotalEl) receiptSubtotalEl.textContent = subtotal.toFixed(2);
        if (receiptVatEl) receiptVatEl.textContent = vatAmount.toFixed(2);
        if (receiptGrandTotalValueEl) receiptGrandTotalValueEl.textContent = grandTotalWithVat.toFixed(2);

        closeCheckoutModal();
        receiptModal.style.display = 'flex';
        bodyElement.style.overflow = 'hidden';
        setTimeout(() => receiptModal.classList.add('visible'), 10);
    }
    function closeReceiptModal() {
        if(!receiptModal) return;
        receiptModal.classList.remove('visible');
        setTimeout(() => {
            receiptModal.style.display = 'none';
            bodyElement.style.overflow = 'auto';
        }, 300);
    }

    if (cartToggleButton) {
        cartToggleButton.addEventListener('click', () => {
            if(cartSidebar) cartSidebar.classList.toggle('visible');
            bodyElement.style.overflow = cartSidebar.classList.contains('visible') ? 'hidden' : 'auto';
        });
    }
    if (closeCartButton) {
        closeCartButton.addEventListener('click', () => {
            if(cartSidebar) cartSidebar.classList.remove('visible');
            bodyElement.style.overflow = 'auto';
        });
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const target = e.target;
            const itemId = target.dataset.id || target.closest('[data-id]')?.dataset.id;
            if (!itemId) return;

            if (target.classList.contains('remove-from-cart-btn') || target.closest('.remove-from-cart-btn')) {
                removeFromCart(itemId);
            } else if (target.classList.contains('quantity-change-btn') || target.closest('.quantity-change-btn')) {
                const changeButton = target.classList.contains('quantity-change-btn') ? target : target.closest('.quantity-change-btn');
                const change = parseInt(changeButton.dataset.change, 10);
                const itemInCart = cart.find(i => i.id === itemId);
                if (itemInCart) {
                    updateCartItemQuantity(itemId, itemInCart.quantity + change);
                }
            }
        });
    }
    
    if (menuItemsGrid) {
        menuItemsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-item-card');
            if (!card) return;

            const itemId = card.dataset.itemId;
            const categoryName = card.dataset.categoryName;

            if (e.target.classList.contains('add-to-cart-button') || e.target.closest('.add-to-cart-button')) {
                e.stopPropagation();
                addToCart(itemId);
            } else {
                const itemData = menuCategories[categoryName]?.find(item => item.id === itemId);
                if (itemData) {
                    itemsInCurrentCategoryForDetailsModal = menuCategories[categoryName];
                    currentItemIndexInDetailsModal = itemsInCurrentCategoryForDetailsModal.findIndex(i => i.id === itemId);
                    openItemDetailsModal(itemData);
                }
            }
        });
    }

    if (itemModalCloseBtn) itemModalCloseBtn.addEventListener('click', closeItemDetailsModal);
    if (itemDetailsModal) {
        itemDetailsModal.addEventListener('click', (e) => { if (e.target === itemDetailsModal) closeItemDetailsModal(); });
    }
    
    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape') {
            if (itemDetailsModal && itemDetailsModal.classList.contains('visible')) closeItemDetailsModal();
            if (cartSidebar && cartSidebar.classList.contains('visible')) {
                cartSidebar.classList.remove('visible');
                bodyElement.style.overflow = 'auto';
            }
            if (checkoutModal && checkoutModal.classList.contains('visible')) closeCheckoutModal();
            if (receiptModal && receiptModal.classList.contains('visible')) closeReceiptModal();
        }
    });

    if (checkoutButton) {
        checkoutButton.addEventListener('click', showCheckoutModal);
    }
    if (checkoutModalCloseBtn) checkoutModalCloseBtn.addEventListener('click', closeCheckoutModal);
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) closeCheckoutModal(); });
    }

    if (confirmOrderButton) {
        confirmOrderButton.addEventListener('click', () => {
            const roomNum = roomNumberInput ? roomNumberInput.value.trim() : null;
            if (!roomNum) {
                showToast("الرجاء إدخال رقم الغرفة.", 3000, 'error');
                if(roomNumberInput) roomNumberInput.focus();
                return;
            }
            if (cart.length === 0) {
                showToast("سلة الطلبات فارغة!", 3000, 'error');
                return;
            }
            
            const currentOrderId = `ORD-${Date.now().toString().slice(-7)}`; // رقم طلب فريد أكثر
            console.log("Order Confirmed:", { orderId: currentOrderId, roomNumber: roomNum, items: cart });
            showToast(`تم إرسال طلبك للغرفة ${roomNum} بنجاح!`, 3000, 'success');
            
            showReceiptModal(roomNum, [...cart], currentOrderId);
            cart = [];
            updateCartDisplay();
            saveCartToLocalStorage(); // حفظ السلة الفارغة
            if(roomNumberInput) roomNumberInput.value = '';
        });
    }

    if (printReceiptButton) {
        printReceiptButton.addEventListener('click', () => {
            window.print();
        });
    }

    if (saveReceiptImageButton && typeof html2canvas !== 'undefined') {
        saveReceiptImageButton.addEventListener('click', () => {
            const receiptArea = document.getElementById('printable-receipt-area');
            if (!receiptArea) {
                console.error("Receipt area not found for saving as image.");
                showToast("خطأ: لم يتم العثور على منطقة الفاتورة.", 3000, 'error');
                return;
            }

            const options = { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false };
            saveReceiptImageButton.disabled = true;
            saveReceiptImageButton.innerHTML = 'جارٍ الحفظ...'; //  أو أيقونة تحميل

            html2canvas(receiptArea, options).then(canvas => {
                const imageURL = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
                downloadLink.href = imageURL;
                downloadLink.download = `فاتورة_طلب_${timestamp}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                showToast("تم حفظ الفاتورة كصورة!", 2500, 'success');
            }).catch(err => {
                console.error("Error saving receipt as image:", err);
                showToast("حدث خطأ أثناء حفظ الفاتورة.", 3000, 'error');
            }).finally(() => {
                saveReceiptImageButton.disabled = false;
                saveReceiptImageButton.innerHTML = 'حفظ كصورة'; //  أو أيقونة حفظ الصورة
            });
        });
    } else if (saveReceiptImageButton) {
        // إذا لم يتم تحميل html2canvas، يمكن إخفاء الزر أو إظهار رسالة
        saveReceiptImageButton.style.display = 'none';
        console.warn("html2canvas library not loaded. 'Save as Image' feature is disabled.");
    }


    if (newOrderButton) {
        newOrderButton.addEventListener('click', () => {
            closeReceiptModal();
            // لا حاجة لإعادة إظهار العناصر، هي ليست مخفية
        });
    }
    if (receiptModalCloseBtn) receiptModalCloseBtn.addEventListener('click', closeReceiptModal);
    if (receiptModal) {
        receiptModal.addEventListener('click', (e) => { if (e.target === receiptModal) closeReceiptModal(); });
    }
    
    if (categoryTabsContainer) {
        categoryTabsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (button && !button.classList.contains('active')) {
                document.querySelectorAll('.tab-button.active').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayMenuItems(button.dataset.category);
            }
        });
    }

    if (categories.length > 0) {
        displayCategories();
        const firstTabButton = categoryTabsContainer ? categoryTabsContainer.querySelector('.tab-button') : null;
        if (firstTabButton) {
            firstTabButton.classList.add('active');
            displayMenuItems(categories[0]);
        } else if (menuItemsGrid) { // احتياطي إذا لم يتم العثور على الأزرار
             displayMenuItems(categories[0]);
        }
    } else if (menuItemsGrid) {
        menuItemsGrid.innerHTML = "<p class='no-items-message'>لا توجد أقسام في القائمة حالياً.</p>";
    }
    updateCartDisplay(); // تحديث عرض السلة عند التحميل (قد تكون هناك عناصر من LocalStorage)
});
// ... (كل الكود السابق من script.js يبقى كما هو) ...

// تأكد من أن هذه الدالة موجودة ومستدعاة بشكل صحيح
// وتأكد من أن لديك العناصر الجديدة للفاتورة في HTML (مثل receipt-header-title و vat-rate-display)
function showReceiptModal(roomNumber, confirmedCart, orderId) {
    if (!receiptModal) return;

    // ملء معلومات المطعم الأساسية
    if (receiptRestaurantNameEl) receiptRestaurantNameEl.textContent = hotelName; // اسم الفندق/المطعم من menu-data.js
    if (document.getElementById('receipt-header-title')) document.getElementById('receipt-header-title').textContent = "فاتورة طلب طعام"; // أو "فاتورة ضريبية مبسطة"

    // ملء معلومات الطلب
    if (receiptOrderIdEl) receiptOrderIdEl.textContent = orderId;
    if (receiptRoomNumberEl) receiptRoomNumberEl.textContent = roomNumber || "غير محدد";
    
    const now = new Date();
    if (receiptDateEl) receiptDateEl.textContent = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    if (receiptTimeEl) receiptTimeEl.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (receiptCashierNameEl) receiptCashierNameEl.textContent = "نظام الطلبات الآلي"; // أو اسم عام

    // ملء جدول الأصناف وحساب الإجماليات
    if (receiptItemsTbody) receiptItemsTbody.innerHTML = '';
    let subtotal = 0;
    confirmedCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const row = receiptItemsTbody.insertRow();
        row.innerHTML = `
            <td class="item-name-col">${item.name}</td>
            <td class="qty-col">${item.quantity}</td>
            <td class="price-col">${item.price.toFixed(2)}</td>
            <td class="subtotal-col">${itemTotal.toFixed(2)}</td>
        `;
        subtotal += itemTotal;
    });

    const currentVatRate = VAT_RATE * 100; // VAT_RATE يجب أن يكون معرفاً (مثلاً 0.15)
    if (document.getElementById('vat-rate-display')) document.getElementById('vat-rate-display').textContent = currentVatRate.toFixed(0);
    
    const vatAmount = subtotal * VAT_RATE;
    const grandTotalWithVat = subtotal + vatAmount;

    if (receiptSubtotalEl) receiptSubtotalEl.textContent = subtotal.toFixed(2);
    if (receiptVatEl) receiptVatEl.textContent = vatAmount.toFixed(2);
    if (receiptGrandTotalValueEl) receiptGrandTotalValueEl.textContent = grandTotalWithVat.toFixed(2);

    if(document.getElementById('receipt-payment-method')) document.getElementById('receipt-payment-method').textContent = `على الغرفة (${roomNumber})`;


    closeCheckoutModal(); // تأكد من إغلاق نافذة الطلب قبل عرض الفاتورة
    receiptModal.style.display = 'flex';
    bodyElement.style.overflow = 'hidden';
    setTimeout(() => receiptModal.classList.add('visible'), 10);
}


// وظيفة حفظ الصورة (تأكد من وجود مكتبة html2canvas)
if (saveReceiptImageButton && typeof html2canvas !== 'undefined') {
    saveReceiptImageButton.addEventListener('click', () => {
        const receiptArea = document.getElementById('printable-receipt-area');
        if (!receiptArea) {
            showToast("خطأ: لم يتم العثور على منطقة الفاتورة.", 3000, 'error');
            return;
        }

        // إضافة كلاس مؤقت لتغيير الخط إلى Courier New قبل الالتقاط
        receiptArea.classList.add('prepare-for-image-capture');

        const options = {
            scale: 2.5, // زيادة الدقة
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: (document) => { // للتأكد من تطبيق الخطوط بشكل صحيح في النسخة المستنسخة
                const clonedReceiptArea = document.getElementById('printable-receipt-area');
                if (clonedReceiptArea) {
                    clonedReceiptArea.style.fontFamily = "'Courier New', Courier, monospace";
                    // يمكنك تطبيق أنماط إضافية هنا إذا لزم الأمر للالتقاط
                    const elementsToStyle = clonedReceiptArea.querySelectorAll('*');
                    elementsToStyle.forEach(el => {
                        el.style.fontFamily = "'Courier New', Courier, monospace";
                        // قد تحتاج لتعديل أحجام الخطوط هنا لتناسب شكل إيصال الكاشير
                        // el.style.fontSize = '9pt'; // مثال
                    });
                }
            }
        };

        const originalButtonText = saveReceiptImageButton.innerHTML;
        saveReceiptImageButton.disabled = true;
        saveReceiptImageButton.innerHTML = ' <i class="fas fa-spinner fa-spin" style="margin-left: 5px;"></i> جارٍ الحفظ...';

        html2canvas(receiptArea, options).then(canvas => {
            receiptArea.classList.remove('prepare-for-image-capture'); // إزالة الكلاس بعد الالتقاط
            const imageURL = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            const orderIdForFilename = document.getElementById('receipt-order-id-val')?.textContent || 'طلب';
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
            downloadLink.href = imageURL;
            downloadLink.download = `فاتورة_${orderIdForFilename}_${timestamp}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            showToast("تم حفظ الفاتورة كصورة!", 2500, 'success');
        }).catch(err => {
            receiptArea.classList.remove('prepare-for-image-capture');
            console.error("Error saving receipt as image:", err);
            showToast("حدث خطأ أثناء حفظ الفاتورة.", 3000, 'error');
        }).finally(() => {
            saveReceiptImageButton.disabled = false;
            saveReceiptImageButton.innerHTML = originalButtonText;
        });
    });
} else if (saveReceiptImageButton) {
    saveReceiptImageButton.title = "مكتبة html2canvas غير متوفرة";
    saveReceiptImageButton.style.opacity = "0.5";
    saveReceiptImageButton.style.cursor = "not-allowed";
    console.warn("html2canvas library not loaded. 'Save as Image' feature is effectively disabled.");
}
// دالة حفظ الفاتورة كصورة
function saveReceiptAsImage() {
    const receiptArea = document.getElementById('printable-receipt-area');
    if (!receiptArea) {
        showToast("خطأ: لم يتم العثور على منطقة الفاتورة.", 3000, 'error');
        return;
    }

    // تحميل مكتبة html2canvas ديناميكياً إذا لم تكن محملة
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = () => {
            // بعد تحميل المكتبة، استدع الدالة مرة أخرى
            saveReceiptAsImage();
        };
        script.onerror = () => {
            showToast("خطأ في تحميل مكتبة حفظ الصور.", 3000, 'error');
        };
        document.head.appendChild(script);
        return;
    }

    // إعداد خيارات html2canvas
    const options = {
        scale: 2, // زيادة الدقة
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        onclone: (clonedDoc) => {
            // تأكد من أن الفاتورة في النسخة المستنسخة تبدو كما نريد
            const clonedReceipt = clonedDoc.getElementById('printable-receipt-area');
            if (clonedReceipt) {
                clonedReceipt.style.fontFamily = "'Courier New', monospace";
                clonedReceipt.style.width = "80mm";
                clonedReceipt.style.padding = "10px";
            }
        }
    };

    // تغيير حالة الزر أثناء المعالجة
    const saveBtn = document.getElementById('save-receipt-image-button');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    saveBtn.disabled = true;

    // تحويل الفاتورة إلى صورة
    html2canvas(receiptArea, options).then(canvas => {
        // إنشاء رابط تنزيل
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `فاتورة-${hotelName}-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast("تم حفظ الفاتورة كصورة بنجاح!", 2000, 'success');
    }).catch(error => {
        console.error('Error saving receipt as image:', error);
        showToast("حدث خطأ أثناء حفظ الفاتورة كصورة", 3000, 'error');
    }).finally(() => {
        // استعادة حالة الزر الأصلية
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

// إضافة مستمع الحدث لزر حفظ الصورة
document.addEventListener('DOMContentLoaded', () => {
    // ... الكود الحالي الخاص بك ...

    const saveReceiptImageButton = document.getElementById('save-receipt-image-button');
    if (saveReceiptImageButton) {
        saveReceiptImageButton.addEventListener('click', saveReceiptAsImage);
    }
});
// إضافة كلاس CSS مؤقت لتغيير الخط قبل التقاط الصورة
// هذا الكلاس سيتم تطبيقه بواسطة JavaScript قبل html2canvas وإزالته بعد ذلك


// ملاحظة: تم نقل منطق تغيير الخط إلى خيار onclone في html2canvas لضمان تطبيقه على النسخة المستنسخة.
// لا يزال بإمكانك استخدام الكلاس .prepare-for-image-capture لتطبيق أنماط أخرى إذا لزم الأمر.
