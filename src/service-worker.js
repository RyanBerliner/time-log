// DO NOT MANUALLY UPDATE VERSION OR FILES!!
//
// This version number and filelist is generated automatically from the build
// script in scripts/build.sh.
//
const AUTOGEN_CACHE_VERSION = 'e67835def2228816382c21a89bcd308594111c1f';
const AUTOGEN_CACHE_ASSETS = ['index.html','app.webmanifest','app/log-hours.js','app/send-report.js','app/log-hours.css','app/dialog.js','app/index.js','app/index.css','app/send-report.css','app/update-notice.js','app/data.js','app/update-notice.css','app/dialog.css','app/timeline/render-day.js','lib/timeline.js','lib/node.js','lib/state.js','lib/date.js','button.css','timeline/hour-block.css','timeline/day-header.css','timeline/day-header.js','timeline/day.css','timeline/day-timeline.js','timeline/day.js','timeline/hour-block.js','base.css'];

// This is deployed on my github pages site, which contains other projects
// and sites on the same domain. Because of this we should prefix the caches
// with something specific to timesheets so we lessen the possiblity of conflicts

const CACHE_PREFIX = 'time-log[files]';

const EXPECTED_CACHES = [
  `${CACHE_PREFIX}-${AUTOGEN_CACHE_VERSION}`,
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(`${CACHE_PREFIX}-${AUTOGEN_CACHE_VERSION}`).then(function (cache) {
      return cache.addAll(AUTOGEN_CACHE_ASSETS);
    }),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            return cacheName.startsWith(CACHE_PREFIX) &&
              EXPECTED_CACHES.indexOf(cacheName) < 0;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
