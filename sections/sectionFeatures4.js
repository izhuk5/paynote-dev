document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  const section = document.querySelector(".section_features4");
  const badge = section.querySelector(".component_badge");
  const heading = section.querySelector(".features4_heading");
  const list = section.querySelector(".features4_list");
  const video = section.querySelector(".features4_background-video");
  const items = section.querySelectorAll(".features4_item");
  const mm = gsap.matchMedia();

  // ─── VIDEO PLAY-ONCE LOGIC ───────────────────────────────────
  if (video) {
    video.removeAttribute("loop");
    video.addEventListener("ended", () => {
      video.style.display = "none";
    }, { once: true });
  }

  // ─── MOBILE (≤479px) ─────────────────────────────────────────
  mm.add("(max-width: 767px)", () => {
    gsap.set([badge, heading], { opacity: 0, y: 24 });
    gsap.set(items, { flexGrow: 1, opacity: 0, y: 16 });
    items.forEach((item) => {
      const label = item.querySelector(".features4_item-label");
      gsap.set(label, { opacity: 0, maxWidth: 0, paddingLeft: 0 });
    });
    gsap.set(list, { height: 0, overflow: "hidden" });
    let triggered = false;
    const revealMobile = () => {
      if (triggered) return;
      triggered = true;
      // Fade out video then remove from flow instantly (no height animation)
      gsap.to(video, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => gsap.set(video, { display: "none" }),
      });
      gsap.to(badge, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.5,
      });
      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.6,
      });
      // Expand list from 0 → auto
      gsap.to(list, {
        height: "auto",
        duration: 0.9,
        ease: "power2.inOut",
        delay: 0.7,
      });
      // Stagger items in after list starts opening
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "power2.out",
        delay: 0.9,
        onComplete: () => {
          items.forEach((item) => {
            item.addEventListener("mouseenter", () => onEnter(item));
            item.addEventListener("mouseleave", () => onLeave(item));
          });
        },
      });
    };
    video.addEventListener("ended", revealMobile, { once: true });
    // Fallback: reveal after 4 s if video never fires "ended"
    const fallbackTimer = setTimeout(revealMobile, 4000);
    video.addEventListener("ended", () => clearTimeout(fallbackTimer), {
      once: true,
    });
    // Cleanup when matchMedia context is reverted
    return () => clearTimeout(fallbackTimer);
  });
  // ─── DESKTOP (≥480px) ────────────────────────────────────────
  mm.add("(min-width: 768px)", () => {
    gsap.set([badge, heading], { opacity: 0, y: 32 });
    gsap.set(items, { flexGrow: 1, opacity: 0, y: 24 });
    items.forEach((item) => {
      const label = item.querySelector(".features4_item-label");
      gsap.set(label, { opacity: 0, maxWidth: 0, paddingLeft: 0 });
    });
    const hoverController = new AbortController();
    const revealDesktop = () => {
      gsap.to(badge, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.to(heading, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.12,
      });
      gsap.set(list, { zIndex: 10 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
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
    video.addEventListener("ended", revealDesktop, { once: true });
    return () => {
      hoverController.abort();
      gsap.killTweensOf([badge, heading, ...items]);
    };
  });
  // ─── Hover In (desktop) ──────────────────────────────────────
  function onEnter(item) {
    const label = item.querySelector(".features4_item-label");
    gsap.killTweensOf([item, label]);
    gsap.to(item, {
      flexGrow: 5,
      borderRadius: "1.5rem",
      backgroundColor: "rgba(0,0,0,0.53)",
      borderColor: "rgba(255,255,255,0.06)",
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0.25)",
      duration: 0.5,
      ease: "expo.out",
    });
    gsap.to(label, {
      maxWidth: "20rem",
      paddingLeft: "1.5rem",
      duration: 0.5,
      ease: "expo.out",
    });
    gsap.to(label, { opacity: 1, duration: 0.45, ease: "power3.out" });
    items.forEach((other) => {
      const icon = other.querySelector(".features4_item-icon");
      if (!icon) return;
      gsap.killTweensOf(icon);
      gsap.to(icon, {
        opacity: other === item ? 1 : 0.4,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }
  // ─── Hover Out (desktop) ─────────────────────────────────────
  function onLeave(item) {
    const label = item.querySelector(".features4_item-label");
    gsap.killTweensOf([item, label]);
    gsap.to(item, {
      flexGrow: 1,
      borderRadius: "2.0625rem",
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "rgba(255,255,255,0)",
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0)",
      duration: 0.9,
      ease: "expo.inOut",
    });
    gsap.to(label, { opacity: 0, duration: 0.6, ease: "power3.in" });
    gsap.to(label, {
      maxWidth: 0,
      paddingLeft: 0,
      duration: 0.9,
      ease: "expo.inOut",
    });
    items.forEach((other) => {
      const icon = other.querySelector(".features4_item-icon");
      if (!icon) return;
      gsap.killTweensOf(icon);
      gsap.to(icon, { opacity: 1, duration: 0.5, ease: "power2.out" });
    });
  }
});
