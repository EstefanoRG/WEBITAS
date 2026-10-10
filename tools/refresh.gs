/**
 * WEBITAS — Refresco automático al editar el Google Sheet.
 *
 * Qué hace: cada vez que cambias la hoja, le pide a GitHub que vuelva a
 * generar las demos y a publicar (dispara el workflow build.yml). Así el
 * cambio se refleja en ~1 minuto, sin esperar el cron de 6 horas.
 *
 * DÓNDE PEGARLO (no es Node; es Google Apps Script):
 *   Abre tu Google Sheet -> Extensiones -> Apps Script -> pega este archivo.
 *
 * CONFIGURACIÓN (una sola vez):
 *   1. Crea un token de GitHub (fine-grained) con acceso al repo
 *      EstefanoRG/WEBITAS y permiso "Actions: Read and write".
 *      https://github.com/settings/tokens?type=beta
 *   2. En Apps Script: Configuración del proyecto (engranaje) ->
 *      Propiedades del script -> añade:
 *         GH_TOKEN  = <tu token>
 *         GH_REPO   = EstefanoRG/WEBITAS   (opcional)
 *         GH_BRANCH = main                 (opcional)
 *   3. En Apps Script: Activadores (reloj, a la izquierda) ->
 *      Añadir activador -> función "triggerEdit" ->
 *      Fuente del evento "De la hoja de cálculo" -> "Al cambiar".
 *   4. Autoriza los permisos cuando Google lo pida.
 *
 * PRUEBA: ejecuta la función "testRefresh" una vez; debe loguear "204".
 */

var PROPS = PropertiesService.getScriptProperties();
var DEBOUNCE_MS = 60000; // no dispara más de 1 vez por minuto

function triggerEdit() {
  var last = Number(PROPS.getProperty("LAST_RUN") || 0);
  var now = Date.now();
  if (now - last < DEBOUNCE_MS) return; // evita ráfagas al pegar varias filas
  PROPS.setProperty("LAST_RUN", String(now));
  dispatchWorkflow();
}

function testRefresh() {
  dispatchWorkflow();
}

function dispatchWorkflow() {
  var token = PROPS.getProperty("GH_TOKEN");
  var repo = PROPS.getProperty("GH_REPO") || "EstefanoRG/WEBITAS";
  var branch = PROPS.getProperty("GH_BRANCH") || "main";
  var workflow = "build.yml";

  if (!token) throw new Error("Falta GH_TOKEN en las Propiedades del script.");

  var url = "https://api.github.com/repos/" + repo +
    "/actions/workflows/" + workflow + "/dispatches";

  var res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    payload: JSON.stringify({ ref: branch }),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  Logger.log(code + " " + res.getContentText());
  // 204 = ok. 401 = token inválido. 404 = repo/workflow o permisos mal.
  return code;
}
