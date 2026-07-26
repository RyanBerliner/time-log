// DO NOT MANUALLY UPDATE VERSION OR FILES!!
//
// This version number and filelist is generated automatically from the build
// script in scripts/build.sh.
//
const AUTOGEN_CACHE_VERSION = '09ebd8b47bed870d4e5a477e45b5a5e82d675a72';
const AUTOGEN_CACHE_ASSETS = ['index.html','app/log-hours.js','app/log-hours.css','app/dialog.js','app/index.js','app/index.css','app/data.js','app/dialog.css','app/timeline/render-day.js','lib/timeline.js','lib/node.js','lib/state.js','lib/date.js','button.css','timeline/hour-block.css','timeline/day-header.css','timeline/day-header.js','timeline/day.css','timeline/day-timeline.js','timeline/day.js','timeline/hour-block.js','base.css'];

// This is deployed a my github pages site, which contains other projects
// and sites on the same domain. Because of this we should prefix the caches
// with something specific to timesheets so we lessen the possiblity of conflicts

const CACHE_PREFIX = 'time-log[files]';

const EXPECTED_CACHES = [
  `${CACHE_PREFIX}static-${AUTOGEN_CACHE_ASSETS}`,
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(`${CACHE_PREFIX}static-${AUTOGEN_CACHE_ASSETS}`).then(function (cache) {
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
