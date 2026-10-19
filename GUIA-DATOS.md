# WEBITAS — Fuente de datos, contador y métricas

Cómo se alimenta el sistema, cómo cambiar de fuente (CSV → Supabase) y cómo funcionan
el **Gestor** (editar), el contador de visitas y las métricas del panel.

---

## 1. Una sola fuente de verdad (25 columnas)

**El esquema es uno solo: 25 columnas, en este orden** (el detalle está en `SETUP.md`).
Cualquier fuente que uses (Supabase, Sheet o CSV) debe respetar esas columnas.

El generador (`generator/build.mjs`) y el tablero local (`tools/panel.mjs`) leen, **en este orden de prioridad**:

| Prioridad | Fuente | Cuándo se usa | Notas |
|---|---|---|---|
| 1 | **Supabase** (`SUPABASE_URL` + clave) | Producción / local | Base de datos real. Ver `supabase/README.md` |
| 2 | `DATA_CSV` (variable de entorno) | Override manual | Fuerza un CSV concreto (salta Supabase) |
| 3 | `prospectos_consolidado.csv` (o `WEBITAS - prospectos_consolidado.csv`) | Local (si existen) | Tus **datos reales**; no se versionan (PII) |
| 4 | `data/empresas.csv` | Fallback | **Muestra** versionada (25 columnas) |

> El build lee Supabase con la **service_role** (`.env`, local/CI) o, si no está, con la **anon** pública
> (que solo puede leer). Por eso el robot de GitHub Actions funciona **sin secretos**.

> Antes había una plantilla de 14 columnas y un CSV de 28. Ya se unificó a **25** (se quitaron `contacto`, `tiktok` y `publicar`, que el sistema no usaba).

Comandos:
```bash
node generator/build.mjs                                       # usa la prioridad de arriba
node tools/supabase-import.mjs "…csv" --replace                # importa CSV a Supabase
DATA_CSV=prospectos_consolidado.csv node generator/build.mjs   # fuerza un CSV
SHEET_CSV_URL="https://docs.google.com/…/pub?output=csv" node generator/build.mjs
```

---

## 2. Google Sheet (retirado)

Ya **no se usa**. Se reemplazó por Supabase (base de datos real). El Sheet, `SHEET_CSV_URL` y el Apps Script
de refresco (`tools/refresh.gs`) se eliminaron. El panel ya no espera a ningún build: lee Supabase en vivo.

---

## 3. Supabase (ya montado)

Es la fuente principal: reemplaza al Google Sheet como base de datos y es la base para el contador,
las métricas y (más adelante) el login real del panel.

**Puesta en marcha:** guía paso a paso en **`supabase/README.md`**. Resumen:
1. `supabase/schema.sql` → pégalo en el **SQL Editor** y Run (crea la tabla `prospectos`, 25 columnas, las mismas que el CSV).
2. `.env` con `SUPABASE_URL` + `SUPABASE_KEY` (la `service_role`, secreta).
3. `node tools/supabase-import.mjs "WEBITAS - prospectos_consolidado.csv" --replace` → importa tus prospectos sin perder nada.
4. Pega la clave `anon` (pública) en `generator/config.json` → `supabase.anonKey` y regenera (`node generator/build.mjs`).

Ya funciona: el **panel lee en vivo** de Supabase (REST), el panel local **lee y escribe** ahí, y dejas de
depender del límite del Sheet. Pendiente (cuando quieras): **login real** con Supabase Auth y **Storage**
para fotos por negocio.

---

## 4. Contador de visitas (opcional, ya sin terceros)

Antes cada demo llamaba a un servicio externo (`abacus.jasoncameron.dev`) al abrirse; se **eliminó**
(privacidad del visitante + dependencia de un tercero). En `generator/config.json`, `counter` quedó en `null`.

- Con `counter: null` → las demos **no** cargan ningún script de conteo y el panel **oculta** el 👀.
- Para volver a tener visitas, apunta `counter` a **tu propio** endpoint:
  ```json
  "counter": {
    "namespace": "webitas",
    "hit": "https://TU-PROYECTO.supabase.co/functions/v1/hit",
    "get": "https://TU-PROYECTO.supabase.co/functions/v1/get"
  }
  ```
  `hit` recibe `…/hit/<namespace>/<slug>` (un GET al abrir la demo) y `get` devuelve `{ "value": n }`.
  Sirve igual un Cloudflare Worker, una función de Vercel, etc. La clave es que sea **tuyo**.

---

## 5. Métricas del panel

El panel (y el tablero local) muestran arriba un resumen calculado en vivo:

- **prospectos** · **sin web** · **con demo**
- **contactados** · **interesados** · **vendidos** · **descartados**
- **tasa respuesta** = interesados / contactados
- **tasa cierre** = vendidos / contactados

Se calculan desde el estado de cada fila, así que cambian al instante al editar en Supabase.
(La vista SQL `metricas` existe para consultarlos también por SQL.)
