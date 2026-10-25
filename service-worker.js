
const CACHE_NAME = "mi-negocio-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evento.request, copia);
          });
        }
        return respuesta;
      })
      .catch(async () => {
        const guardada = await caches.match(evento.request);
        if (guardada) return guardada;

        if (evento.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      })
  );
});
        
