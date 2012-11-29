[![build status](https://secure.travis-ci.org/mjijackson/monterey.js.png)](http://travis-ci.org/mjijackson/monterey.js)

# Welcome to Monterey!

Monterey is a tiny JavaScript library that neatly encapsulates two very common usage patterns:

  1. Inheritance
  2. Events

This document explains each feature and gives some guidance as to how to use it. If you're a newcomer to JavaScript from another object-oriented language like Java, Python, or Ruby, you'll probably find most of these additions quite welcome. If you're an experienced JavaScript programmer you'll still probably enjoy reading the source to see how some of the new features in ES5 are used to expose JavaScript's powerful object model and meta-programming interface.

## Features

### Inheritance

Although it may be used in a mostly-functional style, JavaScript has a simple and powerful object model at its heart built around prototypal inheritance. What this means in practice is that every function has a `prototype` object. When object instances are created using the `new` keyword in front of a function they reference all the properties and methods of that function's prototype. As such, all properties of the prototype object are also properties of that object.

Even though a function automatically comes with a prototype, a function may actually use any object as its prototype. Thus, we can mimic a classical inheritance strategy by setting the prototype of some function to an instance of some other function, its "superclass".

Monterey provides the following properties and methods that make it easier to use this pattern of inheritance in JavaScript:

  - `Function#inherit(fn)`
  - `Function#extend([props])`
  - `Function#isParentOf(fn)`
  - `Function#isChildOf(fn)`
  - `Function#isAncestorOf(fn)`
  - `Function#isDescendantOf(fn)`
  - `Function#parent`
  - `Function#ancestors`

`Function#extend` is used to create an inheritance hierarchy that automatically sets up the prototype chain from one constructor function to another.

```javascript
var Person = Object.extend({
  constructor: function (name) {
    this.name = name;
  },
  sayHello: function () {
    return 'Hi, my name is ' + this.name + '.';
  }
});

var Employee = Person.extend({
  constructor: function (name, title) {
    this.super(name);
    this.title = title;
  },
  sayHello: function () {
    return this.super() + " I'm an " + this.title + '!';
  }
});

var buzz = new Employee('Buzz', 'astronaut');
buzz.sayHello(); // Hi, my name is Buzz. I'm an astronaut!

Employee.parent; // Person
Employee.isChildOf(Person); // true
Person.isParentOf(Employee); // true

Employee.ancestors; // [Person, Object]
Employee.isDescendantOf(Object); //true
Object.isAncestorOf(Employee); // true
```

Under the hood `Function#extend` is just using Monterey's `Function#inherit` to setup the prototype chain.

### Events

Most JavaScript programs rely heavily on an event-driven architecture to know when to do things. For example, in a web browser event handlers are used to run a piece of code in response to things that the user does such as clicking on a button or submitting a form.

Libraries like [jQuery](http://jquery.com) can be very useful for setting up event listeners on a web page, but event-driven architecture can be a very useful tool as a general method of organizing code.

In Monterey, *any* JavaScript object is able to register event handlers and notify listeners when events happen. The following methods make this possible:

  - `Object.on(object, type, handler)`
  - `Object.off(object, type, [ handler ])`
  - `Object.trigger(object, type, args...)`
  - `Object.addEvents(object)`

`Object.on` is used to register a handler function for a given type of event on any object. `Object.trigger` triggers an event of a given type and calls all handlers for events of that type with an event object and any additional arguments given in the scope of the receiver. `Object.off` un-registers a specific event handler if given, or all event handlers for the given type if no handler is given.

```javascript
var a = {};
Object.addEvents(a);

a.on('anEvent', function (event, arg) {
  console.log(this); // a
  console.log(event.source); // a
  console.log(event.type); // "anEvent"
  console.log(arg); // "anArg"
});

a.trigger('anEvent', 'anArg');
```

By default events have `type`, `time`, and `source` properties as in the example above.

Note: If an event handler returns `false` all remaining handlers for that event are not called.

### Object.merge and Object.copy

It's extremely common to need to copy the own properties of one object to another efficiently. This can be useful when cloning objects, for example, or when mixing in methods of a function's prototype on an object (see the Mixins section above).

```javascript
var a = {};
var b = { message: 'Hello!' };

Object.merge(a, b);

a.message; // "Hello!"
```

If you simply want a copy of an existing object, use `Object.copy` which just merges an object with a new, blank object.

```javascript
var a = { message: 'Hello!' };
var b = Object.copy(a);

a === b; // false
b.message; // "Hello!"
```

## Compatibility

Monterey works in any JavaScript environment that supports ES5, specifically the "static" methods of `Object` including `Object.create`, `Object.defineProperty`, and `Object.defineProperties`. Please see kangax's excellent [ECMAScript 5 compatibility table](http://kangax.github.com/es5-compat-table/) for information on which browsers support ES5.

## Installation

Using [npm](http://npmjs.org):

    $ npm install monterey

Otherwise, [download](https://github.com/mjijackson/monterey.js/downloads) the package from GitHub and include monterey.js as you would any other JavaScript file.

## Tests

Run the tests with [mocha](http://visionmedia.github.com/mocha/):

    $ mocha test

## License

Copyright (c) 2012 Michael Jackson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
