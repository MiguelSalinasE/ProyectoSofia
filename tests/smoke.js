/* Prueba del recorrido estático: node tests/smoke.js */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const storage = new Map();
for (const name of ["granada", "granada2", "granada3", "dublin", "dublin2", "dublin3"]) {
  const file = path.join(root, "assets/photos/optimized", `${name}.webp`);
  assert.ok(fs.existsSync(file) && fs.statSync(file).size > 1000, `Falta ${name}.webp`);
}
for (const name of ["calasparra-sin-gente.jpg", "calasparra.JPEG", "dublin4.jpg", "murcia.jpeg", "murcia1.JPEG", "eclipseJPEG.JPEG", "nerja.MOV", "nerja2.MOV"]) {
  const file = path.join(root, "assets/photos", name);
  assert.ok(fs.existsSync(file) && fs.statSync(file).size > 1000, `Falta ${name}`);
}

function startApp({ spotifyUrl = "" } = {}) {
  const handlers = {};
  const elements = new Map();
  const document = {
    title: "",
    activeElement: null,
    body: { append() {} },
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: "", textContent: "", classList: { add() {}, remove() {} },
        style: { setProperty() {} }, dataset: {}, setAttribute() {}, append() {},
        focus() { document.activeElement = this; },
        querySelector() { return null; }, querySelectorAll() { return []; }
      });
      return elements.get(id);
    },
    createElement() { return { className: "", style: {}, setAttribute() {}, append() {} }; },
    addEventListener(type, handler) { handlers[type] = handler; },
    elementFromPoint() { return null; }
  };
  const context = vm.createContext({
    document,
    window: { matchMedia: () => ({ matches: false }), scrollTo() {}, confirm: () => true },
    navigator: {},
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    setTimeout: () => 1,
    clearTimeout() {},
    FormData: class { constructor(form) { this.form = form; } get() { return this.form.answer; } },
    Audio: class { play() { return Promise.resolve(); } }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "js/config.js"), "utf8"), context);
  if (spotifyUrl) {
    context.playlistUrlForTest = spotifyUrl;
    vm.runInContext("STORY_CONFIG.playlist.spotifyUrl = playlistUrlForTest", context);
  }
  vm.runInContext(fs.readFileSync(path.join(root, "js/app.js"), "utf8"), context);
  return {
    html: () => document.getElementById("story").innerHTML,
    count: () => document.getElementById("memory-count").textContent,
    chapter: () => document.getElementById("chapter-indicator").textContent,
    click(action, index) {
      const target = { dataset: { action, ...(index === undefined ? {} : { index: String(index) }) }, classList: { add() {} }, closest() { return this; } };
      document.activeElement = target;
      handlers.click({ target });
    },
    input(value) { handlers.input({ target: { id: "granada-distance", value } }); },
    answer(value) { handlers.submit({ target: { id: "ring-form", answer: value }, preventDefault() {} }); }
  };
}

const app = startApp();
assert.match(app.html(), /Hay historias que empiezan con un plan/);
assert.ok(app.html().indexOf("optimized/dublin.webp") < app.html().indexOf("optimized/granada.webp"), "Dublín debe estar a la izquierda");
app.click("next");
assert.equal(app.count(), "★ 1 / 9");
assert.match(app.html(), /Primero, la música/);
app.click("madrid-bar");
assert.match(app.html(), /Después del concierto fuimos a un bar/);
assert.doesNotMatch(app.html(), /Nos conocimos allí|Encuéntrala|data-action="person"/);
for (let i = 0; i < 3; i++) app.click("bar-light", i);
assert.match(app.html(), /ya me había fijado en ti/);
app.click("next");
assert.match(app.html(), /volvimos a coincidir en una discoteca/);
assert.doesNotMatch(app.html(), /dialogue-choice|conversation__prompt/);
app.click("route-node", 0);
assert.match(startApp().html(), /Cruce 2 de 3/);
app.click("route-node", 1);
app.click("route-node", 2);
assert.match(app.html(), /Al salir de la discoteca nos quedamos hablando/);
app.click("next");
for (let i = 0; i < 3; i++) app.click("path-star", i);
assert.match(app.html(), /Nuestro primer beso/);
assert.match(app.html(), /calasparra-sin-gente.jpg/);
assert.match(app.html(), /calasparra.JPEG/);
app.click("next");
app.input(60);
assert.match(startApp().html(), /value="60"/);
app.input(100);
assert.match(app.html(), /Mucho más pequeños/);
app.click("next");
app.click("song", 0);
assert.match(app.html(), /De aquellas primeras conversaciones/);
assert.match(app.html(), /Escuchar nuestra playlist/);
app.click("show-playlist");
assert.match(app.html(), /open.spotify.com\/embed\/playlist\/5YerRREaAfhwe8wwx631gV/);
app.click("next");
for (let i = 0; i < 6; i++) app.click("puzzle-hint");
assert.match(app.html(), /mi lugar favorito/);
app.click("next");
assert.match(app.html(), /Te empeñaste en llamarme/);
assert.match(app.html(), /dublin4.jpg/);
assert.equal(app.count(), "★ 7 / 9", "La viñeta no añade estrella");
app.click("next");
app.answer("otra ciudad");
app.answer("aún no");
assert.match(app.html(), /Abrir con la pista/);
app.answer("madrid");
assert.match(app.html(), /promesas enormes/);
app.click("next");
assert.match(app.html(), /Murcia a nuestra manera/);
assert.match(app.html(), /Métrica y comimos sushi/);
app.click("next");
assert.match(app.html(), /sudé más que un pollo/);
app.click("open-nerja");
assert.match(app.html(), /uno de los días más bonitos/);
assert.match(app.html(), /nerja.MOV/);
assert.match(app.html(), /nerja2.MOV/);
assert.doesNotMatch(app.html(), /autoplay/);
app.click("next");
assert.match(app.html(), /Aquel mismo día de Nerja también miramos hacia arriba/);
assert.match(app.html(), /eclipseJPEG.JPEG/);
app.click("next");
assert.equal(app.count(), "★ 9 / 9");
assert.equal(app.chapter(), "13 / 13");
app.click("open-letter");
assert.match(app.html(), /Ya ha pasado un tiempo desde que nos conocimos/);
assert.match(app.html(), /Te quiero mucho\./);
assert.match(app.html(), /Siento no poder estar ahí hoy\. Pero al menos, hoy tendrás una sorpresa\./);
assert.doesNotMatch(app.html(), /Aquí puedes escribir tu carta personal/);
app.click("celebrate");
assert.match(app.html(), /Esta historia sigue escribiéndose contigo/);
assert.match(app.html(), /Todos nuestros recuerdos/);
assert.match(app.html(), /calasparra-sin-gente.jpg/);
assert.match(app.html(), /dublin4.jpg/);
assert.equal((app.html().match(/class="birthday-gallery__photo"/g) || []).length, 12);

const resumed = startApp();
assert.equal(resumed.count(), "★ 9 / 9");
assert.match(resumed.html(), /Todos nuestros recuerdos/);
resumed.click("reset");
assert.equal(resumed.count(), "★ 0 / 9");
assert.equal(storage.size, 0);

storage.set("cuando-todo-falla-v4", JSON.stringify({ scene: 5, memories: ["intro", "madrid", "street", "calasparra", "granada"] }));
const withPlaylist = startApp({ spotifyUrl: "https://open.spotify.com/playlist/1234567890abcdefghijkl?si=abc" });
assert.match(withPlaylist.html(), /Escuchar nuestra playlist/);
assert.doesNotMatch(withPlaylist.html(), /<iframe/);
withPlaylist.click("show-playlist");
assert.match(withPlaylist.html(), /open.spotify.com\/embed\/playlist\/1234567890abcdefghijkl/);
assert.doesNotMatch(withPlaylist.html(), /autoplay=1/);
withPlaylist.click("reset");

storage.set("cuando-todo-falla-v2", JSON.stringify({ scene: 7, memories: ["intro", "madrid", "street", "calasparra", "granada", "music", "dublin"], ringOpen: true }));
const migratedRing = startApp();
assert.match(migratedRing.html(), /promesas enormes/);
assert.equal(migratedRing.chapter(), "09 / 13");
migratedRing.click("reset");

storage.set("cuando-todo-falla-v2", JSON.stringify({ scene: 8, memories: ["intro", "madrid", "street", "calasparra", "granada", "music", "dublin", "ring"], letterOpen: true, celebrated: true }));
const migratedBirthday = startApp();
assert.equal(migratedBirthday.chapter(), "10 / 13");
assert.match(migratedBirthday.html(), /Murcia a nuestra manera/);
migratedBirthday.click("reset");

storage.set("cuando-todo-falla-v3", JSON.stringify({ scene: 9, memories: ["intro", "madrid", "street", "calasparra", "granada", "music", "dublin", "ring"], letterOpen: true, celebrated: true }));
const migratedRecentBirthday = startApp();
assert.equal(migratedRecentBirthday.chapter(), "10 / 13");
assert.match(migratedRecentBirthday.html(), /Murcia a nuestra manera/);
migratedRecentBirthday.click("reset");

storage.set("cuando-todo-falla-v1", JSON.stringify({ scene: 6, memories: ["intro", "madrid", "street", "calasparra", "granada", "music"], berlinSolved: true, puzzleOrder: [0, 1, 2, 3, 4, 5] }));
const migratedPuzzle = startApp();
assert.match(migratedPuzzle.html(), /Puzzle de seis piezas de Dublín/);
assert.equal(migratedPuzzle.count(), "★ 6 / 9");
migratedPuzzle.click("reset");
assert.equal(storage.size, 0);

console.log("Recorrido, fotos, playlist, migración y reinicio: OK");
