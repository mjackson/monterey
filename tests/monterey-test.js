/* jshint -W058 */
var assert = require('assert');
var expect = require('expect');

require('../index');

describe('Function.prototype', function () {

  describe('inherit', function () {
    checkDescriptor(Function.prototype, 'inherit', false, true, true);

    it('extends the receiver with all enumerable own properties of the given function', function () {
      var A = function () {};
      A.staticProp = 'A';
      var B = function () {};
      B.inherit(A);

      assert('staticProp' in B);
      expect(B.staticProp).toEqual('A');
    });

    it('sets the prototype of the receiver to an instance of the given function', function () {
      var A = function () {};
      var B = function () {};
      B.inherit(A);

      assert(B.prototype instanceof A);
    });

    it("preserves the constructor property of the receiver's prototype", function () {
      var A = function () {};
      var B = function () {};
      B.inherit(A);

      expect(B.prototype.constructor).toEqual(B);
    });

    it("creates a super getter on the receiver's prototype that returns functions of the superclass' prototype with the same name from inside instance methods", function () {
      var A = function () {};
      A.prototype.sayHello = function () {};
      var B = function () {};
      B.prototype.sayHello = function sayHello() {
        expect(this.super).toBe(A.prototype.sayHello);
        assert(!this.propertyIsEnumerable('super'));
      };
      B.inherit(A);

      var instance = new B;

      instance.sayHello();
    });
  });

  describe('extend', function () {
    checkDescriptor(Function.prototype, 'extend', false, true, true);

    it('returns a new function that is a descendant of the receiver', function () {
      var A = function () {};
      var B = A.extend();

      expect(typeof B).toEqual('function');
      assert(B.isDescendantOf(A));
    });

    it('returns a function that calls its constructor method when invoked in the scope of a new instance', function () {
      var aCalled = false;
      var bCalled = false;
      var A = function () {
        aCalled = true;
      };
      var B = A.extend({
        constructor: function () {
          bCalled = true;
          assert(this instanceof A);
          assert(this instanceof B);
          this.super();
        }
      });

      var instance = new B;
      assert(instance);

      assert(aCalled);
      assert(bCalled);
    });

    it('returns a function that calls its parent constructor method when no child constructor is provided', function () {
      var aCalled = false;
      var A = function () {
        aCalled = true;
      };
      var B = A.extend();

      var instance = new B;
      assert(instance);

      assert(aCalled);
    });

    describe('when called with an object argument', function () {
      it('returns a new function that uses that object as its prototype', function () {
        var A = function () {};
        var B = A.extend({
          sayHi: function () {}
        });

        assert(B.prototype.sayHi);
        assert(!B.prototype.propertyIsEnumerable('sayHi'));
      });
    });

    describe('when called with a function argument', function () {
      it('returns a new function that merges the enumerable properties of the object returned from the argument as its prototype', function () {
        var aProto;
        var A = function () {};
        var B = A.extend(function (parentProto) {
          aProto = parentProto;
          return { sayHi: function () {} };
        });

        expect(aProto).toBe(A.prototype);
        assert(B.prototype.sayHi);
        assert(!B.prototype.propertyIsEnumerable('sayHi'));
      });
    });

    it("extends the new function's prototype with all instance properties (not enumerable)", function () {
      var A = function () {};
      var B = A.extend({
        sayHi: function () {}
      });

      assert(B.prototype.sayHi);
      assert(!B.prototype.propertyIsEnumerable('sayHi'));
    });
  });

  var parent = function () {};
  var child = function () {};
  child.inherit(parent);
  var grandchild = function () {};
  grandchild.inherit(child);
  var other = function () {};

  describe('isParentOf', function () {
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

  describe('isChildOf', function () {
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

  describe('isAncestorOf', function () {
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

  describe('isDescendantOf', function () {
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

  describe('parent', function () {
    checkDescriptor(Function.prototype, 'parent', false, undefined, true);

    it('returns the function from which a function is directly descended', function () {
      expect(child.parent).toBe(parent);
    });

    it('returns Object for top-level functions', function () {
      expect(parent.parent).toBe(Object);
    });

    it('returns null for Object', function () {
      expect(Object.parent).toBe(null);
    });
  });

  describe('ancestors', function () {
    checkDescriptor(Function.prototype, 'ancestors', false, undefined, true);

    it('returns an array of functions a function descends from in hierarchical order', function () {
      expect(grandchild.ancestors).toEqual([ grandchild, child, parent, Object ]);
    });
  });

});

describe('An instance of a class created using Object#extend', function () {
  it('can call methods of the Object prototype using super', function () {
    var more = 'more';
    var A = Object.extend({
      toString: function () {
        return this.super() + more;
      }
    });

    var instance = new A;
    var expected = Object.prototype.toString.call(instance) + more;

    expect(instance.toString()).toEqual(expected);
  });
});

function checkDescriptor(object, name, enumerable, writable, configurable) {
  var descriptor = Object.getOwnPropertyDescriptor(object, name);
  assert(descriptor);

  it('is' + (enumerable ? '' : ' not') + ' enumerable', function () {
    expect(descriptor.enumerable).toEqual(enumerable);
  });

  it('is' + (writable ? '' : ' not') + ' writable', function () {
    expect(descriptor.writable).toEqual(writable);
  });

  it('is' + (configurable ? '' : ' not') + ' configurable', function () {
    expect(descriptor.configurable).toEqual(configurable);
  });
}
