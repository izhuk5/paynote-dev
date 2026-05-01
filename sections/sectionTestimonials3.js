document.addEventListener("DOMContentLoaded", () => {
  const TABS_DURATION = {
    out: 0.2,
    in: 0.3,
  };

  const links = [...document.querySelectorAll(".testimonials3_tab-link")];
  const panes = [...document.querySelectorAll(".testimonials3_tab-pane")];

  if (!links.length || !panes.length) return;

  gsap.set(panes, { display: "none", autoAlpha: 0 });
  gsap.set(panes[0], { display: "block", autoAlpha: 1 });
  links[0].classList.add("is-active");

  const firstItems = panes[0].querySelectorAll(
    ".testimonials3_heading-2, .testimonials3_link-btn",
  );
  gsap.fromTo(
    firstItems,
    { autoAlpha: 0, y: 12 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.1,
    },
  );

  let activeIndex = 0;
  let isAnimating = false;

  const switchTab = (nextIndex) => {
    if (nextIndex === activeIndex || isAnimating) return;

    isAnimating = true;

    const prevPane = panes[activeIndex];
    const nextPane = panes[nextIndex];
    const nextItems = nextPane.querySelectorAll(
      ".testimonials3_heading-2, .testimonials3_link-btn",
    );

    links[activeIndex].classList.remove("is-active");
    links[nextIndex].classList.add("is-active");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        isAnimating = false;
      },
    });

    tl.to(prevPane, { autoAlpha: 0, y: -8, duration: TABS_DURATION.out })
      .call(() => {
        gsap.set(prevPane, { display: "none", clearProps: "y" });
        gsap.set(nextPane, { display: "block" });
      })
      .fromTo(
        nextPane,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: TABS_DURATION.in },
      )
      .fromTo(
        nextItems,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.12,
        },
        "<0.1",
      );

    activeIndex = nextIndex;
  };

  links.forEach((link, i) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(i);
    });
  });
});
