/*!
 * monterey.js - A minimal OO & functional toolkit for ES5 JavaScript
 * Copyright 2012 Michael Jackson
 */

(function () {

  var slice = Array.prototype.slice;
  var defineProperty = Object.defineProperty;
  var defineProperties = Object.defineProperties;
  var guid = 1;

  defineProperties(Object, {

    /**
     * Applies all *enumerable* *own* properties of any additional arguments
     * to the given object.
     */
    merge: {
      value: function (object) {
        var extensions = slice.call(arguments, 1);

        extensions.forEach(function (extension) {
          for (var property in extension) {
            if (extension.hasOwnProperty(property)) {
              object[property] = extension[property];
            }
          }
        });

        return object;
      }
    },

    /**
     * Returns true if the given object is an instance of the given constructor
     * function, or if it mixes in the given function.
     *
     * See also Object.mixesIn.
     */
    is: {
      value: function (object, fn) {
        return (object instanceof fn) || Object.mixesIn(object, fn);
      }
    },

    /**
     * Returns an array of functions that have been mixed in to this object.
     */
    mixins: {
      value: function (object) {
        if (!object.hasOwnProperty('_mixins')) {
          defineProperty(object, '_mixins', { value: [] });
        }

        return object._mixins;
      }
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
    mixin: {
      value: function (object, fn) {
        if (!Function.isFunction(fn)) {
          throw new Error('Invalid mixin');
        }

        Object.mixins(object).push(fn);
        Object.merge(object, fn.prototype);
        fn.apply(object, slice.call(arguments, 2));

        Object.trigger(fn, 'mixedIn', object);
      }
    },

    /**
     * Returns true if the given object mixes in the given function.
     */
    mixesIn: {
      value: function (object, fn) {
        return Object.mixins(object).indexOf(fn) !== -1;
      }
    },

    /**
     * Returns an object of event handlers that have been registered on the
     * given object, keyed by event type.
     */
    events: {
      value: function (object) {
        if (!object.hasOwnProperty('_events')) {
          defineProperty(object, '_events', { value: [] });
        }

        return object._events;
      }
    },

    /**
     * Registers an event handler on the given object for the given event type.
     */
    on: {
      value: function (object, type, handler) {
        if (!Function.isFunction(handler)) {
          throw new Error('Invalid event handler');
        }

        var events = Object.events(object);
        var handlers = events[type];

        if (!handlers) {
          events[type] = handlers = [];
        }

        if (!handler._guid) {
          handler._guid = 'monterey_' + String(guid++);
        }

        handlers.push(handler);
      }
    },

    /**
     * Unregisters an event handler on the given object. If the handler is not
     * given, all event handlers registered for the given type are removed.
     */
    off: {
      value: function (object, type, handler) {
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
            handlers.splice(i--, 1); // A bit dangerous.
          }
        }
      }
    },

    /**
     * Triggers all event handlers of the given type on the given object in
     * the order they were added, passing through any additional arguments.
     * Returning false from an event handler cancels all remaining handlers.
     */
    trigger: {
      value: function (object, type) {
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
    }

  });

  /**
   * Returns true if the given object is a function.
   */
  defineProperties(Function, {

    isFunction: {
      value: function (object) {
        return typeof object === 'function';
      }
    }

  });

  defineProperties(Function.prototype, {

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
    inherit: {
      value: function (fn) {
        if (!Function.isFunction(fn)) {
          throw new Error('Invalid class');
        }

        Object.merge(this, fn);
        this.prototype = Object.create(fn.prototype);

        // Preserve the constructor reference!
        defineProperty(this.prototype, 'constructor', { value: this });

        Object.trigger(fn, 'inherited', this);
      }
    },

    /**
     * Creates a new function that inherits from this function. The new function
     * calls an "initialize" method on instances of itself when invoked, if
     * present on the prototype. The new function also gets all properties of
     * the given prototype/constructor object(s).
     *
     * See also Object.merge.
     */
    extend: {
      value: function (prototypeProps, constructorProps) {
        var child = function () {
          if (Function.isFunction(this.initialize)) {
            this.initialize.apply(this, arguments);
          }
        };

        child.inherit(this);
        Object.merge(child.prototype, prototypeProps || {});
        Object.merge(child, constructorProps || {});

        return child;
      }
    },

    /**
     * Returns true if the given function is a descendant of this function.
     */
    isAncestorOf: {
      value: function (fn) {
        return this.prototype.isPrototypeOf(fn.prototype);
      }
    },

    /**
     * Returns true if this function inherits from the given function.
     */
    inherits: {
      value: function (fn) {
        return fn.isAncestorOf(this);
      }
    },

    /**
     * Returns the next function up in the prototype chain from this one.
     */
    parent: {
      get: function () {
        var proto = Object.getPrototypeOf(this.prototype);
        return proto && proto.constructor;
      }
    },

    /**
     * Returns an array of constructors in the prototype chain from this
     * function's prototype back to Object.
     */
    ancestors: {
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
