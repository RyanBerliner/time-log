import { $, on } from '../lib/node.js';

export default function UpdateNotice() {
  const $UpdateNow = $('a[href="#"][role="button"]', ['Update Now']);

  function mount(node) {
    let registration;
    const isProd = window.location.hostname !== 'localhost';

    on($UpdateNow, 'click', event => {
      event.preventDefault();
      registration.waiting.postMessage('SKIP_WAITING');
    });

    function showNotice(registration) {
      node.style.display = 'block';
    }

    if ('serviceWorker' in navigator) {
      const scope = isProd ? '/time-log/' : '/src/';

      navigator.serviceWorker.register('service-worker.js', {scope})
        .then(function(r) {
          registration = r;
          console.log('service worker registration successful, scope is:', registration.scope);

          if (registration.waiting) {
            showNotice();
          }

          registration.addEventListener('updatefound', function() {
            if (registration.installing) {
              registration.installing.addEventListener('statechange', function() {
                if (registration.waiting && navigator.serviceWorker.controller) {
                  showNotice();
                }
              });
            }
          });

          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              window.location.reload();
              refreshing = true;
            }
          });
        })
        .catch(function(error) {
          console.log('service worker registration failed, error:', error);
        });
    }
  }

  return $('div.app__update-notice', [
    'There is an update available. ',
    $UpdateNow,
  ], mount);
}
