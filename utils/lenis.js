document.addEventListener("DOMContentLoaded", () => {
  window.lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.7,
    infinite: false,
    gestureOrientation: "vertical",
    normalizeWheel: false,
    smoothTouch: false,
  });

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  window.lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
});
