var falafel = require('falafel');

module.exports = function (src) {
    var scope = [];
    var out = falafel(src, function (node) {
        if (isFunction(node)) {
            var ix = getScope(node);
            node.body.body[0].update(
                '__scope[' + ix + ']={};\n'
                + node.body.body[0].source()
            );
        }
        else if (node.type === 'VariableDeclaration') {
            var ix = getScope(node);
            node.update(
                node.declarations.map(function (d) {
                    return '__scope[' + ix + '].'
                        + d.id.name + '=' + d.init.source()
                    ;
                }).join(',') + ';'
            );
        }
    });
    return 'var __scope=[];\n' + out;
    
    function getScope (node) {
        for (
            var p = node;
            !isFunction(p) && p.type !== 'Program';
            p = p.parent
        );
        if (!p.scope) p.scope = scope.length;
        if (!scope[p.scope]) scope.push({});
        return p.scope;
    }
};

function isFunction (x) {
    return x.type === 'FunctionDeclaration'
        || x.type === 'FunctionExpression'
    ;
}
