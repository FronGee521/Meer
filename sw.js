const V="tuner-metronom-v11",SHELL=["./","index.html","style.css","app.js","manifest.json","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(p=>fetch(p,{cache:"reload"}).then(r=>r.ok&&c.put(p,r)).catch(()=>{})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("tuner-metronom-")&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET"||new URL(q.url).origin!==location.origin)return;
e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(q,{ignoreSearch:true});const net=fetch(q).then(r=>{if(r.ok)c.put(q,r.clone());return r}).catch(()=>null);
return hit||(await net)||(q.mode==="navigate"?c.match("index.html"):Response.error())}))});
