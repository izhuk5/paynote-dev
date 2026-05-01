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
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .section_solutions1 .solutions1_item.is-active {
      z-index: 10;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
    .section_solutions1 .solutions1_number { font-size: 3rem; line-height: 1.24; height: 1.24em; overflow: hidden; clip-path: inset(0); }
    .section_solutions1 .solutions1_number .slot-wrapper { display: flex; flex-direction: row; height: 100%; }
    .section_solutions1 .solutions1_number .slot-digit { height: 100%; overflow: hidden; }
    .section_solutions1 .slot-reel { transform-style: flat; will-change: auto; backface-visibility: visible; }
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

  // ── Slot Number — чистая 2D анімація ─────────────────────────
  const animateNumber = (el, numberStr) => {
    if (!el || !numberStr) return;
    el.innerHTML = "";
    const digits = String(numberStr)
      .split("")
      .filter((ch) => /\d/.test(ch));
    if (!digits.length) return;
    const wrapper = document.createElement("div");
    wrapper.className = "slot-wrapper";
    el.appendChild(wrapper);
    digits.forEach((digit, i) => {
      const digitDiv = document.createElement("div");
      digitDiv.className = "slot-digit";
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      Array.from({ length: 10 }, (_, n) => {
        const item = document.createElement("div");
        item.className = "slot-num";
        item.textContent = n;
        reel.appendChild(item);
      });
      digitDiv.appendChild(reel);
      wrapper.appendChild(digitDiv);
      gsap.delayedCall(0, () => {
        const itemH = reel.firstElementChild.getBoundingClientRect().height;
        const targetY = -(parseInt(digit, 10) * itemH);
        gsap.fromTo(
          reel,
          { y: 0 },
          {
            y: targetY,
            duration: gsap.utils.clamp(0.6, 2, 1 + i * 0.2),
            ease: "power3.out",
            overwrite: true,
          },
        );
      });
    });
  };

  gsap.registerPlugin(ScrollTrigger);
  const section = document.querySelector(".section_solutions1");
  const items = gsap.utils.toArray(".section_solutions1 .solutions1_item");
  if (!section || !items.length) return;

  const itemNumbers = items.map((item) => {
    const el = item.querySelector("[solutions-text-number]");
    return el ? el.textContent.trim() : "";
  });
  const getItemNumber = (index) => itemNumbers[index];

  let pending = 0;
  let processing = false;

  const getEls = (item) => {
    const sel = gsap.utils.selector(item);
    return {
      content: sel(".solutions1_paragraph").filter(Boolean),
      videos: sel(".solutions1_tabs-video").filter(Boolean),
    };
  };

  const steps = [];
  items.forEach((item, idx) => {
    steps.push({ cardIdx: idx, phase: "normal" });
  });

  let currentStep = 0;
  let currentCard = 0;

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
      const prevItem = items[prevCard];
      const nextItem = items[nextCard];
      const { content, videos } = getEls(nextItem);
      const numEl = nextItem.querySelector("[solutions-text-number]");

      safeSet(content, { autoAlpha: 0, y: 20 });
      safeSet(videos, { autoAlpha: 0 });

      const tl = gsap.timeline({ onComplete: onDone });
      tl.to(prevItem, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
        onStart: () => {
          prevItem.style.pointerEvents = "none";
          prevItem.querySelectorAll("video").forEach((v) => v.pause());
        },
        onComplete: () => {
          prevItem.classList.remove("is-active");
        },
      });
      tl.call(() => {
        nextItem.classList.add("is-active");
        nextItem.style.pointerEvents = "auto";
        nextItem
          .querySelectorAll("video")
          .forEach((v) => v.play().catch(() => {}));
        if (numEl) animateNumber(numEl, getItemNumber(nextCard));
      });
      tl.set(nextItem, { autoAlpha: 1 });
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
        videos,
        {
          autoAlpha: 1,
          duration: DURATION,
          ease: EASE,
          overwrite: "auto",
        },
        "<",
      );
    }
  };

  // — Exclude section videos from global lazy observer, pause all —
  section.querySelectorAll("video").forEach((v) => {
    v.setAttribute("lazy-target-off", "");
    v.pause();
    v.currentTime = 0;
  });

  // — Init: hide all items —
  gsap.set(items, { autoAlpha: 0, pointerEvents: "none" });
  items.forEach((it) => it.classList.remove("is-active"));
  const firstItem = items[0];
  const { content: fContent, videos: fVideos } = getEls(firstItem);
  safeSet(fContent, { autoAlpha: 0, y: 20 });
  safeSet(fVideos, { autoAlpha: 0 });

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
      const dur = reduced ? 0 : DURATION;
      const stagger = reduced ? 0 : STAGGER;

      // — Reveal first item when section enters viewport —
      ScrollTrigger.create({
        trigger: section,
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.set(firstItem, { autoAlpha: 1 });
          firstItem.classList.add("is-active");
          firstItem.style.pointerEvents = "auto";
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
            fVideos,
            { autoAlpha: 1, duration: dur, ease: EASE },
            "<",
          );
          firstItem
            .querySelectorAll("video")
            .forEach((v) => v.play().catch(() => {}));
          const numEl = firstItem.querySelector("[solutions-text-number]");
          if (numEl && !reduced) animateNumber(numEl, getItemNumber(0));
        },
      });

      if (!desktopMode) {
        // ── MOBILE: Scroll-progress based ──
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * steps.length}`,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            let next = Math.floor(self.progress * steps.length);
            if (next >= steps.length) next = steps.length - 1;
            if (next !== currentStep) goToStep(next);
          },
        });
      } else {
        // ── DESKTOP: Wheel event hijacking ──
        const pin = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          pin: true,
          pinSpacing: true,
        });
        const processNext = () => {
          if (pending === 0) {
            processing = false;
            return;
          }
          const dir = Math.sign(pending);
          pending -= dir;
          processing = true;
          goToStep(currentStep + dir, processNext);
        };
        let wheelAccum = 0;
        const WHEEL_THRESHOLD = 200;
        const onWheel = (e) => {
          if (!pin.isActive) return;
          const delta =
            e.deltaMode === 1
              ? e.deltaY * 30
              : e.deltaMode === 2
                ? e.deltaY * 300
                : e.deltaY;
          const dir = delta > 0 ? 1 : -1;
          if (wheelAccum !== 0 && Math.sign(wheelAccum) !== dir) wheelAccum = 0;
          wheelAccum += delta;
          const futureStep = currentStep + pending + dir;
          if (futureStep < 0) {
            wheelAccum = 0;
            return;
          }
          e.preventDefault();
          if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
          wheelAccum = 0;
          if (futureStep >= steps.length) {
            if (
              currentStep === steps.length - 1 &&
              !processing &&
              pending === 0
            ) {
              window.scrollTo({ top: pin.end, behavior: "instant" });
              ScrollTrigger.update();
            }
            return;
          }
          pending += dir;
          if (!processing) processNext();
        };
        window.addEventListener("wheel", onWheel, { passive: false });
        return () => window.removeEventListener("wheel", onWheel);
      }
    },
  );
});
