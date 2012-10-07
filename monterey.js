/*!
 * monterey.js - A minimal OO & functional toolkit for ES5 JavaScript
 * Copyright 2012 Michael Jackson
 */

(function () {

  var slice = Array.prototype.slice;
  var guid = 1;

  function addProperty(object, name, value) {
    Object.defineProperty(object, name, {
      value: value,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }

  function addProperties(object, properties) {
    for (var name in properties) {
      addProperty(object, name, properties[name]);
    }
  }

  addProperties(Object, {

    /**
     * Copies all *enumerable* *own* properties of any additional arguments to
     * the given object.
     */
    merge: function (object) {
      var extensions = slice.call(arguments, 1);
      var property;

      extensions.forEach(function (extension) {
        for (property in extension) {
          if (extension.hasOwnProperty(property)) {
            object[property] = extension[property];
          }
        }
      });

      return object;
    },

    /**
     * Creates a new object that has all *enumerable* *own* properties of the
     * given object.
     */
    copy: function (object) {
      return Object.merge({}, object);
    },

    /**
     * Returns true if the given object is an instance of the given constructor
     * function, or if it mixes in the given function.
     *
     * See also Object.mixesIn.
     */
    is: function (object, fn) {
      return (object instanceof fn) || Object.mixesIn(object, fn);
    },

    /**
     * Returns an array of functions that have been mixed in to this object.
     */
    mixins: function (object) {
      if (!object.hasOwnProperty('__mixins__')) {
        Object.defineProperty(object, '__mixins__', { value: [] });
      }

      return object.__mixins__;
    },

    /**
     * Mixes in the given function into the given object. This does the
     * following two things:
     *
     *   1. Calls the function in the context of the object with any additional
     *      arguments that are passed
     *   2. Extends the object with the function's prototype
     *
     * See also Object.merge.
     */
    mixin: function (object, fn) {
      if (!Function.isFunction(fn)) {
        throw 'Mixin must be a function';
      }

      Object.mixins(object).push(fn);
      Object.merge(object, fn.prototype);
      fn.apply(object, slice.call(arguments, 2));

      Object.trigger(fn, 'mixedIn', object);
    },

    /**
     * Returns true if the given object mixes in the given function.
     */
    mixesIn: function (object, fn) {
      return Object.mixins(object).indexOf(fn) !== -1;
    },

    /**
     * Returns an object of event handlers that have been registered on the
     * given object, keyed by event type.
     */
    events: function (object) {
      if (!object.hasOwnProperty('__events__')) {
        Object.defineProperty(object, '__events__', { value: {} });
      }

      return object.__events__;
    },

    /**
     * Registers an event handler on the given object for the given event type.
     */
    on: function (object, type, handler) {
      if (!Function.isFunction(handler)) {
        throw 'Event handler must be a function';
      }

      var events = Object.events(object);
      var handlers = events[type];

      if (!handlers) {
        events[type] = handlers = [];
      }

      // Note: jQuery also uses the _guid property.
      if (!handler._guid) {
        handler._guid = 'monterey_' + String(guid++);
      }

      handlers.push(handler);

      Object.trigger(object, 'eventAdded', type, handler);
    },

    /**
     * Unregisters an event handler on the given object. If the handler is not
     * given, all event handlers registered for the given type are removed.
     */
    off: function (object, type, handler) {
      var events = Object.events(object);

      if (!handler) {
        delete events[type];
        return;
      }

      var handlers = events[type];
      var id = handler._guid;

      if (!handlers || !id) {
        return;
      }

      for (var i = 0; i < handlers.length; ++i) {
        if (handlers[i]._guid === id) {
          Object.trigger(object, 'eventRemoved', type, handlers.splice(i--, 1));
        }
      }
    },

    /**
     * Triggers all event handlers of the given type on the given object in
     * the order they were added, passing through any additional arguments.
     * Returning false from an event handler cancels all remaining handlers.
     */
    trigger: function (object, type) {
      var events = Object.events(object);
      var handlers = events[type];

      if (!handlers) {
        return;
      }

      var event = {
        type: type,
        time: new Date,
        source: object
      };

      var args = [event].concat(slice.call(arguments, 2));

      for (var i = 0, len = handlers.length; i < len; ++i) {
        // Returning false from a handler cancels all remaining handlers.
        if (handlers[i].apply(object, args) === false) {
          break;
        }
      }
    }

  });

  addProperties(Function, {

    /**
     * Returns true if the given object is a function.
     */
    isFunction: function (object) {
      return typeof object === 'function';
    }

  });

  addProperties(Function.prototype, {

    /**
     * Makes this function inherit from the given function. This does the
     * following two things:
     *
     *   1. Extends this function with the given function
     *   2. Makes this function's prototype an instance of the given function's
     *      prototype
     *
     * See also Object.merge.
     */
    inherit: function (parent) {
      if (!Function.isFunction(parent)) {
        throw 'Parent must be a function';
      }

      Object.merge(this, parent);

      this.prototype = Object.create(parent.prototype, {
        constructor: {
          value: this,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });

      Object.trigger(parent, 'inherited', this);
    },

    /**
     * Creates a new function that inherits from this function. The new function
     * calls an "initialize" method on instances of itself when invoked, if
     * present on the prototype. The new function also gets all properties of
     * the given prototype/constructor object(s).
     *
     * See also Object.merge.
     */
    extend: function (prototypeProps, constructorProps) {
      var parent = this;
      var child = function () {
        if (Function.isFunction(this.initialize)) {
          this.initialize.apply(this, arguments);
        }
      };

      child.inherit(parent);
      Object.merge(child.prototype, prototypeProps || {});
      Object.merge(child, constructorProps || {});

      return child;
    },

    /**
     * Returns true if the given function is a descendant of this function.
     */
    isAncestorOf: function (fn) {
      return this.prototype.isPrototypeOf(fn.prototype);
    },

    /**
     * Returns true if this function inherits from the given function.
     */
    isDescendantOf: function (fn) {
      return fn.isAncestorOf(this);
    }

  });

  Object.defineProperties(Function.prototype, {

    /**
     * Returns the next function up the prototype chain from this one.
     */
    parent: {
      configurable: true,
      get: function () {
        var proto = Object.getPrototypeOf(this.prototype);
        return proto && proto.constructor;
      }
    },

    /**
     * Returns an array of functions in the prototype chain from this
     * function back to Object.
     */
    ancestors: {
      configurable: true,
      get: function () {
        var ancestors = [], fn = this;

        while (fn = fn.parent) {
          ancestors.push(fn);
        }

        return ancestors;
      }
    }

  });

}());
