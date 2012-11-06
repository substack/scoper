var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(process.argv[2], 'utf8');
var out = scoper(src);
console.log(out);
