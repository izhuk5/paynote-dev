document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  const section = document.querySelector(".section_features4");
  if (!section) return;

  const badge = section.querySelector(".component_badge");
  const heading = section.querySelector(".features4_heading");
  const list = section.querySelector(".features4_list");
  const video = section.querySelector(".features4_background-video");
  const items = section.querySelectorAll(".features4_item");
  const mm = gsap.matchMedia();
  /** Десктоп: один колбэк после `ended` — сначала ревил, потом скрытие видео */
  let videoEndedRevealDesktop = null;

  if (video) {
    video.removeAttribute("loop");
    gsap.set(video, { autoAlpha: 0 });
    video.addEventListener(
      "ended",
      () => {
        videoEndedRevealDesktop?.();
        videoEndedRevealDesktop = null;
        video.style.display = "none";
      },
      { once: true },
    );
  }

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([badge, heading], { autoAlpha: 1, y: 0 });
    gsap.set(items, {
      flexGrow: 1,
      autoAlpha: 1,
      y: 0,
    });
    items.forEach((item) => {
      const label = item.querySelector(".features4_item-label");
      if (label) {
        gsap.set(label, {
          autoAlpha: 0,
          maxWidth: 0,
          paddingLeft: 0,
        });
      }
    });
    if (list) gsap.set(list, { zIndex: 10 });
    if (video) {
      gsap.set(video, { autoAlpha: 0 });
      video.style.display = "none";
    }
    videoEndedRevealDesktop = null;
    return () => {};
  });

  // ─── MOBILE (≤767px) ─────────────────────────────────────────
  mm.add(
    "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
    () => {
      gsap.set([badge, heading], {
        autoAlpha: 0,
        y: 24,
        willChange: "opacity, transform",
      });
      gsap.set(items, {
        flexGrow: 1,
        autoAlpha: 0,
        y: 16,
        willChange: "opacity, transform",
      });
      items.forEach((item) => {
        const label = item.querySelector(".features4_item-label");
        gsap.set(label, {
          autoAlpha: 0,
          maxWidth: 0,
          paddingLeft: 0,
        });
      });
      const revealMobile = () => {
        gsap.to(badge, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });
        gsap.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.1,
        });
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.2,
          onComplete: () => {
            gsap.set([badge, heading, ...items], {
              willChange: "auto",
            });
          },
        });
      };
      let stMobile;
      requestAnimationFrame(() => {
        stMobile = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          once: true,
          onEnter: revealMobile,
        });
      });
      return () => {
        stMobile?.kill();
        gsap.killTweensOf([badge, heading, ...items]);
      };
    },
  );
  // ─── TABLET (768px–991px) ────────────────────────────────────
  mm.add(
    "(prefers-reduced-motion: no-preference) and (min-width: 768px) and (max-width: 991px)",
    () => {
      gsap.set([badge, heading], {
        autoAlpha: 0,
        y: 32,
        willChange: "opacity, transform",
      });
      gsap.set(items, {
        flexGrow: 1,
        autoAlpha: 0,
        y: 24,
        willChange: "opacity, transform",
      });
      items.forEach((item) => {
        const label = item.querySelector(".features4_item-label");
        gsap.set(label, {
          autoAlpha: 0,
          maxWidth: 0,
          paddingLeft: 0,
        });
      });
      const revealTablet = () => {
        gsap.to(badge, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        });
        gsap.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.12,
        });
        if (list) gsap.set(list, { zIndex: 10 });
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          onComplete: () =>
            gsap.set([badge, heading, ...items], {
              willChange: "auto",
            }),
        });
      };
      let stTablet;
      requestAnimationFrame(() => {
        stTablet = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          once: true,
          onEnter: revealTablet,
        });
      });
      return () => {
        stTablet?.kill();
        gsap.killTweensOf([badge, heading, ...items]);
        if (list) gsap.set(list, { clearProps: "zIndex" });
      };
    },
  );
  // ─── DESKTOP (≥992px) + видео play (один matchMedia) ───────
  mm.add(
    "(prefers-reduced-motion: no-preference) and (min-width: 992px)",
    () => {
      gsap.set([badge, heading], {
        autoAlpha: 0,
        y: 32,
        willChange: "opacity, transform",
      });
      gsap.set(items, {
        flexGrow: 1,
        autoAlpha: 0,
        y: 24,
        willChange: "opacity, transform",
      });
      items.forEach((item) => {
        const label = item.querySelector(".features4_item-label");
        gsap.set(label, {
          autoAlpha: 0,
          maxWidth: 0,
          paddingLeft: 0,
        });
      });
      const hoverController = new AbortController();
      let desktopRevealed = false;
      const revealDesktop = () => {
        if (desktopRevealed) return;
        desktopRevealed = true;
        gsap.to(badge, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        });
        gsap.to(heading, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.12,
        });
        if (list) gsap.set(list, { zIndex: 10 });
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          onComplete: () =>
            gsap.set([badge, heading, ...items], {
              willChange: "auto",
            }),
        });
        items.forEach((item) => {
          item.addEventListener("mouseenter", () => onEnter(item), {
            signal: hoverController.signal,
          });
          item.addEventListener("mouseleave", () => onLeave(item), {
            signal: hoverController.signal,
          });
        });
      };

      videoEndedRevealDesktop = revealDesktop;

      let stVideoPlay;
      let stDesktopNoVideo;
      requestAnimationFrame(() => {
        if (video) {
          stVideoPlay = ScrollTrigger.create({
            trigger: section,
            start: "top center",
            once: true,
            onEnter: () => {
              video
                .play()
                .then(() => {
                  gsap.to(video, {
                    autoAlpha: 1,
                    duration: 0.6,
                    ease: "power2.out",
                  });
                })
                .catch(() => {
                  video.style.display = "none";
                  video.dispatchEvent(new Event("ended"));
                });
            },
          });
        } else {
          stDesktopNoVideo = ScrollTrigger.create({
            trigger: section,
            start: "top center",
            once: true,
            onEnter: revealDesktop,
          });
        }
      });

      return () => {
        stVideoPlay?.kill();
        stDesktopNoVideo?.kill();
        videoEndedRevealDesktop = null;
        hoverController.abort();
        gsap.killTweensOf([badge, heading, ...items]);
        if (list) gsap.set(list, { clearProps: "zIndex" });
      };
    },
  );
  // ─── Hover In (desktop) ──────────────────────────────────────
  function onEnter(item) {
    const label = item.querySelector(".features4_item-label");
    gsap.killTweensOf([item, label]);
    item.classList.add("features4_item--hover");
    gsap.to(item, {
      flexGrow: 5,
      borderRadius: "20px",
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0.25)",
      duration: 0.5,
      ease: "expo.out",
    });
    gsap.to(label, {
      maxWidth: "320px",
      paddingLeft: "24px",
      autoAlpha: 1,
      duration: 0.5,
      ease: "expo.out",
    });
    items.forEach((other) => {
      const icon = other.querySelector(".features4_item-icon");
      if (!icon) return;
      gsap.killTweensOf(icon);
      gsap.to(icon, {
        opacity: other === item ? 1 : 0.4,
        maxWidth: other === item ? "2rem" : "3rem",
        duration: 0.5,
        ease: "expo.out",
      });
    });
  }
  // ─── Hover Out (desktop) ─────────────────────────────────────
  function onLeave(item) {
    const label = item.querySelector(".features4_item-label");
    gsap.killTweensOf([item, label]);
    item.classList.remove("features4_item--hover");
    gsap.to(item, {
      flexGrow: 1,
      borderRadius: "33px",
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0)",
      duration: 0.9,
      ease: "expo.inOut",
    });
    gsap
      .timeline()
      .to(
        label,
        {
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.in",
        },
        0,
      )
      .to(
        label,
        {
          maxWidth: 0,
          paddingLeft: 0,
          duration: 0.9,
          ease: "expo.inOut",
        },
        0,
      );
    items.forEach((other) => {
      const icon = other.querySelector(".features4_item-icon");
      if (!icon) return;
      gsap.killTweensOf(icon);
      gsap.to(icon, {
        opacity: 1,
        maxWidth: "3rem",
        duration: 0.5,
        ease: "power2.out",
      });
    });
  }
});
