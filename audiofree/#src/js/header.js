let headerData = {
    el: document.querySelector('.header'),
    isMobile: false,
    isDesktop: false,
    media: 899,
    scrollPos: window.pageYOffset,
    // ссылки в href
    hrefs: {
        cart: '../html-products/cart.html',
        favorites: '../html-products/favorites.html',
        indexpage: '../html-main/index.html',
        catalogue: '../html-main/catalogue.html',
        contacts: '../html-main/contacts.html',
        deliveryPayment: '../html-main/delivery-payment.html',
        guarantees: '../html-main/guarantees.html'
    },
    // указатели состояний элементов (закрыты/открыты; активны/неактивны и др.)
    elConditions: {
        // моб.
        headerMenuOpened: false,
        searchOpened: false,
        // пк
        headerCatalogueOpened: false,
    }
}

const Header = {
    data() {
        return headerData;
    },
    mounted() {
        this.checkMedia();
    },
    methods: {
        checkMedia() {
            let onScroll = this.scrollHeader.bind(this);
            handler = handler.bind(this);
            let mediaQuery = window.matchMedia(`(max-width: ${this.media}px)`);
            handler();
            mediaQuery.addEventListener('change', handler);

            function handler() {
                // сбросить все elConditions в false
                this.refresh();
                // указать, что isMobile; удалить обработчик на scroll
                if (mediaQuery.matches) {
                    this.isMobile = true;
                    this.isDesktop = false;
                    window.removeEventListener('scroll', onScroll);
                }
                // указать, что isDesktop; поставить обработчик на scroll
                else {
                    this.isMobile = false;
                    this.isDesktop = true;
                    window.addEventListener('scroll', onScroll);
                }
            }
        },
        setPaddingTop(){
            let wrapper = document.querySelector('.wrapper');
            setTimeout(() => {
                let hdrHeight = 0;
                let hdrType = this.el.querySelector('.header__desktop') || this.el.querySelector('.header__mobile');
                if(hdrType.classList.contains('header__desktop')){
                    let hdrTopHeight = hdrType.querySelector('.header-top').offsetHeight;
                    let hdrMainHeight = hdrType.querySelector('.header-main').offsetHeight;
                    let hdrBottomHeight = hdrType.querySelector('.header-bottom').offsetHeight;
                    hdrHeight = hdrTopHeight + hdrMainHeight + hdrBottomHeight;
                }
                if(hdrType.classList.contains('header__mobile')){
                    hdrHeight = hdrType.offsetHeight;
                }
                wrapper.style.paddingTop = `${hdrHeight}px`;
            }, 0);
        },
        scrollHeader(){
            shorten = shorten.bind(this);
            lengthen = lengthen.bind(this);
            let hdrTop = this.el.querySelector('.header-top');
            let hdrMain = this.el.querySelector('.header-main');
            let hdrBottom = this.el.querySelector('.header-bottom');

            if(this.scrollPos < window.pageYOffset) shorten();
            if(this.scrollPos > window.pageYOffset) lengthen();

            this.scrollPos = window.pageYOffset;

            function shorten(){
                this.el.style.top = `-${hdrTop.offsetHeight}px`;
                hdrBottom.style.top = `-${hdrBottom.offsetHeight}px`;
            }
            function lengthen(){
                this.el.style.top = '0px';
                hdrBottom.style.top = '0px';
            }
        },
        // обычно запускается при изменении media
        refresh() {
            this.setPaddingTop();
            this.el.style.top = '0px';
            
            let conds = this.elConditions;
            for (let key in conds) {
                conds[key] = false;
            }

            document.querySelector('body').classList.remove('__no-scroll');
            setTimeout(() => {
                showItemsAmount();
            }, 0);
        },
        // методы для моб.версии шапки
        toggleMenu() {
            let isOpened = this.elConditions.headerMenuOpened;
            let body = document.querySelector('body');
            if (isOpened) {
                this.elConditions.headerMenuOpened = false;
                body.classList.remove('__no-scroll');
            } else {
                this.elConditions.headerMenuOpened = true;
                body.classList.add('__no-scroll');
            }
        },
        toggleSearch() {
            this.elConditions.searchOpened = !this.elConditions.searchOpened;
        },
        // методы для пк версии шапки
        toggleHeaderCatalogue() {
            this.elConditions.headerCatalogueOpened = !this.elConditions.headerCatalogueOpened;
        }
    }
}

Vue.createApp(Header).mount('#header');