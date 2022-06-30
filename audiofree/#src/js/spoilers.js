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