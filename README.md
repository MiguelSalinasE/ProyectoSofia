# Cuando todo falla, nos tenemos

Una experiencia web narrativa para jugar y recordar. Funciona como sitio estático: HTML, CSS y JavaScript vanilla. No usa backend, compilación, cuentas ni bibliotecas de terceros. Todo el progreso se guarda en el navegador mediante `localStorage`.

## 1. Ejecutarla localmente

Abre `index.html` con doble clic. También puedes usar cualquier servidor estático, pero no es necesario. La historia y las fotos funcionan sin conexión; el reproductor de Spotify, cuando lo configures, necesita internet.

## 2. Cambiar las fotos

Guarda tus imágenes en `assets/photos/`. Edita únicamente `js/config.js`, en el objeto `STORY_CONFIG.photos`:

```js
photos: {
  madrid: "assets/photos/madrid.jpg",
  calasparra: "assets/photos/calasparra-sin-gente.jpg",
  calasparraMoment: "assets/photos/calasparra.JPEG",
  granada: [
    "assets/photos/optimized/granada.webp",
    "assets/photos/optimized/granada2.webp",
    "assets/photos/optimized/granada3.webp"
  ],
  dublin: [
    "assets/photos/optimized/dublin.webp",
    "assets/photos/optimized/dublin2.webp",
    "assets/photos/optimized/dublin3.webp"
  ],
  nickname: "assets/photos/dublin4.jpg",
  murcia: ["assets/photos/murcia.jpeg", "assets/photos/murcia1.JPEG"],
  eclipse: "assets/photos/eclipseJPEG.JPEG",
  ring: "assets/photos/anillo.jpg"
}
```

La primera foto de Dublín forma el puzzle. Las otras dos aparecen al completarlo. Las tres fotos de Granada aparecen al resolver su escena. `nickname` es la foto del recuerdo «mi cariño», situado después de Dublín. `calasparra` es la imagen del santuario sin personas y `calasparraMoment` añade vuestra foto. Murcia tiene dos fotos y el eclipse de Nerja tiene una. El anillo muestra una ilustración provisional si su ruta queda vacía; Madrid acepta una foto opcional en el bar.

Los JPG originales que añadiste siguen intactos en `assets/photos/`. Las copias WebP de `assets/photos/optimized/` son más ligeras y son las que utiliza la web para Granada y Dublín. Puedes cambiar cualquier ruta por un JPG o WebP propio. Las rutas distinguen mayúsculas y minúsculas en GitHub Pages.

## 3. Cambiar textos y nombres

Todo el texto narrativo está en `js/config.js`, dentro de `STORY_CONFIG.text`. Cambia `title`, `names.me` y `names.partner` cuando quieras. Puedes escribir `{me}` y `{partner}` en los textos para insertar esos nombres; si están vacíos, se mostrarán «yo» y «tú».

La carta se edita en la variable `FINAL_LETTER` del mismo archivo. Respeta los saltos de línea: se mostrarán en la carta. La pregunta, respuesta, pistas y respuestas alternativas del anillo se editan en `ringQuestion`. Tras dos intentos fallidos aparece una opción para abrir la caja con la pista; nadie se queda bloqueado.

Al pulsar «Continuará…» aparecen el confeti y un álbum con todas las fotos distintas configuradas en `STORY_CONFIG.photos`. Los títulos del álbum se editan en `text.birthday.galleryTitle` y `galleryIntro`.

Los dos vídeos de Nerja se configuran en `STORY_CONFIG.videos.nerja`. Se reproducen únicamente al pulsar sus controles: no hay autoplay ni carga anticipada del vídeo completo. Los `.MOV` actuales contienen vídeo H.264 y se comprobaron en Chrome; hay un enlace para abrirlos o descargarlos si otro navegador no los reproduce. Son archivos grandes, así que conviene sustituirlos más adelante por copias MP4 comprimidas para que carguen mejor en móvil. Puedes cambiar sus rutas desde `js/config.js` sin tocar el código.

La cronología está en `text.madrid` y `text.street`: concierto, bar donde os visteis sin hablar, discoteca donde volvisteis a coincidir y conversación al salir. Después llegan Calasparra, Granada, Dublín, «mi cariño», el anillo, Murcia y Nerja con el eclipse del mismo día. No hay diálogos inventados. Las nuevas escenas se editan en `text.murcia`, `text.nerja` y `text.eclipse`.

## 4. Cambiar canciones

Edita el array `STORY_CONFIG.songs` en `js/config.js`:

```js
{
  title: "Nuestra canción",
  artist: "Artista opcional",
  note: "Por qué nos recuerda a aquel día.",
  spotifyUrl: "https://open.spotify.com/track/..."
}
```

El `spotifyUrl` de cada canción es opcional y abre esa canción en Spotify. Para integrar una playlist completa, créala en tu cuenta de Spotify, copia su enlace y colócalo aquí:

```js
playlist: {
  spotifyUrl: "https://open.spotify.com/playlist/ID_DE_TU_PLAYLIST"
}
```

El reproductor oficial se carga cuando la jugadora pulsa «Escuchar nuestra playlist»; no hay reproducción automática. Mientras el enlace esté vacío, seguirán visibles las tarjetas musicales. El enlace debe ser de una playlist de `open.spotify.com`; la disponibilidad de reproducción depende de Spotify y del navegador.

Si más adelante quieres efectos de sonido propios, configura `optionalSound.enabled` y sus rutas `files`. Se reproducen solo tras una interacción, a volumen bajo. Las vibraciones están desactivadas de inicio; puedes activarlas con `haptics.enabled: true`.

## 5. Publicarla en GitHub Pages

1. Crea un repositorio en GitHub y sube estos archivos manteniendo `index.html` en la raíz.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama que contiene los archivos (normalmente `main`) y la carpeta **/(root)**. Guarda los cambios.
5. Espera a que GitHub muestre la URL del sitio. Comprueba allí que las rutas de las fotos coincidan exactamente con sus nombres de archivo.

Guía oficial: [Configurar la fuente de publicación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

La página publicada es accesible públicamente, también cuando el plan permita usar un repositorio privado. Tenlo en cuenta al elegir fotos y textos personales.

El botón discreto `↺` de la esquina superior reinicia la historia en ese navegador. El progreso no se sincroniza entre dispositivos.

## Estructura

```text
index.html
css/styles.css
css/redesign.css
js/config.js
js/app.js
assets/placeholders/dublin.svg
assets/favicon.svg
assets/photos/  ← originales y copias optimizadas
```

La experiencia respeta `prefers-reduced-motion`, puede manejarse con teclado, no tiene Game Over y ofrece ayuda en el puzzle y el anillo. En Calasparra puedes tocar las estrellas en orden o arrastrar entre ellas; en Granada la barra funciona con el dedo o con las flechas del teclado.

Para comprobar el recorrido completo y el guardado, ejecuta `node tests/smoke.js` si tienes Node.js instalado. Node.js solo se usa para esta prueba, no para la web.
