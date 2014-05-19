[![build status](https://secure.travis-ci.org/mjijackson/monterey.js.png)](http://travis-ci.org/mjijackson/monterey.js)

# Welcome to Monterey!

Monterey is a tiny JavaScript library that adds simple but powerful classical inheritance capabilities to ES5 JavaScript.

This document explains each feature and gives some guidance as to how to use it. If you're a newcomer to JavaScript from another object-oriented language like Java, Python, or Ruby, you'll probably find most of these additions quite welcome. If you're an experienced JavaScript programmer you'll still probably enjoy reading the source to see how some of the new features in ES5 are used to expose JavaScript's powerful object model and meta-programming interface.

## Features

Although it may be used in a mostly-functional style, JavaScript has a simple and powerful object model at its heart built around prototypal inheritance. What this means in practice is that every function has a `prototype` object. When object instances are created using the `new` keyword in front of a function they reference all the properties and methods of that function's prototype. As such, all properties of the prototype object are also properties of that object.

Even though a function automatically comes with a prototype, a function may actually use any object as its prototype. Thus, we can mimic a classical inheritance strategy by setting the prototype of some function to an instance of some other function, its "superclass".

Monterey provides the following properties and methods that make it easier to use this pattern of inheritance in JavaScript:

  - `Function#inherit(fn)`
  - `Function#extend([ properties ])`
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

Under the hood `Function#extend` uses `Function#inherit` to setup the prototype chain.

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

MIT
