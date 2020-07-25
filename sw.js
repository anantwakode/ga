const cacheName = 'anantwakode.github.io';
var filesToCache = ['./', './index.html', './css/style.css', './js/mqttws31.js', './js/mymqtt.js', './js/jquery.min.js'];

var deferredPrompt;
self.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
