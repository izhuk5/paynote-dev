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
  // Исходим из оригинальных номеров в верстке
  const itemNumbers = items.map((item) => {
    const el = item.querySelector("[solutions-text-number]");
    return el ? el.textContent.trim() : "";
  });
  const getItemNumber = (index) => itemNumbers[index];
  let current = 0;
  let locked = false;
  const getEls = (item) => {
    const sel = gsap.utils.selector(item);
    return {
      content: [
        ...sel(".solutions1_paragraph"),
        ...sel(".solutions1_img1"),
      ].filter(Boolean),
      images: [...sel(".solutions1_img3"), ...sel(".solutions1_img2")].filter(
        Boolean,
      ),
    };
  };
  // — Switch to a card by index —
  const switchTo = (next) => {
    if (next === current || next < 0 || next >= items.length) return;
    const prev = current;
    current = next;
    const prevItem = items[prev],
      nextItem = items[next];
    const { content, images } = getEls(nextItem);
    const numEl = nextItem.querySelector("[solutions-text-number]");
    const isSecond = next === 1;
    if (!isSecond) gsap.set(content, { autoAlpha: 0, y: 20 });
    gsap.set(images, { autoAlpha: 0 });
    const tl = gsap
      .timeline()
      .to(prevItem, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
        onStart: () => {
          prevItem.style.pointerEvents = "none";
        },
        onComplete: () => {
          prevItem.classList.remove("is-active");
        },
      })
      .call(() => {
        nextItem.classList.add("is-active");
        nextItem.style.pointerEvents = "auto";
        if (numEl && !isSecond) animateNumber(numEl, getItemNumber(next));
      })
      .set(nextItem, { autoAlpha: 1 });
    if (!isSecond)
      tl.to(
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
    tl.to(
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
  };
  // — Init: hide all items —
  gsap.set(items, { autoAlpha: 0, pointerEvents: "none" });
  items.forEach((it) => it.classList.remove("is-active"));
  const firstItem = items[0];
  const { content: fContent, images: fImages } = getEls(firstItem);
  gsap.set(fContent, { autoAlpha: 0, y: 20 });
  gsap.set(fImages, { autoAlpha: 0 });
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
          gsap
            .timeline()
            .to(fContent, {
              autoAlpha: 1,
              y: 0,
              duration: dur,
              ease: EASE,
              stagger,
            })
            .to(
              fImages,
              { autoAlpha: 1, duration: dur, ease: EASE, stagger },
              "<",
            );
          const numEl = firstItem.querySelector("[solutions-text-number]");
          if (numEl && !reduced) animateNumber(numEl, getItemNumber(0));
        },
      });

      if (!desktopMode) {
        // ── MOBILE: Scroll-progress based (fixes touch event bugs) ──
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * items.length}`,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            let next = Math.floor(self.progress * items.length);
            if (next >= items.length) next = items.length - 1;
            if (next !== current) switchTo(next);
          },
        });
      } else {
        // ── DESKTOP: Wheel event hijacking (snappy feel) ──
        const pin = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          pin: true,
          pinSpacing: true,
        });

        const onWheel = (e) => {
          if (!pin.isActive) return;
          const dir = e.deltaY > 0 ? 1 : -1;
          const next = current + dir;

          if (next < 0) return;
          if (next >= items.length) {
            e.preventDefault();
            window.scrollTo({ top: pin.end, behavior: "instant" });
            ScrollTrigger.update();
            return;
          }

          e.preventDefault();
          if (!locked) {
            locked = true;
            gsap.delayedCall(0.75, () => {
              locked = false;
            });
            switchTo(next);
          }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        // Cleanup listener on breakpoint change
        return () => window.removeEventListener("wheel", onWheel);
      }
    },
  );
});
