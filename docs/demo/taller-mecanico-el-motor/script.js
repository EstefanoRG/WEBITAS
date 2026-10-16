(function () {
  "use strict";

  function init() {
    initMenu();
    initTema();
    initForm();
    initReveal();
    initMarquees();
    initHeroSlider();
    initImages();
    var anio = document.getElementById("anio");
    if (anio) anio.textContent = String(new Date().getFullYear());
  }

  function initMenu() {
    var burger = document.getElementById("burger");
    var menu = document.getElementById("menu");
    if (!burger || !menu) return;

    function cerrar() {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Abrir menú");
      menu.classList.remove("is-open");
    }
    burger.addEventListener("click", function () {
      var abierto = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!abierto));
      burger.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      menu.classList.toggle("is-open", !abierto);
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", cerrar); });
  }

  function initTema() {
    var btn = document.getElementById("tema");
    if (!btn) return;
    function aplica(oscuro) {
      if (oscuro) document.documentElement.setAttribute("data-tema", "oscuro");
      else document.documentElement.removeAttribute("data-tema");
      btn.setAttribute("aria-label", oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }
    var oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
    aplica(oscuro);
    btn.addEventListener("click", function () {
      oscuro = !oscuro; aplica(oscuro);
      try { localStorage.setItem("tema", oscuro ? "oscuro" : "claro"); } catch (e) {}
    });
  }

  function initForm() {
    var form = document.getElementById("form-contacto");
    if (!form) return;
    var aviso = document.getElementById("form-error");
    var campos = form.querySelectorAll("input[required], textarea[required]");
    var wa = "51935634896"; // número de Taller Mecánico El Motor (reemplazar si cambia)

    function nombreDe(campo) {
      var label = campo.closest("label");
      var span = label ? label.querySelector("span") : null;
      return span ? span.textContent.replace("*", "").trim() : campo.name;
    }
    function marcar(campo, falta) {
      campo.style.borderColor = falta ? "var(--danger)" : "";
      if (falta) campo.setAttribute("aria-invalid", "true");
      else campo.removeAttribute("aria-invalid");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var faltan = [], lineas = [], primero = null;
      campos.forEach(function (campo) {
        var valor = (campo.value || "").trim();
        var nombre = nombreDe(campo);
        if (campo.required && !valor) {
          faltan.push(nombre); marcar(campo, true);
          if (!primero) primero = campo;
          return;
        }
        marcar(campo, false);
        if (valor) lineas.push("• " + nombre + ": " + valor);
      });
      if (faltan.length) {
        aviso.hidden = false;
        aviso.textContent = "Nos falta: " + faltan.join(", ") + ".";
        if (primero) primero.focus();
        return;
      }
      aviso.hidden = true;
      var texto = "Hola Taller Mecánico El Motor, les escribo desde la web:\n\n" + lineas.join("\n");
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }

  function initReveal() {
    var targets = document.querySelectorAll(".svc, .prod");
    if (!targets.length || !("IntersectionObserver" in window)) return;
    targets.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () { img.style.visibility = "hidden"; });
    });
  }

  // Slider de videos del hero (dentro del marco) + controles de play/pausa y sonido.
  // Si el usuario pidió menos movimiento, no se reproducen solos (quedan los pósters).
  function initHeroSlider() {
    var frame = document.querySelector(".hero__frame--video");
    if (!frame) return;
    var slides = frame.querySelectorAll(".hero__slide");
    var videos = frame.querySelectorAll(".hero__video");
    if (!slides.length) return;

    var btnPlay = frame.querySelector("#v-play");
    var btnMute = frame.querySelector("#v-mute");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function reproducir(play) {
      videos.forEach(function (v) {
        if (play) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
      if (btnPlay) {
        btnPlay.classList.toggle("is-paused", !play);
        btnPlay.setAttribute("aria-label", play ? "Pausar video" : "Reproducir video");
        btnPlay.setAttribute("aria-pressed", String(!play));
      }
    }
    function silenciar(mute) {
      videos.forEach(function (v) { v.muted = mute; });
      if (btnMute) {
        btnMute.classList.toggle("is-sound", !mute);
        btnMute.setAttribute("aria-label", mute ? "Activar sonido" : "Silenciar video");
        btnMute.setAttribute("aria-pressed", String(!mute));
      }
    }

    silenciar(true);
    if (!reduce) reproducir(true); else reproducir(false);

    if (btnPlay) btnPlay.addEventListener("click", function () {
      reproducir(btnPlay.classList.contains("is-paused"));
    });
    if (btnMute) btnMute.addEventListener("click", function () {
      silenciar(btnMute.classList.contains("is-sound"));
    });

    if (reduce || slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 8000);
  }

  // Duplica las marcas hasta cubrir el ancho y luego activa la marquesina
  // (así el desplazamiento -50% siempre es continuo, sin huecos).
  function initMarquees() {
    var tracks = document.querySelectorAll("[data-marquee]");
    if (!tracks.length) return;

    tracks.forEach(function (track) {
      var set = Array.prototype.slice.call(track.children);
      if (!set.length) return;
      var setWidth = track.getBoundingClientRect().width;
      var container = track.parentElement.getBoundingClientRect().width;
      if (!setWidth || !container) return;

      var copies = 2;
      while ((copies / 2) * setWidth < container * 1.4 && copies < 20) copies += 2;

      for (var i = 1; i < copies; i++) {
        set.forEach(function (el) {
          var clone = el.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
      }
      track.classList.add("is-anim");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
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
