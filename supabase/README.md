# WEBITAS · Poner Supabase en marcha (para quien nunca lo usó)

Tu proyecto: **`kktinamqdrkzjyzxpctf`** → `https://kktinamqdrkzjyzxpctf.supabase.co`

Sigue estos pasos en orden. Al final, tus 113 prospectos viven en Supabase y el sistema lee de ahí.

---

## Si quieres que lo haga yo (el agente), sin exponer las claves

Las claves **no se pegan en el chat**. Se ponen en un archivo local `.env` y yo las leo desde ahí, sin mostrarlas:

1. Copia `.env.example` a `.env`.
2. Rellena:
   - `SUPABASE_KEY` = clave **service_role** (para importar/leer/escribir datos).
   - `SUPABASE_ANON_KEY` = clave **anon** (pública; la usa el panel).
   - `SUPABASE_PAT` = *(opcional)* un **Personal Access Token** — solo si quieres que yo cree la tabla por API.
3. Avísame y yo ejecuto:
   ```bash
   node tools/supabase-setup.mjs     # crea la tabla (si hay PAT) y guarda la anon key
   node tools/supabase-import.mjs "WEBITAS - prospectos_consolidado.csv" --replace
   ```

**Si NO me das el PAT**, no puedo crear la tabla por API: haz tú el **Paso 2** (pegar `schema.sql` en el SQL
Editor) y yo hago el resto.

> Seguridad: `.env` está en `.gitignore`. No lo subas ni lo pegues en el chat. La `service_role` y el PAT son
> llaves maestras: si alguna se filtra, cámbiala en Supabase → Settings → API.

---

## Paso 1 · Sacar la URL y las claves

En el panel de Supabase:

1. Abre tu proyecto.
2. Menú izquierdo → ⚙️ **Project Settings** → **API**.
3. Copia estos dos valores:
   - **Project URL** → `https://kktinamqdrkzjyzxpctf.supabase.co` (ya está en `generator/config.json`).
   - **Project API keys**:
     - 🔓 **`anon` `public`** → es **pública** (puede ir en el panel/web). Es la que lee el panel.
     - 🔑 **`service_role`** → es **SECRETA**. Solo para scripts locales y CI. **Nunca** en el repo ni en el panel.

> Si no ves las claves, pulsa "Reveal" o "Reveal keys".

## Paso 2 · Crear la tabla

1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este repo, **cópialo entero** y pégalo.
3. Pulsa **Run** (o Ctrl/Cmd + Enter). Debe decir *Success*.

Esto crea la tabla `prospectos` (25 columnas, mismas que tu CSV menos `contacto`, `tiktok` y `publicar`,
que el sistema no usaba) y la política de lectura para el panel.

## Paso 3 · Crear el archivo `.env` (secretos locales)

En la raíz del repo:

1. Copia `.env.example` a `.env`.
2. Rellena **`SUPABASE_KEY`** con la clave **`service_role`** (la secreta). Deja la URL como está.

```env
SUPABASE_URL=https://kktinamqdrkzjyzxpctf.supabase.co
SUPABASE_KEY=<la service_role>
```

> `.env` está en `.gitignore`: no se sube nunca. No lo compartas ni lo pegues en el chat/otro sitio público.

## Paso 4 · Importar tus prospectos (sin perder nada)

En la terminal, dentro del repo:

```bash
node tools/supabase-import.mjs "WEBITAS - prospectos_consolidado.csv" --replace
```

Verás el progreso (`✓ 113/113`) y al final: *"Listo. 113 prospectos importados…"*.
`--replace` vacía la tabla antes de cargar (para reimportar limpio). Sin `--replace`, solo añade.

Comprueba en **Table Editor → `prospectos`**: deben aparecer **113 filas** con sus estados y vendedores.

## Paso 5 · Que el panel lea de Supabase

1. En `generator/config.json`, pega la clave **`anon`** (la pública) en `supabase.anonKey`:
   ```json
   "supabase": { "url": "https://kktinamqdrkzjyzxpctf.supabase.co", "tabla": "prospectos", "anonKey": "<anon public>" }
   ```
2. El panel local (`node tools/panel.mjs`) ya lee y escribe en Supabase solo con tener el `.env`.
3. Para el panel **publicado**, regenera y publica:
   ```bash
   node generator/build.mjs
   ```

Orden de fuentes (ya implementado): **Supabase → Google Sheet → CSV local → muestra**.
Cuando Supabase esté cargado, deja de depender del Sheet.

## Paso 6 (opcional) · Que GitHub Actions lea de Supabase

En GitHub → *Settings → Secrets and variables → Actions* añade:
- **`SUPABASE_URL`** = `https://kktinamqdrkzjyzxpctf.supabase.co`
- **`SUPABASE_KEY`** = la `service_role` (secreta; los secrets de Actions están cifrados).

Y quita/ignora `SHEET_CSV_URL` si ya no usas el Sheet.

---

## Seguridad (importante)

- 🔑 **`service_role`** = llave maestra: salta toda la seguridad. Solo en `.env` local o en secrets de CI.
- 🔓 **`anon`** = pública: solo puede **leer** (por la política de RLS del `schema.sql`). No puede escribir.
- El panel sigue siendo "solo con el código" (`x7q2k9p4`). Si quieres cerrarlo de verdad, el siguiente paso
  es **Supabase Auth** (login) — lo vemos cuando quieras.

## Problemas típicos

| Síntoma | Causa / arreglo |
|---|---|
| `Faltan SUPABASE_URL y/o SUPABASE_KEY` | No creaste `.env` o está vacío (Paso 3). |
| Error 401 | Clave mal copiada o es la `anon` en un script de escritura. Usa la `service_role`. |
| Error 404 | La tabla no existe: repite el Paso 2 (`schema.sql`). |
| Errores al importar a medias | Repite con `--replace` (vuelve a empezar limpio). |
| El panel publicado no muestra nada | Falta `supabase.anonKey` en `config.json`, o no re-ejecutaste `build.mjs` (Paso 5). |
