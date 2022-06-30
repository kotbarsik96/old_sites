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