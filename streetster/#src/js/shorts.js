// запускается после того, как будет совершен Vue.mount()
function initShorts() {
    // HEADER + FOOTER //
    class HeaderFooter {
        constructor() {
            this.el = document.querySelector('.header');

            this.toggleAsideMenus();
            this.setPaddingTop();
            this.onScroll();
            this.toggleSearchResults();
            this.toggleFooterItems();
        }
        toggleAsideMenus() {
            const asidesList = [
                ['icon__cart', 'cart'],
                ['icon__menu', 'menu']
            ];
            asidesList.forEach(item => {
                let btnsList = document.querySelectorAll(`.${item[0]}`);
                let asideMenu = document.querySelector(`.${item[1]}`);
                // клик по кнопке
                btnsList.forEach(btn => btn.addEventListener('click', onClickBtn));
                // клик по черной области
                asideMenu.addEventListener('click', onClickAside);

                function onClickBtn() {
                    toggle(btnsList, asideMenu, this);
                }
                function onClickAside(event) {
                    if (event.target.classList.contains('aside-menu')) {
                        toggle(btnsList, asideMenu, this);
                    }
                }
            });

            function toggle(btnsList, asideMenu, target) {
                if(target.classList.contains('__active')) hide();
                else show();

                function show(){
                    btnsList.forEach(i => i.classList.add('__active'));
                    asideMenu.classList.add('__active');
                }
                function hide(){
                    btnsList.forEach(i => i.classList.remove('__active'));
                    asideMenu.classList.remove('__active');
                }
            }
        }
        setPaddingTop() {
            let headerHeight = this.el.offsetHeight;
            const startBlock = document.querySelector('.start-block');
            const startBlockWrapper = startBlock.querySelector('.start-block__wrapper');

            if (startBlockWrapper) startBlockWrapper.style.paddingTop = `${headerHeight}px`;
            else startBlock.style.paddingTop = `${headerHeight}px`;
        }
        onScroll() {
            setTimeout(() => {
                onScroll = onScroll.bind(this);
                let headerHeight = this.el.offsetHeight;
                onScroll();
                window.addEventListener('scroll', onScroll);

                function onScroll() {
                    if (window.pageYOffset > headerHeight) this.el.classList.add('__fixed');
                    else this.el.classList.remove('__fixed');
                }
            }, 0);
        }
        toggleSearchResults() {
            const search = this.el.querySelector('.search');
            const input = search.querySelector('input');
            input.addEventListener('focus', onFocus);
            input.addEventListener('blur', onBlur);

            function onFocus() {
                search.classList.add('__active');
            }
            function onBlur() {
                search.classList.remove('__active');
            }
        }
        toggleFooterItems() {
            const footerItems = document.querySelectorAll('.footer__item');
            footerItems.forEach(item => {
                item.addEventListener('click', function (event) {
                    if (event.target.classList.contains('item__header')) {
                        if (item.classList.contains('__active')) close(item);
                        else show(item);
                    }
                });
            });

            function closeAll() {
                footerItems.forEach(item => { close(item) });
            }
            function close(item) {
                item.classList.remove('__active');
            }
            function show(item) {
                closeAll();
                item.classList.add('__active');
            }
        }
    }
    const headerFooter = new HeaderFooter();

    class Select {
        constructor() {
            const list = document.querySelectorAll('.select');
            this.list = list;
            this.list.forEach(select => {
                this.setValues(select);
                this.setSelected(select);
                this.toggleSelect(select);
                this.setInputHandlers(select);
            });
        }
        setValues(select) {
            // поставить первую опцию выбранной, если не указано checked вручную
            const inputChecked = select.querySelector('input[type="radio"]:checked');
            if (!inputChecked) select.querySelector('input[type="radio"]').checked = true;
            // добавить в label'ы текст от input.value
            const inputs = select.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                const option = input.closest('.option');
                let text = document.createElement('span');
                text.innerHTML = input.value;
                option.append(text);
            });
        }
        toggleSelect(select) {
            select.addEventListener('click', () => select.classList.toggle('__active'));
        }
        setSelected(select) {
            let selected = select.querySelector('input[type="text"]');
            if (!selected) {
                selected = document.createElement('input');
                selected.type = 'text';
                selected.setAttribute('readonly', true);
                select.prepend(selected);
            }
            const inputChecked = select.querySelector('input[type="radio"]:checked');
            selected.value = inputChecked.value;
        }
        setInputHandlers(select) {
            onClick = onClick.bind(this);

            const inputs = select.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.addEventListener('change', onClick);
            });

            function onClick() {
                this.setSelected(select);
                select.classList.remove('__active');
            }
        }
    }
    const select = new Select();
}

// LOCALSTORAGE //
function getStorage(key) {
    let storage = localStorage.getItem(key);
    if (!storage) storage = '[]';
    storage = JSON.parse(storage);
    return storage;
}
function setStorage(key, obj) {
    let objStr = JSON.stringify(obj);
    localStorage.setItem(key, objStr);
}