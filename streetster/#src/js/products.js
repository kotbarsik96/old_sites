const productAppBlock = document.querySelector('#products-app');
// проверка на наличие приложений vue на странице
let products;
// на странице есть vue приложение, загрузить products.json
if (productAppBlock) {
    fetch('../../js/JSON/products.json')
        .then(resolve => resolve.json())
        .then(data => {
            products = data;
            // начать работу vue приложени[я/й]
            initVueApps();
        });
}
// на странице нет vue приложений, инициализировать остальные скрипты
else {
    // инициализация слайдеров и других скриптов
    swiperSlidersInit();
    initShorts();
}


function initVueApps() {
    // PRODUCTS //
    if (productAppBlock) {
        const Products = {
            data() {
                return {
                    json: {
                        products: products,
                        prodBikes: products.bikes,
                        prodAccs: products.accessories,
                    },
                    html: {
                        productBlocks: [],
                        totalPrice: 0,
                    },
                    cart: {
                        prodInfo: {},
                        isAddedToCart: false,
                        addedToCartInfo: {},
                        storage: getStorage('streetster_cart'),
                        totalPrice: 0
                    }
                }
            },
            mounted() {
                this.html.productBlocks = Array.from(document.querySelectorAll('[data-product-name]'));
                // инициализация слайдеров и других скриптов
                this.sliders = swiperSlidersInit();
                initShorts();
                // обновить состояние корзины
                this.refreshCart();
                // проставить первые опции
                this.setFirstOption();
                // синхронизировать слайдер с выбором цвета через кружки
                this.setColorChangeListener();
                // собрать информацию для корзины + выставить цену (только на странице товара)
                this.getProdInfo();
            },
            methods: {
                // опции
                setFirstOption() {
                    this.html.productBlocks.forEach(prodBlock => {
                        const paramsBlock = prodBlock.querySelectorAll('.params');
                        paramsBlock.forEach(paramBlock => {
                            paramBlock.querySelector('input[type="radio"]').checked = true;
                        });
                    });
                },
                setColorChangeListener() {
                    this.html.productBlocks.forEach(prodBlock => {
                        onChange = onChange.bind(this);

                        let input = prodBlock.querySelectorAll('input[data-color-code]')[0];
                        let form = input.closest('form');
                        let slider = prodBlock.querySelector('.bike-slider');

                        // передать bikeSlider, для того чтобы применить методы Swiper'а
                        let sliderInstance;
                        if (this.sliders.bikeSlider.length) {
                            this.sliders.bikeSlider.forEach(instance => {
                                if (instance.el === slider) sliderInstance = instance;
                            });
                        }
                        else sliderInstance = this.sliders.bikeSlider;

                        form.addEventListener('change', onChange);
                        function onChange() {
                            syncColorImage(slider, 'onForm', sliderInstance);
                        }
                    });
                },
                calcTotalProdPrice(prodAccs, prodPrice) {
                    prodPrice = parseInt(prodPrice);

                    let accsPrice = 0;
                    if (prodAccs.length > 0) {
                        prodAccs.forEach(i => { accsPrice += parseInt(i.price); });
                    }

                    this.html.totalPrice = prodPrice + accsPrice;
                },
                // корзина
                getProdInfo() {
                    const prodBlock = document.querySelector('.bike-page__start-block');
                    if (prodBlock && prodBlock.dataset.productName) {
                        getOptions = getOptions.bind(this);
                        getAccs = getAccs.bind(this);
                        // собрать информацию о товаре
                        const prodName = prodBlock.dataset.productName;
                        const prodPrice = this.json.prodBikes[prodName].price;
                        const prodParams = getOptions();
                        const prodAccs = getAccs();
                        // выставить итоговую цену
                        this.calcTotalProdPrice(prodAccs, prodPrice);
                        // сгруппировать полученную информацию
                        const prodInfo = {
                            name: separateName(prodName),
                            id: prodName,
                            totalProdPrice: this.html.totalPrice,
                            prodPrice: prodPrice,
                            params: prodParams,
                            accs: prodAccs
                        };
                        this.cart.prodInfo = prodInfo;

                        function getOptions() {
                            const paramsBlock = prodBlock.querySelector('.bike-order__params');
                            const params = paramsBlock.querySelectorAll('.params');
                            const paramsList = {};
                            params.forEach(param => {
                                const paramName = param.dataset.paramName;
                                const paramInputType = param.querySelector('input').type;
                                if (paramInputType === 'radio') {
                                    const paramChecked = param.querySelector('input:checked');
                                    const paramIndex = paramChecked.dataset.paramIndex;
                                    let paramInfo = {};
                                    if (paramName === 'color') {
                                        paramInfo.name = this.json.prodBikes[prodName].colors.name;
                                        paramInfo.info = this.json.prodBikes[prodName].colors.list[paramIndex].name2;
                                        paramInfo.addInfo = this.json.prodBikes[prodName].colors.list[paramIndex];
                                    }
                                    else {
                                        paramInfo.name = this.json.prodBikes[prodName].params[paramName].name;
                                        paramInfo.info = this.json.prodBikes[prodName].params[paramName].list[paramIndex];
                                    }

                                    paramsList[paramName] = paramInfo;
                                }
                            });
                            return paramsList;
                        }
                        function getAccs() {
                            const accsBlock = prodBlock.querySelector('.accessories__list');
                            const accs = accsBlock.querySelectorAll('.accessories-item');
                            const accsList = [];
                            accs.forEach(acc => {
                                const accInput = acc.querySelector('input:checked');
                                if (accInput) {
                                    const accName = accInput.dataset.accName;
                                    const accInfo = this.json.prodAccs[accName];
                                    accsList.push(accInfo);
                                }
                            });
                            return accsList;
                        }
                        function separateName(string) {
                            if (!string) return string;
                            else {
                                let array = string.split('-');
                                let name = '';
                                for (let i = 0; i < array.length; i++) {
                                    name += array[i][0].toUpperCase() + array[i].slice(1);
                                    if (i !== array.length - 1) name += ' ';
                                }
                                return name;
                            }
                        }
                    }
                },
                addToCart() {
                    // поместить в localstorage
                    const storage = getStorage('streetster_cart');
                    storage.push(this.cart.prodInfo);
                    setStorage('streetster_cart', storage);
                    // указать, что товар добавлен в корзину
                    this.cart.isAddedToCart = true;
                    this.cart.addedToCartInfo = this.cart.prodInfo;
                    // обновить состояние корзины
                    this.refreshCart();
                },
                removeFromCart(mainIndex, storage = null, accIndex = null) {
                    if (!storage) storage = getStorage('streetster_cart');

                    // убрать основной товар (велосипед)
                    if (accIndex == null) storage.splice(mainIndex, 1);
                    // убрать доп.товар (аксессуар)
                    if (accIndex || accIndex == 0) {
                        const prod = storage[mainIndex];
                        const acc = prod.accs[accIndex];
                        prod.totalProdPrice = prod.totalProdPrice - parseInt(acc.price);
                        prod.accs.splice(accIndex, 1);
                    }
                    // обновить состояние корзины
                    setStorage('streetster_cart', storage);
                    this.refreshCart();
                    // сбросить кнопки на странице
                    this.cart.isAddedToCart = false;
                },
                cancelOrder() {
                    // получить storage и найти только что добавленный элемент через сравнение
                    const storage = getStorage('streetster_cart');
                    let index = storage.findIndex(item => {
                        const iterationName = item.name;
                        const iterationParams = JSON.stringify(item.params);
                        const prodName = this.cart.addedToCartInfo.name;
                        const prodParams = JSON.stringify(this.cart.addedToCartInfo.params);
                        if (iterationName == prodName && iterationParams == prodParams) return true;
                        else return false;
                    });
                    index = parseInt(index);
                    // если элемент найден - удалить и загрузить в storage
                    if (index + 1) this.removeFromCart(index, storage);
                },
                orderMore() {
                    this.cart.isAddedToCart = false;
                },
                refreshCart() {
                    const storage = getStorage('streetster_cart');
                    this.cart.totalPrice = calcTotalPrice();
                    this.cart.storage = storage;
                    this.cart.storageLength = storage.length;

                    function calcTotalPrice() {
                        let totalPrice = 0;
                        storage.forEach(prod => totalPrice += parseInt(prod.totalProdPrice));
                        return totalPrice;
                    }
                }
            }
        };

        let app = Vue.createApp(Products).mount('#products-app');
    }
}