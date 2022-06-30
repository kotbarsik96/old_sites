function swiperSlidersInit() {
  // fullscreen slider
  const pageSlider = new Swiper('.pagination-slider', {
    slideClass: 'pagination-slide',
    wrapperClass: 'pagination-slider__wrapper',

    loop: true,
    draggable: true,
    effect: 'flip',
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });


  // mobile slider
  function mobileSlider() {
    const mobileSlider = new Swiper('.mobile-slider', {
      wrapperClass: 'mobile-slider__wrapper',
      slideClass: 'mobile-slider__slide',
      slidesPerView: 1,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      on: {
        observerUpdate(sld) {
          sld.update();
        },
      },

      breakpoints: {
        500: {
          slidesPerView: 2
        },
      },
    });

    let sliderList = document.querySelectorAll('[data-mobile-slider]');
    sliderList.forEach(slider => {
      slider.swiper.disable();
      let values = slider.dataset.mobileSlider.split(', ');
      let condition = values[0];
      let md = values[1];

      let sliderWrapper = slider.querySelector('.mobile-slider__wrapper');

      let sliderSlides = sliderWrapper.childNodes;
      sliderSlides = Array.from(sliderSlides).filter(slide => {
        if (!(slide.nodeType == '3' || slide.nodeName == '#text' || slide.dataset.dynamicAdaptive)) {
          slide.classList.add('mobile-slider__slide');
          return slide;
        }
      });

      let mediaQuery = window.matchMedia(`(${condition}-width: ${md}px)`);

      mediaQuery.addListener(initMobileSlider);
      initMobileSlider(mediaQuery);


      function initMobileSlider(media) {
        if (media.matches) {
          slider.swiper.enable();
          sliderWrapper.style.flexWrap = 'nowrap';

          let slideTipButton = slider.querySelector('.icon-circle--slider');
          if (!slideTipButton) {
            slideTipButton = document.createElement('div');
            slideTipButton.classList.add('icon-circle', 'icon-circle--slider');
            slideTipButton.innerHTML =
              `
          <div class="icon-circle__item __icon-slider-hand"></div>
        `;
            slider.append(slideTipButton);
            slideTipButton.addEventListener('click', function () {
              slider.swiper.slideNext();
            });
          }
          slideTipButton.style.display = 'flex';
        }
        else {
          slider.swiper.disable();
          sliderWrapper.style.flexWrap = 'wrap';
          let icon_hand = slider.querySelector('.icon-circle--slider');
          if (icon_hand) {
            icon_hand.remove();
          }
        }
      }
    })
  }

  mobileSlider();


  // tape-slider
  const tapeSlider = new Swiper('.tape-slider', {
    wrapperClass: 'tape-slider__wrapper',
    slideClass: 'tape-slide',
    slidesPerView: 1,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    },

    breakpoints: {
      640: {
        slidesPerView: 2
      },
      940: {
        slidesPerView: 3
      },
      1260: {
        slidesPerView: 4
      },
      1800: {
        slidesPerView: 5
      }
    }
  });

  // product-page-slider
  const productPageSlider = new Swiper('.prodpage-slider', {
    wrapperClass: 'prodpage-slider__wrapper',
    slideClass: 'prodpage-slider__slide',
    slidesPerView: 1,

    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    on: {
      observerUpdate(sld) {
        sld.update();
      },
    }
  });
}