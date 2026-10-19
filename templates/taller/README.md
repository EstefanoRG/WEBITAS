# Taller — plantilla genérica (página de muestra)

Plantilla de **una página** para talleres automotrices (multimarca): mantenimiento, repuestos y lubricantes, frenos, grúa/auxilio, planchado y pintura, off road y alineamiento.

Es la plantilla que usa el generador (`config.json` → rubro `taller`) para **cualquier** taller de la lista. Los textos y datos se reemplazan por los del negocio (`{{negocio}}`, `{{ciudad}}`, `{{whatsapp}}`, etc.); el diseño no se toca.

- El WhatsApp de contacto de toda la página es el del **negocio** (`{{whatsapp}}`, `{{telefono}}`). El número del **vendedor** (`{{vendedor_whatsapp}}`) aparece **solo** en el CTA "Activar con {{vendedor_nombre}}" para que el dueño que abra la muestra le escriba a quien la vendió.
- **Sin assets locales**: el hero y la **galería** usan fotos de **Pexels** hotlinkeadas (no hay carpeta `img/`). Así cada demo pesa casi nada y no se duplican archivos entre las decenas de talleres.
- Secciones: Barra promo · Header · Hero · **Galería** · Nosotros · Productos · Servicios · Contacto · Footer.
