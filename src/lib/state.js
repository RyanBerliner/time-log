// Sentinal value to check against so subscribers know if a value is deleted
// vs set to undefined
const __DELETED__ = Symbol('deleted');

function state(initialState, onFlush) {
  const state = initialState;

  function flush() {
    if (!onFlush) return;

    // just get out it out band to not totally block
    // TODO: should make this not suck
    setTimeout(() => {
      onFlush(state);
    }, 0);
  }

  function get(...args) {
    return args.reduce((s, k) => s?.[k], state);
  }

  function set(...args) {
    const [keys, lastKey] = [args.slice(0, -2), args.slice(-2, -1)[0]];
    const value = args.slice(-1)[0];

    let ptr = state;
    keys.forEach(k => {
      if (ptr[k] == null) {
        ptr[k] = {};
      }

      // TODO: add an better exception in the case that the key already exists
      //       and is not an object

      ptr = ptr[k]
    });

    const prevValue = ptr[lastKey];
    if (prevValue === value) {
      return;
    }

    ptr[lastKey] = typeof value === 'function'
      ? value(ptr[lastKey])
      : value;

    flush();

    // TODO: there is also the case where a nesting like l1.l2.l3 exists, and
    //       the user just destroyed that by setting l1 = "some value" ... we
    //       should probably also fire functions for an l1.l2 or l1.l2.l3
    //       subscribers to? is it the case that you always have to recursively
    //       fire subscribers? Think of a db record, where you can surgically
    //       update a property, or replace the entire object. when replacing the
    //       entire object we technically only need to fire callbacks for the
    //       changed properties, not all of them.
    //
    // IDEA: think about how updating list indexes would work, and how we might
    //       need to update all the properties there too? should we even allow
    //       this? or should all keys be strings with not integers allowed to
    //       discourage updating indexes?
    // 
    // IDEA: i think we should also notify ancestor subscribers... for example
    //       if l1.l2.l3 is updated, notify l1.l2.l3, also l1.l2, also l1
    const funcs = subscribers.get(args.slice(0, -1).join('.'));
    if (funcs) {
      funcs.forEach(fn => fn(prevValue, ptr[lastKey]));
    }
  }

  function del(...args) {
    let ptr = state;
    for (let i = 0; i < args.length-1; i++) {
      const key = args[i];
      if (!Object.hasOwn(ptr, key)) return;

      ptr = ptr[key]
    }

    const prevValue = ptr[args[args.length-2]];
    delete ptr[args[args.length-2]];

    flush();

    const funcs = subscribers.get(args.join('.'));
    if (funcs) {
      funcs.forEach(fn => fn(prevValue, __DELETED__));
    }
  }

  const subscribers = new Map();
  function subscribe(...args) {
    const key = args.slice(0, -1).join('.');
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set([]));
    }

    const cb = args.slice(-1)[0];
    subscribers.get(key).add(cb);
    return () => subscribers.get(key).delete(cb);
  }

  function _state() { return state; }

  return { get, set, del, subscribe, _state };
}

export { state, __DELETED__ };
