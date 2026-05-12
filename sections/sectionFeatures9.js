document
  .querySelectorAll(".features9_card video")
  .forEach((v) => v.setAttribute("lazy-target-off", ""));

document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(initFeatures9);
});

function initFeatures9() {
  gsap.registerPlugin(ScrollTrigger);

  const SCROLL_VH = 120;
  const CARD_STACK_CONFIG = {
    EYEBROW_TOP: 64,
    PEEK_PX: 18,
    SCALE_STEP: 0.038,
    MAX_DEPTH: 4,
    DEPTH_BUFFER: 0.5,
    EXIT_MULT: 1.1,
    GAP: 72,
    TITLE_SWITCH: 0.4,
    FADE_START: 0.88,
    FADE_RANGE: 0.12,
  };

  const cardExitEase = gsap.parseEase("power2.inOut");
  const sectionWrapper = document.querySelector(".features9_component");
  const scrollSpacer = document.querySelector(".features9_spacer");
  const cards = gsap.utils.toArray(".features9_card");
  const titles = gsap.utils.toArray(".features9_title-item");
  const TOTAL = cards.length;

  if (!sectionWrapper || !scrollSpacer || TOTAL === 0) return;

  let exitPx = 0;
  let cachedHeight = 0;
  let cachedWindowHeight = window.innerHeight;
  let prevWidth = window.innerWidth;

  const cardVideos = cards.map((card) => card.querySelector("video"));
  let currentActiveIndex = 0;
  let sectionInView = false;

  new IntersectionObserver(
    ([entry]) => {
      sectionInView = entry.isIntersecting;
      syncVideos();
    },
    { threshold: 0 },
  ).observe(sectionWrapper);

  function syncVideos() {
    cardVideos.forEach((video, i) => {
      if (!video) return;
      if (i === currentActiveIndex && sectionInView) {
        if (video.paused) video.play().catch(() => {});
      } else {
        if (!video.paused) video.pause();
      }
    });
  }

  function measureTitleHeight(titleEl) {
    const savedStyles = titleEl.style.cssText;
    titleEl.style.cssText +=
      ";opacity:1!important;transform:none!important;display:flex!important;position:relative!important";
    const height = titleEl.offsetHeight;
    titleEl.style.cssText = savedStyles;
    return height;
  }

  function updateScrollValues() {
    cachedWindowHeight = window.innerHeight;
    cachedHeight = (SCROLL_VH / 100) * cachedWindowHeight * TOTAL;
  }

  const getTotalScrollDistance = () => cachedHeight;

  function computeLayout() {
    const cardHeight = cards[0].getBoundingClientRect().height;
    exitPx = cardHeight * CARD_STACK_CONFIG.EXIT_MULT;
    const titleHeight = measureTitleHeight(titles[0]);

    const cardTop =
      CARD_STACK_CONFIG.EYEBROW_TOP +
      titleHeight +
      CARD_STACK_CONFIG.GAP +
      CARD_STACK_CONFIG.PEEK_PX * CARD_STACK_CONFIG.MAX_DEPTH;

    cards.forEach((card) => {
      gsap.set(card, { top: cardTop, force3D: true });
    });
  }

  const setScrollSpacerHeight = () => {
    scrollSpacer.style.height = `${getTotalScrollDistance() - cachedWindowHeight}px`;
  };

  const getScrollProgress = () => {
    const rect = sectionWrapper.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalDist = getTotalScrollDistance();
    return gsap.utils.clamp(0, TOTAL, (scrolled / totalDist) * TOTAL);
  };

  function render() {
    const progress = getScrollProgress();
    const {
      PEEK_PX,
      SCALE_STEP,
      MAX_DEPTH,
      DEPTH_BUFFER,
      FADE_START,
      FADE_RANGE,
    } = CARD_STACK_CONFIG;

    cards.forEach((card, cardIndex) => {
      const cardProgress = progress - cardIndex;
      let translateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = TOTAL - cardIndex;

      if (cardProgress >= 1) {
        translateY = exitPx;
        opacity = 0;
        zIndex = 0;
      } else if (cardProgress >= 0) {
        translateY = exitPx * cardExitEase(cardProgress);
        opacity =
          cardProgress > FADE_START
            ? 1 - (cardProgress - FADE_START) / FADE_RANGE
            : 1;
        zIndex = TOTAL + 1;
      } else {
        const stackDepth = Math.min(-cardProgress, MAX_DEPTH + DEPTH_BUFFER);
        if (stackDepth > MAX_DEPTH) {
          opacity = 0;
          zIndex = 0;
          translateY = -PEEK_PX * MAX_DEPTH;
          scale = 1 - SCALE_STEP * MAX_DEPTH;
        } else {
          translateY = -PEEK_PX * stackDepth;
          scale = 1 - SCALE_STEP * stackDepth;
          zIndex = TOTAL - Math.round(stackDepth);
        }
      }

      gsap.set(card, {
        zIndex,
        opacity,
        y: translateY,
        scale,
        force3D: true,
      });
    });

    const activeIndex = Math.min(
      TOTAL - 1,
      Math.floor(progress + (1 - CARD_STACK_CONFIG.TITLE_SWITCH)),
    );

    titles.forEach((title, i) => {
      title.classList.toggle("is-active", i === activeIndex);
    });

    currentActiveIndex = activeIndex;
    syncVideos();
  }

  function initScrollTrigger() {
    ScrollTrigger.create({
      trigger: sectionWrapper,
      start: "top top",
      end: () => `+=${getTotalScrollDistance() - cachedWindowHeight}`,
      onUpdate: render,
      invalidateOnRefresh: true,
    });
  }

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newWidth = window.innerWidth;
      if (newWidth !== prevWidth) {
        prevWidth = newWidth;
        updateScrollValues();
        computeLayout();
        setScrollSpacerHeight();
        ScrollTrigger.refresh();
        render();
      }
    }, 200);
  };

  updateScrollValues();
  computeLayout();
  setScrollSpacerHeight();
  render();
  initScrollTrigger();

  window.addEventListener("resize", onResize);
}
