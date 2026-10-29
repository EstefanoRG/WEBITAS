(function () {
  "use strict";

  function init() {
    initNav();
    initTema();
    initForm();
    initImages();
    initFloat();
    stampYear();

    if (!window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    initHero();
    initTrust();
    initFranja();
    initServices();
    initEmergency();
    initParallaxGallery();
    initFamily();
    initConfidence();
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

  function initFloat() {
    var flotante = document.querySelector(".wa-float");
    var zonas = [
      document.querySelector(".hero"),
      document.getElementById("reserva"),
      document.querySelector(".site-footer"),
    ].filter(Boolean);
    if (!flotante || !zonas.length || !("IntersectionObserver" in window)) return;

    var visibles = new Set();
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) visibles.add(entrada.target);
          else visibles.delete(entrada.target);
        });
        // Sobre el formulario o el footer el botón taparía el botón de enviar.
        flotante.classList.toggle("is-hidden", visibles.size > 0);
      },
      { threshold: 0.06 }
    );

    zonas.forEach(function (zona) {
      observador.observe(zona);
    });
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

    function closeMenu(devolverFoco) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      setScrolled();
      if (devolverFoco) toggle.focus();
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar menú");
      nav.classList.add("is-open");
      document.body.classList.add("nav-open");
      setScrolled();
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu(false);
      else openMenu();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    // Cerrar con Escape y con clic fuera: un panel abierto que no se puede
    // cerrar sin volver a pulsar la hamburguesa se siente atascado.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu(true);
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!header.contains(event.target)) closeMenu(false);
    });

    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth > 1151 && nav.classList.contains("is-open")) {
          closeMenu(false);
        }
      },
      { passive: true }
    );
  }

  function initForm() {
    var form = document.getElementById("form-reserva");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    // Demo sin backend: se arma el mensaje y se abre WhatsApp con todo escrito.
    // Al activar la página se puede reemplazar por fetch("/api/reservas", ...).
    var wa = "51999111222";
    var encabezado = "Hola, vi su página web y quiero reservar una cita en Clínica Veterinaria Patitas:";
    var campos = form.querySelectorAll("input, select, textarea");

    // La fecha no puede ser pasada. Se calcula en local para no depender de UTC.
    var fecha = document.getElementById("fecha");
    if (fecha) {
      var hoy = new Date();
      var iso = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      fecha.min = iso;
    }

    function etiquetaDe(campo) {
      var span = form.querySelector('label[for="' + campo.id + '"] span');
      return span
        ? span.textContent.replace(/\s*\(opcional\)/i, "").trim()
        : campo.name;
    }

    function valorLegible(campo, valor) {
      if (!valor) return valor;
      if (campo.type === "date") {
        var partes = valor.split("-");
        if (partes.length === 3) return partes[2] + "/" + partes[1] + "/" + partes[0];
      }
      return valor;
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
        if (valor) lineas.push("• " + nombre + ": " + valorLegible(campo, valor));
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
    // Si una foto no carga, se deja el alt sobre el fondo del bloque en vez
    // de ocultarla: un hueco beige parece un error de diseño.
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener(
        "error",
        function () {
          img.classList.add("is-missing");
        },
        { once: true }
      );
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

      gsap.from(".franja__cta", {
        y: 22,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".franja__cta",
          start: "top 90%",
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
          { scale: 1.05, opacity: 0.95, yPercent: -6 },
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
          { scale: 1.03, opacity: 0.96, yPercent: -4 },
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

    });
  }

  function initTrust() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".trust__item", {
        y: 12,
        opacity: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".trust",
          start: "top 94%",
          once: true,
        },
      });
    });
  }

  function initEmergency() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".emergency__copy > *, .emergency__actions", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".emergency",
          start: "top 84%",
          once: true,
        },
      });
    });
  }

  function initConfidence() {
    var gsap = window.gsap;
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      gsap.from(".rating-card", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".confidence__grid",
          start: "top 82%",
          once: true,
        },
      });

      gsap.from(".info-list__item", {
        y: 16,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".info-list",
          start: "top 86%",
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
