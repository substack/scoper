var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/source/simple.js', 'utf8');
var c = Function('return ' + scoper(src))();
c.run();

setInterval(function () {
    c.literal['arguments.0'][0] += 10;
}, 500);

setTimeout(function () {
    c.scope[''].x = 11;
}, 2000);
