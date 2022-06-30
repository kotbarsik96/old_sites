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