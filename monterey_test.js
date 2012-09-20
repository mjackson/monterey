var assert = require('assert');
var vows = require('vows');

require('./monterey');

vows.describe('monterey').addBatch({
  'Object.extend': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('extend'));
    },
    'copies all enumerable own properties to the receiver': function () {
      var a = {};
      var b = {};

      Object.defineProperty(b, 'a', { value: 'a' });
      b.b = 'b';

      assert(!b.propertyIsEnumerable('a'));
      assert(b.propertyIsEnumerable('b'));

      Object.extend(a, b);

      assert.deepEqual(['b'], Object.getOwnPropertyNames(a));
    }
  },
  'Object.is': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('is'));
    },
    'returns true for direct instances of a function': function () {
      var a = function () {};
      var b = new a;
      assert(Object.is(b, a));
    },
    'returns true for indirect instances of a function': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = new b;
      assert(Object.is(c, b));
      assert(Object.is(c, a));
    },
    'returns false for instances of a different function': function () {
      var a = function () {};
      var b = function () {};
      var c = new b;
      assert(Object.is(c, b));
      assert(!Object.is(c, a));
    },
    'returns true for objects that mixin a constructor': function () {
      var a = function () {};
      var b = function () {};
      var c = new b;
      Object.mixin(c, a);
      assert(Object.is(c, b));
      assert(Object.is(c, a));
    }
  },
  'Object.mixins': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('mixins'));
    },
    'returns an new empty array for a new object': function () {
      var a = {};
      assert.deepEqual([], Object.mixins(a));
    },
    'returns the same array on subsequent calls': function () {
      var a = {};
      var mixins = Object.mixins(a);
      assert(mixins);
      assert.strictEqual(mixins, Object.mixins(a));
    },
    'returns different arrays for two different objects': function () {
      var a = {};
      var b = {};
      assert.deepEqual([], Object.mixins(a));
      assert.deepEqual([], Object.mixins(b));
      assert(Object.mixins(a) !== Object.mixins(b));
    }
  },
  'Object.mixin': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('mixin'));
    },
    'calls the given function with any additional arguments': function () {
      var args;
      var a = {};
      var b = function () {
        args = Array.prototype.slice.call(arguments, 0);
      };
      Object.mixin(a, b, 1, 2, 3);
      assert.deepEqual([1, 2, 3], args);
    },
    'sets the receiver as the scope of the function call': function () {
      var scope;
      var a = {};
      var b = function () {
        scope = this;
      };
      Object.mixin(a, b);
      assert.strictEqual(scope, a);
    },
    "extends the receiver with all enumerable properties of the function's prototype": function () {
      var a = {};
      var b = function () {};
      b.prototype.c = 'c';
      b.prototype.d = function () {};
      Object.defineProperty(b.prototype, 'e', { value: 'e' });

      assert(b.prototype.propertyIsEnumerable('c'));
      assert(b.prototype.propertyIsEnumerable('d'));
      assert(!b.prototype.propertyIsEnumerable('e'));

      assert.deepEqual([], Object.mixins(a));

      Object.mixin(a, b);

      assert.deepEqual([b], Object.mixins(a));
      assert(a.hasOwnProperty('c'));
      assert.strictEqual(b.prototype.c, a.c);
      assert(a.hasOwnProperty('d'));
      assert.strictEqual(b.prototype.d, a.d);
      assert(!a.hasOwnProperty('e'));
    },
    'triggers a mixedIn event on the given function': function () {
      var a = function () {};
      var b = {};

      var called = false, object;
      Object.on(a, 'mixedIn', function (e, obj) {
        called = true;
        object = obj;
      });

      assert(!called);
      Object.mixin(b, a);
      assert(called);
      assert.strictEqual(object, b);
    }
  },
  'Object.mixesIn': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('mixesIn'));
    },
    'returns true for an object that mixes in a given function': function () {
      var a = function () {};
      var b = {};

      assert(!Object.mixesIn(b, a));
      Object.mixin(b, a);
      assert(Object.mixesIn(b, a));
    }
  },
  'Object.events': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('events'));
    },
    'returns an new empty array for a new object': function () {
      var a = {};
      assert.deepEqual([], Object.events(a));
    },
    'returns the same array on subsequent calls': function () {
      var a = {};
      var events = Object.events(a);
      assert(events);
      assert.strictEqual(events, Object.events(a));
    },
    'returns different arrays for two different objects': function () {
      var a = {};
      var b = {};
      assert.deepEqual([], Object.events(a));
      assert.deepEqual([], Object.events(b));
      assert(Object.events(a) !== Object.events(b));
    }
  },
  'Object.on': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('on'));
    },
    'throws an error when an invalid event handler is given': function () {
      var a = {};

      assert.throws(function () {
        Object.on(a, 'b', 'c');
      });
    },
    'registers an event handler for all events of a given type': function () {
      var a = {};
      assert.isUndefined(Object.events(a)['b']);

      Object.on(a, 'b', function () {});

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
    }
  },
  'Object.off': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('off'));
    },
    'removes a single handler when one is given': function () {
      var a = {};

      assert.isUndefined(Object.events(a)['b']);

      var b = function () {};
      Object.on(a, 'b', b);
      Object.on(a, 'b', function () {});

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
      assert.equal(Object.events(a)['b'].length, 2);

      Object.off(a, 'b', b);

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
      assert.equal(Object.events(a)['b'].length, 1);
    },
    'removes multiple instances of the same handler': function () {
      var a = {};

      assert.isUndefined(Object.events(a)['b']);

      var b = function () {};
      Object.on(a, 'b', b);
      Object.on(a, 'b', b);
      Object.on(a, 'b', function () {});

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
      assert.equal(3, Object.events(a)['b'].length);

      Object.off(a, 'b', b);

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
      assert.equal(1, Object.events(a)['b'].length);
    }
  },
  'Object.trigger': {
    'is not enumerable': function () {
      assert(!Object.propertyIsEnumerable('trigger'));
    },
    'calls all handlers for a given event type': function () {
      var a = {};
      var bCalled = false;
      var b = function () {
        bCalled = true;
      };
      var cCalled = false;
      var c = function () {
        cCalled = true;
      };

      Object.on(a, 'd', b);
      Object.on(a, 'd', c);
      Object.trigger(a, 'd');

      assert(bCalled);
      assert(cCalled);
    },
    'calls handlers in the scope of the receiver': function () {
      var scope;
      var a = {};

      Object.on(a, 'b', function () {
        scope = this;
      });

      assert.isUndefined(scope);
      Object.trigger(a, 'b');
      assert.strictEqual(a, scope);
    },
    'passes an event object as the first argument to handlers': function () {
      var ev;
      var a = {};
      var b = function (e) {
        ev = e;
      };

      Object.on(a, 'c', b);
      assert.isUndefined(ev);
      Object.trigger(a, 'c');

      assert(ev);
      assert(ev.time);
      assert.equal('c', ev.type);
      assert.strictEqual(a, ev.source);
    },
    'calls handlers with any additional arguments': function () {
      var args;
      var a = {};

      Object.on(a, 'b', function () {
        // First argument is the event.
        args = Array.prototype.slice.call(arguments, 1);
      });

      Object.trigger(a, 'b', 1, 2, 3);

      assert.deepEqual([1, 2, 3], args);
    },
    'stops calling handlers when one returns false': function () {
      var a = {};
      var bCalled = false;
      var b = function () {
        bCalled = true;
        return false; // Stop further event handlers.
      };
      var cCalled = false;
      var c = function () {
        cCalled = true;
      };

      Object.on(a, 'd', b);
      Object.on(a, 'd', c);
      Object.trigger(a, 'd');

      assert(bCalled);
      assert(!cCalled);
    }
  },
  'Function.isFunction': {
    'is not enumerable': function () {
      assert(!Function.propertyIsEnumerable('isFunction'));
    },
    'returns true for a function literal': function () {
      assert(Function.isFunction(Object));
    },
    'returns true for a new Function': function () {
      assert(Function.isFunction(new Function('a', 'return a')));
    },
    'returns false for objects that are not functions': function () {
      assert(!Function.isFunction({}));
      assert(!Function.isFunction([]));
      assert(!Function.isFunction(1));
      assert(!Function.isFunction(true));
      assert(!Function.isFunction(null));
    }
  },
  'Function#inherit': {
    'is not enumerable': function () {
      assert(!(new Function).propertyIsEnumerable('inherit'));
    },
    'extends the receiver with all enumerable own properties of the given function': function () {
      var a = function () {};
      a.staticProp = 'a';
      var b = function () {};
      b.inherit(a);

      assert('staticProp' in b);
      assert.equal('a', b.staticProp);
    },
    'sets the prototype of the receiver to an instance of the given function': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(b.prototype instanceof a);
    },
    "preserves the constructor property of the receiver's prototype": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert.equal(b, b.prototype.constructor);
    },
    'triggers an inherited event on the given function': function () {
      var a = function () {};
      var b = function () {};

      var called = false;
      Object.on(a, 'inherited', function () {
        called = true;
      });

      assert(!called);
      b.inherit(a);
      assert(called);
    }
  },
  'Function#extend': {
    'returns a new function that inherits from the receiver': function () {
      function A() {}
      var B = A.extend();

      assert(Function.isFunction(B));
      assert(B.inherits(A));
    },
    'returns a function that calls its initialize method when invoked': function () {
      var called = false;

      function A() {}
      var B = A.extend({
        initialize: function () {
          called = true;
          assert.instanceOf(this, B);
        }
      });

      var b = new B();

      assert(called);
    },
    "extends the new function's prototype with all instance properties": function () {
      function A() {}
      var B = A.extend({
        sayHi: function () {}
      });

      assert(B.prototype.sayHi);
    },
    'extends the new function with all constructor properties': function () {
      function A() {}
      var B = A.extend({}, {
        sayHi: function () {}
      });

      assert(B.sayHi);
    }
  },
  'Function#isAncestorOf': {
    'is not enumerable': function () {
      assert(!(new Function).propertyIsEnumerable('isInheritedBy'));
    },
    'returns true for a function that is directly inherited by another': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(a.isAncestorOf(b));
    },
    'returns true for a function that is indirectly inherited by another': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert(a.isAncestorOf(c));
    }
  },
  'Function#inherits': {
    'is not enumerable': function () {
      assert(!(new Function).propertyIsEnumerable('inherits'));
    },
    'returns true for a function that directly inherits from another': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(b.inherits(a));
    },
    'returns true for a function that indirectly inherits from another': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert(c.inherits(a));
    }
  },
  'Function#parent': {
    'is not enumerable': function () {
      assert(!(new Function).propertyIsEnumerable('parent'));
    },
    'returns the function from which a function inherits': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert.equal(a, b.parent);
    },
    'returns Object for top-level functions': function () {
      var a = function () {};
      assert.equal(Object, a.parent);
    },
    'returns null for Object': function () {
      assert.equal(null, Object.parent);
    }
  },
  'Function#ancestors': {
    'is not enumerable': function () {
      assert(!(new Function).propertyIsEnumerable('ancestors'));
    },
    'returns an array of functions a function inherits from in hierarchical order': function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert.deepEqual([b, a, Object], c.ancestors);
    }
  }
}).export(module);
