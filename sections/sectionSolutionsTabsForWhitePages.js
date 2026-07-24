/**
 * Solutions tabs — scroll pin + card transitions (GSAP ScrollTrigger)
 */
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const CONFIG = {
    duration: 0.6,
    ease: "sine.out",
    stagger: 0.1,
    overlap: 0.4,
  };

  const animateSlotMachine = (el, numberStr) => {
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
        const itemH = gsap.getProperty(reel.firstElementChild, "height");
        const targetY = -(parseInt(digit, 10) * itemH);
        gsap.fromTo(
          reel,
          { y: 0 },
          {
            y: targetY,
            duration: gsap.utils.clamp(0.6, 2, 1 + i * 0.2),
            ease: "power3.out",
            force3D: true,
            rotationZ: 0.01,
          },
        );
      });
    });
  };

  const animateCardTransition = (oldCard, newCard, allCards, onDone = null) => {
    if (!oldCard || !newCard || oldCard === newCard) {
      onDone?.();
      return;
    }

    const targets = [
      oldCard,
      newCard,
      ...oldCard.children,
      ...newCard.children,
    ];
    gsap.killTweensOf(targets);

    allCards.forEach((card) => {
      if (card !== oldCard && card !== newCard) {
        card.classList.remove("is-active");
        gsap.set(card, {
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none",
        });
      }
    });

    const selector = gsap.utils.selector(newCard);
    const textEls = [
      ...selector(".solutions_tabs-card-heading-number"),
      ...selector(".solutions_tabs_card_heading"),
      ...selector(".solutions_tabs_card_description"),
      ...selector(".solutions_tabs_card_image-placeholder"),
      ...selector(".badge-holder.is-solutions-tabs"),
    ].filter(Boolean);
    const imageEls = [
      ...selector(".solutions_tabs-phone-img"),
      ...selector(".solutions_tabs_card_bg-img"),
    ].filter(Boolean);

    if (textEls.length) gsap.set(textEls, { opacity: 0, y: 20 });
    if (imageEls.length) gsap.set(imageEls, { opacity: 0 });

    const offset = CONFIG.duration * CONFIG.overlap;
    const tl = gsap.timeline({ onComplete: onDone });

    tl.to(
      oldCard,
      {
        opacity: 0,
        duration: CONFIG.duration * 0.4,
        ease: CONFIG.ease,
        onStart: () => {
          oldCard.style.pointerEvents = "none";
        },
        onComplete: () => {
          oldCard.classList.remove("is-active");
          gsap.set(oldCard, { visibility: "hidden" });
        },
      },
      0,
    )
      .set(newCard, { visibility: "visible", opacity: 0 })
      .to(
        newCard,
        {
          opacity: 1,
          duration: CONFIG.duration * 0.6,
          ease: CONFIG.ease,
          onStart: () => {
            newCard.classList.add("is-active");
            newCard.style.pointerEvents = "auto";
          },
        },
        offset,
      );

    if (textEls.length) {
      tl.to(
        textEls,
        {
          opacity: 1,
          y: 0,
          duration: CONFIG.duration,
          ease: "power2.out",
          stagger: CONFIG.stagger,
          force3D: true,
        },
        offset,
      );
    }

    if (imageEls.length) {
      tl.to(
        imageEls,
        {
          opacity: 1,
          duration: CONFIG.duration,
          ease: CONFIG.ease,
          stagger: CONFIG.stagger,
        },
        "<",
      );
    }
  };

  const setup = () => {
    const buttons = gsap.utils.toArray(".solutions_tabs_button");
    const cards = gsap.utils.toArray(".solutions_tabs_card");
    const sectionWrapper = document.querySelector(".solutions_tabs-section-wr");

    if (!sectionWrapper || !cards.length) {
      console.warn("[ScrollTabs] Required DOM elements not found.");
      return;
    }

    let currentTabIndex = 0;
    let currentStep = 0;
    let scrollTarget = 0;
    let processing = false;
    let sectionPin = null;

    const steps = cards.map((_, idx) => ({
      cardIdx: idx,
      phase: "normal",
    }));

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
      }
    };

    const setTargetForCard = (cardIdx) => {
      const target = Math.max(0, Math.min(cards.length - 1, cardIdx));
      if (target !== scrollTarget) {
        scrollTarget = target;
        processQueue();
      }
    };

    const goToStep = (nextStep, onDone = null) => {
      if (
        nextStep === currentStep ||
        nextStep < 0 ||
        nextStep >= steps.length
      ) {
        onDone?.();
        return;
      }
      currentStep = nextStep;
      switchToTab(steps[nextStep].cardIdx, onDone);
    };

    const switchToTab = (index, onDone = null) => {
      if (index === currentTabIndex) {
        onDone?.();
        return;
      }
      if (index < 0 || index >= cards.length) {
        onDone?.();
        return;
      }

      const prevIndex = currentTabIndex;
      currentTabIndex = index;
      buttons.forEach((btn, i) =>
        btn.classList.toggle("is-active", i === index),
      );
      animateCardTransition(cards[prevIndex], cards[index], cards, onDone);

      const numberEl = cards[index].querySelector("[solutions-text-number]");
      if (numberEl) {
        animateSlotMachine(
          numberEl,
          numberEl.getAttribute("solutions-text-number"),
        );
      }
    };

    cards.forEach((card) => {
      gsap.set(card, {
        visibility: "hidden",
        opacity: 0,
        pointerEvents: "none",
      });
      card.classList.remove("is-active");
    });
    buttons.forEach((btn, i) => btn.classList.toggle("is-active", i === 0));

    const firstCard = cards[0];
    const firstSelector = gsap.utils.selector(firstCard);
    const firstTextEls = [
      ...firstSelector(".solutions_tabs-card-heading-number"),
      ...firstSelector(".solutions_tabs_card_heading"),
      ...firstSelector(".solutions_tabs_card_description"),
      ...firstSelector(".solutions_tabs_card_image-placeholder"),
      ...firstSelector(".badge-holder.is-solutions-tabs"),
    ].filter(Boolean);
    const firstImageEls = [
      ...firstSelector(".solutions_tabs-phone-img"),
      ...firstSelector(".solutions_tabs_card_bg-img"),
    ].filter(Boolean);

    if (firstTextEls.length) gsap.set(firstTextEls, { opacity: 0, y: 20 });
    if (firstImageEls.length) gsap.set(firstImageEls, { opacity: 0 });

    const firstNumberEl = firstCard.querySelector("[solutions-text-number]");

    ScrollTrigger.create({
      trigger: sectionWrapper,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.set(firstCard, { visibility: "visible", opacity: 0 });
        firstCard.classList.add("is-active");
        firstCard.style.pointerEvents = "auto";

        const enterTl = gsap.timeline().to(firstCard, {
          opacity: 1,
          duration: CONFIG.duration * 0.6,
          ease: CONFIG.ease,
        });

        if (firstTextEls.length) {
          enterTl.to(
            firstTextEls,
            {
              opacity: 1,
              y: 0,
              duration: CONFIG.duration,
              ease: "power2.out",
              stagger: CONFIG.stagger,
              force3D: true,
            },
            "<",
          );
        }

        if (firstImageEls.length) {
          enterTl.to(
            firstImageEls,
            {
              opacity: 1,
              duration: CONFIG.duration,
              ease: CONFIG.ease,
              stagger: CONFIG.stagger,
            },
            "<",
          );
        }

        if (firstNumberEl) {
          animateSlotMachine(
            firstNumberEl,
            firstNumberEl.getAttribute("solutions-text-number"),
          );
        }
      },
    });

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (i === currentTabIndex) return;
        setTargetForCard(i);
      });
    });

    // Pin без anticipatePin — иначе ранний fixed и наезд на соседние секции
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1px)", () => {
      sectionPin = ScrollTrigger.create({
        trigger: sectionWrapper,
        start: "top top",
        end: () => `+=${window.innerHeight * Math.max(1, cards.length - 1)}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        refreshPriority: -1,
        onUpdate: (self) => {
          const max = cards.length - 1;
          const card = Math.round(gsap.utils.clamp(0, 1, self.progress) * max);
          if (card !== scrollTarget) setTargetForCard(card);
        },
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        sectionPin?.kill();
        sectionPin = null;
      };
    });
  };

  window.addEventListener("load", setup, { once: true });
});
