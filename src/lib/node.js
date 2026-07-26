const mountCallbacks = new WeakMap();
const unmountCallbacks = new WeakMap();
let whitelist = new Set();

const observer = new MutationObserver(mutationRecords => {
  mutationRecords.forEach(mutationRecord => {
    mutationRecord.addedNodes.forEach(node => {
      each(node, n => {
        if (mountCallbacks.has(n)) {
          const unmount = mountCallbacks.get(n)(n);
          if (unmount) {
            unmountCallbacks.set(n, unmount);
          }
        }
      });
    });

    mutationRecord.removedNodes.forEach(node => {
      each(node, n => {
        if (unmountCallbacks.has(n)) {
          unmountCallbacks.get(n)(n);
        }
      });
    });
  });
});

const observerArgs = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, observerArgs);

function each(node, cb) {
  if (whitelist.size === 0 || whitelist.has(node)) {
    cb(node);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  node.querySelectorAll('[data-dynamic]').forEach(n => {
    if (whitelist.size === 0 || whitelist.has(n)) {
      cb(n)
    }
  });
}

// Returns a dom node. You don't actually need to use this to create nodes if
// you don't want, but its often more succinct.
//
// This convenience method also adds mounting and unmoutning callbacks to know
// when its [un]attached to the dom tree. Also makes it a bit quickers to add
// classes, attributes, and children nodes.
//
// Examples:
//
// const node = $('span', 'lorem');
//  => <span>lorem</span>
//
// const node = $('div.my-4', [
//   $('span.fw-bold', 'lorem'),
//   $('span.tooltip[title="ipsum"]', 'doler'),
// ]);
//  => <div class="my-4">
//       <span class="fw-bold">lorem</span>
//       <span class="tooltip" title="ipsum">doler</span>
//     </div>
function $(el, children, onmount) {
  const nodeRegex = /^(?<nodeName>[a-z1-9]+)(?<nodeDetails>.*)$/;
  const { nodeName, nodeDetails } = el.match(nodeRegex).groups;

  const attributes = [
    ...nodeDetails.matchAll(/\[([^\]="]+)="([^"]*)"\]/g).map(
      m => ({attribute: m[1], value: m[2]})
    )
  ];

  const node = document.createElement(nodeName);
  attributes.forEach(({ attribute, value }) => node.setAttribute(attribute, value));

  const classes = [...nodeDetails.matchAll(/\.([\w-]+)/g).map(m => m[1])];
  if (classes.length) {
    node.classList.add(...classes);
  }

  if (onmount) {
    // So we can more efficiently query just the nodes we need when check for
    // mounted and unmounted nodes
    node.setAttribute('data-dynamic', true);
    mountCallbacks.set(node, onmount);
  }

  if (children) {
    children.forEach(child => {
      if (!child) {
        return;
      }

      if (!(child instanceof Node)) {
       child = document.createTextNode(child.toString());
      }

      node.appendChild(child);
    });
  }

  return node;
};

// Efficiently updates lists of dom nodes, touching the fewest nodes possible.
// Use this if you need to render a list of objects to the dom which all use
// the same rendering function, and which later might need to add, remove, or
// reorder (ie update) the nodes.
//
// Is intitialized with a renderer function, which must accept a list item as
// its only arg and return a dom node. The initializer returns 2 functions:
//
// initial - a function to be called with the initial list of items, and returns
//           an array of nodes.
//
// update  - a function to be called at any point with an updated list of
//           items, which returns nothing but simply updates the nodes
//           initially rendered.
//
// stable.initial must be the ONLY child of a node, as stable.update will us
// the parent container as its working boundaries. while stable could insert
// its own wrapping container, we aren't doing this to reduce the number of dom
// nodes and allow you create the container with whatever classes, attributes,
// behaviors you want.
//
// Examples:
//
// const users = stable(user => $('li', user));
// const node = $('ul', users.initial(['john', 'jane', 'joe']));
//  => <ul>
//       <li>john</span>
//       <li>jane</span>
//       <li>joe</span>
//     </ul>
//
// users.update(node, ['jill', 'john', 'joe']);
//  => <ul>
//       <li>jill</span>
//       <li>john</span>
//       <li>joe</span>
//     </ul>
//
// In that example, the update ONLY deletes the jane node, and prepends the
// jill node. This is what "minimally touching the dom" means. This update
// operation also makes sure to respect user focus, such that any actively
// focused elements are never moved (maintaining focus) and instead other
// elements are moved around it.
function stable(renderer) {
  let keys = new Set();
  let nodes = new Map();

  function initial(list) {
    return list.map(i => {
      if (nodes.has(i)) {
        console.warn('Duplicate stable list item, only showing first', i);
        return;
      }

      const el = renderer(i);
      nodes.set(i, el);
      keys.add(i);
      return el;
    }).filter(n => !!n);
  }

  function update(node, newList) {
    let renderedKeys = new Set();
    let newNodes = new Set();

    let desired = newList.map((i) => {
      if (renderedKeys.has(i)) {
        console.warn('Duplicate stable list item, only showing first', i);
        return;
      }

      if (!nodes.has(i)) {
        const n = renderer(i);
        newNodes.add(n);
        nodes.set(i, n);
      }

      renderedKeys.add(i);
      return nodes.get(i);
    }).filter(Boolean);

    const deleteMe = keys.difference(renderedKeys);
    keys = renderedKeys;

    deleteMe.forEach(key => {
      nodes.get(key).remove();
      nodes.delete(key);
    });

    // now we can reorder the rest of them, only trigger mutation observer
    // callbacks for our new nodes
    whitelist = newNodes;

    // Locate the node NOT to move to preserve focus of that node. When safari
    // implements moveBefore this should be unnessescary
    let activeElement = document.activeElement;
    let staticNode = null;
    if (node.contains(activeElement)) {
      // get the highest parent that is not the container, this will be the node
      // we must not move
      staticNode = activeElement;
      while (staticNode.parentNode !== node) {
        staticNode = staticNode.parentNode;
      }
    }

    // Works even if empty because insertBefore automatically appends when
    // reference node is null
    let ref = node.firstElementChild;
    for (let i = 0; i < desired.length; i++) {
      const n = desired[i];

      if (ref !== n) {
        if (n === staticNode) {
          // instead of moving the desired element before the current ref, we
          // move the current ref after the desired element. unfortunetely
          // there is not insertAfter, that would be a nicer api.
          node.insertBefore(ref, n.nextElementSibling);
        } else {
          node.insertBefore(n, ref);
        }
      } else {
        ref = ref.nextElementSibling;
      }
    }

    whitelist = new Set();
  }

  return {initial, update};
}

// Updates the classes of a node based on an object of conditions.
//
// Examples:
//
// const node = document.getElementById('mynode');
// classNames(node, {
//   'class1': true,
//   'class2': true,
//   'class3': false,
// });
//  => <div id="mynode" class="class1 class2" />
function classNames(node, conditions) {
  Object.keys(conditions).forEach(key => {
    node.classList[!!conditions[key] ? 'add' : 'remove'](key);
  });
}

// Convenience function to add an event listener to a dom node
//
// Examples:
//
// const node = document.getElementById('mynode');
// on(node, 'click', event => { // something });
//
// Args are spread such that you can pass options just as you can when using
// addEventListener normally.
function on(node, ...args) {
  node.addEventListener(...args);
  return () => off(node, ...args);
}

// Convenience function to remove an event listener from a dom node
//
// Examples:
//
// const node = document.getElementById('mynode');
// off(node, 'click', existingHandler);
function off(node, ...args) {
  node.removeEventListener(...args);
}

export {$, on, off, classNames, stable};
