var falafel = require('falafel');
var fs = require('fs');

var src = fs.readFileSync(process.argv[2], 'utf8');
var out = falafel(src, function (node) {
    if (node.type === 'VariableDeclarator') {
        var context = parents(node).filter(function (x) {
            return x.type === 'FunctionDeclaration'
                || x.type === 'FunctionExpression'
            ;
        });
        
        var scope = context.map(function (c) {
            return c.id.name
        });
        console.dir({
            id : node.id.name,
            scope : scope
        });
        node.update(node.source().toUpperCase());
    }
});
console.log(out);

function parents (node) {
    var p = node;
    var ps = [];
    while (p = p.parent) {
        ps.push(p);
    }
    return ps;
}
