document.addEventListener("DOMContentLoaded", () =>
  requestAnimationFrame(initFeatures9),
);

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

  // The easing curve used when a card slides out of view
  const cardExitEase = gsap.parseEase("power2.inOut");

  // The main section element — used to track scroll position
  const sectionWrapper = document.querySelector(".features9_component");

  // An empty element at the bottom of the section that creates scroll space
  const scrollSpacer = document.querySelector(".features9_spacer");

  // Cards are read in DOM order — first card in HTML = first to show in the animation.
  const cards = gsap.utils.toArray(".features9_card");

  const titles = gsap.utils.toArray(".features9_title-item");
  const TOTAL = cards.length;

  // Safety guard: skip init if component is absent on this Webflow page
  if (!sectionWrapper || !scrollSpacer || TOTAL === 0) return;

  // How many pixels a card moves down to fully leave the screen.
  // This value is set in computeLayout() because it depends on card height.
  let exitPx = 0;

  // Returns the total scroll distance (in pixels) needed to go through all cards
  const getTotalScrollDistance = () =>
    (SCROLL_VH / 100) * window.innerHeight * TOTAL;

  // Temporarily makes a title visible to measure its real height, then restores it.
  // We need this because titles are hidden (opacity: 0) by default.
  function measureTitleHeight(titleEl) {
    const savedStyles = titleEl.style.cssText;
    titleEl.style.cssText +=
      ";opacity:1!important;transform:none!important;transition:none!important;position:relative!important;display:flex!important";
    const height = titleEl.offsetHeight;
    titleEl.style.cssText = savedStyles;
    return height;
  }

  // Reads card size from CSS and updates layout-dependent values.
  // Runs on page load and every time the window is resized.
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
      gsap.set(card, { top: cardTop });
    });
  }

  // Sets the height of the scroll spacer so the page has enough scroll room for all cards
  const setScrollSpacerHeight = () => {
    scrollSpacer.style.height = `${getTotalScrollDistance() - window.innerHeight}px`;
  };

  // Returns a number from 0 to TOTAL showing how far the user has scrolled through the animation.
  // 0 = start, 1 = first card done, 2 = second card done, and so on.
  const getScrollProgress = () => {
    const scrolled = -sectionWrapper.getBoundingClientRect().top;
    return gsap.utils.clamp(
      0,
      TOTAL,
      (scrolled / getTotalScrollDistance()) * TOTAL,
    );
  };

  // Updates every card's position, scale, and opacity based on current scroll progress.
  // Called on every scroll event by ScrollTrigger.
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
        // Card has fully exited — hide it
        translateY = exitPx;
        opacity = 0;
        zIndex = 0;
      } else if (cardProgress >= 0) {
        // Card is currently sliding out
        translateY = exitPx * cardExitEase(cardProgress);
        opacity =
          cardProgress > FADE_START
            ? 1 - (cardProgress - FADE_START) / FADE_RANGE
            : 1;
        zIndex = TOTAL + 1;
      } else {
        // Card is waiting in the stack behind the active card
        const stackDepth = Math.min(-cardProgress, MAX_DEPTH + DEPTH_BUFFER);
        if (stackDepth > MAX_DEPTH) {
          // Card is too deep in the stack — hide it
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

      gsap.set(card, { zIndex, opacity, y: translateY, scale });
    });

    const activeIndex = Math.min(
      TOTAL - 1,
      Math.floor(progress + (1 - CARD_STACK_CONFIG.TITLE_SWITCH)),
    );
    titles.forEach((title, i) =>
      title.classList.toggle("is-active", i === activeIndex),
    );
  }

  // Creates the ScrollTrigger that watches the section and calls render() on every scroll update
  function initScrollTrigger() {
    ScrollTrigger.create({
      trigger: sectionWrapper,
      start: "top top",
      end: () => `+=${getTotalScrollDistance() - window.innerHeight}`,
      onUpdate: render,
    });
  }

  // Recalculates layout when the window is resized.
  // Debounced by 150ms so it doesn't run on every pixel of resize.
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      computeLayout();
      setScrollSpacerHeight();
      ScrollTrigger.refresh();
      render();
    }, 150);
  };

  computeLayout();
  gsap.set(cards, { xPercent: -50, force3D: true });
  setScrollSpacerHeight();
  titles[0].classList.add("is-active");
  render();
  initScrollTrigger();
  window.addEventListener("resize", onResize);
}
