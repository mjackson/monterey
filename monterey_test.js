var assert = require("assert"),
    vows = require("vows");

require("./monterey");

vows.describe("monterey").addBatch({
  "Object#objectId": {
    "generates a unique id for a new object": function () {
      var a = {};
      var b = {};

      assert(a.objectId);
      assert(b.objectId);
      assert(a.objectId !== b.objectId);
    }
  },
  "Object#extend": {
    "copies all enumerable own properties to the receiver": function () {
      var a = {};
      var b = {};

      Object.defineProperty(b, "a", { value: "a" });
      b.b = "b";

      assert(!b.propertyIsEnumerable("a"));
      assert(b.propertyIsEnumerable("b"));

      a.extend(b);

      assert.deepEqual(["b"], Object.getOwnPropertyNames(a));
    }
  },
  "Object#class": {
    "returns the constructor function for an object": function () {
      assert.equal(Object, {}.class);
      assert.equal(Array, [].class);
      assert.equal(Number, (1).class);
      assert.equal(Boolean, (true).class);
      assert.equal(Date, (new Date).class);

      var a = function () {};

      assert.equal(a, (new a).class);
    }
  },
  "Object#is": {
    "returns true for direct instances of a function": function () {
      var a = function () {};
      var b = new a;
      assert(b.is(a));
    },
    "returns true for indirect instances of a function": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = new b;
      assert(c.is(b));
      assert(c.is(a));
    },
    "returns false for instances of a different function": function () {
      var a = function () {};
      var b = function () {};
      var c = new b;
      assert(c.is(b));
      assert(!c.is(a));
    },
    "returns true for objects that mixin a constructor": function () {
      var a = function () {};
      var b = function () {};
      var c = new b;
      c.mixin(a);
      assert(c.is(b));
      assert(c.is(a));
    }
  },
  "Object#mixins": {
    "returns an new empty array for a new object": function () {
      var a = {};
      assert.deepEqual([], a.mixins);
    },
    "returns the same array on subsequent calls": function () {
      var a = {};
      var mixins = a.mixins;
      assert(mixins);
      assert.strictEqual(mixins, a.mixins);
    },
    "returns different arrays for two different objects": function () {
      var a = {};
      var b = {};
      assert.deepEqual([], a.mixins);
      assert.deepEqual([], b.mixins);
      assert(a.mixins !== b.mixins);
    }
  },
  "Object#mixin": {
    "calls the given function with any additional arguments": function () {
      var args;
      var a = {};
      var b = function () {
        args = Array.prototype.slice.call(arguments, 0);
      };
      a.mixin(b, 1, 2, 3);
      assert.deepEqual([1, 2, 3], args);
    },
    "sets the receiver as the scope of the function call": function () {
      var scope;
      var a = {};
      var b = function () {
        scope = this;
      };
      a.mixin(b);
      assert.strictEqual(scope, a);
    },
    "extends the receiver with all enumerable properties of the function's prototype": function () {
      var a = {};
      var b = function () {};
      b.prototype.c = "c";
      b.prototype.d = function () {};
      Object.defineProperty(b.prototype, "e", { value: "e" });

      assert(b.prototype.propertyIsEnumerable("c"));
      assert(b.prototype.propertyIsEnumerable("d"));
      assert(!b.prototype.propertyIsEnumerable("e"));

      assert.deepEqual([], a.mixins);

      a.mixin(b);

      assert.deepEqual([b], a.mixins);
      assert(a.hasOwnProperty("c"));
      assert.strictEqual(b.prototype.c, a.c);
      assert(a.hasOwnProperty("d"));
      assert.strictEqual(b.prototype.d, a.d);
      assert(!a.hasOwnProperty("e"));
    },
    "triggers a mixedIn event on the given function": function () {
      var a = function () {};
      var b = {};

      var called = false;
      a.on("mixedIn", function () {
        called = true;
      });

      assert(!called);

      b.mixin(a);

      assert(called);
    }
  },
  "Object#mixesIn": {
    "returns true for an object that mixes in a given function": function () {
      var a = function () {};
      var b = {};

      assert(!b.mixesIn(a));

      b.mixin(a);

      assert(b.mixesIn(a));
    }
  },
  "Object#events": {
    "returns an new empty array for a new object": function () {
      var a = {};
      assert.deepEqual([], a.events);
    },
    "returns the same array on subsequent calls": function () {
      var a = {};
      var events = a.events;
      assert(events);
      assert.strictEqual(events, a.events);
    },
    "returns different arrays for two different objects": function () {
      var a = {};
      var b = {};
      assert.deepEqual([], a.events);
      assert.deepEqual([], b.events);
      assert(a.events !== b.events);
    }
  },
  "Object#on": {
    "throws an error when an invalid event handler is given": function () {
      var a = {};

      assert.throws(function () {
        a.on("b", "c");
      });
    },
    "registers an event handler for all events of a given type": function () {
      var a = {};
      assert.isUndefined(a.events["b"]);

      a.on("b", function () {});

      assert(a.events["b"]);
      assert(Array.isArray(a.events["b"]));
    }
  },
  "Object#off": {
    "removes a single handler when one is given": function () {
      var a = {};

      assert.isUndefined(a.events["b"]);

      var b = function () {};
      a.on("b", b);
      a.on("b", function () {});

      assert(a.events["b"]);
      assert(Array.isArray(a.events["b"]));
      assert.equal(2, a.events["b"].length);

      a.off("b", b);

      assert(a.events["b"]);
      assert(Array.isArray(a.events["b"]));
      assert.equal(1, a.events["b"].length);
    },
    "removes multiple instances of the same handler": function () {
      var a = {};

      assert.isUndefined(a.events["b"]);

      var b = function () {};
      a.on("b", b);
      a.on("b", b);
      a.on("b", function () {});

      assert(a.events["b"]);
      assert(Array.isArray(a.events["b"]));
      assert.equal(3, a.events["b"].length);

      a.off("b", b);

      assert(a.events["b"]);
      assert(Array.isArray(a.events["b"]));
      assert.equal(1, a.events["b"].length);
    }
  },
  "Object#trigger": {
    "calls all handlers for a given event type": function () {
      var a = {};
      var bCalled = false;
      var b = function () {
        bCalled = true;
      };
      var cCalled = false;
      var c = function () {
        cCalled = true;
      };

      a.on("d", b);
      a.on("d", c);

      a.trigger("d");

      assert(bCalled);
      assert(cCalled);
    },
    "calls handlers in the scope of the receiver": function () {
      var scope;
      var a = {};

      a.on("b", function () {
        scope = this;
      });

      assert.isUndefined(scope);

      a.trigger("b");

      assert.strictEqual(a, scope);
    },
    "passes an event object as the first argument to handlers": function () {
      var ev;
      var a = {};
      var b = function (e) {
        ev = e;
      };

      a.on("c", b);

      assert.isUndefined(ev);

      a.trigger("c");

      assert(ev);
      assert(ev.time);
      assert.equal("c", ev.type);
      assert.strictEqual(a, ev.source);
    },
    "calls handlers with any additional arguments": function () {
      var args;
      var a = {};

      a.on("b", function () {
        // First argument is the event.
        args = Array.prototype.slice.call(arguments, 1);
      });

      a.trigger("b", 1, 2, 3);

      assert.deepEqual([1, 2, 3], args);
    },
    "stops calling handlers when one returns false": function () {
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

      a.on("d", b);
      a.on("d", c);

      a.trigger("d");

      assert(bCalled);
      assert(!cCalled);
    }
  },
  "Function.isFunction": {
    "returns true for a function literal": function () {
      assert(Function.isFunction(Object));
    },
    "returns true for a new Function": function () {
      assert(Function.isFunction(new Function("a", "return a")));
    },
    "returns false for objects that are not functions": function () {
      assert(!Function.isFunction({}));
      assert(!Function.isFunction([]));
      assert(!Function.isFunction(1));
      assert(!Function.isFunction(true));
      assert(!Function.isFunction(null));
    }
  },
  "Function#inherit": {
    "extends the receiver with all enumerable own properties of the given function": function () {
      var a = function () {};
      a.staticProp = "a";
      var b = function () {};
      b.inherit(a);

      assert("staticProp" in b);
      assert.equal("a", b.staticProp);
    },
    "sets the prototype of the receiver to an instance of the given function": function () {
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
    "triggers an inherited event on the given function": function () {
      var a = function () {};
      var b = function () {};

      var called = false;
      a.on("inherited", function () {
        called = true;
      });

      assert(!called);

      b.inherit(a);

      assert(called);
    }
  },
  "Function#isSubclassOf": {
    "returns true for a function that directly inherits from another": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(b.isSubclassOf(a));
    },
    "returns true for a function that indirectly inherits from another": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert(c.isSubclassOf(a));
    }
  },
  "Function#isSuperclassOf": {
    "returns true for a function that is directly inherited by another": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert(a.isSuperclassOf(b));
    },
    "returns true for a function that is indirectly inherited by another": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert(a.isSuperclassOf(c));
    }
  },
  "Function#superclass": {
    "returns the function from which a function inherits": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);

      assert.equal(a, b.superclass);
    },
    "returns Object for top-level functions": function () {
      var a = function () {};
      assert.equal(Object, a.superclass);
    },
    "returns null for Object": function () {
      assert.equal(null, Object.superclass);
    }
  },
  "Function#ancestors": {
    "returns an array of functions a function inherits from in hierarchical order": function () {
      var a = function () {};
      var b = function () {};
      b.inherit(a);
      var c = function () {};
      c.inherit(b);

      assert.deepEqual([b, a, Object], c.ancestors);
    }
  }
}).export(module);
