# Taller — plantilla genérica (página de muestra)

Plantilla de **una página** para talleres automotrices (multimarca): mantenimiento, repuestos y lubricantes, frenos, grúa/auxilio, planchado y pintura, off road y alineamiento.

Es la plantilla que usa el generador (`config.json` → rubro `taller`) para **cualquier** taller de la lista. Los textos y datos se reemplazan por los del negocio (`{{negocio}}`, `{{ciudad}}`, `{{whatsapp}}`, etc.); el diseño no se toca.

- El WhatsApp de toda la página es el del **vendedor** asignado (`{{whatsapp}}`), para que el dueño que abra la muestra le escriba a quien la vendió.
- El hero usa una **foto** de taller (`img/hero.jpg`), sin videos.
- Barra superior: “página de muestra” + **Activar con {{vendedor_nombre}}**.
