// названия всех ключей в localstorage
let storageKeys = {
    cart: "audiofree_cart",
    cartOneclick: "audiofree_cart_oneclick",
    favorites: "audiofree_favorites",
    totalPrice: "audiofree_total_price"
}

// проверка целостности корзины
function fixStorageItems() {
    // названия ключей в localstorage
    let storageItems = [
        storageKeys.cart,
        storageKeys.cartOneclick,
        storageKeys.favorites
    ];
    // проверка на наличие каждого ключа, а также является ли он массивом
    storageItems.forEach(item => {
        let storage = getStorage(item);
        if (!Array.isArray(storage)) {
            storage = [];
            setStorage(item, storage);
        }
    });
}
fixStorageItems();

// проверка типа корзины на странице
function checkCartType() {
    let cartBlock = document.querySelector('.cart-page');

    // корзины нет на странице
    if (!cartBlock) return null;

    // корзина в "1 клик"
    if (cartBlock.classList.contains('cart-page--oneclick')) {
        return 'oneClick';
    }

    // обычная корзина
    else return 'cart';
}

// подсчёт цены всех товаров в корзине
function calcTotalPrice() {
    let totalPrice = getStorage(storageKeys.totalPrice);
    if (!totalPrice) {
        totalPrice = 0;
        setStorage(storageKeys.totalPrice, totalPrice);
    }

    let cartBlock = document.querySelector('.cart-page');
    if (cartBlock) {
        let sum = 0;
        let cart = [];

        // обычная корзина
        if (!cartBlock.classList.contains('cart-page--oneclick')) {
            cart = getStorage(storageKeys.cart);
        }
        // корзина "в 1 клик"
        else {
            cart = getStorage(storageKeys.cartOneclick);
        }

        cart.forEach(item => {
            let itemTotalPrice = products[item.vendorCode].price * item.amount;
            sum += itemTotalPrice;
        });

        setStorage(storageKeys.totalPrice, sum);
    }
}

// ============= PRODUCTS ============= //
if (document.querySelector('#products-app')) {
    const block = document.querySelector('#products-app');

    const ProductsApp = {
        data() {
            return {
                products: products,
                favorites: getStorage(storageKeys.favorites),
                imageViewingMedia: 'slider',
                totalRatingAmount: 5
            }
        },
        mounted() {
            // инициализировать spoilerBlock
            spoilerBlockInst.initSpoilerBlock(block);
            // инициализировать слайдеры
            swiperSlidersInit();
            // в объект this.products выставить значение того, находится ли данный товар в избранном
            this.setFavorite();
            // отслеживать media для смены режима просмотра фото
            this.imageViewingMediaChange();
            // только на странице товара
            let productPage = document.querySelector('.product-page');
            if (productPage) {
                this.setCurrentImage();
            }
            // повесить обработчики
            setTimeout(() => {
                initControls();
                devicesListToggle();
            }, 0);
        },
        methods: {
            openCardIcons(event) {
                let button = event.target.parentNode;
                let container = button.nextElementSibling;
                button.classList.toggle('__active');
                container.classList.toggle('__active');
            },
            imageViewingMediaChange() {
                let mdValue = 849;
                let media = window.matchMedia(`(max-width: ${mdValue}px)`);
                onChange = onChange.bind(this);
                media.addEventListener('change', onChange);
                onChange();

                function onChange() {
                    // включить слайдер (моб.)
                    if (media.matches) {
                        this.imageViewingMedia = 'slider';
                    }
                    // включить обычный режим просмотра (пк)
                    else {
                        this.imageViewingMedia = 'usual';
                    }
                }
            },
            renderRating(vendorCode) {
                let obj = this.products[vendorCode];
                if (!obj) obj = {};
                // массив, представляющий количество (.length) активных звёзд
                let activeStars = [];
                for (let i = 0; i < obj.rating; i++) { activeStars.push(i); }
                // массив, представляющий количество (.length) пустых звёзд
                let emptyStars = [];
                for (let i = 0; i < (this.totalRatingAmount - obj.rating); i++) { emptyStars.push(i) }
                return {
                    activeStars: activeStars,
                    emptyStars: emptyStars
                }
            },
            addToCart(vendorCode, cartType, isProductPage = false) {
                let options;
                // выставить опции по умолчанию
                if (!isProductPage) {
                    options = {};
                    options.vendorCode = vendorCode;
                    options.amount = '1';

                    let prodOptions = this.products[vendorCode].options;
                    for (let opt in prodOptions) {
                        options[opt] = prodOptions[opt].list[0];
                    }
                }
                // собрать опции со страницы товара
                else if (isProductPage) {
                    let productPage = document.querySelector('.product-block');
                    options = {};
                    options.vendorCode = vendorCode;

                    let optBlocks = productPage.querySelectorAll('[data-option-name]');
                    optBlocks.forEach(block => {
                        let optName = block.dataset.optionName;
                        let input = block.querySelector('input');

                        let value;
                        if (input.type == 'text') value = input.value;
                        if (input.type == 'radio') {
                            input = block.querySelector('input:checked');
                            value = input.value;
                        }

                        options[optName] = value;
                    });
                }
                if (cartType == 'cart') {
                    let storage = getStorage(storageKeys.cart);
                    if (storage) storage.push(options);
                    else {
                        storage = [];
                        storage.push(options);
                    }

                    setStorage(storageKeys.cart, storage);

                    showItemsAmount();

                    // вставить вызов уведомления
                    let popupMessage =
                        `
                            ${popupMethods.createNote('Товар добавлен в корзину.')}
                            ${popupMethods.createNote('<a href="../html-products/cart.html">Перейти</a>')}
                        `;
                    popupMethods.createPopup(popupMessage);
                }
                if (cartType == 'oneClick') {
                    let storage = getStorage(storageKeys.cartOneclick);
                    storage = [];
                    storage.push(options);
                    setStorage(storageKeys.cartOneclick, storage);
                }
            },
            toggleFavorites(event) {
                let button = event.target;
                let prod = button.closest('[data-vendor-code]');
                let vendorCode = prod.dataset.vendorCode;
                let storage = getStorage(storageKeys.favorites);
                let itemIndex = storage.indexOf(vendorCode);

                // элемент уже в избранном - удалить его оттуда
                if (itemIndex != -1) {
                    storage.splice(itemIndex, 1);
                    // вызвать уведомление-popup
                    let popupMessage =
                        `
                        ${popupMethods.createNote('Товар <span class="bold-text">' + this.products[vendorCode].name + '</span> удалён из избранного')}
                        `;
                    popupMethods.createPopup(popupMessage, 3000);
                }
                // элемента нет в избранном - добавить его туда
                if (itemIndex < 0) {
                    storage.push(vendorCode);
                    // вызвать уведомление-popup
                    let popupMessage =
                        `
                        ${popupMethods.createNote('Товар <span class="bold-text">' + this.products[vendorCode].name + '</span> добавлен в избранное')}
                        ${popupMethods.createNote('<a href="../html-products/favorites.html">Перейти</a>')}
                        `;
                    popupMethods.createPopup(popupMessage, 3000);
                }

                // обновить данные в localstorage и в this.products
                setStorage(storageKeys.favorites, storage);
                this.favorites = getStorage(storageKeys.favorites);
                this.setFavorite();
                // обновить иконку, показывающую кол-во (в шапке)
                showItemsAmount();
            },
            setFavorite() {
                for (let vendorCode in this.products) {
                    let prod = this.products[vendorCode];
                    let isFavorite = false;

                    let favoritesStorage = this.favorites;
                    favoritesStorage.forEach(item => {
                        if (item == vendorCode) isFavorite = true;
                    });

                    prod.isFavorite = isFavorite;
                }
            },
            // только на странице товара
            setCurrentImage(event = null) {
                if (this.imageViewingMedia == 'usual') {
                    setTimeout(() => {
                        let productBlock = document.querySelector('.product-block[data-vendor-code]');
                        let images = productBlock.querySelectorAll('.small-image');
                        let vendorCode = productBlock.dataset.vendorCode;
                        let image, src;

                        // нажатие на конкретное фото / выставление фото по умолчанию (при загрузке страницы)
                        (event) ? image = event.target : image = images[0].querySelector('img');

                        // выставить большое фото 
                        src = image.src;
                        this.products[vendorCode]['image-current'] = src;
                        // обвести маленькое фото
                        images.forEach(i => { i.classList.remove('__active'); });
                        image.parentNode.classList.add('__active');
                    }, 100);
                }
            }
        }
    }

    Vue.createApp(ProductsApp).mount('#products-app');
}


// =============== CART =============== //
if (document.querySelector('#cart-app')) {
    const block = document.querySelector('#cart-app');

    const CartApp = {
        data() {
            return {
                products: products,
                cart: getStorage(storageKeys.cart),
                cart_oneclick: getStorage(storageKeys.cartOneclick),
                totalPrice: getStorage(storageKeys.totalPrice),
                cartIsEmpty: getStorage(storageKeys.cart).length <= 0
            }
        },
        mounted() {
            this.refreshData();
            // инициализировать слайдеры
            swiperSlidersInit();
            // повесить обработчики на изменение количества
            initControls();
        },
        methods: {
            // refreshData используется для обновления всех данных в data(), когда были внесены изменения в localstorage
            refreshData() {
                calcTotalPrice();
                showItemsAmount();

                this.cart = getStorage(storageKeys.cart);
                this.cart_oneclick = getStorage(storageKeys.cartOneclick);
                this.totalPrice = getStorage(storageKeys.totalPrice);
                this.cartIsEmpty = getStorage(storageKeys.cart).length <= 0;
            },
            delFromCart(event) {
                let button = event.target;
                let item = button.closest('.cart-list__item');
                let index = button.closest('[data-cart-item-number]').dataset.cartItemNumber;
                let storage = getStorage(storageKeys.cart);
                storage.splice(index, 1);
                setStorage(storageKeys.cart, storage);
                this.refreshData();

                // вставить вызов уведомления
                let name = item.querySelector('[data-cart-item-name]').dataset.cartItemName;
                let popupMessage =
                    `
                    ${popupMethods.createNote('Товар <span class="bold-text">' + name + '</span> удалён из корзины.')}
                    `;
                popupMethods.createPopup(popupMessage, 2000);

            },
            amountChange(event) {
                let input = event.target;
                let amount = input.value;
                let cartItemNumber = input.closest('[data-cart-item-number]').dataset.cartItemNumber;

                // проверка на тип корзины
                let cartType;
                input.closest('.cart-page').classList.contains('cart-page--oneclick') ? cartType = 'oneClick' : cartType = 'cart';

                if (cartType == 'cart') {
                    let cart = getStorage(storageKeys.cart);
                    cart[cartItemNumber].amount = amount;
                    setStorage(storageKeys.cart, cart);
                } else {
                    let cart = getStorage(storageKeys.cartOneclick);
                    cart[cartItemNumber].amount = amount;
                    setStorage(storageKeys.cartOneclick, cart);
                }
                this.refreshData();
            }
        }
    }

    Vue.createApp(CartApp).mount('#cart-app');
}