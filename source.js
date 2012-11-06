var x = 5;

function foo () {
    var y = x + 100;
    
    (function bar () {
        var z = 6;
        var f = function () {
            var q = y * 10;
            var x = z + 2;
        };
    })();
}
