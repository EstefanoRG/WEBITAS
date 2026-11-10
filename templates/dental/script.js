(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("nav-principal");
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.getElementById("nav-backdrop");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));

  /* Mobile navigation -------------------------------------------------- */
  function openNav() {
    body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    if (backdrop) backdrop.hidden = false;
    var first = nav.querySelector("a");
    if (first) first.focus({ preventScroll: true });
  }

  function closeNav(restoreFocus) {
    body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    if (backdrop) backdrop.hidden = true;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (body.classList.contains("nav-open")) closeNav(true);
      else openNav();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeNav(true);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (body.classList.contains("nav-open")) closeNav(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && body.classList.contains("nav-open")) {
      closeNav(true);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 920 && body.classList.contains("nav-open")) {
      closeNav(false);
    }
  });

  /* Header state ------------------------------------------------------- */
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Treatment groups: open on desktop, collapsed on mobile --------------- */
  var treatmentGroups = Array.prototype.slice.call(document.querySelectorAll(".treatment-group"));
  var desktopTreatments = window.matchMedia("(min-width: 921px)");

  function syncTreatments() {
    treatmentGroups.forEach(function (group) {
      group.open = desktopTreatments.matches;
    });
  }

  syncTreatments();
  if (desktopTreatments.addEventListener) {
    desktopTreatments.addEventListener("change", syncTreatments);
  } else if (desktopTreatments.addListener) {
    desktopTreatments.addListener(syncTreatments);
  }

  /* Reservation form --------------------------------------------------- */
  var form = document.getElementById("form-reserva");

  if (form) {
    var status = document.getElementById("form-status");
    var WA = "{{whatsapp}}";
    var NEGOCIO = "{{negocio}}";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.textContent = "Completa los campos marcados para continuar.";
          status.classList.add("is-error");
        }
        return;
      }

      var data = new FormData(form);
      var nombre = String(data.get("nombre") || "").trim();
      var telefono = String(data.get("telefono") || "").trim();
      var tratamiento = String(data.get("tratamiento") || "").trim();
      var mensaje = String(data.get("mensaje") || "").trim();

      var lines = [
        "Hola, quiero reservar una evaluación en " + NEGOCIO + ".",
        "Nombre: " + nombre,
        "Teléfono: " + telefono,
        "Tratamiento: " + tratamiento
      ];

      if (mensaje) lines.push("Mensaje: " + mensaje);

      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));

      if (status) {
        status.textContent = "Listo. Abrimos WhatsApp con tu mensaje.";
        status.classList.remove("is-error");
      }

      var popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) window.location.href = url;
    });
  }

  /* Footer year -------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
