import { $, on } from 'lib/node.js';

import { appState, setView } from 'app/data.js';

function Dialog(viewKey, content) {
  function mount(node) {
    const page = document.querySelector('.page');

    let hideTimeout;

    function show() {
      clearTimeout(hideTimeout);
      node.style.display = 'block';
      page.classList.add('backdrop');
      setTimeout(() => node.classList.add('show'), 0);
    }

    function hide() {
      node.classList.remove('show');
      page.classList.remove('backdrop');
      hideTimeout = setTimeout(() => node.style.display = null, 500);
    }

    return appState.subscribe('view', (prevView, view) => {
      if (prevView !== viewKey && view === viewKey) {
        show();
      } else if (prevView === viewKey && view !== viewKey) {
        hide();
      }
    });
  }

  return $('aside.dialog', content, mount);
}

export { Dialog };
