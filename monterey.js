/*!
 * monterey.js - A minimal OO & functional toolkit for ES5 JavaScript
 * Copyright 2012 Michael Jackson
 */

(function () {

  var _guid = 1;
  var _slice = Array.prototype.slice;

  /**
   * Returns a unique identifier for this object, generated on-demand.
   */
  Object.defineProperty(Object.prototype, "guid", {
    get: function () {
      if (!this.hasOwnProperty("_guid")) {
        Object.defineProperty(this, "_guid", { value: _guid++, writable: true });
      }

      return this._guid;
    },
    set: function (value) {
      if (!this.hasOwnProperty("_guid")) {
        Object.defineProperty(this, "_guid", { value: value, writable: true });
      } else {
        this._guid = value;
      }

      return value;
    }
  });

  /**
   * Extends this object with all *enumerable* *own* properties of the
   * given object.
   */
  Object.defineProperty(Object.prototype, "extend", {
    value: function (object) {
      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          this[property] = object[property];
        }
      }

      return this;
    }
  });

  /**
   * Returns the function this object is an instance of.
   */
  Object.defineProperty(Object.prototype, "class", {
    get: function () {
      return this.constructor;
    }
  });

  /**
   * Returns true if this object is an instance of the given constructor
   * function, or if it mixes in the given function.
   */
  Object.defineProperty(Object.prototype, "is", {
    value: function (fn) {
      // Check prototype chain.
      if (this instanceof fn) {
        return true;
      }

      // Check mixins.
      return this.mixesIn(fn);
    }
  });

  /**
   * Returns an array of functions that have been "mixed in" to this object.
   * See Object#mixin.
   */
  Object.defineProperty(Object.prototype, "mixins", {
    get: function () {
      if (!this.hasOwnProperty("_mixins")) {
        Object.defineProperty(this, "_mixins", { value: [] });
      }

      return this._mixins;
    }
  });

  /**
   * Mixes in the given function into this object. This does the following two
   * things:
   *
   *   1. Calls the function in the context of this object with any additional
   *      arguments that are passed
   *   2. Extends this object with the function's prototype
   *
   * See Object#extend.
   */
  Object.defineProperty(Object.prototype, "mixin", {
    value: function (fn) {
      if (!Function.isFunction(fn)) {
        throw new Error("Invalid mixin");
      }

      this.mixins.push(fn);

      this.extend(fn.prototype);
      fn.apply(this, _slice.call(arguments, 1));

      fn.trigger("mixedIn", this);

      return this;
    }
  });

  /**
   * Returns true if this object mixes in the given function.
   */
  Object.defineProperty(Object.prototype, "mixesIn", {
    value: function (fn) {
      return this.mixins.indexOf(fn) !== -1;
    }
  });

  /**
   * Returns an object of event handlers that have been registered on this
   * object, keyed by event type.
   */
  Object.defineProperty(Object.prototype, "events", {
    get: function () {
      if (!this.hasOwnProperty("_events")) {
        Object.defineProperty(this, "_events", { value: [] });
      }

      return this._events;
    }
  });

  /**
   * Registers an event handler on this object.
   */
  Object.defineProperty(Object.prototype, "on", {
    value: function (type, handler) {
      if (!Function.isFunction(handler)) {
        throw new Error("Invalid event handler");
      }

      var events = this.events[type];

      if (!events) {
        this.events[type] = events = [];
      }

      events.push({
        type: type,
        handler: handler
      });
    }
  });

  /**
   * Unregisters an event handler on this object. If the handler is not given,
   * all event handlers registered for the given type are removed.
   */
  Object.defineProperty(Object.prototype, "off", {
    value: function (type, handler) {
      var events = this.events[type];

      if (!events) {
        return;
      }

      if (handler) {
        var id = handler.guid;

        for (var i = 0; i < events.length; ++i) {
          if (events[i].handler.guid === id) {
            events.splice(i--, 1); // A bit dangerous.
          }
        }

        return;
      }

      delete this.events[type];
    }
  });

  /**
   * Triggers an event of the given type on this object. This automatically
   * calls all handlers for that type. If a handler returns false no more
   * handlers are called.
   */
  Object.defineProperty(Object.prototype, "trigger", {
    value: function (type) {
      var events = this.events[type];

      if (!events) {
        return;
      }

      var event = {
        type: type,
        time: new Date,
        source: this
      };

      var args = [event].concat(_slice.call(arguments, 1));

      for (var i = 0, len = events.length; i < len; ++i) {
        // Return false from any event handler to cancel all remaining handlers.
        if (events[i].handler.apply(this, args) === false) {
          break;
        }
      }
    }
  });

  /**
   * Returns true if the given object is a function.
   */
  Object.defineProperty(Function, "isFunction", {
    value: function (object) {
      return typeof object === "function";
    }
  });

  /**
   * Makes this function inherit from the given function. This does the
   * following two things:
   *
   *   1. Extends this function with the given function
   *   2. Makes this function's prototype an instance of the given function's
   *      prototype
   *
   * See Object#extend.
   */
  Object.defineProperty(Function.prototype, "inherit", {
    value: function (fn) {
      if (!Function.isFunction(fn)) {
        throw new Error("Invalid class");
      }

      this.extend(fn);
      this.prototype = Object.create(fn.prototype);

      // Preserve the constructor reference!
      Object.defineProperty(this.prototype, "constructor", { value: this });

      fn.trigger("inherited", this);
    }
  });

  /**
   * Returns true if the given function inherits from this function.
   */
  Object.defineProperty(Function.prototype, "isSuperclassOf", {
    value: function (fn) {
      return this.prototype.isPrototypeOf(fn.prototype);
    }
  });

  /**
   * Returns true if this function inherits from the given function.
   */
  Object.defineProperty(Function.prototype, "isSubclassOf", {
    value: function (fn) {
      return fn.isSuperclassOf(this);
    }
  });

  /**
   * Returns the next function up in the prototype chain from this one.
   */
  Object.defineProperty(Function.prototype, "superclass", {
    get: function () {
      var proto = Object.getPrototypeOf(this.prototype);
      return proto && proto.constructor;
    }
  });

  /**
   * Returns an array of constructors in the prototype chain from this
   * function's prototype back to Object.
   */
  Object.defineProperty(Function.prototype, "ancestors", {
    get: function () {
      var ancestors = [];
      var fn = this;

      while (fn = fn.superclass) {
        ancestors.push(fn);
      }

      return ancestors;
    }
  });

})();
