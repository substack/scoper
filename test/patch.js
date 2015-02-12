var test = require('tap').test;
var fs = require('fs');
var scoper = require('../');

var src0 = ';(function () { console.log("zero");'
    + 'setTimeout(function () { console.log("no") }, 5) })()'
;
var src1 = ';(function () { console.log("zero");'
    + 'setTimeout(function () { console.log("one") }, 5) })()'
;

test('patch', function (t) {
    t.plan(2);
    
    var expected = [ 'zero', 'one' ];
    var con = {
        log : function (n) { t.equal(n, expected.shift()) }
    };
    
    var c0 = Function(
        [ 'console' ], 'return ' + scoper(src0)
    )(con);
    c0.run();
    
    var c1 = Function(
        [ 'console' ],
        'return ' + scoper(src1, { names: c0.names })
    )(con);
    c0.patch(c1);
});
