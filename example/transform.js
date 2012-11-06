var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/source.js', 'utf8');
var out = scoper(src);
console.log(out);
