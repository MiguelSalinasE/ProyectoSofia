/* La historia funciona sin servidor: todos los recursos son rutas relativas. */
(() => {
  "use strict";

  const config = STORY_CONFIG;
  const copy = config.text;
  const scenes = ["intro", "madrid", "street", "calasparra", "granada", "music", "dublin", "nickname", "ring", "murcia", "nerja", "eclipse", "birthday"];
  const memoryScenes = scenes.filter(name => !["nickname", "murcia", "eclipse", "birthday"].includes(name));
  const storageKey = "cuando-todo-falla-v4";
  const previousStorageKeys = ["cuando-todo-falla-v3", "cuando-todo-falla-v2", "cuando-todo-falla-v1"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const story = document.getElementById("story");
  const counter = document.getElementById("memory-count");
  const chapterIndicator = document.getElementById("chapter-indicator");
  const toastElement = document.getElementById("toast");
  let toastTimer;

  function initialState() {
    return {
      scene: 0,
      memories: [],
      madridStage: 0,
      barLights: 0,
      routeProgress: 0,
      constellationProgress: 0,
      granadaDistance: 0,
      selectedSong: -1,
      puzzleOrder: [2, 0, 5, 1, 4, 3],
      selectedPiece: -1,
      dublinSolved: false,
      playlistVisible: false,
      ringAttempts: 0,
      ringHint: false,
      ringOpen: false,
      nerjaOpened: false,
      letterOpen: false,
      celebrated: false
    };
  }

  function loadState() {
    try {
      const current = localStorage.getItem(storageKey);
      const legacyKey = current ? null : previousStorageKeys.find(key => localStorage.getItem(key));
      const saved = JSON.parse(current || (legacyKey && localStorage.getItem(legacyKey)) || "null");
      const legacy = !current && Boolean(legacyKey);
      const oldGame = legacyKey?.endsWith("v2") || legacyKey?.endsWith("v1");
      const oldLength = legacyKey?.endsWith("v3") ? 10 : 9;
      if (!saved || !Number.isInteger(saved.scene) || saved.scene < 0 || saved.scene >= (legacy ? oldLength : scenes.length)) return initialState();
      const base = initialState();
      const loaded = { ...base, ...saved };
      if (legacyKey?.endsWith("v3") && saved.scene === 9) loaded.scene = 9;
      if (oldGame && saved.scene >= 7) loaded.scene = saved.scene + 1;
      loaded.memories = Array.isArray(saved.memories)
        ? [...new Set(saved.memories.map(name => name === "berlin" ? "dublin" : name).filter(name => memoryScenes.includes(name)))]
        : [];
      loaded.madridStage = oldGame ? Number(Boolean(saved.madridConcert || saved.madridFound)) : Math.min(1, Math.max(0, Number(saved.madridStage) || 0));
      loaded.barLights = oldGame ? saved.madridFound ? 7 : 0 : Math.min(7, Math.max(0, Number(saved.barLights) || 0));
      loaded.routeProgress = oldGame ? 0 : Math.min(3, Math.max(0, Number(saved.routeProgress) || 0));
      loaded.constellationProgress = oldGame ? Math.min(3, Math.max(0, Number(saved.pathIndex) || 0)) : Math.min(3, Math.max(0, Number(saved.constellationProgress) || 0));
      loaded.granadaDistance = oldGame ? Array.isArray(saved.problems) && saved.problems.every(n => Number(n) >= (legacyKey.endsWith("v1") ? 3 : 1)) ? 100 : 0 : Math.min(100, Math.max(0, Number(saved.granadaDistance) || 0));
      loaded.puzzleOrder = Array.isArray(saved.puzzleOrder) && saved.puzzleOrder.length === 6 && new Set(saved.puzzleOrder).size === 6 && saved.puzzleOrder.every(n => Number.isInteger(n) && n >= 0 && n < 6) ? saved.puzzleOrder : base.puzzleOrder;
      if (legacyKey?.endsWith("v1") && loaded.scene === 6) {
        loaded.puzzleOrder = base.puzzleOrder;
        loaded.selectedPiece = -1;
      }
      loaded.dublinSolved = legacyKey?.endsWith("v1") && loaded.scene === 6 ? false : Boolean(saved.dublinSolved);
      loaded.nerjaOpened = Boolean(saved.nerjaOpened);
      loaded.playlistVisible = false;
      for (const oldField of ["madridFound", "madridConcert", "walkSteps", "dialogueStarted", "dialogueIndex", "dialogueReply", "pathIndex", "problems", "berlinSolved"]) delete loaded[oldField];
      return loaded;
    } catch {
      return initialState();
    }
  }

  let state = loadState();

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* El juego sigue si el almacenamiento está bloqueado. */ }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function t(value) {
    return escapeHtml(String(value ?? "").replaceAll("{me}", config.names.me || "yo").replaceAll("{partner}", config.names.partner || "tú"));
  }

  function replaceCount(value, count) {
    return t(String(value).replace("{count}", count).replace("{remaining}", count));
  }

  function safeUrl(value) {
    if (!value) return "";
    const url = String(value).trim();
    if (/^(https:\/\/|\.\.?\/|assets\/)/i.test(url)) return escapeHtml(url);
    return "";
  }

  function photo(path, label, kind = "memory", loading = "lazy") {
    const url = safeUrl(path);
    return url
      ? `<img class="photo__image" src="${url}" alt="${t(label)}" loading="${loading}" decoding="${loading === "eager" ? "sync" : "async"}">`
      : `<div class="photo__placeholder photo__placeholder--${kind}" role="img" aria-label="Espacio para ${t(label)}"><span class="placeholder__glow">✦</span><span>${t(label)}</span></div>`;
  }

  function photoPaths(value) {
    return (Array.isArray(value) ? value : [value]).filter(Boolean);
  }

  function photoMoments(paths, city) {
    return `<div class="moment-strip" aria-label="Tres recuerdos de ${t(city)}">${paths.map((path, index) => `<figure class="moment-strip__frame moment-strip__frame--${index}">${photo(path, `Nosotros en ${city}, momento ${index + 1}`)}<figcaption>${String(index + 1).padStart(2, "0")} · ${t(city)}</figcaption></figure>`).join("")}</div>`;
  }

  function spotifyEmbedUrl(value) {
    const match = String(value || "").trim().match(/^https:\/\/open\.spotify\.com\/playlist\/([A-Za-z0-9]{10,})(?:[/?#]|$)/i);
    return match ? `https://open.spotify.com/embed/playlist/${match[1]}` : "";
  }

  function button(label, action, extra = "") {
    return `<button class="button ${extra}" type="button" data-action="${action}">${t(label)}<span aria-hidden="true"> ↗</span></button>`;
  }

  function page(eyebrow, heading, body, extraClass = "") {
    return `<section class="scene scene--${scenes[state.scene]} ${extraClass}" aria-labelledby="scene-title">
      <div class="scene__content"><p class="eyebrow"><span class="eyebrow__spark">✦</span> ${t(eyebrow)}</p><h1 id="scene-title">${t(heading)}</h1>${body}</div>
    </section>`;
  }

  function renderIntro() {
    const c = copy.intro;
    const dublin = photoPaths(config.photos.dublin);
    const granada = photoPaths(config.photos.granada);
    return page(c.eyebrow, config.title, `<div class="intro__cinema" aria-hidden="true"><div class="intro__frame intro__frame--one">${photo(dublin[0], "Dublín", "memory", "eager")}</div><div class="intro__frame intro__frame--two">${photo(granada[0], "Granada", "memory", "eager")}</div><span class="intro__cinema-star">✦</span></div>
      <div class="intro__lines"><p>${t(c.line1)}</p><p>${t(c.line2)}</p></div>
      <div class="scene__actions">${button(copy.start, "next")}<p class="subtle">${t(c.hint)}</p></div>`, "scene--center");
  }

  function renderMadrid() {
    const c = copy.madrid;
    if (state.madridStage === 0) return page(c.eyebrow, c.concert, `<p class="scene__lead">${t(c.concertSmall)}</p><div class="concert" role="img" aria-label="Luces de un concierto, sin representar a ningún artista"><div class="concert__beam concert__beam--one"></div><div class="concert__beam concert__beam--two"></div><div class="concert__stage"></div><div class="concert__crowd"></div></div><div class="scene__actions">${button(c.enterBar, "madrid-bar")}</div>`);
    const complete = state.barLights === 7;
    const lights = c.lights.map((label, index) => `<button class="bar-light bar-light--${index}${state.barLights & (1 << index) ? " is-on" : ""}" type="button" data-action="bar-light" data-index="${index}" aria-pressed="${Boolean(state.barLights & (1 << index))}" aria-label="${t(label)}"><span aria-hidden="true">✦</span><small>${t(label)}</small></button>`).join("");
    return page(c.eyebrow, c.barHeading, `<p class="scene__lead">${t(c.setup)}</p><div class="bar-scene ${complete ? "bar-scene--lit" : ""}" role="group" aria-label="Tres luces del bar de copas"><div class="bar-scene__halo" aria-hidden="true"></div><div class="bar-scene__shelf" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="bar-scene__lights">${lights}</div><div class="bar-scene__counter" aria-hidden="true"></div></div>${complete ? `<div class="reveal"><p>${t(c.found)}</p></div>${config.photos.madrid ? `<div class="optional-photo">${photo(config.photos.madrid, "Un recuerdo de Madrid")}</div>` : ""}<div class="scene__actions">${button(copy.nextChapter, "next")}</div>` : `<p class="instruction">${t(c.instruction)}</p>`}`);
  }

  function renderStreet() {
    const c = copy.street;
    const complete = state.routeProgress >= 3;
    const nodes = Array.from({ length: 3 }, (_, index) => `<button class="route-node route-node--${index}${index < state.routeProgress ? " is-visited" : ""}${index === state.routeProgress ? " is-next" : ""}" type="button" data-action="route-node" data-index="${index}" aria-label="Cruce ${index + 1} de 3${index < state.routeProgress ? ", recorrido" : ""}"><span aria-hidden="true">✦</span></button>`).join("");
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p><div class="route-map" role="group" aria-label="Dos recorridos por Madrid que terminan juntos"><svg class="route-map__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M 6 22 Q 31 22 42 46 T 92 80"/><path d="M 6 82 Q 34 87 54 47 T 92 80"/></svg><span class="route-map__start route-map__start--one">yo</span><span class="route-map__start route-map__start--two">tú</span>${nodes}<span class="route-map__end" aria-hidden="true">${complete ? "♥" : "✦"}</span></div>${complete ? `<div class="reveal"><p>${t(c.reunion)}</p><p class="reveal__small">${t(c.conversation)}</p></div><div class="scene__actions">${button(copy.nextChapter, "next")}</div>` : `<p class="instruction">${t(c.instruction)}</p>`}`);
  }

  function renderCalasparra() {
    const c = copy.calasparra;
    const complete = state.constellationProgress >= 3;
    const stars = Array.from({ length: 3 }, (_, index) => `<button class="path-star path-star--${index}${index < state.constellationProgress ? " is-visited" : ""}${index === state.constellationProgress ? " is-next" : ""}" type="button" data-action="path-star" data-index="${index}" aria-label="Estrella ${index + 1} de 3${index < state.constellationProgress ? ", unida" : ""}">✦</button>`).join("");
    const personalPhoto = config.photos.calasparraMoment ? `<div class="polaroid polaroid--personal"><div class="polaroid__image">${photo(config.photos.calasparraMoment, c.personalPhotoLabel)}</div><p>${t(c.kiss)}</p></div>` : "";
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p>${complete ? `<p class="reveal reveal--plain">${t(c.before)}</p><div class="kiss-stars" aria-hidden="true"><span>✦</span><span>✦</span></div><div class="calasparra-photos"><div class="polaroid"><div class="polaroid__image">${photo(config.photos.calasparra, c.photoLabel, "sanctuary")}</div><p>${t(personalPhoto ? c.photoLabel : c.kiss)}</p></div>${personalPhoto}</div><div class="scene__actions">${button(copy.nextChapter, "next")}</div>` : `<div class="star-path star-path--step-${state.constellationProgress}" role="group" aria-label="Constelación de tres estrellas"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="18,70 48,24 78,55"/></svg>${stars}</div><p class="instruction">${t(c.instruction)}</p>`}`);
  }

  function renderGranada() {
    const c = copy.granada;
    const photos = photoPaths(config.photos.granada);
    const complete = state.granadaDistance >= 100;
    const problems = c.problems.map((word, index) => `<span class="problem problem--${index}" style="--shrink:${1 - state.granadaDistance * .0085}" aria-hidden="true">${t(word)}</span>`).join("");
    const stage = `<div class="granada-sky ${complete ? "granada-sky--clear" : ""}" style="--approach:${state.granadaDistance * .34}%"><div class="granada-sky__photo" aria-hidden="true">${photo(photos[0], "Granada al atardecer", "memory", "eager")}</div><div class="granada-sky__vignette" aria-hidden="true"></div><div class="granada-lights" aria-hidden="true"><span>✦</span><span>✦</span></div><div class="problems">${problems}</div>${complete ? `<div class="granada-stars" aria-hidden="true">✦ · ✦ · ✦ · ✦ · ✦</div>` : ""}</div>`;
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p>${stage}${complete ? `<div class="granada-reveal">${c.lines.map((line, index) => `<p class="granada-reveal__line granada-reveal__line--${index}" style="--i:${index}">${t(line)}</p>`).join("")}</div>${photoMoments(photos, "Granada")}<div class="scene__actions scene__actions--delayed">${button(copy.nextChapter, "next")}</div>` : `<label class="gesture-label" for="granada-distance">${t(c.instruction)}</label><input id="granada-distance" class="gesture-range" type="range" min="0" max="100" step="5" value="${state.granadaDistance}" aria-label="Acercar nuestras dos luces">`}`);
  }

  function renderMusic() {
    const c = copy.music;
    const songs = config.songs || [];
    const embedUrl = spotifyEmbedUrl(config.playlist?.spotifyUrl);
    const cards = songs.map((song, index) => `<button class="song-card ${state.selectedSong === index ? "is-selected" : ""}" type="button" data-action="song" data-index="${index}" aria-pressed="${state.selectedSong === index}"><span class="song-card__disc" aria-hidden="true"><span></span></span><span class="song-card__info"><span class="song-card__number">TRACK ${String(index + 1).padStart(2, "0")}</span><strong>${t(song.title)}</strong><small>${t(song.artist || "Un recuerdo nuestro")}</small></span><span class="song-card__arrow" aria-hidden="true">↗</span></button>`).join("");
    const selected = songs[state.selectedSong];
    const link = selected && /^https:\/\//i.test(selected.spotifyUrl || "") ? `<a class="text-link" href="${safeUrl(selected.spotifyUrl)}" target="_blank" rel="noopener noreferrer">${t(c.link)}</a>` : "";
    const playlist = embedUrl ? `<div class="playlist-embed">${state.playlistVisible ? `<iframe title="${t(c.playlistTitle)}" src="${embedUrl}" width="100%" height="352" loading="lazy" tabindex="0" allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>` : `<button class="button button--secondary" type="button" data-action="show-playlist">${t(c.playlistButton)} <span aria-hidden="true">♫</span></button>`}</div>` : "";
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p><div class="music-player"><div class="music-player__top"><span>✦ NUESTRA PLAYLIST</span><span>UNA CANCIÓN CADA VEZ</span></div><div class="music-player__display"><div class="music-player__art" aria-hidden="true">♫</div><div><span class="music-player__label">AHORA RECORDANDO</span><strong>${selected ? t(selected.title) : "—"}</strong><p>${selected ? t(selected.note) : t(c.instruction)}</p>${link}</div></div><div class="music-player__timeline" aria-hidden="true"><span></span></div><div class="song-list">${cards || `<p class="subtle">${t(c.noSongs)}</p>`}</div></div>${playlist}<div class="scene__actions">${button(copy.nextChapter, "next")}</div>`);
  }

  function renderDublin() {
    const c = copy.dublin;
    const photos = photoPaths(config.photos.dublin);
    const url = safeUrl(photos[0]) || "assets/placeholders/dublin.svg";
    if (state.dublinSolved) return page(c.eyebrow, c.heading, `<div class="dublin-complete"><div class="dublin-complete__photo">${photo(photos[0] || "assets/placeholders/dublin.svg", c.photoLabel, "dublin")}</div><div class="dublin-complete__lines">${c.lines.map((line, index) => `<p style="--i:${index}">${t(line)}</p>`).join("")}</div></div>${photoMoments(photos, "Dublín")}<div class="scene__actions">${button(copy.nextChapter, "next")}</div>`);
    const tiles = state.puzzleOrder.map((piece, position) => `<button class="puzzle__tile ${state.selectedPiece === position ? "is-selected" : ""}" type="button" data-action="puzzle-tile" data-index="${position}" aria-label="Pieza ${piece + 1}, posición ${position + 1}${position === piece ? ", en su lugar" : ""}" aria-pressed="${state.selectedPiece === position}" style="--tile-x:${piece % 3};--tile-y:${Math.floor(piece / 3)};background-image:url('${url}')"><span>${piece + 1}</span></button>`).join("");
    const inPlace = state.puzzleOrder.filter((piece, index) => piece === index).length;
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p><div class="puzzle-wrap"><div class="puzzle" role="group" aria-label="Puzzle de seis piezas de Dublín">${tiles}</div><div class="puzzle__side"><p class="instruction">${t(c.instruction)}</p><p class="puzzle__count">${replaceCount(c.pieces, inPlace)}</p><button class="button button--secondary" type="button" data-action="puzzle-hint">${t(c.hintButton)} ✦</button></div></div>`);
  }

  function renderNickname() {
    const c = copy.nickname;
    return page(c.eyebrow, c.heading, `<div class="nickname-memory"><div class="nickname-memory__photo">${photo(config.photos.nickname, c.photoLabel)}</div><div class="nickname-memory__copy"><p>${t(c.line1)}</p><p>${t(c.line2)}</p><div class="scene__actions">${button(copy.nextChapter, "next")}</div></div></div>`);
  }

  function renderRing() {
    const c = copy.ring;
    const q = config.ringQuestion;
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p><div class="ring-layout"><div class="ring-box ${state.ringOpen ? "ring-box--open" : ""}" aria-label="Caja de anillo ${state.ringOpen ? "abierta" : "cerrada"}"><div class="ring-box__lid"></div><div class="ring-box__inside"><span class="ring-box__ring" aria-hidden="true">◇</span></div><div class="ring-box__base"></div></div>${state.ringOpen ? `<div class="ring-reveal"><div class="ring-reveal__photo">${photo(config.photos.ring, c.photoLabel, "ring")}</div>${c.openLines.map(line => `<p>${t(line)}</p>`).join("")}${button(copy.nextChapter, "next")}</div>` : `<div class="ring-question"><label for="ring-answer">${t(q.question)}</label><form id="ring-form"><input id="ring-answer" name="answer" type="text" autocomplete="off" required placeholder="${t(c.answerPlaceholder)}"><button class="button" type="submit">${t(c.unlock)} <span aria-hidden="true">↗</span></button></form><button class="text-link text-link--button" type="button" data-action="ring-hint">${t(c.hintButton)}</button>${state.ringHint ? `<p class="ring-question__hint">${t(q.hint)}</p>` : ""}${state.ringAttempts >= 2 ? `<button class="button button--secondary" type="button" data-action="ring-easy-open">${t(c.easyOpen)} ✦</button>` : ""}</div>`}</div>`);
  }

  function renderMurcia() {
    const c = copy.murcia;
    const photos = photoPaths(config.photos.murcia);
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.line)}</p><div class="vignette-photos">${photos.map((path, index) => `<figure><div>${photo(path, `${c.photoLabel} ${index + 1}`)}</div><figcaption>${t(c.photoLabel)} · ${index + 1}</figcaption></figure>`).join("")}</div><div class="scene__actions">${button(copy.nextChapter, "next")}</div>`);
  }

  function renderNerja() {
    const c = copy.nerja;
    const videos = photoPaths(config.videos?.nerja);
    const reels = videos.map((path, index) => {
      const url = safeUrl(path);
      return `<details class="nerja-reel"><summary><span aria-hidden="true">▶</span>${t(c.videoLabel)} · ${index + 1}</summary><video controls preload="none" playsinline aria-label="${t(c.videoLabel)} ${index + 1}"><source src="${url}" type="video/mp4">Tu navegador no puede reproducir este vídeo.</video><a href="${url}" target="_blank" rel="noopener noreferrer">${t(c.videoFallback)} ↗</a></details>`;
    }).join("");
    return page(c.eyebrow, c.heading, `<p class="scene__lead">${t(c.setup)}</p><div class="nerja-map ${state.nerjaOpened ? "nerja-map--open" : ""}" aria-hidden="true"><span>☀</span><span>≈</span><span>✦</span></div>${state.nerjaOpened ? `<div class="reveal"><p>${t(c.memory)}</p></div><div class="nerja-reels">${reels}</div><div class="scene__actions">${button(copy.nextChapter, "next")}</div>` : `<div class="scene__actions">${button(c.unfold, "open-nerja")}</div>`}`);
  }

  function renderEclipse() {
    const c = copy.eclipse;
    return page(c.eyebrow, c.heading, `<div class="eclipse-memory"><div class="eclipse-memory__photo">${photo(config.photos.eclipse, c.photoLabel)}</div><div><p>${t(c.line)}</p>${button(copy.nextChapter, "next")}</div></div>`);
  }

  function galleryPhotos() {
    const groups = [
      [config.photos.madrid, "Madrid"],
      [config.photos.calasparra, "Calasparra"],
      [config.photos.calasparraMoment, "Nosotros en Calasparra"],
      [config.photos.granada, "Granada"],
      [config.photos.dublin, "Dublín"],
      [config.photos.nickname, "Mi cariño"],
      [config.photos.ring, "El anillo"],
      [config.photos.murcia, "Murcia"],
      [config.photos.eclipse, "El eclipse en Nerja"]
    ];
    const seen = new Set();
    return groups.flatMap(([paths, label]) => photoPaths(paths).map((path, index) => ({ path, label: Array.isArray(paths) ? `${label} · ${index + 1}` : label })))
      .filter(item => { if (seen.has(item.path)) return false; seen.add(item.path); return true; });
  }

  function renderBirthday() {
    const c = copy.birthday;
    const coords = [[29, 29], [18, 40], [23, 55], [35, 70], [50, 79], [65, 70], [77, 55], [82, 40], [71, 29]];
    const heart = state.memories.map((_, index) => `<span class="heart-star" style="--x:${coords[index][0]}%;--y:${coords[index][1]}%;--i:${index}">✦</span>`).join("");
    const album = state.celebrated ? `<section class="birthday-gallery" aria-labelledby="gallery-title"><p class="eyebrow">✦ ${t(c.after)}</p><h2 id="gallery-title">${t(c.galleryTitle)}</h2><p>${t(c.galleryIntro)}</p><div class="birthday-gallery__grid">${galleryPhotos().map(item => `<figure class="birthday-gallery__photo">${photo(item.path, item.label)}<figcaption>${t(item.label)}</figcaption></figure>`).join("")}</div></section>` : "";
    const letter = state.letterOpen ? `<div class="letter"><div class="letter__seal">✦</div><h2>${t(c.letterTitle)}${config.names.partner ? `, ${t(config.names.partner)}` : ""}</h2><p class="letter__body">${t(config.finalLetter)}</p><div class="letter__closing"><p>${t(c.closing1)}</p><p>${t(c.closing2)}</p></div><button class="button" type="button" data-action="celebrate">${t(c.continue)} <span aria-hidden="true">✦</span></button></div>${album}` : `<div class="birthday__prelude"><p>${t(c.prelude)}</p>${button(c.lastThing, "open-letter")}</div>`;
    return page(c.eyebrow, c.heading, `<div class="heart-field" aria-label="${state.memories.length} estrellas recogidas forman un corazón">${heart}</div>${letter}`, "scene--birthday");
  }

  const renderers = [renderIntro, renderMadrid, renderStreet, renderCalasparra, renderGranada, renderMusic, renderDublin, renderNickname, renderRing, renderMurcia, renderNerja, renderEclipse, renderBirthday];

  function render(focusHeading = false) {
    document.title = `${config.title} · ${scenes[state.scene]}`;
    story.innerHTML = renderers[state.scene]();
    counter.textContent = `★ ${state.memories.length} / ${memoryScenes.length}`;
    counter.setAttribute("aria-label", `${state.memories.length} de ${memoryScenes.length} recuerdos recogidos`);
    chapterIndicator.textContent = `${String(state.scene + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
    if (focusHeading) {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
      const heading = document.getElementById("scene-title");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function notify(message) {
    toastElement.textContent = message;
    toastElement.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastElement.classList.remove("toast--visible"), 2800);
  }

  function subtleFeedback(sound = "star") {
    if (config.haptics?.enabled && !reducedMotion.matches && navigator.vibrate) navigator.vibrate(12);
    const file = config.optionalSound?.enabled && config.optionalSound.files?.[sound];
    if (file) { const audio = new Audio(file); audio.volume = 0.15; audio.play().catch(() => {}); }
  }

  function update(focusHeading = false) {
    const active = document.activeElement;
    const activeAction = active?.dataset?.action;
    const activeIndex = active?.dataset?.index;
    const playingEmbed = state.scene === 5 ? story.querySelector(".playlist-embed iframe") : null;
    save();
    render(focusHeading);
    if (playingEmbed && state.scene === 5) story.querySelector(".playlist-embed iframe")?.replaceWith(playingEmbed);
    if (!focusHeading && activeAction) {
      const selector = `[data-action="${activeAction}"]${activeIndex === undefined ? "" : `[data-index="${activeIndex}"]`}`;
      let nextFocus = story.querySelector(selector);
      if (activeAction === "path-star") nextFocus = story.querySelector(".path-star.is-next");
      if (nextFocus?.disabled) nextFocus = null;
      nextFocus ||= story.querySelector("button:not([disabled])");
      nextFocus?.focus({ preventScroll: true });
    }
  }

  function nextScene() {
    const current = scenes[state.scene];
    if (memoryScenes.includes(current) && !state.memories.includes(current)) {
      state.memories.push(current);
      subtleFeedback("star");
    }
    if (state.scene < scenes.length - 1) state.scene += 1;
    update(true);
  }

  function activateStar(index) {
    if (index === state.constellationProgress && index < 3) {
      state.constellationProgress += 1;
      subtleFeedback(state.constellationProgress === 3 ? "success" : "star");
      update();
    } else if (index > state.constellationProgress) notify(copy.calasparra.early);
  }

  function normalizeAnswer(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  }

  function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const index = Number(target.dataset.index);
    if (action === "reset") {
      if (window.confirm(copy.resetQuestion)) {
        state = initialState();
        try {
          localStorage.removeItem(storageKey);
          previousStorageKeys.forEach(key => localStorage.removeItem(key));
        } catch { /* Sin almacenamiento persistente. */ }
        render(true);
      }
      return;
    }
    if (action === "next") return nextScene();
    if (action === "madrid-bar") { state.madridStage = 1; subtleFeedback("transition"); update(true); }
    if (action === "bar-light" && Number.isInteger(index) && index >= 0 && index < 3) {
      state.barLights |= 1 << index;
      subtleFeedback(state.barLights === 7 ? "success" : "star");
      update();
    }
    if (action === "route-node" && index === state.routeProgress) {
      state.routeProgress += 1;
      subtleFeedback(state.routeProgress === 3 ? "success" : "star");
      update();
    }
    if (action === "path-star") activateStar(index);
    if (action === "song") { state.selectedSong = index; subtleFeedback(); update(); }
    if (action === "show-playlist") {
      if (spotifyEmbedUrl(config.playlist?.spotifyUrl)) {
        state.playlistVisible = true;
        update();
        story.querySelector("iframe")?.focus({ preventScroll: true });
      }
    }
    if (action === "puzzle-tile") {
      if (state.selectedPiece < 0) { state.selectedPiece = index; update(); }
      else if (state.selectedPiece === index) { state.selectedPiece = -1; update(); }
      else {
        [state.puzzleOrder[state.selectedPiece], state.puzzleOrder[index]] = [state.puzzleOrder[index], state.puzzleOrder[state.selectedPiece]];
        state.selectedPiece = -1;
        state.dublinSolved = state.puzzleOrder.every((piece, position) => piece === position);
        subtleFeedback(state.dublinSolved ? "success" : "star"); update();
      }
    }
    if (action === "puzzle-hint") {
      const wrong = state.puzzleOrder.findIndex((piece, position) => piece !== position);
      if (wrong >= 0) {
        const correctPosition = state.puzzleOrder.indexOf(wrong);
        [state.puzzleOrder[wrong], state.puzzleOrder[correctPosition]] = [state.puzzleOrder[correctPosition], state.puzzleOrder[wrong]];
        state.selectedPiece = -1;
        state.dublinSolved = state.puzzleOrder.every((piece, position) => piece === position);
        subtleFeedback(state.dublinSolved ? "success" : "star"); update();
      }
    }
    if (action === "ring-hint") { state.ringHint = true; update(); }
    if (action === "ring-easy-open") { state.ringOpen = true; subtleFeedback("success"); update(); }
    if (action === "open-nerja") { state.nerjaOpened = true; subtleFeedback("transition"); update(); }
    if (action === "open-letter") { state.letterOpen = true; subtleFeedback(); update(); }
    if (action === "celebrate") {
      state.celebrated = true;
      subtleFeedback("success");
      update();
      launchConfetti();
      story.querySelector(".birthday-gallery")?.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
    }
  }

  function onSubmit(event) {
    if (event.target.id !== "ring-form") return;
    event.preventDefault();
    const answer = normalizeAnswer(new FormData(event.target).get("answer"));
    const validAnswers = [config.ringQuestion.answer, ...(config.ringQuestion.alternateAnswers || [])].map(normalizeAnswer);
    if (answer && validAnswers.includes(answer)) {
      state.ringOpen = true;
      subtleFeedback("success");
      update();
      story.querySelector("button")?.focus({ preventScroll: true });
    }
    else {
      state.ringAttempts += 1;
      if (state.ringAttempts >= 2) state.ringHint = true;
      update();
      story.querySelector("#ring-answer")?.focus({ preventScroll: true });
      notify(copy.ring.wrong);
    }
  }

  function onInput(event) {
    if (event.target.id !== "granada-distance") return;
    state.granadaDistance = Math.min(100, Math.max(0, Number(event.target.value) || 0));
    const sky = story.querySelector(".granada-sky");
    sky?.style.setProperty("--approach", `${state.granadaDistance * .34}%`);
    story.querySelectorAll(".problem").forEach(problem => problem.style.setProperty("--shrink", 1 - state.granadaDistance * .0085));
    save();
    if (state.granadaDistance >= 100) { subtleFeedback("success"); update(); }
  }

  let tracingConstellation = false;
  function onPointerDown(event) {
    const target = event.target.closest?.('[data-action="path-star"]');
    if (target) { tracingConstellation = true; activateStar(Number(target.dataset.index)); }
  }

  function onPointerMove(event) {
    if (!tracingConstellation) return;
    const star = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-action="path-star"]');
    if (star) activateStar(Number(star.dataset.index));
  }

  function makeSky() {
    const sky = document.getElementById("sky-stars");
    for (let i = 0; i < 28; i++) {
      const star = document.createElement("span");
      star.className = "sky__star";
      star.style.cssText = `--x:${(i * 73 + 11) % 100}%;--y:${(i * 47 + 7) % 93}%;--delay:${(i % 9) * -0.6}s;--size:${i % 5 === 0 ? 3 : 2}px`;
      sky.append(star);
    }
  }

  function launchConfetti() {
    if (reducedMotion.matches) { notify(copy.birthday.after); return; }
    const container = document.createElement("div");
    container.className = "confetti";
    container.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 56; i++) {
      const piece = document.createElement("span");
      piece.style.cssText = `--x:${(i * 41) % 100}vw;--delay:${(i % 11) * 0.07}s;--duration:${2.1 + (i % 5) * 0.2}s;--rotate:${(i * 97) % 720}deg`;
      container.append(piece);
    }
    document.body.append(container);
    setTimeout(() => container.remove(), 3800);
  }

  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("input", onInput);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", () => { tracingConstellation = false; });
  document.addEventListener("pointercancel", () => { tracingConstellation = false; });
  makeSky();
  render();
})();
