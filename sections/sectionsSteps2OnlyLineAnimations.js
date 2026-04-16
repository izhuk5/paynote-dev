document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // ==========================================
  // SVG PATH ANIMATIONS
  // ==========================================
  const leftPath = document.querySelector(
    ".solutions_horizontal-line.left path",
  );
  const rightPath = document.querySelector(
    ".solutions_horizontal-line.right path",
  );
  const verticalPath = document.querySelector(".solutions_vertical-line path");
  const pLogo = document.querySelector(".solutions_p-logo");
  const highlightButton =
    document.querySelector(".button_higlight.is-steps2") ||
    document.querySelector(".button_higlight");
  const solutionsTabsSection = document.querySelector(".solutions_tabs");
  const verticalLineSVG = document.querySelector(".solutions_vertical-line");

  if (!verticalPath) return;

  const getLogoDistance = () => verticalLineSVG.getBoundingClientRect().height;

  const verticalPathLength = verticalPath.getTotalLength();

  gsap.set(verticalPath, {
    strokeDasharray: verticalPathLength,
    strokeDashoffset: verticalPathLength,
    opacity: 0,
  });

  if (pLogo) gsap.set(pLogo, { scale: 0.3, y: 0, yPercent: -70 });
  if (highlightButton)
    gsap.set(highlightButton, { opacity: 0, scale: 0.8, y: 20 });
  if (solutionsTabsSection) gsap.set(solutionsTabsSection, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".solutions_gradient-wrapper",
      start: "top 60%",
      end: "top 20%",
      scrub: 1,
    },
  });

  // Horizontal lines (desktop only)
  const mmHorizontal = gsap.matchMedia();
  mmHorizontal.add("(min-width: 992px)", () => {
    if (!leftPath || !rightPath) return;
    const leftPathLength = leftPath.getTotalLength();
    const rightPathLength = rightPath.getTotalLength();
    gsap.set(leftPath, {
      strokeDasharray: leftPathLength,
      strokeDashoffset: leftPathLength,
    });
    gsap.set(rightPath, {
      strokeDasharray: rightPathLength,
      strokeDashoffset: rightPathLength,
    });
    tl.to(
      [leftPath, rightPath],
      { strokeDashoffset: 0, duration: 0.21, ease: "none" },
      0,
    );
  });

  // Vertical line + p-logo
  tl.to(verticalPath, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0)
    .to(verticalPath, { opacity: 1, duration: 0.5, ease: "none" }, 0)
    .to(pLogo, { scale: 1, duration: 0.5, ease: "none" }, 0)
    .to(pLogo, { scale: 0.3, duration: 0.5, ease: "none" }, 0.5);

  // p-logo movement
  tl.to(
    pLogo,
    { y: () => getLogoDistance() + 25, duration: 1, ease: "none" },
    0,
  );

  // Highlight button
  if (highlightButton) {
    gsap.to(highlightButton, {
      opacity: 1,
      scale: 1,
      y: 0,
      scrollTrigger: {
        trigger: ".solutions_gradient-wrapper",
        start: "top 35%",
        end: "top 15%",
        scrub: 1,
      },
    });
  }

  // Solutions tabs section fade-in
  if (solutionsTabsSection) {
    gsap.to(solutionsTabsSection, {
      opacity: 1,
      scrollTrigger: {
        trigger: highlightButton,
        start: "bottom 50%",
        end: "bottom 30%",
        scrub: 1,
      },
    });
  }

  // Text span gradient reveal
  const textSpan3 = document.querySelector(".text-span-3");
  if (textSpan3) {
    gsap.fromTo(
      textSpan3,
      { clipPath: "inset(0 100% 0 0)", opacity: 0, y: 30 },
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: textSpan3,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      },
    );
  }
});
