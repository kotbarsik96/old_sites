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
