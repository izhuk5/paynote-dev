document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector(".section_tabs2");
  const panes = gsap.utils.toArray(".tabs2_pane.is-slider");

  if (!section || !panes.length) return;

  gsap.set(section, { height: "100vh", overflow: "hidden" });

  let current = 0;
  let currentStep = 0;
  let scrollTarget = 0;
  let processing = false;
  let sectionPin = null;
  let activeTl = null;

  const steps = panes.map((_, idx) => ({ cardIdx: idx, phase: "normal" }));

  const setStrokeImportant = (els, color) => {
    els.forEach((el) => el.style.setProperty("stroke", color, "important"));
  };

  const getEls = (pane) => {
    const sel = gsap.utils.selector(pane);
    return {
      text: [
        ...sel(".component_badge"),
        ...sel(".tabs3_heading"),
        ...sel(".tabs2_paragraph"),
        ...sel(".tabs3_how-text"),
      ].filter(Boolean),
      links: [...sel(".tabs3_link-item"), ...sel(".tabs2_link-item")].filter(
        Boolean,
      ),
      linkParagraphs: [...sel(".tabs3_link-paragraph")].filter(Boolean),
      image: [...sel(".tabs3_image")].filter(Boolean),
      icons: [...sel(".tabs3_icon-svg circle")].filter(Boolean),
    };
  };

  const firstStepOfCard = (cardIdx) => cardIdx;
  const lastStepOfCard = (cardIdx) => cardIdx;

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
    const target =
      cardIdx > current ? firstStepOfCard(cardIdx) : lastStepOfCard(cardIdx);
    if (target !== scrollTarget) {
      scrollTarget = target;
      processQueue();
    }
  };

  const goToStep = (nextStep, onDone = null) => {
    if (nextStep === currentStep || nextStep < 0 || nextStep >= steps.length) {
      onDone?.();
      return;
    }
    currentStep = nextStep;
    switchTo(steps[nextStep].cardIdx, onDone);
  };

  const forcePane = (index) => {
    if (activeTl) activeTl.kill();
    panes.forEach((p, i) => {
      gsap.set(
        p,
        i === index
          ? { display: "grid", opacity: 1 }
          : { display: "none", opacity: 0 },
      );
    });
    const { text, links, linkParagraphs, image, icons } = getEls(panes[index]);
    if (text.length) gsap.set(text, { opacity: 1, y: 0 });
    if (links.length) gsap.set(links, { opacity: 1, y: 0 });
    if (linkParagraphs.length) gsap.set(linkParagraphs, { color: "#CDCED3" });
    if (image.length) gsap.set(image, { opacity: 1, scale: 1 });
    if (icons.length) {
      setStrokeImportant(icons, "#fefefd");
      gsap.to(icons, {
        stroke: "#0052FF",
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.05,
        onUpdate: function () {
          this.targets().forEach((el) => {
            if (el.style.stroke)
              el.style.setProperty("stroke", el.style.stroke, "important");
          });
        },
      });
    }
    current = index;
    currentStep = index;
    scrollTarget = index;
  };

  const switchTo = (index, onDone = null) => {
    if (index === current || index < 0 || index >= panes.length) {
      onDone?.();
      return;
    }

    if (activeTl) activeTl.kill();

    panes.forEach((p, i) => {
      if (i !== current && i !== index)
        gsap.set(p, { display: "none", opacity: 0 });
    });

    const prev = panes[current];
    const next = panes[index];
    const { text, links, linkParagraphs, image, icons } = getEls(next);
    current = index;

    if (text.length) gsap.set(text, { opacity: 0, y: 16 });
    if (links.length) gsap.set(links, { opacity: 0, y: 16 });
    if (linkParagraphs.length) gsap.set(linkParagraphs, { color: "#808080" });
    if (image.length) gsap.set(image, { opacity: 0, scale: 0.97 });
    if (icons.length) setStrokeImportant(icons, "#fefefd");

    activeTl = gsap.timeline({ onComplete: onDone });
    activeTl
      .to(prev, {
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(prev, { display: "none" });
          prev.style.willChange = "auto";
        },
      })
      .set(next, { display: "grid", opacity: 0 })
      .to(next, { opacity: 1, duration: 0.2, ease: "power2.out" }, "<0.05");

    if (text.length)
      activeTl.to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.05,
          force3D: true,
        },
        "-=0.1",
      );

    if (links.length)
      activeTl.to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
          force3D: true,
        },
        "-=0.1",
      );

    if (linkParagraphs.length)
      activeTl.to(
        linkParagraphs,
        {
          color: "#CDCED3",
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.3",
      );

    if (icons.length)
      activeTl.to(
        icons,
        {
          stroke: "#0052FF",
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.08,
          onUpdate: function () {
            this.targets().forEach((el) => {
              if (el.style.stroke)
                el.style.setProperty("stroke", el.style.stroke, "important");
            });
          },
        },
        "<",
      );

    if (image.length)
      activeTl.to(
        image,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        "<",
      );

    activeTl.call(() => {
      next.style.willChange = "auto";
    });
  };

  forcePane(0);

  // — Pin: 1vh на слайд, переключение из progress + очередь без пропусков —
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1px)", () => {
    sectionPin = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * panes.length}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const card = Math.min(
          panes.length - 1,
          Math.max(0, Math.floor(self.progress * panes.length)),
        );
        if (card !== current) setTargetForCard(card);
      },
    });

    return () => {
      sectionPin?.kill();
      sectionPin = null;
    };
  });
});
