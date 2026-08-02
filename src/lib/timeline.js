import { on } from 'lib/node.js';

function timelinePaginator({
  anchor,
  pageSize,
  stepSize,
  stepForward,
}) {
  const pages = {};

  function dataForPage(page) {
    if (pages[page]) {
      return pages[page];
    }

    pages[page] = [];

    let startData = new Date(anchor);
    // sets the start date to the anchor in the middle of the page
    stepForward(startData, page * stepSize * pageSize);
    // move the start from the middle to the actual start
    stepForward(startData, Math.floor(pageSize / 2) * -stepSize);

    for (let i = 0; i < pageSize; i++) {
      const d = new Date(startData);
      stepForward(d, i * stepSize);
      pages[page].push(d);
    }

    return pages[page];
  }

  function prev(page, index) {
    if (index === 0) {
      return [page - 1, pageSize - 1];
    }

    return [page, index - 1];
  }

  function next(page, index) {
    if (index >= pageSize - 1) {
      return [page + 1, 0];
    }

    return [page, index + 1];
  }

  return {
    dataForPage,
    prev,
    next,
    pageSize,
  };
}

function setData(node, page, index) {
  node.setAttribute('data-page', page);
  node.setAttribute('data-index', index);
}

function getData(node) {
  const {page, index} = node.dataset;
  return [parseInt(page), parseInt(index)];
}

function Timeline({
  container,
  tall,
  offset,
  list,
  paginator,
  renderItem,
}) {
  const boundary = container.offsetHeight;

  function itemNode(page, index) {
    const item = paginator.dataForPage(page)[index];
    const node = renderItem(item);
    setData(node, page, index);
    return node;
  }

  function resetScroll() {
    // resets the current view to be in the center of the scroll, visually
    // does not update
    const delta = ((container.scrollHeight - container.offsetHeight) / 2) - container.scrollTop;
    container.scrollTop += delta;
    offset.style.height = `${(parseInt(offset.style.height) || 0) + delta}px`
  }

  function onScroll(delta) {
    const listRect = container.getBoundingClientRect();

    function handleBottom() {
      let lastElement = list.lastElementChild;
      let lastRect = lastElement.getBoundingClientRect();

      while (lastRect.top > listRect.bottom + boundary) {
        lastElement.remove();
        lastElement = list.lastElementChild;
        lastRect = lastElement.getBoundingClientRect();
      }

      while (lastRect.bottom < listRect.bottom + boundary) {
        const [page, index] = paginator.next(...getData(lastElement));
        list.append(itemNode(page, index));
        lastElement = list.lastElementChild;
        lastRect = lastElement.getBoundingClientRect();
      }
    }

    function handleTop() {
      let heightDelta = 0;
      let firstElement = list.firstElementChild;
      let firstRect = firstElement.getBoundingClientRect();

      while (firstRect.bottom < listRect.top - boundary) {
        const height = firstElement.offsetHeight;
        const possible = firstRect.bottom + height;
        firstElement.remove();
        heightDelta += height;
        firstElement = list.firstElementChild;
        firstRect = {bottom: firstRect.bottom + height};
      }

      while (firstRect.top > listRect.top - boundary) {
        const [page, index] = paginator.prev(...getData(firstElement));
        const li = itemNode(page, index);
        list.prepend(li);
        const height = li.offsetHeight;
        heightDelta -= height;

        firstElement = li;
        firstRect = {top: firstRect.top - height};
      }

      offset.style.height = `${(parseInt(offset.style.height) || 0) + heightDelta}px`;
    }

    if (delta < 0) {
      // add to the top before removing from the bottom
      handleTop();
      handleBottom();
    } else {
      // add to the bottom before removing from the top
      handleBottom();
      handleTop();
    }
  }

  let raf;
  let prevScroll = 0;

  on(container, 'scroll', function(event) {
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      const delta = container.scrollTop - prevScroll;
      onScroll(delta);
      prevScroll = container.scrollTop;
    });
  });

  function init() {
    tall.style.height = '1000000px';
    container.style.overflow = 'auto';
    container.style.height = '100%';
    container.style.width = '100%';
    container.style.position = 'absolute';

    list.innerHTML = '';

    let height = 0;

    for (let i = 0; i < paginator.pageSize; i++) {
      const item = itemNode(0, i);
      list.appendChild(item);
    }

    // init the offset container by centering the list
    // BUG: if the list is taller than the container this will not work...
    //      in that case we'd simply have to init to height 0 and scroll down a
    //      bit to compensate. then call resetScroll as normal.
    const containerHeight = container.offsetHeight;
    const listHeight = list.offsetHeight;
    const middle = ((containerHeight - listHeight) / 2);
    offset.style.height = `${middle}px`;

    // since this changes the scroll top it will also trigger the on scroll
    // handler and fill in any blanks. nice.
    resetScroll();
  };

  return { init };
}

export { Timeline, timelinePaginator };
