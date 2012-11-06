var test = require('tap').test;
var fs = require('fs');
var scoper = require('../');

var src = fs.readFileSync(__dirname + '/src/source.js', 'utf8');

test('run', function (t) {
    t.plan(1);
    
    var c = Function([ 'console' ], 'return ' + scoper(src))({
        log : function (n) { t.equal(n, 1378) }
    });
    c.run();
});

test('modify a literal', function (t) {
    t.plan(2);
    
    var expected = [ 1378, 2378 ];
    var c = Function([ 'console' ], 'return ' + scoper(src))({
        log : function (n) { t.equal(n, expected.shift()) }
    });
    c.run();
    
    c.literal['body.1'][0] += 100;
    c.run();
});
