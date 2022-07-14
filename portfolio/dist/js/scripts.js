function checkWebpSupport() {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = function () {
            resolve(document.querySelector('body').classList.add('webp'));
        }
        img.onerror = function () {
            reject(document.querySelector('body').classList.remove('webp'));
        }
        img.src = 'img/check-webp/check.webp';
    })
}

checkWebpSupport();
class Video {
    constructor() {
        this.initVideoInNode(document);
    }
    initVideoInNode(node = document) {
        setTimeout(() => {
            const videoContainers = node.querySelectorAll('.video-container');
            videoContainers.forEach(videoContainer => this.initControls(videoContainer));
        }, 0);
    }
    setControls(videoContainer) {
        let videoControls = videoContainer.querySelector('.video-container__controls');
        // список классов элементов управления
        const controlsElClasses = {
            playBtn: 'video-container__play-btn',
            expandBtn: 'video-container__expand',
            timestamp: 'video-container__timestamp',
            videotrack: 'video-container__videotrack',
            timeline: 'video-container__timeline',
            timelineSlider: 'video-container__timeline-slider'
        };
        // создать videoControls если его нет
        if (!videoControls) createControls();
        // пересоздать videoControls, если он есть, но внутри него присутствуют не все элементы
        if (videoControls) {
            // проверка, все ли нужные элементы есть внутри videoControls:
            let controlsCheckSum = true;
            for (let key in controlsElClasses) {
                const className = controlsElClasses[key];
                if (!videoControls.querySelector(className)) controlsCheckSum = false;
            }
            // нет каких-либо элементов: пересоздать controls
            if (!controlsCheckSum) {
                videoControls.remove();
                createControls();
            }
        }

        // ссылки на элементы управления в html
        const videoControlsObj = {
            video: videoContainer.querySelector('video'),
            node: videoControls,
            playBtn: videoControls.querySelector(`.${controlsElClasses.playBtn}`),
            expandBtn: videoControls.querySelector(`.${controlsElClasses.expandBtn}`),
            timestamp: videoControls.querySelector(`.${controlsElClasses.timestamp}`),
            videotrack: videoControls.querySelector(`.${controlsElClasses.videotrack}`),
            timeline: videoControls.querySelector(`.${controlsElClasses.timeline}`),
            timelineSlider: videoControls.querySelector(`.${controlsElClasses.timelineSlider}`)
        }

        function createControls() {
            videoControls = document.createElement('div');
            videoControls.className = 'video-container__controls';
            videoControls.innerHTML = `
                <div class="${controlsElClasses.playBtn}"></div>
                <div class="${controlsElClasses.expandBtn}"></div>
                <div class="${controlsElClasses.timestamp}">
                    <span></span>
                    <span></span>
                </div>
                <div class="${controlsElClasses.videotrack}">
                    <div class="${controlsElClasses.timeline}">
                        <div class="${controlsElClasses.timelineSlider}"></div>
                    </div>
                </div>
            `;
            videoContainer.append(videoControls);
        }
        return videoControlsObj;
    }
    initControls(videoContainer) {
        // получение объекта, содержащего как сам .video-container, так и элементы управления внутри него
        // этот объект собираетсяв this.setControls();
        const videoControlsObj = this.setControls(videoContainer);

        // выставление обработчиков на элементы управлнения
        this.initPlayingToggle(videoControlsObj);
        this.initVideotrack(videoControlsObj);
        this.initExpandBtn(videoControlsObj);
        this.initTimestamp(videoControlsObj);
        this.toggleControlsOnHover(videoControlsObj);
    }
    play(video) {
        const videoContainer = video.closest('.video-container');
        videoContainer.classList.add('__playing');
        video.play();
        if (!video.loop) video.loop = true;
    }
    pause(video) {
        const videoContainer = video.closest('.video-container');
        videoContainer.classList.remove('__playing');
        video.pause();
    }
    initPlayingToggle(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        const video = videoControlsObj.video;
        togglePlaying = togglePlaying.bind(this);

        videoControlsObj.node.addEventListener('click', togglePlaying);

        function togglePlaying(event) {
            const isPlaying = videoContainer.classList.contains('__playing');
            // если клик был не на элементы управления - остановить или воспроизвести
            if (event.target === videoControlsObj.node || event.target === videoControlsObj.playBtn) isPlaying ? this.pause(video) : this.play(video);
        }
    }
    initVideotrack(videoControlsObj) {
        const videotrack = videoControlsObj.videotrack;
        const timeline = videoControlsObj.timeline;
        const slider = videoControlsObj.timelineSlider;
        const video = videoControlsObj.video;

        // показ прогресса проигрывания
        initVideotrack();
        // перемотка. Бинд контекста для того, чтобы вызвать pause при перемотке через pointermove
        initRewind = initRewind.bind(this);
        initRewind();

        function initVideotrack() {
            video.addEventListener('timeupdate', showProgress);

            function showProgress() {
                timeline.style.width = `${video.currentTime / video.duration * 100}%`;
            }
        }
        function initRewind() {
            onPointerDown = onPointerDown.bind(this);

            videotrack.addEventListener('click', rewind);
            videotrack.addEventListener('pointerdown', onPointerDown);
            videotrack.ondragstart = function () { return false };

            function rewind(event) {
                const coord = event.clientX - getCoords(videotrack).left;
                const trackWidth = videotrack.offsetWidth;
                const value = coord / trackWidth * 100;

                // перемотка не выходит за границы videotrack
                if (value > 1 && value <= 100) {
                    timeline.style.width = `${value}%`;
                    video.currentTime = video.duration / 100 * value;
                }
                // перемотка выходит за границы videotrack
                if (value > 100) timeline.style.width = '100%';
                if (value < 1) timeline.style.width = '1%';
            }
            function onPointerDown(downEvent) {
                this.pause(video);
                document.addEventListener('pointermove', onMove);
                document.addEventListener('pointerup', onUp);

                function onMove(event) {
                    event.preventDefault();
                    rewind(event);
                }
                function onUp() {
                    document.removeEventListener('pointermove', onMove);
                    document.removeEventListener('pointerup', onUp);
                }
            }
        }
    }
    initExpandBtn(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        const expandBtn = videoControlsObj.expandBtn;
        const video = videoControlsObj.video;
        initExpansion();

        function initExpansion() {
            // для double-click. Такая реализация потому, что dblclick не регистрирует touch-нажатия
            let doubledClick = false;
            videoContainer.onclick = watchDblClick;
            expandBtn.addEventListener('click', doExpand);

            function doExpand() {
                if (!video.closest('.popup')) {
                    new Popup({
                        content: [
                            {
                                type: 'htmlElement',
                                body: videoContainer,
                                oldParent: videoContainer.parentNode
                            }
                        ]
                    });
                }
            }
            function watchDblClick(event) {
                const controls = videoContainer.querySelector('.video-container__controls');
                const playBtn = videoContainer.querySelector('.video-container__play-btn');
                if (event.target === controls || event.target === playBtn) {
                    if (doubledClick) {
                        if (!videoContainer.closest('.popup')) doExpand();
                        if (videoContainer.closest('.popup')) {
                            const popupCloseBtn = document.querySelector('.popup__body');
                            const customEvent = new Event('click', { bubbles: true });
                            popupCloseBtn.dispatchEvent(customEvent);
                        }
                    }
                    doubledClick = true;
                    setTimeout(() => {
                        doubledClick = false;
                    }, 250);
                }
            }
        }
    }
    initTimestamp(videoControlsObj) {
        const video = videoControlsObj.video;
        const timestamp = videoControlsObj.timestamp;
        setTimestamp();
        video.addEventListener('timeupdate', setTimestamp);

        function setTimestamp() {
            const spans = timestamp.querySelectorAll('span');
            const currentSpan = spans[0];
            const durationSpan = spans[1];

            let currentMinutes = Math.floor(Math.floor(video.currentTime) / 60) || 0;
            let currentSeconds = Math.floor(video.currentTime) - currentMinutes * 60 || 0;
            currentMinutes = currentMinutes.toString();
            currentSeconds = currentSeconds.toString();
            if (currentMinutes.length <= 1) currentMinutes = `0${currentMinutes}`;
            if (currentSeconds.length <= 1) currentSeconds = `0${currentSeconds}`;

            let durationMinutes = Math.floor(Math.floor(video.duration) / 60) || 0;
            let durationSeconds = Math.floor(video.duration) - durationMinutes * 60 || 0;
            durationMinutes = durationMinutes.toString();
            durationSeconds = durationSeconds.toString();
            if (durationMinutes.length <= 1) durationMinutes = `0${durationMinutes}`;
            if (durationSeconds.length <= 1) durationSeconds = `0${durationSeconds}`;

            currentSpan.innerHTML = `${currentMinutes}:${currentSeconds}`;
            durationSpan.innerHTML = `${durationMinutes}:${durationSeconds}`;
        }
    }
    toggleControlsOnHover(videoControlsObj) {
        const videoContainer = videoControlsObj.node.closest('.video-container');
        videoContainer.onpointerover = addHoverClass;
        videoContainer.onmouseleave = removeHoverClass;

        function addHoverClass(event) {
            videoContainer.classList.add('__hover');
            // убрать класс __hover через 1с после присваивания, если event спровоцирован не мышью (тачскрином)
            if (event.pointerType != 'mouse') setTimeout(() => { removeHoverClass(); }, 1000);
        }
        function removeHoverClass() {
            videoContainer.classList.remove('__hover');
        }
    }
}
class Images {
    constructor() {
        this.initImagesInNode(document);
    }
    initImagesInNode(node = document) {
        setTimeout(() => {
            const imageContainers = node.querySelectorAll('.image-container');
            imageContainers.forEach(imageContainer => this.initContainer(imageContainer));
        }, 0);
    }
    initContainer(imageContainer) {
        this.initExpandBtn(imageContainer);
    }
    initExpandBtn(imageContainer) {
        setIcon();
        imageContainer.onclick = doExpand;

        function setIcon() {
            let expandBtn = imageContainer.querySelector('.image-container__expand');
            if (!expandBtn) {
                expandBtn = document.createElement('div');
                expandBtn.className = 'image-container__expand';
                imageContainer.append(expandBtn);
            }
        }
        function doExpand() {
            if (!imageContainer.closest('.popup')) {
                new Popup({
                    content: [{ type: 'htmlElement', body: imageContainer, oldParent: imageContainer.parentNode }]
                });
            }
        }
    }
}

const videoMethods = new Video();
const imageMethods = new Images();
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
class ScrollAnim {
    constructor() {
        this.timeoutDflt = 75;

        this.initAllObjs();
        window.addEventListener('scroll', () => this.initAnimObjs());
    }
    initAllObjs(node = document) {
        this.initAnimObjs(node);
        this.initTextNodes(node);
    }
    initAnimObjs(node = document) {
        const animObjects = node.querySelectorAll('[class*="anim__object"]:not([v-cloak])');
        animObjects.forEach(obj => this.initAnimObj(obj));
    }
    initTextNodes(node = document) {
        const textNodes = node.querySelectorAll('[class*="anim__object-text"]:not([v-cloak])');
        textNodes.forEach(textNode => this.initTextTyping(textNode));
    }
    initAnimObj(obj) {
        let animCoords = getCoords(obj);
        let animHeight = obj.offsetHeight;
        let scrollHeight = window.pageYOffset;
        let animValue = 5;
        let animPoint = window.innerHeight - window.innerHeight / animValue;

        if ((window.pageYOffset > animCoords.top - animPoint) && (window.pageYOffset < animHeight + animCoords.top)) {
            applyAnim();
        }
        else {
            removeAnim();
        }

        function applyAnim() {
            obj.classList.add('__animated');
        }
        function removeAnim() {
            if (obj.classList.contains('__unlock-anim')) {
                obj.classList.remove('__animated');
            }
        }
    }
    initTextTyping(textNode) {
        this.saveTextContent(textNode);
        const hasAnimatedClass = textNode.classList.contains('__animated');
        // поставить обработчик DOM-мутаций
        if (!hasAnimatedClass) {
            const observer = new MutationObserver(onMutation.bind(this));
            observer.observe(textNode, { attributes: true, attributeOldValue: true });
        }
        // просто анимировать текст
        if (hasAnimatedClass) this.type(textNode);


        function onMutation(mtList) {
            mtList.forEach(mutn => {
                const textNode = mutn.target;
                if (mutn.attributeName === 'class' && mutn.oldValue) {
                    const wasntAnimated = !mutn.oldValue.split(' ').includes('__animated');
                    const isAnimated = textNode.classList.contains('__animated');
                    if (wasntAnimated && isAnimated) this.type(textNode);
                }
            });
        }
    }
    type(textNode) {
        const content = textNode.textContent;
        const dataset = textNode.dataset.textContent;
        const typingSpeed = textNode.dataset.typingSpeed;

        if (textNode.dataset.isTyping !== 'true') {
            textNode.dataset.isTyping = 'true';
            textNode.textContent = '';

            const lettersArray = dataset.replace(/\s\s/g, '').split('');
            for (let i = 0; i < lettersArray.length; i++) {
                let timeout = 0;
                !typingSpeed ? timeout = this.timeoutDflt * i : timeout = typingSpeed * i;
                const letter = lettersArray[i];

                setTimeout(() => {
                    textNode.textContent += letter;
                    if (i === lettersArray.length - 1) {
                        textNode.dataset.isTyping = 'false';
                    }
                }, timeout);
            }
        }
    }
    saveTextContent(textNode) {
        const dataset = textNode.dataset.textContent;
        if (!dataset) textNode.dataset.textContent = textNode.textContent;
        textNode.textContent = '';
    }
}
const scrollAnim = new ScrollAnim();
// =======================================    СПИСОК РАБОТ    ======================================= //
const worksAppId = '#works-block';
const worksAppBlock = document.querySelector(worksAppId);

const WorksApp = {
    data() {
        return {
            // исходный массив
            worksSrc: [],
            // отсортированный массив, который отображается пользователю
            works: [],
            // блоки фильтров со списками (значение - массив\объект) и со строками (значение - строка)
            filterLists: [],
            filterStrings: [],
            // строки со значениями выбранных фильтров
            filtersChosen: [],
            // указать, поставлен ли обработчик на обновление фильтров при DOM-мутациях
            filterUpdater: false
        }
    },
    created() {
        this.previewPlatformByMedia();
    },
    mounted() {
        fetch('js/JSON/works.json')
            .then(response => response.json())
            .then(data => {
                // вывести текущее количество работ в #about-block
                aboutBlockInfo.setInfo('worksAmount', data.length);
                // внести изменения в полученный массив json и записать как исходный массив в data()
                let newData = this.modifyData(data);
                this.worksSrc = newData;
                this.works = newData;
                // активировать скрипты для filter и select
                this.initFilterBlock();
                // поставить значение isDesktop в true или false в зависимости от платформы
                this.previewPlatformByMedia();
                // инициализировать анимации элементов при прокрутке
                scrollAnim.initAllObjs(worksAppBlock);
                // инициализировать кнопки
                headerMethods.initNavButtons(worksAppBlock);
            });
    },
    beforeUpdate() {
        // повесить обработчик на отслеживание мутаций в .filter, реактивирующий этот блок
        if (!this.filterUpdater) {
            filterListUpdater();
            this.filterUpdater = true;
        }

        function filterListUpdater() {
            const filter = document.querySelector(worksAppId).querySelector('.filter__body');
            if (filter) {
                const observer = new MutationObserver(mutationRecords => {
                    initFilters(document.querySelector(worksAppId));
                });
                observer.observe(filter, {
                    childList: true,
                    subtree: true,
                    charactedData: true
                });
            }
        }
    },
    methods: {
        modifyData(data) {
            let newData = data;
            newData.forEach(work => {
                // добавить значение showFeature (для показа списка особенностей)
                work.showFeature = false;
            });

            return newData;
        },
        initFilterBlock() {
            this.initFilterData();
            this.initSortData();
        },
        initFilterData() {
            // сбор для отрисовки в фильтре
            const filterLists = this.filterLists;
            const filterStrings = this.filterStrings;
            const worksSrc = this.worksSrc;
            let filtersChosen = this.filtersChosen;
            const filterBody = worksAppBlock.querySelector('.filter__body');
            render();
            doFilter = doFilter.bind(this);
            doFilter();
            filterBody.addEventListener('change', doFilter);


            function render() {
                renderFilterLists();

                function renderFilterLists() {
                    const featuresArray = getArray('features');
                    const featuresObj = { title: 'По содержимому', keyName: 'features', content: featuresArray };
                    filterLists.push(featuresObj);
                }
                function getArray(keyName) {
                    const list = [];
                    worksSrc.forEach(work => {
                        work[keyName].forEach(elem => {
                            if (list.indexOf(elem) < 0) list.push(elem);
                        });
                    });
                    return list;
                }
            }
            function doFilter() {
                // копия worksSrc, которую можно изменять без затрагивания this.worksSrc
                let worksFiltered = worksSrc.slice();
                // фильтры не заданы
                if (!filterBody.querySelector('input:checked')) {
                    this.works = worksSrc;
                    this.filtersChosen = [];
                    return;
                }
                // фильтры заданы
                const checkedListInputs = filterBody.querySelectorAll('input:not([value]):checked');
                checkedListInputs.forEach(inp => {
                    const value = inp.nextElementSibling.innerText || inp.nextElementSibling.textContent;
                    filterLists.forEach(filterList => {
                        worksFiltered = worksFiltered.filter(work => {
                            return work[filterList.keyName].indexOf(value) >= 0;
                        });
                    });
                });
                const checkedStringInputs = filterBody.querySelectorAll('input[value]:checked');
                let worksFilteredByStrings = [];
                checkedStringInputs.forEach(inp => {
                    const value = inp.value;
                    filterStrings.forEach(filterString => {
                        worksFiltered = worksFiltered.filter(work => {
                            return work[filterString.keyName].toString() == value.toString();
                        });
                    });
                });
                // отправить в рендер отфильтрованный массив
                this.works = worksFiltered;
                // записать названия примененных фильтров
                getFilterValues = getFilterValues.bind(this);
                getFilterValues();
            }
            function getFilterValues() {
                const checkedInputs = filterBody.querySelectorAll('input:checked');
                const uncheckedInputs = filterBody.querySelectorAll('input:not(:checked)');
                // добавить
                checkedInputs.forEach(inp => {
                    const value = inp.nextElementSibling.innerText || inp.nextElementSibling.textContent;
                    if (this.filtersChosen.indexOf(value) < 0) this.filtersChosen.push(value);
                });
                // убрать
                uncheckedInputs.forEach(inp => {
                    const value = inp.nextElementSibling.innerText || inp.nextElementSibling.textContent;
                    const index = this.filtersChosen.indexOf(value);
                    if (index >= 0) this.filtersChosen.splice(index, 1);
                });
            }
        },
        initSortData() {
            initSelects(worksAppBlock);
            const filterBlock = worksAppBlock.querySelector('.filter-block');
            const sortBlock = worksAppBlock.querySelector('.filter-block__sort');
            doSort = doSort.bind(this);
            doSort();
            filterBlock.addEventListener('change', doSort);

            function doSort() {
                sortByType = sortByType.bind(this);
                const sortedByType = sortByType();
                const worksSorted = sortByOrder(sortedByType);
                this.works = worksSorted;


                function sortByType() {
                    const typeInput = sortBlock.querySelector('input[name="works-sort__type"]:checked');
                    const value = typeInput.value;
                    if (value === 'alphabet') return this.works.sort((a, b) => {
                        if (a.title.toUpperCase() > b.title.toUpperCase()) return 1;
                        if (a.title.toUpperCase() < b.title.toUpperCase()) return -1;
                        return 0;
                    });
                    if (value === 'workload') return this.works.sort((a, b) => {
                        if (a.features.length > b.features.length) return 1;
                        if (a.features.length < b.features.length) return -1;
                        return 0;
                    });
                }
                function sortByOrder(array) {
                    const orderInput = sortBlock.querySelector('input[name="works-sort__order"]:checked');
                    const value = orderInput.value;
                    if (value === 'start') return array;
                    if (value === 'end') return array.reverse();
                }
            }
        },
        capitalLetter: capitalLetter,
        togglePlatform(work, bool, event) {
            if (bool !== work.isDesktop && !work.showFeature) {
                let transitionDuration = '.5s';

                let presentBlock = event.target.closest('.site-item').querySelector('.site-item__presentation');
                presentBlock.style.transition = `transform ${transitionDuration} ease`;
                presentBlock.style.transform = 'rotate3d(1, 0, 0, 90deg)';
                presentBlock.addEventListener('transitionend', onTransEnd);

                function onTransEnd() {
                    setTimeout(() => {
                        work.isDesktop = bool;
                        presentBlock.style.removeProperty('transform');
                        presentBlock.removeEventListener('transitionend', onTransEnd);
                    }, 100);
                }
            }
            if (work.showFeature) {
                work.isDesktop = bool;
            }
        },
        showFeature(work) {
            work.showFeature = !work.showFeature;
        },
        previewPlatformByMedia() {
            onMediaChange = onMediaChange.bind(this);

            let mdValue = 499;
            let md = window.matchMedia(`(max-width: ${mdValue}px)`);
            md.addEventListener('change', onMediaChange);
            onMediaChange();

            function onMediaChange() {
                if (md.matches) {
                    for (let i = 0; i < this.works.length; i = i + 1) { this.works[i].isDesktop = false; }
                } else {
                    for (let i = 0; i < this.works.length; i = i + 2) { this.works[i].isDesktop = true; }
                }
            }
        }
    }
}

Vue.createApp(WorksApp).mount(worksAppId);

// ======================================= ДЕМОНСТРАЦИЯ НАВЫКОВ ======================================= //
const featuresAppId = '#features-block';
const featuresAppBlock = document.querySelector(featuresAppId);

const FeaturesApp = {
    data: () => ({
        features: {},
        featuresGrouped: {}
    }),
    mounted() {
        fetch('js/JSON/features.json')
            .then(response => response.json())
            .then(data => {
                // вывести текущее количество features в #about-block
                const fAmount = parseInt(data.video.length) + parseInt(data.images.length);
                aboutBlockInfo.setInfo('jsFeaturesAmount', fAmount);
                // записать несгруппированный объект json в data (изменения элементов проходят в нём!)
                this.features = data;
                // сгруппировать элементы массивов объекта json по страницам
                this.groupToSlides(this.features);
                // изменять ориентацию видеороликов в зависимости от соотношения сторон экрана пользователя
                this.orientationByMedia();
                // активировать скрипты для video и image
                videoMethods.initVideoInNode(featuresAppBlock);
                imageMethods.initImagesInNode(featuresAppBlock);
                // инициализировать анимации элементов при прокрутке
                scrollAnim.initAllObjs(featuresAppBlock);
                // инициализировать кнопки
                headerMethods.initNavButtons(featuresAppBlock);
            });
    },
    updated() {
        // активировать скрипты для video и image
        videoMethods.initVideoInNode(featuresAppBlock);
        imageMethods.initImagesInNode(featuresAppBlock);
    },
    methods: {
        groupToSlides(data) {
            const newData = { 'video': [], 'images': [] };
            let pageIndex = 1;
            for (let key in newData) { newData[key] = groupArray(data[key]); }
            this.featuresGrouped = newData;


            function groupArray(array) {
                const groupedArray = [];
                for (let i = 0; i < array.length; i += 2) {
                    const obj = {};
                    const elem_1 = array[i];
                    const elem_2 = array[i + 1];
                    obj[pageIndex] = elem_1;
                    if (elem_2) obj[pageIndex + 1] = elem_2;
                    groupedArray.push(obj);

                    pageIndex += 2;
                }
                return groupedArray;
            }
        },
        initVideo() {
            initVideoImages(featuresAppBlock);
        },
        capitalLetter: capitalLetter,
        presentList(ftr) {
            const obj = { title: '', content: [{ type: 'text' }] };

            if (ftr.examples.length <= 0) {
                obj.title = `К сожалению, пока не добавлены сайты, где можно посмотреть <span class="__selected">${ftr.name}</span>`;
            }
            if (ftr.examples.length === 1) {
                obj.title = `<span class="__selected">${this.capitalLetter(ftr.name)}</span> можно посмотреть на следующем сайте:`;
                obj.content[0].body = `<a href="${ftr.examples[0].url}">${ftr.examples[0].text}</a>`;
            }
            if (ftr.examples.length > 1) {
                obj.title = `<span class="__selected">${this.capitalLetter(ftr.name)}</span> можно посмотреть на следующих сайтах:`;
                obj.content[0].body = [];
                ftr.examples.forEach(example => {
                    const string = `<a href="${example.url}">${example.text}</a>`;
                    obj.content[0].body.push(string);
                });
            }

            new Popup(obj);
        },
        orientationByMedia() {
            let screenWidth = document.documentElement.clientWidth;
            let screenHeight = document.documentElement.clientHeight;
            let isHorizontal = screenWidth - screenHeight >= 0;
            let isVertical = screenWidth - screenHeight < 0;

            for (let type in this.featuresGrouped) {
                const array = this.featuresGrouped[type];
                array.forEach(pagesObj => {
                    for (let pageIndex in pagesObj) {
                        const ftr = pagesObj[pageIndex];
                        // видео/изображение по горизонтали - если горизонтальное соотношение экрана или если вертикальное 
                        // соотношение экрана, но вертикального видео/изображения нет
                        if (isHorizontal || (isVertical && !ftr.presentation['src-vertical'])) {
                            ftr.presentation['currentSrc'] = ftr.presentation.src;
                        }
                        // видео по вертикали (только если такое есть)
                        if (isVertical && ftr.presentation['src-vertical']) {
                            ftr.presentation['currentSrc'] = ftr.presentation['src-vertical'];
                        }
                    }
                });
            }
        }
    }
}

Vue.createApp(FeaturesApp).mount(featuresAppId);
// BOOK SLIDER //
let bookSlider = new Swiper('.my-features__slider', {
    wrapperClass: 'my-features__wrapper',
    slideClass: 'my-features__slide',
    effect: 'flip',
    on: {
        update() {
            let shadowsLeft = document.querySelectorAll('.swiper-slide-shadow-left');
            let shadowsRight = document.querySelectorAll('.swiper-slide-shadow-right');
            let commonArray = [];
            shadowsLeft.forEach(i => { commonArray.push(i); });
            shadowsRight.forEach(i => { commonArray.push(i); });
            commonArray.forEach(shadow => {
                shadow.style.backgroundImage = "url('img/mains/book.jpg')";
                shadow.style.backgroundPosition = 'center';
                shadow.style.backgroundSize = '300% 125%';
            });
        },
        touchStart(swiper, event) {
            if (event.target.classList.contains('features-slide__presentation')
                || event.target.closest('.features-slide__presentation')
                || event.target.classList.contains('features-slide__title')) swiper.allowTouchMove = false;
            else swiper.allowTouchMove = true;
        },
        slideChange(swiper) {
            const swiperNode = swiper.el;
            const videoList = swiperNode.querySelectorAll('video');
            videoList.forEach(video => videoMethods.pause(video));
        }
    }
});

function bookSliderFix() {
    let book = document.querySelector('.my-features__slider');

    function moveBook() {
        let slideMobile = 1169;
        let mediaQuery = window.matchMedia(`(max-width: ${slideMobile}px)`);

        // активация передвижения всей книги стрелками, когда вся книга не помещается во всю ширину экрана
        initMovement();
        mediaQuery.addEventListener('change', initMovement);

        function initMovement() {

            let controlsBlock = document.querySelector('.book-controls');
            let ctrlLeft = controlsBlock.querySelector('.book-controls__arrow--left');
            let ctrlRight = controlsBlock.querySelector('.book-controls__arrow--right');
            ctrlLeft.addEventListener('click', onClickLeft);
            ctrlRight.addEventListener('click', onClickRight);
            window.addEventListener('resize', onClickLeft);

            if (!mediaQuery.matches) book.style.removeProperty('transform');

            function onClickLeft() {
                book.style.transform = `translate(0, 0)`;
            }
            function onClickRight() {
                let width = book.offsetWidth;
                let screenWidth = window.innerWidth;
                book.style.transform = `translate(-${width - screenWidth + 20}px, 0)`;
            }
        }
    }
    function pageCount() {
        doCount();
        bookSlider.on('update', doCount);
        bookSlider.on('activeIndexChange', function () {
            setTimeout(() => { doCount(); }, 100);
        });

        function doCount() {
            let paginationBlock = document.querySelector('.book-pagination');
            let pages = book.querySelectorAll('[data-slider-page]');

            let activeSlide = book.querySelector('.swiper-slide-active');
            if (activeSlide) {
                let activeSlidePages = activeSlide.querySelectorAll('[data-slider-page]');
                let activePages = [];
                if (activeSlidePages.length > 0) {
                    activeSlidePages.forEach(el => {
                        activePages.push(el.dataset.sliderPage);
                    });
                }

                if (activePages.length > 1) paginationBlock.innerHTML = `Страницы ${activePages[0]}-${activePages[1]} из ${pages.length}`;
                else paginationBlock.innerHTML = `Страница ${activePages[0]} из ${pages.length}`;
            }
        }
    }
    function update() {
        let sliderElems = bookSlider.$el;
        sliderElems.forEach(elem => {
            let observer = new MutationObserver(mutations => {
                bookSlider.update();
            });

            observer.observe(elem, { childList: true, subtree: true, });
        });
    }

    moveBook();
    pageCount();
    update();
}

bookSliderFix();