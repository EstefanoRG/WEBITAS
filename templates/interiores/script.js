(function () {
  "use strict";

  function init() {
    initNav();
    initTema();
    initFiltros();
    initForm();
    initImages();
    stampYear();

    if (!window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    initHero();
    initPortfolio();
    initServicios();
    initProceso();
    initEstudio();
    initTestimonios();
    initFaq();
    initCta();
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

  function initFiltros() {
    var chips = document.querySelectorAll(".chip[data-filtro]");
    var items = document.querySelectorAll(".proyecto");
    if (!chips.length || !items.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filtro = chip.getAttribute("data-filtro");

        chips.forEach(function (otro) {
          var activo = otro === chip;
          otro.classList.toggle("is-active", activo);
          otro.setAttribute("aria-pressed", String(activo));
        });

        items.forEach(function (item) {
          var muestra =
            filtro === "todos" ||
            item.getAttribute("data-categoria") === filtro;
          item.classList.toggle("is-hidden", !muestra);
        });
      });
    });
  }

  function initForm() {
    var form = document.getElementById("form-cotiza");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    // Demo sin backend: se arma el mensaje y se abre WhatsApp con todo escrito.
    var wa = "{{whatsapp}}";
    var encabezado = "Hola, vi su página web y quiero cotizar un proyecto de interiores:";
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
      gsap.from(".hero__copy > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(".hero__figure--main, .hero__figure--detail, .hero__badge", {
        y: 34,
        opacity: 0,
        scale: 0.97,
        duration: 1,
        stagger: 0.14,
        delay: 0.15,
        ease: "power2.out",
      });

      gsap.set(".hero__figure--main img", { willChange: "transform" });
      gsap.to(".hero__figure--main img", {
        yPercent: -8,
        scale: 1.14,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.from(".hero__copy > *", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power2.out",
      });
      gsap.from(".hero__collage", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power2.out",
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", function () {
      gsap.set(".hero__copy > *, .hero__collage", { clearProps: "all" });
    });
  }

  function initPortfolio() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".proyecto", {
        y: 34,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".proyectos",
          start: "top 84%",
          once: true,
        },
      });
    });
  }

  function initServicios() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".service-card", {
        y: 26,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services__grid",
          start: "top 84%",
          once: true,
        },
      });
    });
  }

  function initProceso() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".proceso .section__kicker, .proceso .section__title, .proceso .section__intro", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".proceso",
          start: "top 78%",
          once: true,
        },
      });

      gsap.from(".paso", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".pasos",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from(".proceso__cta", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".proceso__cta",
          start: "top 90%",
          once: true,
        },
      });
    });
  }

  function initEstudio() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.set(".estudio__img", { willChange: "transform" });
      gsap.fromTo(
        ".estudio__img",
        { yPercent: -6 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".estudio",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.from(".estudio__copy > *", {
        opacity: 0,
        y: 22,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".estudio__copy",
          start: "top 80%",
          once: true,
        },
      });

      animateCounters();
    });

    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.from(".estudio__copy > *", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".estudio__copy",
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
          el.textContent = Math.round(obj.val) + suffix;
        },
      });
    });
  }

  function initTestimonios() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".testimonial-card", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonios__grid",
          start: "top 82%",
          once: true,
        },
      });
    });
  }

  function initFaq() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
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

  function initCta() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
      gsap.set(".cta__img", { willChange: "transform" });
      gsap.fromTo(
        ".cta__img",
        { yPercent: -6, scale: 1.1 },
        {
          yPercent: 6,
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
        y: 26,
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
      gsap.from(".form", {
        y: 22,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".form",
          start: "top 88%",
          once: true,
        },
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* Ajuste dinamico de --barra-h
   La barra de venta es fija y su texto puede ocupar dos lineas (moviles
   estrechos, zoom o "texto grande" del sistema). Sin esto, la altura real
   supera el valor fijo de --barra-h y la barra tapa el header. */
(function () {
  var barra = document.querySelector('.barra-dueno');
  if (!barra) return;
  var raiz = document.documentElement;
  function ajustar() {
    raiz.style.setProperty('--barra-h', Math.round(barra.getBoundingClientRect().height) + 'px');
  }
  if (window.ResizeObserver) { new ResizeObserver(ajustar).observe(barra); }
  window.addEventListener('resize', ajustar);
  window.addEventListener('orientationchange', ajustar);
  window.addEventListener('load', ajustar);
  ajustar();
})();
