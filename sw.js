const CACHE='cf-arritmix-unificado-20261016-v4-debriefing';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./prancheta/index.html','./Modelo_DEBRIEFING.pdf'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('cf-arritmix-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;event.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(resp=>{if(!resp||resp.status!==200)return resp;const copy=resp.clone();caches.open(CACHE).then(c=>c.put(r,copy));return resp;}).catch(()=>r.mode==='navigate'?caches.match('./index.html'):Response.error())));});
