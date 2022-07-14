// запускается после того, как будет совершен Vue.mount()
function initShorts() {
    // HEADER + FOOTER //
    class HeaderFooter {
        constructor() {
            this.el = document.querySelector('.header');

            this.toggleAsideMenus();
            this.setPaddingTop();
            this.onScroll();
            this.toggleSearchResults();
            this.toggleFooterItems();
        }
        toggleAsideMenus() {
            const asidesList = [
                ['icon__cart', 'cart'],
                ['icon__menu', 'menu']
            ];
            asidesList.forEach(item => {
                let btnsList = document.querySelectorAll(`.${item[0]}`);
                let asideMenu = document.querySelector(`.${item[1]}`);
                // клик по кнопке
                btnsList.forEach(btn => btn.addEventListener('click', onClickBtn));
                // клик по черной области
                asideMenu.addEventListener('click', onClickAside);

                function onClickBtn() {
                    toggle(btnsList, asideMenu, this);
                }
                function onClickAside(event) {
                    if (event.target.classList.contains('aside-menu')) {
                        toggle(btnsList, asideMenu, this);
                    }
                }
            });

            function toggle(btnsList, asideMenu, target) {
                if(target.classList.contains('__active')) hide();
                else show();

                function show(){
                    btnsList.forEach(i => i.classList.add('__active'));
                    asideMenu.classList.add('__active');
                }
                function hide(){
                    btnsList.forEach(i => i.classList.remove('__active'));
                    asideMenu.classList.remove('__active');
                }
            }
        }
        setPaddingTop() {
            let headerHeight = this.el.offsetHeight;
            const startBlock = document.querySelector('.start-block');
            const startBlockWrapper = startBlock.querySelector('.start-block__wrapper');

            if (startBlockWrapper) startBlockWrapper.style.paddingTop = `${headerHeight}px`;
            else startBlock.style.paddingTop = `${headerHeight}px`;
        }
        onScroll() {
            setTimeout(() => {
                onScroll = onScroll.bind(this);
                let headerHeight = this.el.offsetHeight;
                onScroll();
                window.addEventListener('scroll', onScroll);

                function onScroll() {
                    if (window.pageYOffset > headerHeight) this.el.classList.add('__fixed');
                    else this.el.classList.remove('__fixed');
                }
            }, 0);
        }
        toggleSearchResults() {
            const search = this.el.querySelector('.search');
            const input = search.querySelector('input');
            input.addEventListener('focus', onFocus);
            input.addEventListener('blur', onBlur);

            function onFocus() {
                search.classList.add('__active');
            }
            function onBlur() {
                search.classList.remove('__active');
            }
        }
        toggleFooterItems() {
            const footerItems = document.querySelectorAll('.footer__item');
            footerItems.forEach(item => {
                item.addEventListener('click', function (event) {
                    if (event.target.classList.contains('item__header')) {
                        if (item.classList.contains('__active')) close(item);
                        else show(item);
                    }
                });
            });

            function closeAll() {
                footerItems.forEach(item => { close(item) });
            }
            function close(item) {
                item.classList.remove('__active');
            }
            function show(item) {
                closeAll();
                item.classList.add('__active');
            }
        }
    }
    const headerFooter = new HeaderFooter();

    class Select {
        constructor() {
            const list = document.querySelectorAll('.select');
            this.list = list;
            this.list.forEach(select => {
                this.setValues(select);
                this.setSelected(select);
                this.toggleSelect(select);
                this.setInputHandlers(select);
            });
        }
        setValues(select) {
            // поставить первую опцию выбранной, если не указано checked вручную
            const inputChecked = select.querySelector('input[type="radio"]:checked');
            if (!inputChecked) select.querySelector('input[type="radio"]').checked = true;
            // добавить в label'ы текст от input.value
            const inputs = select.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                const option = input.closest('.option');
                let text = document.createElement('span');
                text.innerHTML = input.value;
                option.append(text);
            });
        }
        toggleSelect(select) {
            select.addEventListener('click', () => select.classList.toggle('__active'));
        }
        setSelected(select) {
            let selected = select.querySelector('input[type="text"]');
            if (!selected) {
                selected = document.createElement('input');
                selected.type = 'text';
                selected.setAttribute('readonly', true);
                select.prepend(selected);
            }
            const inputChecked = select.querySelector('input[type="radio"]:checked');
            selected.value = inputChecked.value;
        }
        setInputHandlers(select) {
            onClick = onClick.bind(this);

            const inputs = select.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.addEventListener('change', onClick);
            });

            function onClick() {
                this.setSelected(select);
                select.classList.remove('__active');
            }
        }
    }
    const select = new Select();
}

// LOCALSTORAGE //
function getStorage(key) {
    let storage = localStorage.getItem(key);
    if (!storage) storage = '[]';
    storage = JSON.parse(storage);
    return storage;
}
function setStorage(key, obj) {
    let objStr = JSON.stringify(obj);
    localStorage.setItem(key, objStr);
}
function syncColorImage(slider, from, sliderInstance = null) {
    setTimeout(() => {
        const productBlock = slider.closest('[data-product-name]');
        const activeSlide = slider.querySelector('.swiper-slide-active');
        const activeInput = productBlock.querySelector('input[data-color-code]:checked');

        if(activeInput.dataset.colorCode !== activeSlide.dataset.colorCode){
            if(from === 'onSlider'){
                const colorCode = activeSlide.dataset.colorCode;
                const matchedInput = productBlock.querySelector(`input[data-color-code="${colorCode}"]`);
                matchedInput.checked = true;
                const event = new Event('change');
                activeInput.closest('form').dispatchEvent(event);
            }
            if(from === 'onForm'){
                const colorCode = activeInput.dataset.colorCode;
                const matchedSlide = productBlock.querySelector(`.swiper-slide[data-color-code="${colorCode}"]`);
                const slideIndex = parseInt(matchedSlide.dataset.swiperSlideIndex) + 1;
                sliderInstance.slideTo(slideIndex);
            }
        }
    }, 0);
}

function swiperSlidersInit() {
    // BIKE SLIDER //
    const bikeSlider = new Swiper('.bike-slider', {
        wrapperClass: 'bike-slider__wrapper',
        slideClass: 'bike-slider__slide',
        slidesPerView: 1,
        centeredSlides: true,
        loop: true,

        navigation: {
            prevEl: '.bike-slider__button-prev',
            nextEl: '.bike-slider__button-next'
        },
        pagination: {
            el: '.bike-slider__pagination',
            clickable: true,
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            },
            slideChangeTransitionEnd(slider) {
                syncColorImage(slider.el, 'onSlider');
            }
        }
    });


    // CATEGORIES SLIDER // 
    const categoriesSlider = new Swiper('.categories-slider', {
        wrapperClass: 'categories-slider__wrapper',
        slideClass: 'categories-slider__slide',
        centeredSlides: true,
        slidesPerView: 1,
        loop: true,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        breakpoints: {
            993: {
                slidesPerView: 2,
            },
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            }
        }
    });


    // NEWS SLIDER // 
    const newsSlider = new Swiper('.news-slider', {
        wrapperClass: 'news-slider__wrapper',
        slideClass: 'news-slider__slide',
        slidesPerView: 1,
        spaceBetween: 40,
        loop: true,
        navigation: {
            nextEl: '.news-slider-button__next',
            prevEl: '.news-slider-button__prev',
        },
        pagination: {
            el: '.streetster-slider__pagination',
            clickable: true
        },
        breakpoints: {
            341: {
                spaceBetween: 0,
            },
            890: {
                slidesPerView: 2,
            },
            1320: {
                slidesPerView: 3,
            },
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            }
        }
    });


    return { bikeSlider, categoriesSlider, newsSlider}
}
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
