document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupNavigation();
  setupReveal(reducedMotion);
  setupActiveNavigation();
  setupContactForm();
  setupPlaceholderLinks();

  document.getElementById("current-year").textContent = new Date().getFullYear();
});

function setupNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-navigation");
  const toggleLabel = toggle.querySelector("span");

  const closeMenu = () => {
    navigation.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Menu";
    document.body.classList.remove("menu-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggleLabel.textContent = isOpen ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const updateHeader = () => {
    const scrolled = window.scrollY > 20;
    header.classList.toggle("scrolled", scrolled);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

function setupReveal(reducedMotion) {
  const elements = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

  elements.forEach((element) => observer.observe(element));
}

function setupActiveNavigation() {
  const links = [...document.querySelectorAll(".site-navigation a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length === 0) return;

  let rafId = null;

  const updateActive = () => {
    const scrollMid = window.scrollY + window.innerHeight * 0.38;
    let activeSection = sections[0];

    for (const section of sections) {
      if (section.offsetTop <= scrollMid) {
        activeSection = section;
      }
    }

    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeSection.id}`;
      if (link.classList.contains("active") !== isActive) {
        link.classList.toggle("active", isActive);
      }
    });
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateActive();
      rafId = null;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateActive();
}

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
      status.textContent = "Message sent. Thank you for reaching out.";
    } catch (error) {
      status.textContent = "The message could not be sent. Please use the email link instead.";
      status.classList.add("error");
    } finally {
      submitButton.disabled = false;
      buttonLabel.textContent = "Send message";
    }
  });
}

function setupPlaceholderLinks() {
  document.querySelectorAll("[data-placeholder='true']").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });
}
