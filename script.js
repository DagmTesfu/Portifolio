/* =========================
   Dagmawi Tesfu Portfolio
   Vanilla JavaScript only
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupNavigation();
  setupScrollReveal(prefersReducedMotion);
  setupTypingEffect(prefersReducedMotion);
  setupProjectTilt(prefersReducedMotion);
  setupContactForm();
  setupPlaceholderLinks();
  setupParticles(prefersReducedMotion);
  setupActiveNavigation();

  document.getElementById("current-year").textContent = new Date().getFullYear();
});

// Keeps unfinished social profile placeholders from navigating to a dead URL.
function setupPlaceholderLinks() {
  document.querySelectorAll("[data-placeholder='true']").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

// Mobile navigation and header state.
function setupNavigation() {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = nav.querySelectorAll("a");

  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

// Reveals content as it enters the viewport and animates the journey line.
function setupScrollReveal(reducedMotion) {
  const revealItems = document.querySelectorAll(".reveal");
  const journey = document.querySelector(".journey");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    journey.classList.add("in-view");
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(item);
  });

  const journeyObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      journey.classList.add("in-view");
      journeyObserver.disconnect();
    }
  }, { threshold: 0.3 });

  journeyObserver.observe(journey);
}

// Types the role once on page load. Change the text in index.html.
function setupTypingEffect(reducedMotion) {
  const typingElement = document.getElementById("typing-text");
  const fullText = typingElement.textContent.trim();

  if (reducedMotion) return;

  typingElement.textContent = "";
  let characterIndex = 0;

  const typeNextCharacter = () => {
    typingElement.textContent = fullText.slice(0, characterIndex + 1);
    characterIndex += 1;

    if (characterIndex < fullText.length) {
      const delay = fullText[characterIndex] === " " ? 35 : 54;
      window.setTimeout(typeNextCharacter, delay);
    }
  };

  window.setTimeout(typeNextCharacter, 650);
}

// Adds a restrained pointer tilt to project cards on devices with a mouse.
function setupProjectTilt(reducedMotion) {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reducedMotion || !canHover) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${y * -1.4}deg) rotateY(${x * 1.4}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0) rotateY(0)";
    });
  });
}

// Sends contact messages through Formspree without leaving the portfolio.
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const submitButton = form.querySelector("button[type='submit']");
  const buttonLabel = submitButton.querySelector("span");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.textContent = "";
    status.classList.remove("error");
    submitButton.disabled = true;
    buttonLabel.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Form submission failed");

      form.reset();
      status.textContent = "Message sent. Thank you for reaching out!";
    } catch (error) {
      status.textContent = "The message could not be sent. Please email me directly instead.";
      status.classList.add("error");
    } finally {
      submitButton.disabled = false;
      buttonLabel.textContent = "Send Message";
    }
  });
}

// Highlights the section currently nearest the middle of the viewport.
function setupActiveNavigation() {
  const links = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

// Lightweight canvas particles connected by faint lines.
function setupParticles(reducedMotion) {
  const canvas = document.getElementById("particle-canvas");
  const context = canvas.getContext("2d");
  let particles = [];
  let animationFrame;
  let width = 0;
  let height = 0;
  let deviceScale = 1;

  const createParticles = () => {
    const particleCount = Math.min(55, Math.max(24, Math.floor(width / 28)));
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: Math.random() * 1.2 + 0.4,
      color: Math.random() > 0.86 ? "231, 189, 85" : "100, 217, 139"
    }));
  };

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    deviceScale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * deviceScale);
    canvas.height = Math.floor(height * deviceScale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    createParticles();
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      if (!reducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.color}, 0.22)`;
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
        const other = particles[otherIndex];
        const xDistance = particle.x - other.x;
        const yDistance = particle.y - other.y;
        const distance = Math.hypot(xDistance, yDistance);

        if (distance < 125) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(100, 217, 139, ${0.045 * (1 - distance / 125)})`;
          context.lineWidth = 0.6;
          context.stroke();
        }
      }
    });

    if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw);
  };

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeCanvas();
      draw();
    }, 150);
  });

  resizeCanvas();
  draw();
}
