(function () {
  "use strict";

  function init() {
    initNav();
    initTema();
    initForm();
    initImages();
    stampYear();

    if (!window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    initHero();
    initFranja();
    initServices();
    initParallaxGallery();
    initFamily();
    initTestimonials();
    initFaq();
    initCTA();
    refreshOnImages();
  }

  function initTema() {
    var btn = document.getElementById("tema-toggle");
    if (!btn) return;

    function aplica(oscuro) {
      if (oscuro) document.documentElement.setAttribute("data-tema", "oscuro");
      else document.documentElement.removeAttribute("data-tema");
      btn.setAttribute("aria-pressed", String(oscuro));
      btn.setAttribute(
        "aria-label",
        oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      );
    }

    var oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
    aplica(oscuro);

    btn.addEventListener("click", function () {
      oscuro = !oscuro;
      aplica(oscuro);
      try {
        localStorage.setItem("tema", oscuro ? "oscuro" : "claro");
      } catch (e) {}
    });
  }

  function stampYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav-principal");
    if (!header || !toggle || !nav) return;

    function setScrolled() {
      var menuOpen = nav.classList.contains("is-open");
      header.classList.toggle("is-scrolled", window.scrollY > 24 || menuOpen);
    }

    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      nav.classList.remove("is-open");
      setScrolled();
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("is-open", !open);
      setScrolled();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  function initForm() {
    var form = document.getElementById("form-reserva");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    // Demo sin backend: se arma el mensaje y se abre WhatsApp con todo escrito.
    // Al activar la página se puede reemplazar por fetch("/api/reservas", ...).
    var wa = "51935634896";
    var encabezado = "Hola, vi su página web y quiero reservar una cita:";
    var campos = form.querySelectorAll("input, select, textarea");

    function etiquetaDe(campo) {
      var span = form.querySelector('label[for="' + campo.id + '"] span');
      return span ? span.textContent.trim() : campo.name;
    }

    function marcar(campo, falta) {
      campo.style.borderColor = falta ? "var(--danger)" : "";
      if (falta) campo.setAttribute("aria-invalid", "true");
      else campo.removeAttribute("aria-invalid");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var faltan = [];
      var lineas = [];
      var primerFalta = null;

      campos.forEach(function (campo) {
        var valor = (campo.value || "").trim();
        var nombre = etiquetaDe(campo);
        if (campo.required && !valor) {
          faltan.push(nombre);
          marcar(campo, true);
          if (!primerFalta) primerFalta = campo;
          return;
        }
        marcar(campo, false);
        if (valor) lineas.push("• " + nombre + ": " + valor);
      });

      if (faltan.length) {
        status.textContent = "Nos falta: " + faltan.join(", ") + ".";
        status.className = "form__status is-error";
        if (primerFalta) primerFalta.focus();
        return;
      }

      status.textContent = "";
      status.className = "form__status";

      var texto = encabezado + "\n\n" + lineas.join("\n");
      window.open(
        "https://wa.me/" + wa + "?text=" + encodeURIComponent(texto),
        "_blank",
        "noopener"
      );
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.opacity = "0";
      });
    });
  }

  function refreshOnImages() {
    var images = document.querySelectorAll("img");
    var pending = images.length;

    function done() {
      pending -= 1;
      if (pending > 0) return;
      // Con scroll-behavior: smooth, refresh() mide a mitad de scroll y descoloca los triggers.
      var html = document.documentElement;
      var body = document.body;
      var prevHtml = html.style.scrollBehavior;
      var prevBody = body.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      window.ScrollTrigger.refresh();
      html.style.scrollBehavior = prevHtml;
      body.style.scrollBehavior = prevBody;
    }

    images.forEach(function (img) {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
  }

  function initHero() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.from(".hero__content > *", {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power2.out",
      });

      // scrub: 1 suaviza el seguimiento; scale 0.85→1.15 y y contrario al scroll
      gsap.fromTo(
        ".hero__img",
        { scale: 0.85, opacity: 0.88, yPercent: 0 },
        {
          scale: 1.15,
          opacity: 1,
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
      gsap.set(".hero__img", { willChange: "transform, opacity" });

      gsap.to(".hero__content", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "center top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.from(".hero__content > *", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.fromTo(
        ".hero__img",
        { scale: 1, opacity: 0.85, yPercent: 4 },
        {
          scale: 1.08,
          opacity: 1,
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", function () {
      gsap.set(".hero__img, .hero__content", { clearProps: "all" });
    });
  }

  function initFranja() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".franja__kicker, .franja__title, .franja__lead", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".franja",
          start: "top 78%",
          once: true,
        },
      });

      gsap.from(".franja__chip", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".franja__chips",
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".franja__cols > div, .franja__cta", {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".franja__cols",
          start: "top 85%",
          once: true,
        },
      });
    });
  }

  function initServices() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      // Sin stagger: todas las tarjetas entran a la vez para que queden siempre
      // alineadas (con stagger, la última se veía más abajo un instante).
      gsap.from(".service-card", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services__grid",
          start: "top 82%",
          once: true,
        },
      });
    });
  }

  function initParallaxGallery() {
    var gsap = window.gsap;
    var items = gsap.utils.toArray(".gallery__item");
    var starts = ["top 90%", "top 80%", "top 70%"];
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      items.forEach(function (item, index) {
        var img = item.querySelector(".gallery__img");
        gsap.set(img, { willChange: "transform, opacity" });
        // Recorrido 600px; y = 0.2 × distancia para ir un 20% más lento
        gsap.fromTo(
          img,
          { scale: 1.05, opacity: 0.4, yPercent: -6 },
          {
            scale: 1.2,
            opacity: 1,
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: starts[index] || "top 85%",
              end: "+=600",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      gsap.from(".gallery__quote", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gallery__quote",
          start: "top 85%",
          once: true,
        },
      });
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      items.forEach(function (item, index) {
        var img = item.querySelector(".gallery__img");
        gsap.fromTo(
          img,
          { scale: 1.03, opacity: 0.5, yPercent: -4 },
          {
            scale: 1.12,
            opacity: 1,
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: starts[index] || "top 90%",
              end: "+=320",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });
  }

  function initFamily() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.set(".family__img", { willChange: "transform" });
      gsap.fromTo(
        ".family__img",
        { yPercent: -6 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".family",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.from(".family__copy > *", {
        opacity: 0,
        y: 22,
        scale: 0.98,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".family__copy",
          start: "top 80%",
          once: true,
        },
      });

      animateCounters();
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.fromTo(
        ".family__img",
        { yPercent: -3 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: ".family",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.from(".family__copy > *", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".family__copy",
          start: "top 85%",
          once: true,
        },
      });

      animateCounters();
    });
  }

  function animateCounters() {
    var gsap = window.gsap;
    gsap.utils.toArray(".stats__value").forEach(function (el) {
      var target = Number(el.getAttribute("data-count") || 0);
      var suffix = el.getAttribute("data-suffix") || "";
      var obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        snap: { val: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate: function () {
          var value = Math.round(obj.val);
          el.textContent = value >= 1000 ? value.toLocaleString("es") + suffix : value + suffix;
        },
      });
    });
  }

  function initTestimonials() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".testimonial-card", {
        y: 30,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".testimonials__grid",
          start: "top 80%",
          once: true,
        },
      });
    });
  }

  function initFaq() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".faq .section__kicker, .faq .section__title", {
        y: 22,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq",
          start: "top 80%",
          once: true,
        },
      });

      gsap.from(".faq__q", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq__list",
          start: "top 84%",
          once: true,
        },
      });
    });
  }

  function initCTA() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.set(".cta__img", { willChange: "transform" });
      gsap.fromTo(
        ".cta__img",
        { yPercent: -8, scale: 1.08 },
        {
          yPercent: 8,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.from(".cta__intro > *, .form", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".cta__inner",
          start: "top 80%",
          once: true,
        },
      });
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.fromTo(
        ".cta__img",
        { yPercent: -4, scale: 1.04 },
        {
          yPercent: 4,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
