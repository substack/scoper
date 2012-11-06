var test = require('tap').test;
var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/src/source.js', 'utf8');

test('run', function (t) {
    t.plan(1);
    
    Function([ 'console' ], 'return ' + scoper(src))({
        log : function (n) { t.equal(n, 1378) }
    });
});
