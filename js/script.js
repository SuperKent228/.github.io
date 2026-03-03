// Скрипт для корзины
console.log('Скрипт корзины загружен!');

document.addEventListener('DOMContentLoaded', function() {
    
    // Элементы корзины
    const cartIcon = document.querySelector('.cart, .cart-btn, .header__actions a[href="#"]');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.querySelector('.close-cart');
    const cartCount = document.querySelector('.cart-count');
    const continueShopping = document.querySelector('.continue-shopping');
    
    // Массив для хранения товаров в корзине
    let cartItems = [];
    
    // Открытие корзины
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            if (cartModal) {
                cartModal.classList.add('show');
                updateCartDisplay();
            }
        });
    }
    
    // Закрытие корзины
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartModal.classList.remove('show');
        });
    }
    
    // Закрытие по клику вне корзины
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.classList.remove('show');
            }
        });
    }
    
    // Продолжить покупки
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            cartModal.classList.remove('show');
        });
    }
    
    // Функция для получения правильной цены товара
    function getCorrectPrice(productCard) {
        console.log('Ищем цену для товара:', productCard.querySelector('h3')?.textContent);
        
        // 1. Пробуем найти current-price (самый надежный способ)
        const currentPriceElement = productCard.querySelector('.current-price');
        if (currentPriceElement) {
            const priceText = currentPriceElement.textContent.trim();
            console.log('Нашли current-price:', priceText);
            // Убираем все кроме цифр и преобразуем в число
            const priceNumber = parseInt(priceText.replace(/\s/g, '').replace('₽', ''));
            if (!isNaN(priceNumber) && priceNumber > 0) {
                console.log('Цена из current-price:', priceNumber);
                return priceNumber;
            }
        }
        
        // 2. Пробуем найти price (обычная цена)
        const priceElement = productCard.querySelector('.price');
        if (priceElement) {
            const priceText = priceElement.textContent.trim();
            console.log('Нашли price:', priceText);
            
            // Проверяем, есть ли старая цена (old-price)
            const oldPriceElement = productCard.querySelector('.old-price');
            if (oldPriceElement) {
                // Если есть старая цена, берем current-price внутри price
                const currentInPrice = priceElement.querySelector('.current-price');
                if (currentInPrice) {
                    const currentText = currentInPrice.textContent.trim();
                    const currentNumber = parseInt(currentText.replace(/\s/g, '').replace('₽', ''));
                    if (!isNaN(currentNumber) && currentNumber > 0) {
                        console.log('Цена из current-price внутри price:', currentNumber);
                        return currentNumber;
                    }
                }
                
                // Если нет current-price, ищем второе число (это новая цена)
                const numbers = priceText.match(/\d+/g);
                if (numbers && numbers.length >= 2) {
                    // Берем последнее число (это новая цена)
                    const lastNumber = parseInt(numbers[numbers.length - 1]);
                    console.log('Цена из price (последнее число):', lastNumber);
                    return lastNumber;
                }
            } else {
                // Если нет старой цены, просто берем число
                const number = parseInt(priceText.replace(/\s/g, '').replace('₽', ''));
                if (!isNaN(number) && number > 0) {
                    console.log('Цена из price (одно число):', number);
                    return number;
                }
            }
        }
        
        // 3. Если ничего не нашли, ищем в тексте карточки
        const allText = productCard.textContent;
        console.log('Текст всей карточки:', allText);
        
        // Ищем все числа в тексте
        const numbers = [];
        const matches = allText.match(/\d+\s*\d*/g);
        if (matches) {
            matches.forEach(match => {
                // Убираем пробелы и преобразуем в число
                const num = parseInt(match.replace(/\s/g, ''));
                if (!isNaN(num) && num > 0) {
                    numbers.push(num);
                }
            });
        }
        
        console.log('Все найденные числа:', numbers);
        
        // Для товара "Лофт" (где есть старая цена 18700 и новая 14990)
        // Берем наименьшее число - это новая цена
        if (numbers.length > 0) {
            // Находим минимальное число (это обычно цена со скидкой)
            const minPrice = Math.min(...numbers);
            console.log('Берем минимальное число как цену:', minPrice);
            return minPrice;
        }
        
        console.log('Цена не найдена, возвращаем 0');
        return 0;
    }
    
    // Добавление товара в корзину
    const addToCartButtons = document.querySelectorAll('.btn-add, .btn-add-to-cart, .product-card button, .product button, button:contains("В корзину")');
    
    // Добавляем обработчики на все кнопки
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('В корзину') || 
            button.classList.contains('btn-add') || 
            button.classList.contains('btn-add-to-cart')) {
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Находим карточку товара
                const productCard = this.closest('.product-card, .product, div[class*="product"]');
                
                if (productCard) {
                    // Получаем название товара
                    const titleElement = productCard.querySelector('h3');
                    const title = titleElement ? titleElement.textContent.trim() : 'Товар';
                    
                    // Получаем цену товара через нашу функцию
                    const price = getCorrectPrice(productCard);
                    
                    console.log('Добавляем товар:', title, 'по цене:', price);
                    
                    if (price === 0) {
                        alert('Ошибка: не удалось определить цену товара');
                        return;
                    }
                    
                    // Проверяем, есть ли уже такой товар в корзине
                    const existingItem = cartItems.find(item => item.title === title);
                    
                    if (existingItem) {
                        // Если есть, увеличиваем количество
                        existingItem.quantity++;
                    } else {
                        // Если нет, создаем новый
                        const product = {
                            id: Date.now() + Math.random(),
                            title: title,
                            price: price,
                            quantity: 1,
                            image: 'https://via.placeholder.com/80'
                        };
                        
                        // Добавляем в массив
                        cartItems.push(product);
                    }
                    
                    // Обновляем счетчик
                    updateCartCount();
                    
                    // Показываем уведомление
                    showNotification('Товар добавлен в корзину!');
                    
                    // Если корзина открыта, обновляем её
                    if (cartModal && cartModal.classList.contains('show')) {
                        updateCartDisplay();
                    }
                }
            });
        }
    });
    
    // Функция обновления счетчика
    function updateCartCount() {
        if (cartCount) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    
    // Функция показа уведомления
    function showNotification(message) {
        // Проверяем, есть ли уже уведомление
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    // Функция обновления отображения корзины
    function updateCartDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const totalSpan = document.querySelector('.total-price');
        
        if (!cartItemsContainer) return;
        
        if (cartItems.length === 0) {
            // Показываем пустую корзину
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Ваша корзина пуста</p>
                    <button class="btn btn-primary continue-shopping">Начать покупки</button>
                </div>
            `;
            
            // Добавляем обработчик для кнопки в пустой корзине
            const emptyCartBtn = cartItemsContainer.querySelector('.continue-shopping');
            if (emptyCartBtn) {
                emptyCartBtn.addEventListener('click', () => {
                    cartModal.classList.remove('show');
                });
            }
            
            if (totalSpan) totalSpan.textContent = '0 ₽';
        } else {
            // Показываем товары
            let html = '';
            let total = 0;
            
            cartItems.forEach((item, index) => {
                total += item.price * item.quantity;
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p class="cart-item-price">${item.price.toLocaleString()} ₽</p>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-index="${index}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            });
            
            cartItemsContainer.innerHTML = html;
            if (totalSpan) totalSpan.textContent = total.toLocaleString() + ' ₽';
            
            // Добавляем обработчики для кнопок в корзине
            attachCartItemHandlers();
        }
    }
    
    // Обработчики для кнопок в корзине
    function attachCartItemHandlers() {
        // Минус
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                } else {
                    cartItems.splice(index, 1);
                }
                updateCartCount();
                updateCartDisplay();
            });
        });
        
        // Плюс
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                cartItems[index].quantity++;
                updateCartCount();
                updateCartDisplay();
            });
        });
        
        // Удалить
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                cartItems.splice(index, 1);
                updateCartCount();
                updateCartDisplay();
            });
        });
    }
    
    // Добавляем стили для уведомления, если их нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s;
                z-index: 3000;
            }
            
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
});