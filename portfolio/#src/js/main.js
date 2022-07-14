// выставление информации в блоке #about-block //
function setAboutInfo() {
    const infoArray = {
        // информация получается в приложении app.js > WorksApp
        worksAmount: {
            span: document.querySelector('#about__works-amount'),
            infoText: ''
        },
        // информация получается в приложении app.js > FeaturesApp
        jsFeaturesAmount: {
            span: document.querySelector('#about__js-features'),
            infoText: ''
        }
    };
    renderInfo();

    function renderInfo() {
        for (let key in infoArray) {
            const obj = infoArray[key];
            obj.span.innerHTML = obj.infoText;
        }
    }
    function setInfo(key, infoText) {
        if (typeof (key) !== 'string') key = key.toString();
        infoArray[key].infoText = infoText.toString();
        renderInfo();
    }
    return { setInfo };
}
const aboutBlockInfo = setAboutInfo();

// включить/выключить возможность листать страницу //
function toggleScroll() {
    let body = document.querySelector('body');
    let elems = [];
    // добавить классы блоков, к которым будет применен padding-right при блокировке скролла
    getPaddingElems([
        'page-block',
        '__padding-elem'
    ]);

    if (body.classList.contains('__no-scroll')) {
        body.classList.remove('__no-scroll');
        elems.forEach(elem => {
            elem.style.removeProperty('padding-right');
        });
    } else {
        body.classList.add('__no-scroll');
        elems.forEach(elem => {
            elem.style.paddingRight = `${getScrollWidth()}px`;
        });
    }

    function getScrollWidth() {
        let block = document.createElement('div');
        block.style.width = '50px';
        block.style.height = '50px';
        block.style.overflow = 'scroll';
        body.append(block);

        let scrollWidth = block.offsetWidth - block.clientWidth;
        block.remove();
        return scrollWidth;
    }
    function getPaddingElems(list) {
        list.forEach(i => {
            document.querySelectorAll(`.${i}`).forEach(item => {
                elems.push(item);
            });
        });
    }
}

// сделать первую букву заглавной //
function capitalLetter(str) {
    if (!str) return;

    let letter = str.slice(0, 1).toUpperCase();
    str = str.slice(1, str.length);
    let newStr = `${letter}${str}`;

    return newStr;
}

// изменить картинки в зависимости от темы //
function changeThemeImages() {
    let images = document.querySelectorAll('[data-theme-image]');
    let body = document.querySelector('body');
    if (images.length > 0) {
        images.forEach(img => {
            let sourceImg = img.parentNode.querySelector('source');
            let imgData = img.dataset.themeImage.split('.');
            let path = imgData[0];
            let extension = imgData[1];

            // темная тема
            if (body.classList.contains('__dark-theme')) {
                img.src = `${path}--dark.${extension}`;
                if (sourceImg) sourceImg.srcset = img.src;
            }
            // светлая тема
            else {
                img.src = img.dataset.themeImage;
                if (sourceImg) sourceImg.srcset = img.src;
            }
        });
    }
}

// координаты элемента //
function getCoords(elem) {
    let crd = elem.getBoundingClientRect();

    return {
        top: crd.top + window.pageYOffset,
        left: crd.left + window.pageXOffset
    }
}

// SPOILER //
function initSpoilerElem(btn, elem, body) {
    // btn - кнопка, открывающая/закрывающая спойлер, elem - родительский элемент, body - тело, открывающееся
    // или закрыавющееся
    const shownClass = '__spoiler-shown';
    body.style.removeProperty('max-height');
    const bodyHeight = body.offsetHeight;

    hide();
    btn.removeEventListener('click', toggle);
    btn.addEventListener('click', toggle);

    function toggle() {
        elem.classList.contains(shownClass) ? hide() : show();
    }
    function hide() {
        elem.classList.remove(shownClass);
        body.style.cssText = `
            max-height: 0px;
            padding: 0px;
        `;
    }
    function show() {
        elem.classList.add(shownClass);
        body.style.cssText = `max-height: ${bodyHeight * 1.5}px;`;
        body.style.removeProperty('padding');
    }
}

// SELECT //
function initSelects(node = null) {
    let selects;
    !node ? selects = document.querySelectorAll('.select') : selects = node.querySelectorAll('.select');
    selects.forEach(select => initSelect(select));

    if (!node) {
        // обработчик на закрытие при нажатии кнопки в любую часть страницы, кроме блоков .select
        document.addEventListener('click', function (event) {
            if (!event.target.classList.contains('.select') && !event.target.closest('.select')) {
                closeAllSelects();
            }
        });
    }

    function initSelect(select) {
        setValue();
        setHandlers();

        function setValue() {
            let value = select.querySelector('.select__value');
            let checkedItem = select.querySelector('input:checked');
            if (!value) {
                value = document.createElement('div');
                value.className = 'select__value';
                select.append(value);
            }
            if (!checkedItem) {
                checkedItem = select.querySelector('input[type="radio"]');
                checkedItem.checked = true;
            }
            value.innerHTML = checkedItem.parentNode.querySelector('p').innerHTML;
            closeAllSelects();
        }
        function setHandlers() {
            const value = select.querySelector('.select__value');
            value.addEventListener('click', openItems);
            select.addEventListener('change', setValue);

            function openItems() {
                const selectContainer = value.closest('.select');
                if (!selectContainer.classList.contains('__active')) {
                    closeAllSelects();
                    selectContainer.classList.add('__active');
                }
                else closeAllSelects();
            }
        }
    }
    function closeAllSelects() {
        const openedList = document.querySelectorAll('.select.__active');
        openedList.forEach(opened => { opened.classList.remove('__active') });
    }
}
initSelects();

// FILTER //
function initFilters(node = null) {
    let filters;
    !node ? filters = document.querySelectorAll('.filter') : filters = node.querySelectorAll('.filter');
    filters.forEach(filter => initFilter(filter));
}
function initFilter(filter) {
    const title = filter.querySelector('.filter__title');
    const filterBody = filter.querySelector('.filter__body');
    initSpoilerElem(title, filter, filterBody);
}
initFilters();

// ДОСТУП К LOCALSTORAGE //
class Storage {
    constructor() { }

    getItem(key) {
        let item = JSON.parse(localStorage.getItem(key));
        return item;
    }
    setItem(key, value) {
        value = JSON.stringify(value);
        localStorage.setItem(key, value);
    }
}

// HEADER //
class Header {
    constructor(header) {
        this.header = header;

        this.fix();
        this.padding();
        this.initTogglingMenu();
        this.changeTheme();
        this.initNavButtons();
    }

    fix() {
        let header = this.header;
        onScroll();
        window.addEventListener('scroll', onScroll);

        function onScroll() {
            let headerHeight = header.offsetHeight;
            (window.pageYOffset > headerHeight) ? header.classList.add('__fixed') : header.classList.remove('__fixed');
        }
    }
    padding() {
        let header = this.header;
        let firstSection = document.querySelector('.page-block');
        let headerHeight = header.offsetHeight;
        let paddingValue = headerHeight + 40
        firstSection.style.paddingTop = `${paddingValue}px`;
    }
    initTogglingMenu() {
        let header = this.header;
        const toggleHandler = this.toggleMenu.bind(this);
        const burger = header.querySelector('.burger');
        burger.addEventListener('click', toggleHandler);
    }
    toggleMenu(action = null) {
        let header = this.header;
        let burger = header.querySelector('.burger');
        let menu = header.querySelector('.header__menu');

        if (!action || typeof (action === 'object')) burger.classList.contains('__active') ? close() : open();
        if (action === 'open') open();
        if (action === 'close') close();

        function open() {
            burger.classList.add('__active');
            menu.classList.add('__active');
        }
        function close() {
            burger.classList.remove('__active');
            menu.classList.remove('__active');
        }
    }
    changeTheme() {
        // проверка на наличие значения в localstorage
        let storage = new Storage();
        let storageKey = 'an_portfolio_theme';
        let isTheme = storage.getItem(storageKey);
        if (!isTheme) {
            isTheme = 'light';
            storage.setItem(storageKey, isTheme);
        }
        // выставить тему
        let controls = document.querySelectorAll('.theme-change');
        let body = document.querySelector('body');
        setTheme(isTheme);

        controls.forEach(ctrl => {
            ctrl.addEventListener('click', onClick);

            function onClick(event) {
                if (event.target.classList.contains('__icon-sun')) setTheme('light');
                if (event.target.classList.contains('__icon-moon')) setTheme('dark');
            }
        });

        function setTheme(type) {
            let lightButton = document.querySelectorAll('.theme-change__button.__icon-sun');
            let darkButton = document.querySelectorAll('.theme-change__button.__icon-moon');

            if (type == 'light') {
                lightButton.forEach(btn => {
                    btn.classList.add('__selected');
                });
                darkButton.forEach(btn => {
                    btn.classList.remove('__selected');
                });
                body.classList.remove('__dark-theme');
                storage.setItem(storageKey, 'light');
            }
            if (type == 'dark') {
                darkButton.forEach(btn => {
                    btn.classList.add('__selected');
                });
                lightButton.forEach(btn => {
                    btn.classList.remove('__selected');
                });
                body.classList.add('__dark-theme');
                storage.setItem(storageKey, 'dark');
            }

            changeThemeImages();
        }
    }
    // все навигационные кнопки на сайте, не только в шапке
    initNavButtons(node = document) {
        const clickableButtons = node.querySelectorAll('[href*="#"]');
        clickableButtons.forEach(btn => {
            btn.addEventListener('click', this.navBtnOnClick.bind(this));
        });

        if (node === document) {
            const navButtons = this.header.querySelectorAll('.header__link-button');
            let currentBlock;
            onScroll();
            window.addEventListener('scroll', onScroll);

            function onScroll() {
                navButtons.forEach(btn => {
                    const id = btn.getAttribute('href');
                    const block = document.querySelector(id);
                    if (currentBlock !== block) {
                        const blockPosY = getCoords(block).top;
                        if (window.pageYOffset >= blockPosY - 100 && window.pageYOffset < block.offsetHeight + (blockPosY - 100)) {
                            inActiveAll();
                            active(btn);
                            currentBlock = block;
                        }
                    }
                });
            }
            function inActiveAll() {
                navButtons.forEach(navButton => {
                    navButton.closest('.header__link').classList.remove('__selected');
                });
            }
            function active(btn) {
                btn.closest('.header__link').classList.add('__selected');
            }
        }
    }
    navBtnOnClick(event) {
        event.preventDefault();
        const btn = event.target;
        const id = btn.getAttribute('href');
        const block = document.querySelector(id);
        block.scrollIntoView({ behavior: 'smooth' });
        this.toggleMenu('close');
    }
}
let headerMethods = new Header(document.querySelector('.header'));

// POP-UPS //
class Popup {
    constructor(message) {
        this.message = message;
        this.body = document.querySelector('body');
        this.wrapper = document.querySelector('.wrapper');

        this.renderBackground();
    }

    createBlock(tagName, classNames) {
        let block = document.createElement(tagName);
        block.className = classNames;
        return block;
    }

    renderBackground() {
        toggleScroll();
        let popupBlocksOld = document.querySelectorAll('.popup');
        let popupBlockNew = this.createBlock('div', 'popup');
        // если на странице есть popup'ы
        if (popupBlocksOld.length > 0) {
            let thereIsColored = false;
            popupBlocksOld.forEach(block => {
                if (block.classList.contains('popup--colored')) thereIsColored = true;
            });
            if (!thereIsColored) popupBlocksOld[0].classList.add('popup--colored');

            this.wrapper.append(popupBlockNew);
            this.toUnite(popupBlockNew);
        }
        // если нет popup'ов на странице
        else {
            this.wrapper.append(popupBlockNew);
            setTimeout(() => {
                popupBlockNew.classList.add('popup--colored');
                this.toUnite(popupBlockNew);
            }, 0);
        }
    }

    renderBody() {
        let message = this.message;
        let popupBody = this.createBlock('div', 'popup__body');

        let messageTitle = this.createBlock('div', 'popup__title');
        message.title ? messageTitle.innerHTML = message.title : messageTitle.style.display = 'none';
        popupBody.append(messageTitle);

        if (message.content && message.content.length > 0) {
            message.content.forEach(item => {
                let contentBody = this.createBlock('div', 'popup__content');

                if (item.type == 'text') {
                    popupBody.classList.add('popup__body--tablet');
                    renderList = renderList.bind(this);
                    renderString = renderString.bind(this);
                    // отрисовать список или обычную строку в зависимости от того, что в item.body - массив или строка
                    Array.isArray(item.body) ? renderList() : renderString();

                    function renderList() {
                        contentBody.classList.add('popup__list');
                        for (let i = 0; i < item.body.length; i++) {
                            const bodyItem = item.body[i];
                            let listItem = this.createBlock('li', 'popup__item');
                            listItem.innerHTML = `${i + 1}. ${bodyItem}`;
                            contentBody.append(listItem);
                        }
                    }
                    function renderString() {
                        contentBody.classList.add('popup__paragraph');
                        contentBody.innerHTML = item.body || '';
                    }
                }
                if (item.type == 'htmlElement') {
                    popupBody.classList.add('popup__body--element');
                    contentBody.classList.add('popup__element');
                    contentBody.append(item.body);
                }

                if (item.body) popupBody.append(contentBody);
            });
        }

        return popupBody;
    }

    toUnite(popupBlock) {
        let popupBody = this.renderBody();
        popupBlock.append(popupBody);
        setTimeout(() => {
            popupBody.style.transform = 'translate(0, 0)';
        }, 150);

        onClick = onClick.bind(this);
        popupBlock.addEventListener('click', onClick);

        function onClick(event) {
            let condition =
                (event.target.classList.contains('popup') || event.target.classList.contains('popup__body--element'))
                && (event.target.tagName != 'VIDEO' && event.target.tagName != 'IMG');
            if (condition) {
                this.removePopup(popupBlock, popupBody);
                popupBlock.removeEventListener('click', onClick);
            }
        }
    }

    removePopup(popupBlock, popupBody) {
        let message = this.message;

        if (popupBlock.classList.contains('popup--colored')) {
            toggleScroll();
            popupBlock.classList.remove('popup--colored');
            remove();
        } else remove();

        function remove() {
            popupBody.style.transform = 'translate(100vw, 0)';
            popupBody.addEventListener('transitionend', function () {
                popupBlock.remove();

                // вернуть вставленные элементы на место
                message.content.forEach(el => {
                    if (el.type == 'htmlElement' && el.oldParent) {
                        el.oldParent.append(el.body);
                    }
                });
            });
        }
    }
}