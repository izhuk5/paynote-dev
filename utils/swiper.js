document.addEventListener("DOMContentLoaded", function () {
  const swiperOptions = {
    loop: true,
    grabCursor: true,
    slideToClickedSlide: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    pagination: {
      el: ".slider_pagination",
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 1,
    },
    breakpoints: {
      992: {
        slidesPerView: 3,
        spaceBetween: 86,
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 32,
      },
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
    },
    on: {
      init: function () {
        fixSwiperA11y(this);
      },
      slideChange: function () {
        fixSwiperA11y(this);
      },
    },
  };

  const mySwiper = new Swiper(".slider_component", swiperOptions);

  function fixSwiperA11y(swiper) {
    if (swiper.wrapperEl) {
      swiper.wrapperEl.removeAttribute("role");
    }
    swiper.slides.forEach((slide) => {
      slide.removeAttribute("role");
    });
  }
});
