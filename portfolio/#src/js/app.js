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