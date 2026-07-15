const CACHE="valgard-maps-public-v1.21.0";
const CORE=["./","./index.html","./gallery.html","./atlas.html","./valgard-3d.html","./search.html","./tours.html","./offline.html","./styles.css","./phase29.css","./polish.css","./accessibility.css","./gallery.css","./atlas.css","./valgard-3d.css","./search.css","./tours.css","./app.js","./atlas.js","./valgard-3d.js","./search.js","./tours.js","./sw-register.js","./manifest.webmanifest","./icons/valgard-map.svg","./maps/eldrath-v001.svg","./art/eldrath-carta-ilustrada-v001.jpg","./downloads/eldrath-v001-3200x2000.png","./downloads/eldrath-v001.geojson","./data/atlas.json","./data/scenes.json","./data/valgard-3d.json","./data/search-index.json","./data/tours.json","./vendor/three.module.min.js","./vendor/three.core.min.js"];
const forbidden=pathname=>/(^|\/)(private-editor|private-workspace|notion|bkp)(\/|$)/i.test(pathname);
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("valgard-maps-public-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==location.origin||forbidden(url.pathname))return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{if(!response.ok)return caches.match("./offline.html");caches.open(CACHE).then(cache=>cache.put(request,response.clone()));return response;}).catch(()=>caches.match(request).then(cached=>cached||caches.match("./offline.html"))));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()));return response;})));
});
