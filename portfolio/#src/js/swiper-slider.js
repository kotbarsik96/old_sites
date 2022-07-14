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