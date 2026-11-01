const C="ucl-v4";
const API="https://script.google.com/macros/s/AKfycbyyBcBzjWO62UXWzQO_rAGViSNII3fQU-HK7u7IL0npJN86XAguAy8xHydLehCyneUJ/exec";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});

/* תזכורות: ההתראה מגיעה ריקה, והטקסט נשלף מהשרת */
self.addEventListener("push",e=>{
  e.waitUntil((async()=>{
    let msg={title:"⚽ ניחושי הצמרת",body:"יש משחקים שמחכים לניחוש שלך"};
    try{
      const sub=await self.registration.pushManager.getSubscription();
      const r=await fetch(API,{method:"POST",body:JSON.stringify({fn:"api_push_pending",args:[sub?sub.endpoint:""]})});
      const j=await r.json();
      if(j&&j.result&&j.result.title)msg=j.result;
    }catch(x){}
    await self.registration.showNotification(msg.title,{body:msg.body,icon:"icon-192.png",badge:"icon-192.png",dir:"rtl",lang:"he",tag:msg.tag||"ucl-reminder",renotify:true,timestamp:Date.now(),data:{url:msg.url||"./"}});
  })());
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||"./";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{for(const w of ws){if("focus" in w){w.postMessage({open:url});return w.focus();}}return self.clients.openWindow(url);}));
});
