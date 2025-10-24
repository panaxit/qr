const CACHE_NAME = `${location.hostname}_1.1`,
    urlsToCache = [
        './'
        , './register-pwa.js'
        , './custom/images/favicon.png'
        , './custom/images/icon.png'
        , 'https://d3js.org/d3.v5.min.js'
        , 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css'
        , 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js'
    ]

//durante la fase de instalación, generalmente se almacena en caché los activos estáticos
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache)
                    .then(() => self.skipWaiting())
            })
            .catch(err => console.log('Falló registro de cache', err))
    )
})

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME]

    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        //Eliminamos lo que ya no se necesita en cache
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName)
                        }
                    })
                )
            })
            // Le indica al SW activar el cache actual
            .then(() => self.clients.claim())
    )
})

//Cuando el navegador recupera una url
self.addEventListener('fetch', e => {
    //Responder ya sea con el objeto en caché o continuar y buscar la url real
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                let from_cache = (!navigator.onLine || ['force-cache', 'only-if-cached'].includes(e.request.headers.get("Cache-Control")) || ['image', 'style', 'script'].includes(e.request.destination) || e.request.url.indexOf('.xsl') != -1);
                return from_cache && response || fetch(e.request).then(response => {
                    if (!(e.request.method == 'GET' && response && response.status == 200 && !['no-store', 'no-cache'].includes(e.request.cache) /*&& ['basic','cors'].includes(response.type)*/)) {
                        return response;
                    }
                    return caches.open(CACHE_NAME).then(cache => {
                        try {
                            cache.put(e.request, response.clone());
                            console.log('[SW] Almacena el nuevo recurso: ' + e.request.url);
                        } catch (e) {
                            console.log('[SW] No se pudo almacenar el nuevo recurso: ' + e.request.url);
                        }
                        return response;
                    });
                });
            })
    )
})
