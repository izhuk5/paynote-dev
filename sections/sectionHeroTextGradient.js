document.addEventListener("DOMContentLoaded", () => {
  const gradientEls = document.querySelectorAll(".gradient-text-hero");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.style.animationPlayState = entry.isIntersecting
          ? "running"
          : "paused";
      });
    },
    { threshold: 0 },
  );

  gradientEls.forEach((el) => {
    el.style.animationPlayState = "paused";
    observer.observe(el);
  });
});
