var assert = require('assert');
require('../monterey');

describe('Object', function () {
  describe('.merge', function () {
    checkDescriptor(Object, 'merge', false, true, true);

    it('copies all enumerable own properties to the receiver', function () {
      var a = {};
      var b = {};

      Object.defineProperty(b, 'a', { value: 'a' });
      b.b = 'b';

      assert(!b.propertyIsEnumerable('a'));
      assert(b.propertyIsEnumerable('b'));

      Object.merge(a, b);

      assert.deepEqual(['b'], Object.getOwnPropertyNames(a));
    });
  });

  describe('.copy', function () {
    checkDescriptor(Object, 'copy', false, true, true);

    it('creates a new object', function () {
      var a = {};
      var b = Object.copy(a);

      assert.ok(a !== b);
    });
  });

  describe('.guid', function () {
    checkDescriptor(Object, 'guid', false, true, true);

    it('generates a unique id for each object', function () {
      var a = Object.guid({});
      var b = Object.guid({});

      assert.ok(a);
      assert.ok(b);
      assert.ok(a !== b);
    });
  });

  describe('.events', function () {
    checkDescriptor(Object, 'events', false, true, true);

    it('returns an new empty array for a new object', function () {
      var a = {};
      assert.deepEqual([], Object.events(a));
    });

    it('returns the same array on subsequent calls', function () {
      var a = {};
      var events = Object.events(a);
      assert(events);
      assert.strictEqual(events, Object.events(a));
    });

    it('returns different arrays for two different objects', function () {
      var a = {};
      var b = {};
      assert.deepEqual([], Object.events(a));
      assert.deepEqual([], Object.events(b));
      assert(Object.events(a) !== Object.events(b));
    });
  });

  describe('.on', function () {
    checkDescriptor(Object, 'on', false, true, true);

    it('throws an error when an invalid event handler is given', function () {
      var a = {};

      assert.throws(function () {
        Object.on(a, 'b', 'c');
      });
    });

    it('registers an event handler for all events of a given type', function () {
      var a = {};
      assert.ok(typeof Object.events(a)['b'] === 'undefined');

      Object.on(a, 'b', function () {});

      assert(Object.events(a)['b']);
      assert(Array.isArray(Object.events(a)['b']));
    });
  });

  describe('.off', function () {
    checkDescriptor(Object, 'off', false, true, true);

    it('removes a single handler when one is given', function () {
      var a = {};

      assert.ok(typeof Object.events(a)['b'] === 'undefined');

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
    });

    it('removes multiple instances of the same handler', function () {
      var a = {};

      assert.ok(typeof Object.events(a)['b'] === 'undefined');

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
    });
  });

  describe('.trigger', function () {
    checkDescriptor(Object, 'trigger', false, true, true);

    it('calls all handlers for a given event type', function () {
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
    });

    it('calls handlers in the scope of the receiver', function () {
      var scope;
      var a = {};

      Object.on(a, 'b', function () {
        scope = this;
      });

      assert.ok(typeof scope === 'undefined');
      Object.trigger(a, 'b');
      assert.strictEqual(a, scope);
    });

    it('passes an event object as the first argument to handlers', function () {
      var ev;
      var a = {};
      var b = function (e) {
        ev = e;
      };

      Object.on(a, 'c', b);
      assert.ok(typeof ev === 'undefined');
      Object.trigger(a, 'c');

      assert(ev);
      assert(ev.time);
      assert.equal('c', ev.type);
      assert.strictEqual(a, ev.source);
    });

    it('calls handlers with any additional arguments', function () {
      var args;
      var a = {};

      Object.on(a, 'b', function () {
        // First argument is the event.
        args = Array.prototype.slice.call(arguments, 1);
      });

      Object.trigger(a, 'b', 1, 2, 3);

      assert.deepEqual([1, 2, 3], args);
    });

    it('stops calling handlers when one returns false', function () {
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
    });
  });
});

describe('Function', function () {
  describe('#inherit', function () {
    checkDescriptor(Function.prototype, 'inherit', false, true, true);

    it('extends the receiver with all enumerable own properties of the given function', function () {
      var a = function () {};
      a.staticProp = 'a';
      var b = function () {};
      b.inherit(a);

      assert('staticProp' in b);
      assert.equal('a', b.staticProp);
    });

    it('sets the prototype of the receiver to an instance of the given function', function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(b.prototype instanceof a);
    });

    it("preserves the constructor property of the receiver's prototype", function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert.equal(b, b.prototype.constructor);
    });

    it("creates a super getter on the receiver's prototype that returns functions of the superclass' prototype with the same name from inside instance methods", function () {
      var a = function () {};
      a.prototype.sayHello = function () {};
      var b = function () {};
      b.prototype.sayHello = function sayHello() {
        assert.strictEqual(this.super, a.prototype.sayHello);
        assert(!this.propertyIsEnumerable('super'));
      };
      b.inherit(a);

      var instance = new b;

      instance.sayHello();
    });

    it('triggers an inherited event on the given function', function () {
      var a = function () {};
      var b = function () {};

      var called = false;
      Object.on(a, 'inherited', function () {
        called = true;
      });

      assert(!called);
      b.inherit(a);
      assert(called);
    });
  });

  describe('#extend', function () {
    checkDescriptor(Function.prototype, 'extend', false, true, true);

    it('returns a new function that is descended from the receiver', function () {
      var a = function () {};
      var b = a.extend();

      assert(typeof b === 'function');
      assert(b.isDescendantOf(a));
    });

    it('returns a function that calls its initialize method when invoked', function () {
      var called = false;
      var a = function () {};
      var b = a.extend({
        initialize: function () {
          called = true;
          assert.ok(this instanceof b);
        }
      });

      var instance = new b;

      assert(called);
    });

    it("extends the new function's prototype with all instance properties (not enumerable)", function () {
      var a = function () {};
      var b = a.extend({
        sayHi: function () {}
      });

      assert(b.prototype.sayHi);
      assert(!b.prototype.propertyIsEnumerable('sayHi'));
    });

    it('extends the new function with all constructor properties (not enumerable)', function () {
      var a = function () {};
      var b = a.extend({}, {
        sayHi: function () {}
      });

      assert(b.sayHi);
      assert(!b.propertyIsEnumerable('sayHi'));
    });
  });

  var parent = function () {};
  var child = function () {};
  child.inherit(parent);
  var grandchild = function () {};
  grandchild.inherit(child);
  var other = function () {};

  describe('#isParentOf', function () {
    checkDescriptor(Function.prototype, 'isParentOf', false, true, true);

    it('returns true for a function that is a parent of another', function () {
      assert(parent.isParentOf(child));
    });

    it('returns false for a function that is a grandparent of another', function () {
      assert(!parent.isParentOf(grandchild));
    });

    it('returns false for a function that is not an ancestor of another', function () {
      assert(!parent.isParentOf(other));
    });
  });

  describe('#isChildOf', function () {
    checkDescriptor(Function.prototype, 'isChildOf', false, true, true);

    it('returns true for a function that is a child of another', function () {
      assert(child.isChildOf(parent));
    });

    it('returns false for a function that is a grandchild of another', function () {
      assert(!grandchild.isChildOf(parent));
    });

    it('returns false for a function that does not inherit from another', function () {
      assert(!other.isChildOf(parent));
    });
  });

  describe('#isAncestorOf', function () {
    checkDescriptor(Function.prototype, 'isAncestorOf', false, true, true);

    it('returns true for a function that is the parent of another', function () {
      assert(parent.isAncestorOf(child));
    });

    it('returns true for a function that is an ancestor of another', function () {
      assert(parent.isAncestorOf(grandchild));
    });

    it('returns false for a function that is not the ancestor of another', function () {
      assert(!parent.isAncestorOf(other));
    });
  });

  describe('#isDescendantOf', function () {
    checkDescriptor(Function.prototype, 'isDescendantOf', false, true, true);

    it('returns true for a function that is a child of another', function () {
      assert(child.isDescendantOf(parent));
    });

    it('returns true for a function that is a grandchild of another', function () {
      assert(grandchild.isDescendantOf(parent));
    });

    it('returns false for a function that is not a descendant of another', function () {
      assert(!other.isDescendantOf(parent));
    });
  });

  describe('#parent', function () {
    checkDescriptor(Function.prototype, 'parent', false, undefined, true);

    it('returns the function from which a function is directly descended', function () {
      assert.strictEqual(parent, child.parent);
    });

    it('returns Object for top-level functions', function () {
      assert.strictEqual(Object, parent.parent);
    });

    it('returns null for Object', function () {
      assert.strictEqual(null, Object.parent);
    });
  });

  describe('#ancestors', function () {
    checkDescriptor(Function.prototype, 'ancestors', false, undefined, true);

    it('returns an array of functions a function descends from in hierarchical order', function () {
      assert.deepEqual([child, parent, Object], grandchild.ancestors);
    });
  });
});

describe('An instance of a class created using Object#extend', function () {
  it('can call methods of the Object prototype using the super property', function () {
    var more = 'more';
    var a = Object.extend({
      toString: function () {
        return this.super.call(this) + more;
      }
    });

    var instance = new a;
    var expect = Object.prototype.toString.call(instance) + more;

    assert.equal(instance.toString(), expect);
  });
});

function checkDescriptor(object, name, enumerable, writable, configurable) {
  var descriptor = Object.getOwnPropertyDescriptor(object, name);
  assert.ok(descriptor);

  it('is' + (enumerable ? '' : ' not') + ' enumerable', function () {
    assert.equal(descriptor.enumerable, enumerable);
  });

  it('is' + (writable ? '' : ' not') + ' writable', function () {
    assert.equal(descriptor.writable, writable);
  });

  it('is' + (configurable ? '' : ' not') + ' configurable', function () {
    assert.equal(descriptor.configurable, configurable);
  });
}
