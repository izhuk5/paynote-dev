document
  .querySelectorAll(".section_solutions1 .solutions1_item video")
  .forEach((v) => v.setAttribute("lazy-target-off", ""));

document.addEventListener("DOMContentLoaded", () => {
  // ── Inject CSS — Designer не видит JS, стили применяются только в браузере ──
  const style = document.createElement("style");
  style.textContent = `
    .section_solutions1 { height: 100vh; }
    .section_solutions1 .solutions1_tabs,
    .section_solutions1 .padding-global,
    .section_solutions1 .solutions1_container { height: 100%; }
    .section_solutions1 .solutions1_container { position: relative; }
    .section_solutions1 .solutions1_item {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .section_solutions1 .solutions1_item.is-active { z-index: 10; pointer-events: auto; }
    .section_solutions1 .solutions1_number { font-size: 3rem; line-height: 1.24; height: 1.24em; overflow: hidden; clip-path: inset(0); }
    .section_solutions1 .solutions1_number .slot-wrapper { display: flex; flex-direction: row; height: 100%; }
    .section_solutions1 .solutions1_number .slot-digit { height: 100%; overflow: hidden; }
    .section_solutions1 .slot-reel { display: flex; flex-direction: column; will-change: transform; }
    .section_solutions1 .slot-num { height: 1.24em; flex-shrink: 0; }
    .section_solutions1 .solutions1_paragraph,
    .section_solutions1 .solutions1_img1,
    .section_solutions1 .solutions1_img2,
    .section_solutions1 .solutions1_img3 { will-change: transform, opacity; }
    @media screen and (max-width: 479px) {
      .section_solutions1 .solutions1_number { font-size: 2.5rem; }
    }
  `;
  document.head.appendChild(style);

  const DURATION = 0.55,
    EASE = "power2.out",
    STAGGER = 0.08;
  const safeSet = (targets, props) => {
    if (targets && targets.length) gsap.set(targets, props);
  };
  const safeTo = (tl, targets, props, pos) => {
    if (targets && targets.length) tl.to(targets, props, pos);
  };

  // ── Slot Number — yPercent, без layout read ───────────────────
  const animateNumber = (el, numberStr) => {
    if (!el || !numberStr) return;
    el.replaceChildren();
    const digits = String(numberStr)
      .split("")
      .filter((ch) => /\d/.test(ch));
    if (!digits.length) return;
    const wrapper = document.createElement("div");
    wrapper.className = "slot-wrapper";
    const reels = [];
    digits.forEach((digit, i) => {
      const digitDiv = document.createElement("div");
      digitDiv.className = "slot-digit";
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      for (let n = 0; n < 10; n++) {
        const item = document.createElement("div");
        item.className = "slot-num";
        item.textContent = n;
        reel.appendChild(item);
      }
      digitDiv.appendChild(reel);
      wrapper.appendChild(digitDiv);
      reels.push({ reel, digit: parseInt(digit, 10), i });
    });
    el.appendChild(wrapper);
    reels.forEach(({ reel, digit, i }) => {
      gsap.fromTo(
        reel,
        { yPercent: 0, force3D: true },
        {
          yPercent: -digit * 10,
          duration: gsap.utils.clamp(0.6, 2, 1 + i * 0.2),
          ease: "power3.out",
          overwrite: true,
        },
      );
    });
  };

  gsap.registerPlugin(ScrollTrigger);
  const section = document.querySelector(".section_solutions1");
  const items = gsap.utils.toArray(".section_solutions1 .solutions1_item");
  if (!section || !items.length) return;

  const itemVideos = items.map((item) => item.querySelector("video"));
  let sectionInView = false;

  new IntersectionObserver(
    ([entry]) => {
      sectionInView = entry.isIntersecting;
      syncVideos();
    },
    { threshold: 0 },
  ).observe(section);

  function syncVideos() {
    itemVideos.forEach((video, i) => {
      if (!video) return;
      if (i === currentCard && sectionInView) {
        if (video.paused) video.play().catch(() => {});
      } else {
        if (!video.paused) video.pause();
      }
    });
  }

  const itemNumbers = items.map((item) => {
    const el = item.querySelector("[solutions-text-number]");
    return el ? el.textContent.trim() : "";
  });
  const getItemNumber = (index) => itemNumbers[index];

  let scrollTarget = 0;
  let processing = false;
  let sectionPin = null;
  let scrollNavMode = "scroll";
  let syncScrollRaf = 0;

  const scrollPinToCard = (cardIdx) => {
    if (!sectionPin) return;
    const range = sectionPin.end - sectionPin.start;
    if (range <= 0) return;
    const progress = items.length > 1 ? cardIdx / (items.length - 1) : 0;
    sectionPin.scroll(sectionPin.start + progress * range);
  };

  const syncPinScroll = () => {
    if (!sectionPin || scrollNavMode !== "wheel") return;
    cancelAnimationFrame(syncScrollRaf);
    syncScrollRaf = requestAnimationFrame(() => {
      scrollPinToCard(currentCard);
    });
  };

  const processQueue = () => {
    if (processing) return;
    if (currentStep < scrollTarget) {
      processing = true;
      goToStep(currentStep + 1, () => {
        processing = false;
        processQueue();
      });
    } else if (currentStep > scrollTarget) {
      processing = true;
      goToStep(currentStep - 1, () => {
        processing = false;
        processQueue();
      });
    } else {
      syncPinScroll();
    }
  };

  const elsCache = new WeakMap();
  const getEls = (item) => {
    if (elsCache.has(item)) return elsCache.get(item);
    const sel = gsap.utils.selector(item);
    const els = {
      content: sel(".solutions1_paragraph").filter(Boolean),
      imgsVisible: [
        ...sel(".solutions1_img1:not(.is-hide)"),
        ...sel(".solutions1_img3:not(.is-hide)"),
      ].filter(Boolean),
      imgsHidden: [
        ...sel(".solutions1_img1.is-hide"),
        ...sel(".solutions1_img3.is-hide"),
      ].filter(Boolean),
      images: sel(".solutions1_img2").filter(Boolean),
    };
    elsCache.set(item, els);
    return els;
  };

  // Flat steps: each card has 'normal', and 'swapped' if it has .is-hide images
  const steps = [];
  items.forEach((item, idx) => {
    const { imgsHidden } = getEls(item);
    steps.push({ cardIdx: idx, phase: "normal" });
    if (imgsHidden.length) steps.push({ cardIdx: idx, phase: "swapped" });
  });

  let currentStep = 0;
  let currentCard = 0;

  const firstStepOfCard = (cardIdx) =>
    steps.findIndex((s) => s.cardIdx === cardIdx && s.phase === "normal");
  const lastStepOfCard = (cardIdx) => {
    let last = firstStepOfCard(cardIdx);
    steps.forEach((s, i) => {
      if (s.cardIdx === cardIdx) last = i;
    });
    return last;
  };

  const setTargetForCard = (cardIdx) => {
    const target =
      cardIdx > currentCard
        ? firstStepOfCard(cardIdx)
        : lastStepOfCard(cardIdx);
    if (target !== scrollTarget) {
      scrollTarget = target;
      processQueue();
    }
  };

  const navigateCard = (dir) => {
    const nextCard = currentCard + dir;
    if (nextCard < 0) return false;
    if (nextCard >= items.length) {
      if (currentCard === items.length - 1 && !processing && sectionPin) {
        sectionPin.scroll(sectionPin.end);
      }
      return false;
    }
    scrollTarget =
      dir > 0 ? firstStepOfCard(nextCard) : lastStepOfCard(nextCard);
    processQueue();
    return true;
  };

  // — Navigate to a step —
  const goToStep = (nextStep, onDone = null) => {
    if (nextStep === currentStep || nextStep < 0 || nextStep >= steps.length) {
      if (onDone) onDone();
      return;
    }
    const prevStep = currentStep;
    currentStep = nextStep;
    const { cardIdx: nextCard, phase: nextPhase } = steps[nextStep];
    const { cardIdx: prevCard } = steps[prevStep];

    if (nextCard !== prevCard) {
      // ── Card switch ──
      currentCard = nextCard;
      syncVideos();
      const prevItem = items[prevCard];
      const nextItem = items[nextCard];
      const { content, imgsVisible, imgsHidden, images } = getEls(nextItem);
      const numEl = nextItem.querySelector("[solutions-text-number]");

      safeSet(content, { autoAlpha: 0, y: 20 });
      safeSet(imgsVisible, { autoAlpha: 0 });
      safeSet(imgsHidden, { autoAlpha: 0 });
      safeSet(images, { autoAlpha: 0 });

      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(prevItem, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          prevItem.classList.remove("is-active");
          gsap.set(prevItem, {
            pointerEvents: "none",
            clearProps: "transform",
          });
        },
      });
      tl.call(() => {
        nextItem.classList.add("is-active");
        gsap.set(nextItem, { pointerEvents: "auto" });
        if (numEl) animateNumber(numEl, getItemNumber(nextCard));
      });
      tl.set(nextItem, { autoAlpha: 1, force3D: true });
      safeTo(
        tl,
        content,
        {
          autoAlpha: 1,
          y: 0,
          duration: DURATION,
          ease: EASE,
          stagger: STAGGER,
          overwrite: "auto",
        },
        "<",
      );
      safeTo(
        tl,
        imgsVisible,
        {
          autoAlpha: 1,
          duration: DURATION,
          ease: EASE,
          stagger: STAGGER,
          overwrite: "auto",
        },
        "<",
      );
      safeTo(
        tl,
        images,
        {
          autoAlpha: 1,
          duration: DURATION,
          ease: EASE,
          stagger: STAGGER,
          overwrite: "auto",
        },
        "<",
      );
    } else {
      // ── Same card, phase change ──
      const item = items[nextCard];
      const { imgsVisible, imgsHidden } = getEls(item);
      if (nextPhase === "swapped") {
        const tl2 = gsap.timeline({ onComplete: onDone });
        safeTo(tl2, imgsVisible, {
          autoAlpha: 0,
          duration: DURATION,
          ease: EASE,
          overwrite: "auto",
        });
        safeTo(
          tl2,
          imgsHidden,
          {
            autoAlpha: 1,
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            overwrite: "auto",
          },
          "<",
        );
      } else {
        const tl2 = gsap.timeline({ onComplete: onDone });
        safeTo(tl2, imgsHidden, {
          autoAlpha: 0,
          duration: DURATION,
          ease: EASE,
          overwrite: "auto",
        });
        safeTo(
          tl2,
          imgsVisible,
          {
            autoAlpha: 1,
            duration: DURATION,
            ease: EASE,
            stagger: STAGGER,
            overwrite: "auto",
          },
          "<",
        );
      }
    }
  };

  // — Init: hide all items (autoAlpha, без CSS opacity) —
  gsap.set(items, { autoAlpha: 0, pointerEvents: "none", force3D: true });
  items.forEach((it) => it.classList.remove("is-active"));
  const firstItem = items[0];
  const {
    content: fContent,
    imgsVisible: fImgsVisible,
    imgsHidden: fImgsHidden,
    images: fImages,
  } = getEls(firstItem);
  safeSet(fContent, { autoAlpha: 0, y: 20 });
  safeSet(fImgsVisible, { autoAlpha: 0 });
  safeSet(fImgsHidden, { autoAlpha: 0 });
  safeSet(fImages, { autoAlpha: 0 });

  // — gsap.matchMedia: Responsive & reduced-motion ────────
  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: "(min-width: 992px)",
      isMobile: "(max-width: 991px)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (ctx) => {
      const { isDesktop, isMobile, reduced } = ctx.conditions;
      const desktopMode = isDesktop !== false && !isMobile;
      scrollNavMode = desktopMode ? "wheel" : "scroll";
      const dur = reduced ? 0 : DURATION;
      const stagger = reduced ? 0 : STAGGER;

      // — Reveal first item when section enters viewport —
      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.set(firstItem, {
            autoAlpha: 1,
            pointerEvents: "auto",
            force3D: true,
          });
          firstItem.classList.add("is-active");
          const revealTl = gsap.timeline();
          safeTo(revealTl, fContent, {
            autoAlpha: 1,
            y: 0,
            duration: dur,
            ease: EASE,
            stagger,
          });
          safeTo(
            revealTl,
            fImgsVisible,
            { autoAlpha: 1, duration: dur, ease: EASE, stagger },
            "<",
          );
          safeTo(
            revealTl,
            fImages,
            { autoAlpha: 1, duration: dur, ease: EASE, stagger },
            "<",
          );
          const numEl = firstItem.querySelector("[solutions-text-number]");
          if (numEl && !reduced) animateNumber(numEl, getItemNumber(0));
        },
      });

      // ── Pin + scroll: одна логика для mobile и desktop ──
      sectionPin = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * items.length}`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          if (scrollNavMode === "wheel" || processing) return;
          const card = Math.min(
            items.length - 1,
            Math.max(0, Math.floor(self.progress * items.length)),
          );
          if (card !== currentCard) setTargetForCard(card);
        },
      });

      let wheelAccum = 0;
      const WHEEL_THRESHOLD = 400;
      const onWheel = (e) => {
        if (!desktopMode || !sectionPin?.isActive) return;
        const delta =
          e.deltaMode === 1
            ? e.deltaY * 30
            : e.deltaMode === 2
              ? e.deltaY * 300
              : e.deltaY;
        const dir = delta > 0 ? 1 : -1;
        if (wheelAccum !== 0 && Math.sign(wheelAccum) !== dir) wheelAccum = 0;
        wheelAccum += delta;
        if (currentCard + dir < 0) {
          wheelAccum = 0;
          return;
        }
        e.preventDefault();
        if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
        wheelAccum = 0;
        navigateCard(dir);
      };

      if (desktopMode) {
        window.addEventListener("wheel", onWheel, { passive: false });
      }

      return () => {
        if (desktopMode) window.removeEventListener("wheel", onWheel);
        cancelAnimationFrame(syncScrollRaf);
        sectionPin?.kill();
        sectionPin = null;
        scrollNavMode = "scroll";
      };
    },
  );
});
