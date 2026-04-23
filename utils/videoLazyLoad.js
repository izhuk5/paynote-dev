document.addEventListener("DOMContentLoaded", () => {
  // Убираем пустые source теги (с пустым src)
  document.querySelectorAll("video source").forEach((source) => {
    if (!source.getAttribute("src")) {
      source.remove();
    }
  });

  const videos = document.querySelectorAll("video");
  if (videos.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.25,
  };

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        if (video.paused) video.play();
      } else {
        if (!video.paused) video.pause();
      }
    });
  };

  const observer = new IntersectionObserver(
    handleIntersection,
    observerOptions,
  );

  videos.forEach((video, index) => {
    if (!video.id) video.id = `video-${index + 1}`;
    if (!video.muted) video.muted = true;
    video.removeAttribute("autoplay");
    observer.observe(video);
    if (!video.paused) video.pause();
  });
});
