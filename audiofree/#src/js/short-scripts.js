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