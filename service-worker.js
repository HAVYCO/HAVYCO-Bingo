const CACHE='havyco-bingo-v4-3-offline';
const APP_SHELL=[
  './','./index.html','./styles.css','./app.js','./license.js','./config.js',
  './manifest.json','./assets/logo-havyco.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  // Navegación: servir index desde cache si no hay red.
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copy));
        return resp;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  // Archivos locales: cache first + actualización en segundo plano.
  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(resp=>{
        if(resp && resp.ok && new URL(req.url).origin===self.location.origin){
          const copy=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return resp;
      }).catch(()=>cached);
      return cached || network;
    })
  );
});
