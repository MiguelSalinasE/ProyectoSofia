/* Edita este archivo para personalizar la historia. Deja una foto vacía para usar su ilustración provisional. */
const FINAL_LETTER = `Ya ha pasado un tiempo desde que nos conocimos y mí amor por ti solo ha hecho más que crecer. Qué habría pasado si no hubiéramos coincidido aquel día en Madrid, no se, lo que tengo claro es que no sería tan feliz. Cuando ya no me quedan fuerzas para seguir o todo se hace más difícil tú estás ahí para calmarme. Y eso que soy un cascarrabias a veces jeje. Tienes el don de alegrar cada momento que paso contigo, lo aburrido se hace ameno y lo cotidiano algo precioso. Quiero pasar contigo los domingos, pelearme con mí hijastro, cenar pizza viendo cualquier serie aunque tenga que elegirla yo siempre jijiji y estar abrazadito a ti toooooodo el rato. No todo ha sido de color de rosas... Tuve que descubrir que las pijoteras no eran las pequeñas... Mi uso de las palabras llevo a puyas compañeriles, jejejeje. Pero todo esto es lo que nos ha llevado a estar aquí. Otro cumpleaños que celebramos juntos, ya te haces mayor señora jajajajja, aunque nunca admita que a los mayores siempre hay que hacerles caso, tienes la mala manía de llevar la razón.

Eres lo más bonito de mi vida, espero que esto dure para toda la vida, porque te quiero y siempre lo voy a hacer. Tú sonrisa, tus ojos, tu cara, son lo único que quiero ver siempre al despertar. Quiero estar contigo en las buenas y en las malas, porque ahí es cuando se demuestra el amor de verdad, me soportas cuanndo estoy con sueño (a veces) yo me resisto a ir a la cama para ver como te desmaquillas y dormirnos juntos (si no lo hago muero en combate por dormición ejejejejej), cuando me dan mis ansiedades de los domingos, o simplemente cuando tengo ganas de molestar.

Te quiero mucho.

Siento no poder estar ahí hoy. Pero al menos, hoy tendrás una sorpresa.`;

const STORY_CONFIG = {
  title: "Cuando todo falla, nos tenemos",
  names: { me: "", partner: "" },
  photos: {
    madrid: "",
    calasparra: "assets/photos/calasparra-sin-gente.jpg",
    calasparraMoment: "assets/photos/calasparra.JPEG",
    // Primera foto: escena principal y puzzle. Las siguientes aparecen al resolver el capítulo.
    granada: ["assets/photos/optimized/granada.webp", "assets/photos/optimized/granada2.webp", "assets/photos/optimized/granada3.webp"],
    dublin: ["assets/photos/optimized/dublin.webp", "assets/photos/optimized/dublin2.webp", "assets/photos/optimized/dublin3.webp"],
    nickname: "assets/photos/dublin4.jpg",
    murcia: ["assets/photos/murcia.jpeg", "assets/photos/murcia1.JPEG"],
    eclipse: "assets/photos/eclipseJPEG.JPEG",
    ring: ""
  },
  videos: {
    nerja: ["assets/photos/nerja.MOV", "assets/photos/nerja2.MOV"]
  },
  playlist: {
    spotifyUrl: "https://open.spotify.com/playlist/5YerRREaAfhwe8wwx631gV"
  },
  ringQuestion: {
    question: "¿Dónde empezó todo?",
    answer: "Madrid",
    hint: "En Madrid, después del concierto, en un bar de copas.",
    alternateAnswers: ["en Madrid"]
  },
  finalLetter: FINAL_LETTER,
  optionalSound: {
    enabled: false,
    files: { star: "", success: "", transition: "" }
  },
  haptics: { enabled: false },
  text: {
    start: "Empezar nuestra historia",
    continue: "Continuar",
    nextChapter: "Seguir nuestra historia",
    intro: {
      eyebrow: "Para ti, en tu cumpleaños",
      line1: "Hay historias que empiezan con un plan.",
      line2: "La nuestra empezó después de un concierto, en un bar de copas de Madrid.",
      hint: "Ponte cómoda. Esta historia se juega sin prisa."
    },
    madrid: {
      eyebrow: "Capítulo 1 · Madrid",
      concert: "Primero, la música.",
      concertSmall: "Aquella noche empezó en un concierto. Aún no sabíamos lo que vendría después.",
      enterBar: "Salir al bar",
      barHeading: "El bar de copas",
      setup: "Después del concierto fuimos a un bar de copas. Allí nos vimos por primera vez, pero todavía no hablamos.",
      instruction: "Enciende las tres luces del bar.",
      lights: ["Luz rosa", "Luz coral", "Luz lavanda"],
      found: "Lo que tú todavía no sabías es que yo ya me había fijado en ti."
    },
    street: {
      eyebrow: "Capítulo 2 · Otra vez tú",
      heading: "Otra vez tú",
      setup: "Después del bar volvimos a coincidir en una discoteca. La noche todavía no había terminado.",
      instruction: "Marca los tres cruces para que nuestros caminos se encuentren al salir.",
      reunion: "Entre tanta gente, Madrid decidió que teníamos que encontrarnos otra vez.",
      conversation: "Al salir de la discoteca nos quedamos hablando. Ahí empezó a cambiarlo todo."
    },
    calasparra: {
      eyebrow: "Capítulo 3 · Calasparra",
      heading: "Un camino bajo las estrellas",
      setup: "En el Santuario de Calasparra, la noche parecía ir más despacio.",
      instruction: "Traza la constelación uniendo tres estrellas. Puedes arrastrar o tocarlas en orden.",
      early: "Esa estrella nos espera un poquito más adelante.",
      before: "Y en algún punto del camino dejamos de ser simplemente dos personas que se habían encontrado.",
      kiss: "Nuestro primer beso.",
      photoLabel: "El Santuario de Calasparra",
      personalPhotoLabel: "Nosotros en Calasparra"
    },
    granada: {
      eyebrow: "Capítulo 4 · Granada",
      heading: "Lo que se hace pequeño",
      setup: "Hay viajes que se quedan en las fotos. Y otros que nos enseñan a estar juntos.",
      instruction: "Acerca las dos luces. También puedes usar las flechas del teclado.",
      problems: ["miedo", "dudas", "estrés", "distancia", "días malos"],
      lines: [
        "Granada nos recordó algo.",
        "Cuando todo falla…",
        "Nos tenemos el uno al otro.",
        "Y entonces los problemas se hacen pequeños.",
        "Mucho más pequeños."
      ]
    },
    music: {
      eyebrow: "Capítulo 5 · Nuestra banda sonora",
      heading: "Canciones que guardan momentos",
      playlistTitle: "Nuestra playlist en Spotify",
      missingPlaylist: "Añade el enlace de la playlist en js/config.js."
    },
    dublin: {
      eyebrow: "Capítulo 6 · Dublín",
      heading: "Una ciudad más en nuestro mapa",
      setup: "Hay recuerdos que encajan pieza a pieza.",
      instruction: "Toca dos piezas para intercambiarlas. También puedes usar la ayuda.",
      hintButton: "Colocar una pieza",
      pieces: "Piezas en su lugar: {count} / 6",
      lines: ["Fuimos acumulando lugares.", "Madrid.", "Calasparra.", "Granada.", "Dublín.", "Pero mi lugar favorito seguía siendo contigo."],
      photoLabel: "Nuestro recuerdo de Dublín"
    },
    nickname: {
      eyebrow: "Un recuerdo después de Dublín",
      heading: "Mi cariño",
      line1: "Te empeñaste en llamarme «mi cariño».",
      line2: "Empezó como una broma. Y acabó convirtiéndose en algo esencial para nosotros.",
      photoLabel: "Ella, en un recuerdo de esta etapa"
    },
    murcia: {
      eyebrow: "Otro recuerdo · Murcia",
      heading: "Murcia a nuestra manera",
      line: "Disfrutamos de sus calles, fuimos a conciertos como el de Métrica y comimos sushi. Murcia también se fue llenando de momentos nuestros.",
      photoLabel: "Nosotros en Murcia"
    },
    eclipse: {
      eyebrow: "Nerja · Aquel mismo día",
      heading: "Y hasta hubo un eclipse",
      line: "Aquel mismo día de Nerja también miramos hacia arriba: un eclipse, unas gafas imposibles de olvidar y nosotros dos.",
      photoLabel: "Nosotros durante el eclipse"
    },
    nerja: {
      eyebrow: "Otro capítulo · Nerja",
      heading: "La ruta, la playa y nosotros",
      setup: "En Nerja hubo playa. También una ruta en la que casi nos matamos y yo sudé más que un pollo.",
      unfold: "Desplegar aquel día",
      memory: "Y aun así, fue uno de los días más bonitos de mi vida. Pocas veces me lo he pasado tan bien.",
      videoLabel: "Un trocito de Nerja",
      videoFallback: "Abrir o descargar el vídeo"
    },
    ring: {
      eyebrow: "Capítulo 7 · El anillo",
      heading: "Una cosa pequeña",
      setup: "El año pasado quise guardar una promesa en algo que pudieras llevar contigo.",
      answerPlaceholder: "Escribe tu respuesta",
      unlock: "Abrir la caja",
      hintButton: "Ver una pista",
      wrong: "Todavía no se abre. Piensa en cómo empezó nuestra historia.",
      easyOpen: "Abrir con la pista",
      openLines: ["Algunas cosas son pequeñas.", "Pero llevan dentro promesas enormes."],
      photoLabel: "Un recuerdo para llevar siempre"
    },
    birthday: {
      eyebrow: "Capítulo 8 · Cumpleaños",
      heading: "Todo esto nos trajo aquí",
      prelude: "Y después de Madrid,\nCalasparra,\nGranada,\nDublín,\nMurcia,\naquel eclipse,\nNerja,\nlas canciones,\nlos problemas,\nlas risas\ny todo lo que todavía nos queda…",
      lastThing: "Una última cosa",
      letterTitle: "Feliz cumpleaños",
      closing1: "No sé cuántos lugares nos quedan por conocer.",
      closing2: "Solo sé con quién quiero conocerlos.",
      continue: "Continuará…",
      galleryTitle: "Todos nuestros recuerdos",
      galleryIntro: "Y todas estas imágenes son solo el principio.",
      after: "Esta historia sigue escribiéndose contigo."
    },
    resetQuestion: "¿Quieres volver al principio? El progreso guardado se borrará.",
    saved: "Tu historia se guarda en este dispositivo."
  }
};
