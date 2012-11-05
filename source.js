var x = 5;

function foo () {
    var y = x + 100;
    
    (function bar () {
        var z = 6;
    })();
}
