function checkWebpSupport() {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = function () {
            resolve(document.querySelector('body').classList.add('webp'));
        }
        img.onerror = function () {
            reject(document.querySelector('body').classList.remove('webp'));
        }
        img.src = '../img/check-webp/check.webp';
    })
}

checkWebpSupport();
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
class SpoilerBlock {
    constructor() {
        this.spoilerBlocks = Array.from(document.querySelectorAll('[data-spoiler]:not([data-inside-app])'));

        // инициализация только если есть спойлер-блоки
        if (this.spoilerBlocks.length > 0) {
            let jsons = this.sortSrcs();
            jsons.forEach(src => this.initLoading(src));
        }
    }

    // инициализация отдельно от this.spoilerBlocks (если внутри Vue). вызывается как метод экземпляра класса, parentNode - родительский блок Vue или внутри Vue, в котором находятся spoilerBlock'и
    initSpoilerBlock(parentNode) {
        const spoilerBlocks = Array.from(parentNode.querySelectorAll('[data-spoiler]'));
        spoilerBlocks.forEach(spBlock => {
            const src = spBlock.dataset.spoiler.split(', ')[1];
            this.initLoading(src, spBlock);
        });
    }
    // инициализировать загрузку json-источника и последующую обработку его содержимого
    initLoading(src, spBlock = null) {
        if (src) {
            fetch(src)
                .then(resolve => resolve.json())
                .then(data => { this.loadContent(data, src, spBlock); });
        }
    }

    // [ЭТАПЫ ИНИЦИАЛИЗАЦИИ: сортировка блоков по json-источникам]
    sortSrcs() {
        let jsonCollection = new Set();
        this.spoilerBlocks.forEach(spoilerBlock => {
            let spblData = spoilerBlock.dataset.spoiler.split(', ');
            jsonCollection.add(spblData[1]);
        });
        return Array.from(jsonCollection);
    }
    // [ЭТАПЫ ИНИЦИАЛИЗАЦИИ: загрузка контента]
    loadContent(data, src, spBlock = null) {
        if(spBlock){
            this.renderSpoilerBlock(spBlock, data);
        }
        if (!spBlock) {
            this.spoilerBlocks.forEach(spoilerBlock => {
                let jsonSrc = spoilerBlock.dataset.spoiler.split(', ')[1];
                if (jsonSrc === src) {
                    this.renderSpoilerBlock(spoilerBlock, data);
                }
            });
        }
    }
    // [ЭТАП ОТРИСОВКИ]
    renderSpoilerBlock(spoilerBlock, data) {
        let media = spoilerBlock.dataset.spoiler.split(', ')[0];
        let mediaQuery = window.matchMedia(`(max-width: ${media}px)`);

        let toggler = new Toggler(spoilerBlock, spoilerBlock.querySelector('.toggler'));
        toggler.render(data)
            .then(() => {
                toggler.setFirstActive();
                toggler.setHandlers();
                toggler.setReplace(mediaQuery);
            });

        let spoiler = new Spoiler(spoilerBlock, spoilerBlock.querySelector('.spoiler'));
        spoiler.render(data)
            .then(() => {
                spoiler.setHandlers();
                spoiler.setReplace(mediaQuery);
            });
    }
}

class Toggler {
    constructor(spoilerBlock, toggler) {
        this.spoilerBlock = spoilerBlock;
        this.el = toggler;
        this.content = [];
        this.getTemplates();
    }
    render(data) {
        return new Promise((resolve, reject) => {
            let titlesBlock = this.el.querySelector('.toggler__titles');
            data.forEach(currentData => {
                // title
                let title = this.templates.title.cloneNode(true);
                title.querySelector('.toggler__title--text').innerHTML = currentData.title;
                titlesBlock.append(title);
                // content
                let contentBlock = document.createElement('div');
                contentBlock.classList.add('toggler__content');
                // content: subtitle & paragraphs
                if ((currentData.content.paragraphs && this.templates.contentParagraph) || currentData.content.subtitle) {
                    contentBlock = this.templates.contentParagraph.cloneNode(true);
                    contentBlock.removeAttribute('data-spbl-render');
                    let subtitle = contentBlock.querySelector('.toggler__content--subtitle');
                    let paragraph = contentBlock.querySelector('.toggler__content--paragraph');
                    paragraph.remove();
                    // subtitle
                    if (currentData.content.subtitle) subtitle.innerHTML = currentData.content.subtitle;
                    else subtitle.remove();
                    // paragraphs
                    currentData.content.paragraphs.forEach(par => {
                        let newPar = paragraph.cloneNode();
                        newPar.innerHTML = par;
                        contentBlock.append(newPar);
                    });
                }
                // content: specs
                if (currentData.content.specs) {
                    contentBlock.classList.add('specs');
                    currentData.content.specs.forEach(spec => {
                        let specsItem = renderSpecsItem(spec.name, spec.text);
                        contentBlock.innerHTML += specsItem;
                    });
                }
                let obj = {};
                obj.title = title;
                obj.content = contentBlock;
                this.content.push(obj);
            });
            resolve();
        });
    }
    getTemplates() {
        let templates = {};
        templates.title = this.el.querySelector('.toggler__title');
        let contentTemplates = this.el.querySelectorAll('.toggler__content');
        contentTemplates.forEach(item => {
            if (item.dataset.spblRender === 'paragraphs' || !item.dataset.spblRender) {
                templates.contentParagraph = item;
            }
        });
        this.templates = templates;
        for (let key in templates) {
            templates[key].remove();
        }
    }
    setHandlers() {
        for (let key in this.content) {
            let obj = this.content[key];
            onClick = onClick.bind(this);
            obj.title.addEventListener('click', onClick);

            function onClick() {
                this.hideAllContents();
                this.showContent(obj.title, obj.content);
            }
        }
    }
    showContent(title, content) {
        title.classList.add('__active');
        this.el.append(content);
    }
    hideAllContents() {
        for (let key in this.content) {
            let obj = this.content[key];
            obj.title.classList.remove('__active');
            obj.content.remove();
        }
    }
    setFirstActive() {
        let obj = this.content[0];
        this.showContent(obj.title, obj.content);
    }
    setReplace(mediaQuery) {
        let handler = this.replaceSpoiler.bind(this);
        handler(mediaQuery);
        mediaQuery.addEventListener('change', handler);
    }
    replaceSpoiler(mediaQuery) {
        // вкл. toggler
        if (!mediaQuery.matches) {
            this.spoilerBlock.innerHTML = '';
            this.spoilerBlock.append(this.el);
        }
    }
}
class Spoiler {
    constructor(spoilerBlock, spoiler) {
        this.spoilerBlock = spoilerBlock;
        this.el = spoiler;
        this.content = [];
        this.getTemplates();
    }
    render(data) {
        return new Promise((resolve, reject) => {
            data.forEach(currentData => {
                let spoilerItem = this.templates.spoilerItem.cloneNode(false);
                // title
                let title = this.templates.title.cloneNode();
                title.innerHTML = currentData.title;
                spoilerItem.append(title);
                // content: paragraphs
                if (currentData.content.paragraphs) {
                    let content = this.templates.content.cloneNode(true);
                    let parTemplate = content.querySelector('p') || content.querySelector('.spoiler__content--paragraph');
                    parTemplate.remove();
                    currentData.content.paragraphs.forEach(par => {
                        let parInstance = parTemplate.cloneNode();
                        parInstance.innerHTML = par;
                        content.append(parInstance);
                    });
                    spoilerItem.append(content);
                }
                // content: specs
                if (currentData.content.specs) {
                    let content = this.templates.content.cloneNode(false);
                    content.classList.add('specs');
                    currentData.content.specs.forEach(spec => {
                        let specsItem = renderSpecsItem(spec.name, spec.text);
                        content.innerHTML += specsItem;
                    });
                    spoilerItem.append(content);
                }
                this.el.append(spoilerItem);

                let obj = {};
                obj.title = title;
                obj.content = {
                    block: spoilerItem.querySelector('.spoiler__content'),
                    height: spoilerItem.querySelector('.spoiler__content').offsetHeight
                };
                this.content.push(obj);
            });
            resolve();
        });
    }
    getTemplates() {
        let templates = {};
        templates.spoilerItem = this.el.querySelector('.spoiler__item');
        templates.title = this.el.querySelector('.spoiler__title');
        templates.content = this.el.querySelector('.spoiler__content');
        templates.content.removeAttribute('data-spbl-render');

        this.templates = templates;
        for (let key in templates) { this.templates[key].remove(); }
    }
    setHandlers() {
        let isAccordeon = false;
        if (this.el.hasAttribute('data-is-accordeon') || this.el.closest('[data-is-accordeon]')) isAccordeon = true;

        this.content.forEach(obj => {
            onClick = onClick.bind(this);
            let title = obj.title;
            let content = obj.content;
            title.addEventListener('click', onClick);

            function onClick() {
                let isOpened = title.classList.contains('__active');
                if (isAccordeon) {
                    if (isOpened) this.closeAllSpoilers();
                    else {
                        this.closeAllSpoilers();
                        this.toggleSpoiler(title, content).show();
                    }
                }
                else {
                    if (isOpened) this.toggleSpoiler(title, content).hide();
                    else this.toggleSpoiler(title, content).show();
                }
            }
        });

        this.closeAllSpoilers();
    }
    toggleSpoiler(title, content) {
        let block = content.block;
        let height = content.height;

        function show() {
            title.classList.add('__active');
            block.style.maxHeight = `${content.height * 1.5}px`;
            block.style.removeProperty('padding');
            block.style.removeProperty('margin');
        }
        function hide() {
            title.classList.remove('__active');
            block.style.cssText = `
                max-height: 0px;
                padding: 0;
                margin: 0 0 5px 0;
            `
        }
        return { show, hide }
    }
    closeAllSpoilers() {
        this.content.forEach(obj => {
            this.toggleSpoiler(obj.title, obj.content).hide();
        });
    }
    setReplace(mediaQuery) {
        let handler = this.replaceToggler.bind(this);
        handler(mediaQuery);
        mediaQuery.addEventListener('change', handler);
    }
    replaceToggler(mediaQuery) {
        // вкл. spoiler
        if (mediaQuery.matches) {
            this.spoilerBlock.innerHTML = '';
            this.spoilerBlock.append(this.el);
        }
    }
}

function renderSpecsItem(name, text) {
    let specsItem = `
        <div class="specs__item">
            <div class="specs__name">${name}</div>
            <div class="specs__content">${text}</div>
        </div>
    `;
    return specsItem;
}

let spoilerBlockInst = new SpoilerBlock();
// data-dynamic-adaptive="mediaType, mediaValue, new_parent, new_parent_is_unique" - ЗАПИСЬ ДЛЯ ПЕРЕМЕЩЕНИЯ
// data-insert-type="prepend/append" - ЗАПИСЬ ДЛЯ ТИПА ПЕРЕМЕЩЕНИЯ В НОВЫЙ БЛОК, если нет - то append

function dynamicAdaptive() {
    let objects = document.querySelectorAll('[data-dynamic-adaptive]');
    let objList = [];
    let mediaList = [];

    objects.forEach(obj => {
        let values = obj.dataset.dynamicAdaptive.split(', ');
        let mdType = values[0];
        if (!mdType) mdType = 'max';
        let mdValue = values[1];

        let media = `(${mdType}-width: ${mdValue}px)`;
        mediaList.push(media);

        let insertType = obj.dataset.insertType;
        if(!insertType) insertType = ['append', 'append'];
        else{
            insertType = insertType.split(', ');
            if(insertType.length == 1) insertType.push('append');
        }

        let objInfo = {};
        objInfo.obj = obj;
        objInfo.insertType = insertType;
        objInfo.media = media;
        objInfo.oldParent = obj.parentNode;
        objInfo.newParentClass = values[2];
        objInfo.isUnique = values[3];
        if(!values[3]) objInfo.isUnique = false;

        objList.push(objInfo);
    });

    mediaList = mediaList.filter((item, index, self) => {
        return self.indexOf(item) === index;
    });

    mediaList.forEach(mediaQueryText => {
        let mediaQuery = window.matchMedia(mediaQueryText);
        let objListMedia = objList.filter((item) => {
            return item.media == mediaQueryText;
        });

        doAdaptive(mediaQuery, objListMedia);
        mediaQuery.addEventListener('change', function (){
            doAdaptive(mediaQuery, objListMedia);
        }); 
    });

    function doAdaptive(mediaQuery, objListMedia) {

        objListMedia.forEach(obj => {
            if (mediaQuery.matches) {
                let newParent;
                if (obj.isUnique) newParent = document.querySelector(`.${obj.newParentClass}`);
                else {
                    newParent = obj.oldParent.querySelector(`.${obj.newParentClass}`);
                    let _newParent_ = obj.oldParent.parentNode;
                    while (!newParent) {
                        _newParent_ = _newParent_.parentNode;
                        newParent = _newParent_.querySelector(`.${obj.newParentClass}`);
                    }
                }
                switchAction(newParent, obj, obj.insertType[0]);
            }
            else {
                switchAction(obj.oldParent, obj, obj.insertType[1]);
            }
        })
    }
    function switchAction(parentType, obj, insertType) {
        switch (insertType) {
            case 'append':
                parentType.append(obj.obj);
                break;
            case 'prepend':
                parentType.prepend(obj.obj);
                break;
            default:
                parentType.append(obj.obj);
        }
    }
}

dynamicAdaptive();
// открытие различных блоков по нажатию кнопки
function openBlock(btn, block, btnAnim = false) {
    btn.addEventListener('click', function () {
        block.classList.toggle('__active');
        // анимация кнопки
        if (btnAnim) { btn.classList.toggle('__active'); }
    });
}
// управление devices-list (переключение карточек)
function devicesListToggle() {
    let devicesToggles = document.querySelectorAll('.devices-toggle');
    if (devicesToggles.length > 0) {
        devicesToggles.forEach(toggle => {
            let list = toggle.querySelectorAll('.devices-toggle__title');
            let products = toggle.querySelectorAll('.devices-toggle__product');

            list.forEach(el => {
                el.addEventListener('click', function () {
                    showProducts(el);
                });
            });

            let activeTitle = toggle.querySelector('.devices-toggle__title.__active');
            if (!activeTitle) showProducts(list[0]);

            function showProducts(el) {
                let elRelated = toggle.querySelector(`.devices-toggle__product[data-devices-toggle="${el.dataset.devicesToggle}"]`);
                removeActiveClasses();
                el.classList.add('__active');
                elRelated.classList.add('__shown');
            }
            function removeActiveClasses() {
                list.forEach(i => {
                    i.classList.remove('__active');
                });
                products.forEach(i => {
                    i.classList.remove('__shown');
                });
            }
        });
    }
}

// управление (controls)
function initControls() {
    let controls = document.querySelectorAll('.controls');
    if (controls.length > 0) {
        controls.forEach(control => {
            // "Количество:"
            let controlsAmounts = control.querySelectorAll('.controls__amount');
            controlsAmounts.forEach(ctrlAmount => {
                let number = ctrlAmount.querySelector('.controls__amount--number').querySelector('input');
                number.addEventListener('input', function () {
                    let value = number.value;
                    number.value = value.replace(/\D/g, '');
                });

                ctrlAmount.addEventListener('click', function (event) {
                    if (event.target.classList.contains('controls__amount-button') && !number.value) number.value = 1;

                    if (event.target.classList.contains('controls__amount--less')) {
                        if (number.value > 0) number.value--;
                        if (number.value <= 0) number.value = 1;
                    }
                    if (event.target.classList.contains('controls__amount--more')) {
                        if (number.value.length <= number.maxLength) number.value++;
                        if (number.value.length > number.maxLength) number.value = 1;
                    }
                    number.dispatchEvent(new Event('change'));
                });
            });
        });
    }
}

// добавление пустых строк в таблицы, определение высоты ячеек по наибольшей
function editTables() {
    let tables = document.querySelectorAll('.table');
    if (tables.length > 0) {
        tables.forEach(table => {
            // вычисление строки с наибольшим количеством ячеек, вычисление наибольшей высоты ячейки
            let cellsAmount = 0;
            let cellsHeight = 0;
            let tableColumns = table.querySelectorAll('.table__column');
            tableColumns.forEach(col => {
                let cells = col.querySelectorAll('.table__cell');
                if (cells.length > cellsAmount) cellsAmount = cells.length;
                cells.forEach(cell => {
                    if (cell.offsetHeight > cellsHeight) cellsHeight = cell.offsetHeight;
                });
            });

            // добавление недостающих ячеек
            tableColumns.forEach(col => {
                let cells = col.querySelectorAll('.table__cell');
                let cellsLength = cells.length;
                while (cellsLength < cellsAmount) {
                    let newCell = document.createElement('div');
                    newCell.className = 'table__cell';
                    col.append(newCell);
                    cellsLength++;
                }
            });

            // удаление пустых ячеек на мобильной версии
            let mediaValue = table.dataset.clearEmptyCells;
            if (!mediaValue) mediaValue = 499;
            let mediaQuery = window.matchMedia(`(max-width: ${mediaValue}px)`);

            clearEmptyCells(mediaQuery);
            mediaQuery.addEventListener('change', function () {
                clearEmptyCells(mediaQuery);
            });

            function clearEmptyCells(mediaQuery) {
                let cells = table.querySelectorAll('.table__cell');
                if (mediaQuery.matches) {
                    cells.forEach(cell => {
                        if (!cell.innerHTML) cell.style.display = 'none';
                    });
                }
                if (!mediaQuery.matches) {
                    cells.forEach(cell => {
                        cell.style.removeProperty('display');
                    });
                }
            }

            // выставление высоты ячейкам
            setHeight();
            window.addEventListener('resize', setHeight);

            function setHeight() {
                let cells = table.querySelectorAll('.table__cell');
                cells.forEach(cell => {
                    if (mediaQuery.matches) cell.style.flexBasis = 'auto';
                    else cell.style.flexBasis = `${cellsHeight}px`;
                });
            }
        });
    }
}

// localstorage
function getStorage(key) {
    let item = localStorage.getItem(key);
    return JSON.parse(item);
}
function setStorage(keyName, obj) {
    obj = JSON.stringify(obj);
    localStorage.setItem(keyName, obj);
}

// подсчет количества товаров в группе (корзина, "избранное") и вывод в иконку
function showItemsAmount(storageName = null, circleClassName = null) {
    // при загрузке страницы
    if (!storageName || !circleClassName) {
        let list = [
            ['audiofree_cart', 'icon-circle--cart-icon'],
            ['audiofree_favorites', 'icon-circle--favorites-icon']
        ];

        list.forEach(el => {
            storageName = el[0];
            circleClassName = el[1];
            setAmount(storageName, circleClassName);
        });
    }
    // изменить значения при добавлении/удалении элемента
    if (storageName && circleClassName) {   
        setAmount(storageName, circleClassName);
    }

    function setAmount(storageName, circleClassName) {
        let storage = getStorage(storageName);
        if (storage) {
            let itemsAmount = storage.length;
            let iconCircles = document.querySelectorAll(`.${circleClassName}`);
            // создать кружок с цифрой
            if (itemsAmount > 0) {
                let numberBlock = document.createElement('div');
                numberBlock.className = 'icon-circle__number';
                numberBlock.innerHTML = itemsAmount;

                iconCircles.forEach(circle => {
                    let oldNumberBlock = circle.querySelector('.icon-circle__number');
                    if (oldNumberBlock) oldNumberBlock.remove();
                    circle.append(numberBlock);
                });
            }
            // убрать кружок с цифрой
            else {
                iconCircles.forEach(circle => {
                    let numberBlock = circle.querySelector('.icon-circle__number');
                    if (numberBlock) numberBlock.remove();
                });
            }
        }
    }
}

// вызовы функций
initControls();
editTables();
showItemsAmount();
function initSelections() {
    let selects = document.querySelectorAll('.select');
    selects.forEach(select => {
        setSelectedBlock(select);
        openOptions(select);
        chooseOption(select);
    });


    function setSelectedBlock(select){
        let block = select.querySelector('.select__selected');
        if(!block){
            block = document.createElement('div');
            block.className = 'select__selected';
            select.prepend(block);
        }
    }
    function openOptions(select) {
        select.addEventListener('click', function (e) {
            e.preventDefault();
            select.classList.toggle('__active');
            if(e.target.classList.contains('select__option')) chooseOption(select, e.target);
        });
    }
    function chooseOption(select, option = null) {
        let selectedOption = select.querySelector('.select__option--selected');
        if(!selectedOption){
            selectedOption = select.querySelector('.select__option');
            selectedOption.classList.add('select__option--selected');
        }
        if(option){
            selectedOption.classList.remove('select__option--selected');
            option.classList.add('select__option--selected');
        }

        selectedOption = select.querySelector('.select__option--selected');
        selectedText = selectedOption.innerText || selectedOption.textContent;
        let selectedBlock = select.querySelector('.select__selected');
        selectedBlock.innerHTML = selectedText;
    }
}

initSelections();
function productFilter() {
    // инициализация ползунка с ценой
    function initRanges() {
        let ranges = document.querySelectorAll('.price-range');
        ranges.forEach(range => {
            initRange(range);
        });

        function initRange(range) {
            // вся дорожка
            let rangeScale = range.querySelector('.price-range__scale');
            // получение значения максимальной цены
            let maxPrice = range.querySelector('[data-max-price-value]');
            let maxPriceValue;
            !maxPrice ? maxPriceValue = '9999' : maxPriceValue = maxPrice.dataset.maxPriceValue;
            // обработчик input'ов
            let inputs = range.querySelectorAll('.price-range__input');
            inputs.forEach(input => {
                // выставление maxlength значения на основе data-max-value
                input.maxLength = maxPriceValue.length;

                input.addEventListener('input', function (event) {
                    // разрешить ввод только цифр
                    let value = input.value;
                    input.value = input.value.replace(/\D/g, '');
                });
                input.addEventListener('change', function () {
                    // запретить ввод невалидных значений (min > max или наоборот), получение подходящего ползунка
                    let otherInput;
                    let control;
                    if (input.classList.contains('price-range__input--min')) {
                        otherInput = range.querySelector('.price-range__input--max');
                        if (input.value && !otherInput.value) otherInput.value = parseInt(maxPriceValue);
                        if (input.value && parseInt(input.value) > parseInt(otherInput.value)) input.value = otherInput.value;

                        control = range.querySelector('.price-range__toggle--min');
                    }
                    if (input.classList.contains('price-range__input--max')) {
                        otherInput = range.querySelector('.price-range__input--min');
                        if (input.value && !otherInput.value) otherInput.value = 0;
                        if (input.value && parseInt(input.value) < parseInt(otherInput.value)) input.value = otherInput.value;

                        control = range.querySelector('.price-range__toggle--max');
                    }
                    // запретить ввод числа больше, чем указано в data-max-price-value
                    if (input.value && input.value > parseInt(maxPriceValue)) input.value = parseInt(maxPriceValue);
                    // запретить ввод чисел, начинающихся на "0"
                    if (input.value) input.value = parseInt(input.value);

                    // изменять положение ползунков в зависимости от указанных цифр
                    let step = Math.round(parseInt(maxPriceValue) / (rangeScale.clientWidth - control.offsetWidth));
                    let newCoord = parseInt(input.value) / step;
                    control.style.left = `${newCoord}px`;
                    setBar(range);
                });
            });

            // настройка ползунков
            let controls = range.querySelectorAll('.price-range__toggle');
            controls.forEach(control => {
                let rangeSizeX = rangeScale.clientWidth - control.offsetWidth;
                // выставление позиции ползунков
                let isMinControl = control.classList.contains('price-range__toggle--min');
                let isMaxControl = control.classList.contains('price-range__toggle--max');
                if (isMinControl) control.style.left = 0;
                if (isMaxControl) control.style.left = `${rangeSizeX}px`;

                control.ondragstart = function () {
                    return false;
                }
            });
            // обработчик на дорожку и ползунки
            range.addEventListener('pointerdown', function (event) {
                // ползунки
                let minControl = range.querySelector('.price-range__toggle--min');
                let maxControl = range.querySelector('.price-range__toggle--max');
                // длина дорожки
                let rangeSizeX = rangeScale.clientWidth - minControl.offsetWidth;
                // обработчик дорожки
                if (event.target.classList.contains('price-range__scale') || event.target.classList.contains('price-range__bar')) {
                    event.preventDefault();
                    let coordX = event.clientX - range.getBoundingClientRect().left;

                    let minCoord = parseInt(minControl.style.left);
                    let maxCoord = parseInt(maxControl.style.left);
                    let middleCoord = (minCoord + maxCoord) / 2;

                    let shiftX = minControl.offsetWidth / 2;

                    if (coordX < middleCoord) {
                        moveAt(minControl, maxControl);
                        changeValues(minControl);
                    } 
                    if (coordX >= middleCoord) {
                        moveAt(maxControl, minControl); 
                        changeValues(maxControl);
                    }

                    setBar(range);

                    function moveAt(control) {
                        let newCoord = coordX - shiftX;
                        if (newCoord < 0) newCoord = 0;
                        if (newCoord > rangeSizeX) newCoord = `${rangeSizeX}px`;
                        control.style.left = `${newCoord}px`;
                    }
                }
                // обработчик ползунков
                if (event.target.classList.contains('price-range__toggle')) controlsInit(event.target, event.clientX);

                function controlsInit(control, clientX) {
                    let shiftX = clientX - control.getBoundingClientRect().left;
                    let otherControl;
                    if (control.classList.contains('price-range__toggle--min')) {
                        otherControl = range.querySelector('.price-range__toggle--max');
                    }
                    if (control.classList.contains('price-range__toggle--max')) {
                        otherControl = range.querySelector('.price-range__toggle--min');
                    }

                    document.addEventListener('pointermove', onMove);
                    document.addEventListener('pointerup', onUp);

                    function onMove(event) {
                        event.preventDefault();
                        moveAt(event.clientX, control, otherControl);
                        setBar(range);
                        changeValues(control);
                    }
                    function onUp() {
                        document.removeEventListener('pointermove', onMove);
                        document.removeEventListener('pointerup', onUp);
                    }
                    // сдвиг ползунка
                    function moveAt(clientX, control, otherControl) {
                        let newCoord = clientX - shiftX - range.getBoundingClientRect().left;
                        if (newCoord < 0) newCoord = 0;
                        if (newCoord > rangeSizeX) newCoord = `${rangeSizeX}px`;

                        let otherControlPosition = parseInt(otherControl.style.left);
                        let controlCollides = (control.classList.contains('price-range__toggle--min') && newCoord > otherControlPosition)
                            || (control.classList.contains('price-range__toggle--max') && newCoord < otherControlPosition);
                        if (controlCollides) newCoord = `${otherControlPosition}px`;

                        control.style.left = `${newCoord}px`;
                    }
                }
            });

            // поставить maxControl и minControl по краям ползунка, выставить линию ползунка и значения
            toUnite();
            window.addEventListener('resize', toUnite);

            // размер цветной полоски между ползунками
            function setBar(range) {
                let minControl = range.querySelector('.price-range__toggle--min');
                let maxControl = range.querySelector('.price-range__toggle--max');

                let bar = range.querySelector('.price-range__bar');
                let minControlPosition = parseInt(minControl.style.left);
                let maxControlPosition = parseInt(maxControl.style.left);

                bar.style.width = `${maxControlPosition - minControlPosition}px`;
                bar.style.left = `${minControlPosition}px`;
            }
            // изменение значения цены
            function changeValues(control) {
                let step = Math.round(parseInt(maxPriceValue) / (rangeScale.clientWidth - control.offsetWidth));
                let input;
                if(control.classList.contains('price-range__toggle--min')) input = range.querySelector('.price-range__input--min');
                if(control.classList.contains('price-range__toggle--max')) input = range.querySelector('.price-range__input--max');
                
                input.value = step * parseInt(control.style.left);
            }
            function toUnite(){
                setBar(range);
                changeValues(controls[0]);
                changeValues(controls[1]);
                controls.forEach(control => {
                    let rangeSizeX = rangeScale.clientWidth - control.offsetWidth;
                    if(control.classList.contains('price-range__toggle--min')) control.style.left = '0px';
                    if(control.classList.contains('price-range__toggle--max')) control.style.left = `${rangeSizeX}px`;
                });
            }
        }
    }
    // инициализация кнопки очистки фильтра
    function initClearButton(){
        let clearButtons = document.querySelectorAll('.filter__clear-button');
        clearButtons.forEach(button => {
            button.addEventListener('click', function (){
                let filter = button.closest('.filter');
                // убрать input:checked
                let inputChecks = filter.querySelectorAll('input[type="checkbox"]');
                inputChecks.forEach(input => {
                    input.checked = false;
                });
                // обнулить ползунки
                let ranges = filter.querySelectorAll('.price-range');
                ranges.forEach(range => {
                    let inputs = range.querySelectorAll('.price-range__input');
                    inputs.forEach(input => {
                        input.value = '';
                    });

                    let rangeScale = range.querySelector('.price-range__scale');
                    let minControl = range.querySelector('.price-range__toggle--min');
                    minControl.style.left = 0;
                    let maxControl = range.querySelector('.price-range__toggle--max');
                    maxControl.style.left = `${rangeScale.clientWidth - maxControl.offsetWidth}px`;

                    let rangeBar = range.querySelector('.price-range__bar');
                    rangeBar.style.width = `${rangeScale.clientWidth}px`;
                    rangeBar.style.left = 0;
                });
            });
        });
    }

    initRanges();
    initClearButton();
}

productFilter();
let popupMethods = {
    // создать уведомление
    // если time <= 0, то таймер не применяется и закрыть уведомление может только сам пользователь
    createPopup: function (message, time = 5750) {
        let popupBlock = document.createElement('div');
        popupBlock.className = 'popup card';
        if(time <= 0) popupBlock.classList.add('popup--hold');
        popupBlock.innerHTML =
            `
        <div class="card__bottom card__side popup__bottom"></div>
        <div class="card__container card__side popup__container">
            <div class="popup__cancel">
                <div class="popup__cancel--button"></div>
            </div>
            ${message}
        </div>
        `;
        let wrapper = document.querySelector('.wrapper');
        let cancelButton = popupBlock.querySelector('.popup__cancel');

        if(time > 0){
            let otherPopups = wrapper.querySelectorAll('.popup');
            otherPopups.forEach(elem => {
                popupMethods.removePopup(elem);
            });   

            setTimeout(() => {
                popupMethods.removePopup(popupBlock);
            }, time);

            cancelButton.addEventListener('click', function(){
                popupMethods.removePopup(popupBlock);
            });
        }
        if(time <= 0){
            cancelButton.addEventListener('click', function (){
                popupMethods.removePopupNoTimer(popupBlock);
            })
        }
        
        wrapper.append(popupBlock);
        setTimeout(() => {
            popupBlock.style.transform = 'translate(0, -20%)';
        }, 100);
    },
    // удалить уведомление с таймером
    removePopup: function (elem) {
        if (elem) {
            if (elem.classList.contains('popup') && !elem.classList.contains('popup--hold')) {
                elem.style.transform = 'translate(150%, -20%)';
                elem.addEventListener('transitionend', function () {
                    elem.remove();
                });
            }
        }
    },
    // удалить уведомление без таймера
    removePopupNoTimer: function (elem){
        elem.style.transform = 'translate(-150%, -20%)';
        elem.addEventListener('transitionend', function () {
            elem.remove();
        });
    },
    // создать надпись в уведомлении
    createNote: function (message) {
        let newString = 
        `
            <p class="popup__note">
                ${message}
            </p>
        `;
        return newString;
    }
};

function swiperSlidersInit() {
  // fullscreen slider
  const pageSlider = new Swiper('.pagination-slider', {
    slideClass: 'pagination-slide',
    wrapperClass: 'pagination-slider__wrapper',

    loop: true,
    draggable: true,
    effect: 'flip',
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });


  // mobile slider
  function mobileSlider() {
    const mobileSlider = new Swiper('.mobile-slider', {
      wrapperClass: 'mobile-slider__wrapper',
      slideClass: 'mobile-slider__slide',
      slidesPerView: 1,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      on: {
        observerUpdate(sld) {
          sld.update();
        },
      },

      breakpoints: {
        500: {
          slidesPerView: 2
        },
      },
    });

    let sliderList = document.querySelectorAll('[data-mobile-slider]');
    sliderList.forEach(slider => {
      slider.swiper.disable();
      let values = slider.dataset.mobileSlider.split(', ');
      let condition = values[0];
      let md = values[1];

      let sliderWrapper = slider.querySelector('.mobile-slider__wrapper');

      let sliderSlides = sliderWrapper.childNodes;
      sliderSlides = Array.from(sliderSlides).filter(slide => {
        if (!(slide.nodeType == '3' || slide.nodeName == '#text' || slide.dataset.dynamicAdaptive)) {
          slide.classList.add('mobile-slider__slide');
          return slide;
        }
      });

      let mediaQuery = window.matchMedia(`(${condition}-width: ${md}px)`);

      mediaQuery.addListener(initMobileSlider);
      initMobileSlider(mediaQuery);


      function initMobileSlider(media) {
        if (media.matches) {
          slider.swiper.enable();
          sliderWrapper.style.flexWrap = 'nowrap';

          let slideTipButton = slider.querySelector('.icon-circle--slider');
          if (!slideTipButton) {
            slideTipButton = document.createElement('div');
            slideTipButton.classList.add('icon-circle', 'icon-circle--slider');
            slideTipButton.innerHTML =
              `
          <div class="icon-circle__item __icon-slider-hand"></div>
        `;
            slider.append(slideTipButton);
            slideTipButton.addEventListener('click', function () {
              slider.swiper.slideNext();
            });
          }
          slideTipButton.style.display = 'flex';
        }
        else {
          slider.swiper.disable();
          sliderWrapper.style.flexWrap = 'wrap';
          let icon_hand = slider.querySelector('.icon-circle--slider');
          if (icon_hand) {
            icon_hand.remove();
          }
        }
      }
    })
  }

  mobileSlider();


  // tape-slider
  const tapeSlider = new Swiper('.tape-slider', {
    wrapperClass: 'tape-slider__wrapper',
    slideClass: 'tape-slide',
    slidesPerView: 1,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    },

    breakpoints: {
      640: {
        slidesPerView: 2
      },
      940: {
        slidesPerView: 3
      },
      1260: {
        slidesPerView: 4
      },
      1800: {
        slidesPerView: 5
      }
    }
  });

  // product-page-slider
  const productPageSlider = new Swiper('.prodpage-slider', {
    wrapperClass: 'prodpage-slider__wrapper',
    slideClass: 'prodpage-slider__slide',
    slidesPerView: 1,

    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    }
  });
}