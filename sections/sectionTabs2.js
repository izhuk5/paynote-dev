document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".section_tabs2");
  const panes = gsap.utils.toArray(".tabs2_pane.is-slider");

  if (!section || !panes.length) return;

  gsap.set(section, { height: "100vh", overflow: "hidden" });

  let current = 0;
  let activeTl = null;

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
      links: [
        ...sel(".tabs3_link-item"),
        ...sel(".tabs2_link-item"),
      ].filter(Boolean),
      image: [...sel(".tabs3_image")].filter(Boolean),
      icons: [...sel(".tabs3_icon-svg circle")].filter(Boolean),
    };
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
    const { text, links, image, icons } = getEls(panes[index]);
    if (text.length) gsap.set(text, { opacity: 1, y: 0 });
    if (links.length) gsap.set(links, { opacity: 1, y: 0 });
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
  };

  const switchTo = (index) => {
    if (index === current || index < 0 || index >= panes.length) return;

    if (activeTl) activeTl.kill();

    panes.forEach((p, i) => {
      if (i !== current && i !== index)
        gsap.set(p, { display: "none", opacity: 0 });
    });

    const prev = panes[current];
    const next = panes[index];
    const { text, links, image, icons } = getEls(next);
    current = index;

    if (text.length) gsap.set(text, { opacity: 0, y: 16 });
    if (links.length) gsap.set(links, { opacity: 0, y: 16 });
    if (image.length) gsap.set(image, { opacity: 0, scale: 0.97 });
    if (icons.length) setStrokeImportant(icons, "#fefefd");

    activeTl = gsap.timeline();
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

  const mm = gsap.matchMedia();

  // ── Desktop (>991px): wheel-based switching ──────────────────
  mm.add("(min-width: 992px)", () => {
    const pinnedST = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight}`,
      pin: true,
      pinSpacing: true,
    });

    const ANIM_DURATION_MS = 650;
    let wheelCooldown = false;

    const onWheel = (e) => {
      if (!pinnedST.isActive) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      const newIndex = current + dir;

      if (newIndex < 0) return;

      if (newIndex >= panes.length) {
        e.preventDefault();
        window.scrollTo({ top: pinnedST.end, behavior: "instant" });
        ScrollTrigger.update();
        return;
      }

      e.preventDefault();
      if (wheelCooldown) return;
      wheelCooldown = true;
      setTimeout(() => {
        wheelCooldown = false;
      }, ANIM_DURATION_MS);

      switchTo(newIndex);
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      pinnedST.kill();
    };
  });

  // ── Mobile (≤991px): scrub-based switching ───────────────────
  mm.add("(max-width: 991px)", () => {
    const mobileST = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * (panes.length - 1) * 0.8}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const index = Math.min(
          Math.round(self.progress * (panes.length - 1)),
          panes.length - 1,
        );
        if (index !== current) switchTo(index);
      },
    });

    return () => {
      mobileST.kill();
    };
  });
});
