(function () {
  const scriptEl = document.currentScript;
  (function waitForGSAP() {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initEffect();
    } else {
      setTimeout(waitForGSAP, 50);
    }
  })();

  function initEffect() {
    const rootOG = scriptEl.closest(".mwg045");
    const root = rootOG.querySelector(".mwg045-root");
    const slides = rootOG.querySelectorAll(".mwg045-slide");
    const slideContent = rootOG.querySelectorAll(".mwg045-content");
    const dots = rootOG.querySelectorAll(".mwg045-dot");
    const baseDuration = slides.length / 2;
    const staggerEach = 0.5;
    const visibleDuration = baseDuration - staggerEach;

    const mm = gsap.matchMedia();

    // DESKTOP (>=992px): 3D карусель с ScrollTrigger
    mm.add("(min-width: 992px)", () => {
      const rotY = gsap.quickTo(root, "rotationY", {
        duration: 0.3,
        ease: "power3",
      });
      const rotX = gsap.quickTo(root, "rotationX", {
        duration: 0.3,
        ease: "power3",
      });

      const tl = gsap.timeline({ paused: true });
      tl.from(slides, {
        y: "-15vw",
        z: "-60vw",
        ease: "none",
        duration: baseDuration,
        stagger: { each: staggerEach },
      });

      Array.from(slideContent).forEach((content, i) => {
        const enterAt = i * staggerEach;
        const exitAt = enterAt + visibleDuration;
        tl.fromTo(
          content,
          { y: "10vh" },
          { y: 0, ease: "back.out(1.05)", duration: staggerEach },
          enterAt,
        );
        if (i < slideContent.length - 1) {
          tl.fromTo(
            content,
            { y: 0 },
            { y: "200vh", ease: "power3.in", duration: staggerEach },
            exitAt,
          );
        }
      });
      gsap.set(slideContent[slideContent.length - 1], { y: 0 });

      let winWidth = window.innerWidth;
      let winHeight = window.innerHeight;
      const onResize = () => {
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
      };
      window.addEventListener("resize", onResize);

      function handleMouseMove(e) {
        rotX(-(e.clientY / winHeight - 0.5) * 5);
        rotY((e.clientX / winWidth - 0.5) * 10);
      }
      root.addEventListener("mousemove", handleMouseMove);

      const st = ScrollTrigger.create({
        trigger: rootOG,
        start: "top top",
        end: "+=" + slides.length * 100 + "vh",
        pin: true,
        pinType: "transform",
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          tl.progress(self.progress);
        },
      });

      return () => {
        st.kill();
        root.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", onResize);
        gsap.set([...slides, ...slideContent], { clearProps: "all" });
      };
    });

    // MOBILE/TABLET (<=991px): автоплей с точками
    mm.add("(max-width: 991px)", () => {
      gsap.set(root, { clearProps: "all" });
      gsap.set([...slides], { clearProps: "all" });
      gsap.set(slideContent, { clearProps: "all" });
      gsap.set(slideContent, { opacity: 0 });
      gsap.set(slideContent[0], { opacity: 1 });
      dots.forEach((d) => d.classList.remove("active"));
      if (dots[0]) dots[0].classList.add("active");

      let current = 0;
      let timer;

      const changeSlide = (nextIndex) => {
        if (current === nextIndex) return;
        const prev = current;
        current = nextIndex;
        gsap.to(slideContent[prev], {
          opacity: 0,
          duration: 0.45,
          ease: "power2.in",
        });
        gsap.to(slideContent[current], {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
          delay: 0.25,
        });
        dots.forEach((d, i) => d.classList.toggle("active", i === current));
      };

      const startAutoPlay = () => {
        clearInterval(timer);
        timer = setInterval(() => {
          changeSlide((current + 1) % slideContent.length);
        }, 2500);
      };

      startAutoPlay();

      const clickHandlers = [];
      dots.forEach((dot, index) => {
        const handler = () => {
          changeSlide(index);
          startAutoPlay();
        };
        dot.addEventListener("click", handler);
        clickHandlers.push({ dot, handler });
      });

      return () => {
        clearInterval(timer);
        gsap.set(slideContent, { clearProps: "all" });
        clickHandlers.forEach(({ dot, handler }) =>
          dot.removeEventListener("click", handler),
        );
      };
    });
  }
})();
