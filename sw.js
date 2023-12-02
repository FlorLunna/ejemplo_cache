const CACHE ='ejemplo';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_INMUTABLE ='inmutable-1';

self.addEventListener('install', evento=>{
    /*Seleccione el tipo de cache with network fallback, ya que nos permite cargar los archivos que
    son necesarios para poder almacenarlos en el caché inicial. Posteriormente en el caché inmutable 
    mando a llamar archivos que no se van a modificar y posteriormente abro el caché dinámico para que 
    se guarden los archivos que no se encuentran en el espacio principal y que se limite solo a 5 archivos.
    -VENTAJAS: La aplicación se podrá visualizar si es que no se tiene conexión a internet.
    -DESVENTAJAS: Los archivos guardados en el Shell hace que se pueda abrir un espacio dinámico que pueden modificarse.
    */
    const promesa =caches.open(CACHE)
    .then(cache=>{
    return cache.addAll([
        '/',
        'index.html',
        'css/icons.css',
        'css/googleapi.css',
        'manifest.json',
        'js/bootstrap.min.js',
        'js/application.js',
        'js/app.js',
        '/images/error404.jpg',
        'offline.html',
        'form.html'
    ]);
    });
    const cacheInmutable =  caches.open(CACHE_INMUTABLE)
        .then(cache => cache.addAll([
            'css/bootstrap.min.css',
            'css/styles.css',
            'css/londinium-theme.css'
        ]));
            

        evento.waitUntil(Promise.all([promesa,cacheInmutable]));
});

self.addEventListener('fetch', evento => {  

    const respuesta=caches.match(evento.request)
        .then(res=>{

            if (res) return res;
                     console.log('No existe', evento.request.url);
                return fetch(evento.request)
                .then(resWeb=>{
                    caches.open(CACHE_DINAMICO)
                .then(cache=>{

                     cache.put(evento.request,resWeb);
                     /*Aquí estamos indicando que el caché dinámico estará limitado solo a 5 archivos y que estos cada
                     vez que se llene el espacio dinámico no almacene los demas archivos.*/
                        limpiarCache(CACHE_DINAMICO,5);
                })
 
            return resWeb.clone();
            });
        }) //NAVEGACIÓN OFFLINE
        .catch(err => {
            
            if(evento.request.headers.get('accept').includes('text/html')){
          
            return caches.match('/offline.html');
            }else if(evento.request.headers.get('accept').includes('png')){
                
                return caches.match('images/error404.jpg');
                }
            });
        
            evento.respondWith(respuesta);
        
            
            function limpiarCache(nombreCache, numeroItems){
                caches.open(nombreCache)
                    .then(cache=>{
                        return cache.keys()
                            .then(keys=>{
                                if (keys.length>numeroItems){
                                    cache.delete(keys[0])
                                    .then(limpiarCache(nombreCache, numeroItems));
                }
                });
                });
            }
        
            });
    


    
  