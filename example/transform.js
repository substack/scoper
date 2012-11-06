var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/source/nested.js', 'utf8');
var out = scoper(src);
console.log(out);
