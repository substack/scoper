var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/source.js', 'utf8');
var c = Function('return ' + scoper(src))();
c.run();

setInterval(function () {
    //c.literal['body.1'][0] += 10;
}, 500);
