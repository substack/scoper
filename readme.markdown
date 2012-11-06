# scoper

modify nested scope at runtime

# example

## modify

Given this simple source:

``` js
var x = 3;

setInterval(function () {
    console.log(100 * x);
}, 500);
```

we can modify the values of the variable `x` and the constant `100` at runtime:

``` js
var fs = require('fs');
var scoper = require('scoper');

var src = fs.readFileSync(__dirname + '/source/simple.js', 'utf8');
var c = Function('return ' + scoper(src))();
c.run();

setInterval(function () {
    c.literal['arguments.0'][0] += 10;
}, 500);

setTimeout(function () {
    c.scope[''].x = 11;
}, 2000);
```

***

```
$ node example/simple.js
300
330
360
390
1540
1650
1760
1870
1980
2090
^C
```

## attributes

Given some source:

``` js
var x = 5;

function foo (n) {
    var y = n + x + 100;
    
    return (function bar () {
        var z = 6;
        var f = function () {
            var q = y * 10;
            var x = z + 2;
            return q + x;
        };
        return f(z);
    })();
}

setInterval(function () {
    console.log(foo(32));
}, 500);
```

the attribute object looks like:

```
$ node example/attr
{ scope: 
   { '': {},
     'body.1': {},
     'body.1.callee': {},
     'body.1.callee.init': {},
     'body.1.callee.right': {},
     'arguments.0': {} },
  function: 
   { 'body.1.callee.right': [Function],
     'body.1.callee': [Function: bar],
     'body.1': [Function: foo],
     'arguments.0': [Function] },
  literal: 
   { '': [ 5, 500 ],
     'body.1': [ 100 ],
     'body.1.callee': [ 6 ],
     'body.1.callee.init': [ 10, 2 ],
     'arguments.0': [ 32 ] },
  run: [Function] }
```

# methods

``` js
var scoper = require('scoper')
```

## var newSrc = scoper(src)

Return a string that rewrites `src` to add scoping instrumentation hooks.

## var c = Function('return ' + newSrc)()

Create a new scoper context `c` from the javascript source string `newSrc`
returned by `scoper()`.

## c.run()

Run the source. You can run the source as many times as you like. You can modify
the scope attributes before, after, or during a run.

# attributes

## c.scope

All the variables are kept in this object.

## c.function

Copies of all functions are kept here so you can modify the functions at runtime.

## c.literal

The literal number, string, boolean, and regex values are stored in this object.

# install

With [npm](https://npmjs.org) do:

```
npm install scoper
```

# license

MIT
