const importMap = document.createElement('script');
importMap.setAttribute('type', 'importmap');
importMap.innerText = JSON.stringify({
  "imports": {
    "root/": "http://localhost:8000/src/",
    "lib/": "http://localhost:8000/src/lib/",
    "app/": "http://localhost:8000/src/app/",
  }
});

const head = document.querySelector('head');
head.appendChild(importMap);
