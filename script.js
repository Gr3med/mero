document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing Hotel Menu System.");

    // التحقق من البيانات الأساسية
    if (typeof menuCategories === 'undefined' || typeof hotelName === 'undefined' || typeof welcomeMessage === 'undefined') {
        console.error("CRITICAL ERROR: Essential data from menu-data.js is missing.");
        document.body.innerHTML = "<p style='text-align:center;color:red;font-size:1.5em;padding:50px;'>خطأ: فشل تحميل بيانات القائمة. يرجى مراجعة ملف menu-data.js.</p>";
        return;
    }

    // العناصر الأساسية
    const bodyElement = document.body;
    const categoryTabsContainer = document.querySelector('.category-tabs');
    const menuItemsGrid = document.getElementById('menu-items-grid');
    const hotelTitleElement = document.getElementById('hotel-title');
    const welcomeTextElement = document.getElementById('welcome-text');
    const footerHotelNameElement = document.getElementById('footer-hotel-name');
    const currentYearElement = document.getElementById('current-year');

    // عناصر النوافذ المنبثقة
    const itemDetailsModal = document.getElementById('item-details-modal');
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');

    // عناصر السلة
    const cartToggleButton = document.getElementById('cart-toggle-button');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    // عناصر إنهاء الطلب
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');
    const roomNumberInput = document.getElementById('room-number-input');
    const confirmOrderButton = document.getElementById('confirm-order-button');

    // عناصر الفاتورة
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

    // العناصر العامة
    const toastNotification = document.getElementById('toast-notification');
    const themeSwitcher = document.getElementById('theme-switcher');

    // المتغيرات العامة
    let cart = JSON.parse(localStorage.getItem('hotelCart')) || [];
    let currentItemIndexInDetailsModal = 0;
    let itemsInCurrentCategoryForDetailsModal = [];
    const VAT_RATE = 0.15;
    let html2canvasLoaded = false;

    // تهيئة البيانات الأساسية
    if (hotelTitleElement) hotelTitleElement.textContent = hotelName;
    if (footerHotelNameElement) footerHotelNameElement.textContent = hotelName;
    if (welcomeTextElement) welcomeTextElement.textContent = welcomeMessage;
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

    const categories = Object.keys(menuCategories);

    // ======================
    // وظائف إدارة السمة (الوضع الليلي/النهاري)
    // ======================
    function applyTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-mode');
            if(themeSwitcher) themeSwitcher.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            bodyElement.classList.remove('dark-mode');
            if(themeSwitcher) themeSwitcher.innerHTML = '<i class="fas fa-moon"></i>';
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

    // ======================
    // وظائف عرض القائمة
    // ======================
    function displayCategories() {
        if (!categoryTabsContainer) {
            console.error("Category tabs container not found!");
            return;
        }
        
        categoryTabsContainer.innerHTML = '';
        
        if (categories.length === 0) {
            console.warn("No categories to display.");
            return;
        }

        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = category;
            button.dataset.category = category;
            categoryTabsContainer.appendChild(button);
        });
    }

    function displayMenuItems(category) {
        if (!menuItemsGrid) {
            console.error("Menu items grid not found!");
            return;
        }

        // تأثير إخفاء للعناصر الحالية
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
                        <div>
                            <p class="price">${item.price} ريال</p>
                            <button class="add-to-cart-button" data-item-id="${item.id}">
                                <i class="fas fa-cart-plus"></i> أضف للسلة
                            </button>
                        </div>
                    </div>
                `;
                menuItemsGrid.appendChild(card);

                // تأثير ظهور للعناصر الجديدة
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, (index * 60) + 200);
            });
        }, 200 + (menuItemsGrid.children.length * 40));
    }

    // ======================
    // وظائف إدارة السلة
    // ======================
    function addToCart(itemId) {
        let itemToAdd = null;
        for (const categoryName in menuCategories) {
            itemToAdd = menuCategories[categoryName].find(item => item.id === itemId);
            if (itemToAdd) break;
        }
        
        if (!itemToAdd) {
            console.error(`Item with ID ${itemId} not found.`);
            return;
        }

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
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            updateCartDisplay();
            saveCartToLocalStorage();
            showToast(`${itemName} أزيل من السلة.`, 2000);
        }
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

    function saveCartToLocalStorage() {
        localStorage.setItem('hotelCart', JSON.stringify(cart));
    }

    // ======================
    // وظائف النوافذ المنبثقة
    // ======================
    function openItemDetailsModal(itemData) {
        if (!itemDetailsModal) return;
        
        modalImg.src = itemData.image;
        modalImg.alt = itemData.name;
        modalName.textContent = itemData.name;
        modalDescription.textContent = itemData.description || "لا يوجد وصف متوفر.";
        modalPrice.textContent = `${itemData.price} ريال`;
        
        if (modalAddToCartBtn) {
            modalAddToCartBtn.dataset.itemId = itemData.id;
        }
        
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
        }, 300);
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
        if (checkoutGrandTotal) checkoutGrandTotal.textContent = grandTotal.toFixed(2);
        
        if (cartSidebar) cartSidebar.classList.remove('visible');
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

        // تعبئة معلومات الفاتورة
        if (receiptOrderIdEl) receiptOrderIdEl.textContent = orderId;
        if (receiptRoomNumberEl) receiptRoomNumberEl.textContent = roomNumber || "غير محدد";
        
        const now = new Date();
        if (receiptDateEl) receiptDateEl.textContent = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
        if (receiptTimeEl) receiptTimeEl.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });

        // تعبئة جدول الأصناف
        if (receiptItemsTbody) receiptItemsTbody.innerHTML = '';
        let subtotal = 0;
        
        confirmedCart.forEach(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            const row = receiptItemsTbody.insertRow();
            row.innerHTML = `
                <td class="item-name-col">${item.name}</td>
                <td class="qty-col">${item.quantity}</td>
                <td class="price-col">${item.price} ريال</td>
                <td class="subtotal-col">${itemTotal.toFixed(2)} ريال</td>
            `;
            subtotal += itemTotal;
        });

        // حساب الضريبة والإجمالي
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
        if (!receiptModal) return;
        receiptModal.classList.remove('visible');
        setTimeout(() => {
            receiptModal.style.display = 'none';
            bodyElement.style.overflow = 'auto';
        }, 300);
    }

    // ======================
    // وظيفة حفظ الفاتورة كصورة
    // ======================
    // ... (الكود السابق حتى بداية saveReceiptAsImage) ...

    // ======================
    // وظيفة حفظ الفاتورة كصورة (محسنة)
    // ======================
     async function saveReceiptAsImage() {
        const receiptArea = document.getElementById('printable-receipt-area');
        const orderId = document.getElementById('receipt-order-id-val')?.textContent || 'unknown_order';

        if (!receiptArea) {
            showToast("خطأ: لم يتم العثور على منطقة الفاتورة.", 3000, 'error');
            return;
        }

        if (!html2canvasLoaded) {
            try {
                showToast("جاري تحميل مكتبة الصور...", 2000);
                await loadHtml2Canvas();
            } catch (error) {
                console.error("Failed to load html2canvas:", error);
                showToast("خطأ في تحميل مكتبة حفظ الصور. يرجى المحاولة مرة أخرى.", 3000, 'error');
                return;
            }
        }

        const originalButtonText = saveReceiptImageButton.innerHTML;
        saveReceiptImageButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        saveReceiptImageButton.disabled = true;

        let originalStyles = null;
        let originalChildFonts = [];
        let originalReceiptAreaDirection = receiptArea.style.direction; // حفظ الاتجاه الأصلي

        try {
            originalStyles = {
                width: receiptArea.style.width,
                maxWidth: receiptArea.style.maxWidth,
                padding: receiptArea.style.padding,
                boxShadow: receiptArea.style.boxShadow,
                border: receiptArea.style.border,
                fontSize: receiptArea.style.fontSize,
                fontFamily: receiptArea.style.fontFamily,
                lineHeight: receiptArea.style.lineHeight, // حفظ ارتفاع السطر الأصلي
                letterSpacing: receiptArea.style.letterSpacing, // حفظ تباعد الحروف الأصلي
            };

            receiptArea.style.width = '380px'; // أو 80mm إذا كنت تفضل
            receiptArea.style.maxWidth = '380px';
            receiptArea.style.padding = '15px';
            receiptArea.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            receiptArea.style.border = '1px solid #ccc';
            receiptArea.style.fontSize = '13px'; // حجم الخط الأساسي للفاتورة
            receiptArea.style.direction = 'rtl'; // التأكد من الاتجاه من اليمين لليسار
            receiptArea.style.lineHeight = '1.6'; // قد تحتاج لتعديل هذا
            // receiptArea.style.letterSpacing = 'normal'; // تجربة إعادة التعيين إلى الوضع الطبيعي

            const computedFont = getComputedStyle(document.documentElement).getPropertyValue('--font-receipt-onscreen').trim() || 'Tajawal, sans-serif';
            receiptArea.style.fontFamily = computedFont;

            const allElementsInReceipt = receiptArea.querySelectorAll('*');
            allElementsInReceipt.forEach(el => {
                originalChildFonts.push({
                    element: el,
                    fontFamily: el.style.fontFamily,
                    direction: el.style.direction, // حفظ اتجاه كل عنصر
                    lineHeight: el.style.lineHeight,
                    // letterSpacing: el.style.letterSpacing
                });
                el.style.fontFamily = 'inherit'; // ليرث الخط من receiptArea
                el.style.direction = 'inherit'; // ليرث الاتجاه
                el.style.lineHeight = 'inherit';
                // el.style.letterSpacing = 'normal';

                // معالجة خاصة للعناصر التي تحتوي على السعر و "ريال"
                // إذا كانت عناصر السعر لديها فئة معينة، استهدفها هنا
                // مثال: if (el.classList.contains('price-value') || el.classList.contains('currency-symbol'))
                // هذا مثال عام، قد تحتاج لتكييفه حسب بنية HTML الخاصة بك
                if (el.innerText && (el.innerText.includes('ريال') || /\d/.test(el.innerText))) {
                    // el.style.letterSpacing = '0.5px'; // تجربة تباعد بسيط
                }
            });


            if (typeof html2canvas === 'undefined') {
                showToast("مكتبة html2canvas غير محملة. لا يمكن حفظ الصورة.", 4000, 'error');
                throw new Error("html2canvas is not defined");
            }

            const canvas = await html2canvas(receiptArea, {
                scale: 2.5, // يمكنك تجربة تقليل هذا قليلاً (مثلاً 2) لرؤية التأثير
                logging: false,
                useCORS: true,
                backgroundColor: bodyElement.classList.contains('dark-mode') ? getComputedStyle(document.documentElement).getPropertyValue('--color-surface-dm').trim() : getComputedStyle(document.documentElement).getPropertyValue('--color-surface-lm').trim(),
                onclone: (clonedDocument) => {
                    const clonedReceiptArea = clonedDocument.getElementById('printable-receipt-area');
                    if (clonedReceiptArea) {
                        clonedReceiptArea.style.direction = 'rtl'; // التأكيد مرة أخرى في النسخة المستنسخة
                        clonedReceiptArea.style.fontFamily = computedFont;
                        // clonedReceiptArea.style.lineHeight = '1.6';

                        clonedReceiptArea.querySelectorAll('*').forEach(clonedEl => {
                           if (clonedEl.style) {
                               clonedEl.style.fontFamily = 'inherit';
                               clonedEl.style.direction = 'inherit';
                               // clonedEl.style.lineHeight = 'inherit';
                               // clonedEl.style.letterSpacing = 'normal';
                           }
                           // معالجة خاصة للنص الذي يحتوي على "ريال" في النسخة المستنسخة
                           if (clonedEl.innerText && clonedEl.innerText.includes('ريال')) {
                                // قد تحتاج إلى التفاف كلمة "ريال" بـ <span> مع أنماط خاصة إذا لزم الأمر
                                // مثال: clonedEl.innerHTML = clonedEl.innerHTML.replace(/ريال/g, '<span style="display: inline-block; vertical-align: baseline;">ريال</span>');
                           }
                        });
                        const logoImg = clonedReceiptArea.querySelector('.receipt-logo');
                        if (logoImg) {
                            logoImg.style.filter = 'none';
                        }
                    }
                }
            });

            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.download = `فاتورة_${hotelName.replace(/\s+/g, '_')}_${orderId}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast("تم حفظ الفاتورة كصورة بنجاح!", 2500, 'success');

        } catch (error) {
            console.error('Error saving receipt as image:', error);
            showToast("حدث خطأ أثناء حفظ الفاتورة كصورة. التفاصيل في الكونسول.", 4000, 'error');
        } finally {
            if (originalStyles) {
                receiptArea.style.width = originalStyles.width;
                receiptArea.style.maxWidth = originalStyles.maxWidth;
                receiptArea.style.padding = originalStyles.padding;
                receiptArea.style.boxShadow = originalStyles.boxShadow;
                receiptArea.style.border = originalStyles.border;
                receiptArea.style.fontSize = originalStyles.fontSize;
                receiptArea.style.fontFamily = originalStyles.fontFamily;
                receiptArea.style.lineHeight = originalStyles.lineHeight;
                receiptArea.style.letterSpacing = originalStyles.letterSpacing;
            }
            receiptArea.style.direction = originalReceiptAreaDirection; // استعادة الاتجاه الأصلي

            if (originalChildFonts.length > 0) {
                originalChildFonts.forEach(item => {
                    item.element.style.fontFamily = item.fontFamily;
                    item.element.style.direction = item.direction;
                    item.element.style.lineHeight = item.lineHeight;
                    // item.element.style.letterSpacing = item.letterSpacing;
                });
            }

            saveReceiptImageButton.innerHTML = originalButtonText;
            saveReceiptImageButton.disabled = false;
        }
    }

 function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (typeof html2canvas !== 'undefined') {
            console.log("html2canvas already loaded.");
            resolve();
            return;
        }
        console.log("Loading html2canvas...");
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        // script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfKvMGEXFHwPQCA9AbaHANdkASOtarjPQiRxOsnEXDJrNBJIERJIKiYpvKMTg2A=='; // <-- تم التعليق على هذا السطر أو حذفه
        script.crossOrigin = 'anonymous'; // اترك هذا، قد يكون مفيدًا
        script.referrerPolicy = 'no-referrer'; // اترك هذا

        script.onload = () => {
            console.log("html2canvas loaded successfully.");
            html2canvasLoaded = true;
            resolve();
        };
        script.onerror = (err) => {
            console.error("Failed to load html2canvas script:", err);
            // يمكنك إضافة تفاصيل الخطأ إلى رسالة التوست إذا أردت
            reject(new Error('Failed to load html2canvas from CDN. Check console for details.'));
        };
        document.head.appendChild(script);
    });
}

// ... (بقية كود JavaScript) ...

    // ======================
    // وظائف مساعدة
    // ======================
    function showToast(message, duration = 3000, type = '') {
        if (!toastNotification) return;
        
        toastNotification.textContent = message;
        toastNotification.className = 'toast-notification';
        
        if (type) {
            toastNotification.classList.add(type);
        }
        
        toastNotification.classList.add('show');
        
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }

    function generateOrderId() {
        return `ORD-${Date.now().toString().slice(-7)}`;
    }

    // ======================
    // إرفاق مستمعي الأحداث
    // ======================
    if (cartToggleButton) {
        cartToggleButton.addEventListener('click', () => {
            if (cartSidebar) {
                cartSidebar.classList.toggle('visible');
                bodyElement.style.overflow = cartSidebar.classList.contains('visible') ? 'hidden' : 'auto';
            }
        });
    }

    if (closeCartButton) {
        closeCartButton.addEventListener('click', () => {
            if (cartSidebar) cartSidebar.classList.remove('visible');
            bodyElement.style.overflow = 'auto';
        });
    }

    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const target = e.target.closest('[data-id]');
            if (!target) return;

            const itemId = target.dataset.id;
            const itemInCart = cart.find(i => i.id === itemId);
            if (!itemInCart) return;

            if (target.classList.contains('remove-from-cart-btn') || target.closest('.remove-from-cart-btn')) {
                removeFromCart(itemId);
            } else if (target.classList.contains('quantity-change-btn') || target.closest('.quantity-change-btn')) {
                const change = parseInt(target.dataset.change, 10);
                updateCartItemQuantity(itemId, itemInCart.quantity + change);
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

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            if (itemId) {
                addToCart(itemId);
                closeItemDetailsModal();
            }
        });
    }

    if (itemDetailsModal) {
        itemDetailsModal.addEventListener('click', (e) => {
            if (e.target === itemDetailsModal || e.target.classList.contains('item-modal-close')) {
                closeItemDetailsModal();
            }
        });
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', showCheckoutModal);
    }

    if (confirmOrderButton) {
        confirmOrderButton.addEventListener('click', () => {
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
            console.log("Order Confirmed:", { orderId: currentOrderId, roomNumber: roomNum, items: cart });
            
            showReceiptModal(roomNum, [...cart], currentOrderId);
            cart = [];
            updateCartDisplay();
            saveCartToLocalStorage();
            if (roomNumberInput) roomNumberInput.value = '';
        });
    }

    if (printReceiptButton) {
        printReceiptButton.addEventListener('click', () => {
            window.print();
        });
    }

    if (saveReceiptImageButton) {
        saveReceiptImageButton.addEventListener('click', saveReceiptAsImage);
    }

    if (newOrderButton) {
        newOrderButton.addEventListener('click', closeReceiptModal);
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

    // التهيئة الأولية
    if (categories.length > 0) {
        displayCategories();
        const firstTabButton = categoryTabsContainer ? categoryTabsContainer.querySelector('.tab-button') : null;
        if (firstTabButton) {
            firstTabButton.classList.add('active');
            displayMenuItems(categories[0]);
        } else if (menuItemsGrid) {
            displayMenuItems(categories[0]);
        }
    } else if (menuItemsGrid) {
        menuItemsGrid.innerHTML = "<p class='no-items-message'>لا توجد أقسام في القائمة حالياً.</p>";
    }

    updateCartDisplay(); // تحديث عرض السلة عند التحميل
});