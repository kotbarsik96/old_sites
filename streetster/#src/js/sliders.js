function syncColorImage(slider, from, sliderInstance = null) {
    setTimeout(() => {
        const productBlock = slider.closest('[data-product-name]');
        const activeSlide = slider.querySelector('.swiper-slide-active');
        const activeInput = productBlock.querySelector('input[data-color-code]:checked');

        if(activeInput.dataset.colorCode !== activeSlide.dataset.colorCode){
            if(from === 'onSlider'){
                const colorCode = activeSlide.dataset.colorCode;
                const matchedInput = productBlock.querySelector(`input[data-color-code="${colorCode}"]`);
                matchedInput.checked = true;
                const event = new Event('change');
                activeInput.closest('form').dispatchEvent(event);
            }
            if(from === 'onForm'){
                const colorCode = activeInput.dataset.colorCode;
                const matchedSlide = productBlock.querySelector(`.swiper-slide[data-color-code="${colorCode}"]`);
                const slideIndex = parseInt(matchedSlide.dataset.swiperSlideIndex) + 1;
                sliderInstance.slideTo(slideIndex);
            }
        }
    }, 0);
}

function swiperSlidersInit() {
    // BIKE SLIDER //
    const bikeSlider = new Swiper('.bike-slider', {
        wrapperClass: 'bike-slider__wrapper',
        slideClass: 'bike-slider__slide',
        slidesPerView: 1,
        centeredSlides: true,
        loop: true,

        navigation: {
            prevEl: '.bike-slider__button-prev',
            nextEl: '.bike-slider__button-next'
        },
        pagination: {
            el: '.bike-slider__pagination',
            clickable: true,
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            },
            slideChangeTransitionEnd(slider) {
                syncColorImage(slider.el, 'onSlider');
            }
        }
    });


    // CATEGORIES SLIDER // 
    const categoriesSlider = new Swiper('.categories-slider', {
        wrapperClass: 'categories-slider__wrapper',
        slideClass: 'categories-slider__slide',
        centeredSlides: true,
        slidesPerView: 1,
        loop: true,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        breakpoints: {
            993: {
                slidesPerView: 2,
            },
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            }
        }
    });


    // NEWS SLIDER // 
    const newsSlider = new Swiper('.news-slider', {
        wrapperClass: 'news-slider__wrapper',
        slideClass: 'news-slider__slide',
        slidesPerView: 1,
        spaceBetween: 40,
        loop: true,
        navigation: {
            nextEl: '.news-slider-button__next',
            prevEl: '.news-slider-button__prev',
        },
        pagination: {
            el: '.streetster-slider__pagination',
            clickable: true
        },
        breakpoints: {
            341: {
                spaceBetween: 0,
            },
            890: {
                slidesPerView: 2,
            },
            1320: {
                slidesPerView: 3,
            },
        },

        on: {
            observerUpdate(sld) {
                sld.update();
            }
        }
    });


    return { bikeSlider, categoriesSlider, newsSlider}
}