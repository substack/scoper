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

console.log(foo(32));
