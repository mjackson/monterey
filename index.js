/*!
 * monterey - Minimal OOP for JavaScript
 * https://github.com/mjackson/monterey
 */

function isFunction(object) {
  return typeof object === 'function'
}

function hasOwnProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property)
}

function addProperty(object, property, value) {
  if (isFunction(value))
    addProperty(value, '__montereyName__', property)

  Object.defineProperty(object, property, {
    value: value,
    enumerable: false,
    writable: true,
    configurable: true
  })
}

function addProperties(object, properties) {
  for (var property in properties)
    if (hasOwnProperty(properties, property))
      addProperty(object, property, properties[property])
}

function addGetter(object, property, fn) {
  Object.defineProperty(object, property, {
    enumerable: false,
    configurable: true,
    get: fn
  })
}

function superGetter(proto) {
  return function superHack() {
    // In order for this hack to work properly the caller needs to be
    // either a named function or one that was added to the prototype
    // using addProperty (e.g. using Function#extend).
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/caller
    var caller = superHack.caller
    return proto[caller.__montereyName__ || caller.name]
  }
}

addProperties(Function.prototype, {

  /**
   * Makes this function "inherit" from the given function by copying all
   * enumerable properties of the given function to this function and making
   * this function's prototype an instance of the given function's prototype.
   */
  inherit: function (parent) {
    if (!isFunction(parent))
      throw new Error('Parent must be a function')

    addProperties(this, parent)
    this.prototype = Object.create(parent.prototype)
    addProperty(this.prototype, 'constructor', this)

    // Experimental.
    addGetter(this.prototype, 'super', superGetter(parent.prototype))
  },

  /**
   * Returns a function that inherits from this function (see Function#inherit).
   * The `properties` argument should be an object that contains properties to add
   * to the new function's prototype, or a function that is used to generate such
   * an object. In the second case the function is called with one argument: the
   * parent's prototype.
   *
   * If `properties` has a "constructor" function it will be used as the return
   * value. Otherwise, a new anonymous function that automatically calls the
   * parent is used.
   */
  extend: function (properties) {
    var parent = this

    if (isFunction(properties))
      properties = properties(parent.prototype)

    var child
    if (properties && hasOwnProperty(properties, 'constructor')) {
      child = properties.constructor
    } else {
      child = function () {
        parent.apply(this, arguments)
      }
    }

    child.inherit(parent)

    if (properties)
      addProperties(child.prototype, properties)

    return child
  },

  /**
   * Returns true if this function is a direct ancestor of the
   * given function.
   */
  isParentOf: function (fn) {
    return this.prototype === Object.getPrototypeOf(fn.prototype)
  },

  /**
   * Returns true if this function is a direct descendant of the
   * given function.
   */
  isChildOf: function (fn) {
    return fn.isParentOf(this)
  },

  /**
   * Returns true if the given function is a descendant of this function.
   */
  isAncestorOf: function (fn) {
    return this.prototype.isPrototypeOf(fn.prototype)
  },

  /**
   * Returns true if this function is a descendant of the given function.
   */
  isDescendantOf: function (fn) {
    return fn.isAncestorOf(this)
  }

})

/**
 * Returns the next function up the prototype chain from this one.
 */
addGetter(Function.prototype, 'parent', function () {
  var proto = Object.getPrototypeOf(this.prototype)
  return proto && proto.constructor
})

/**
 * Returns an array of functions in the prototype chain from this
 * function back to Object.
 */
addGetter(Function.prototype, 'ancestors', function () {
  var ancestors = []
  var fn = this

  do {
    ancestors.push(fn)
  } while ((fn = fn.parent) != null)

  return ancestors
})
