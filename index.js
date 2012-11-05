var falafel = require('falafel');

module.exports = function (src) {
    var scope = {};
    var fns = [];
    
    var out = falafel(String(falafel(src, rewriteVars)), rewriteIds);
    return 'var __scope='
        + JSON.stringify(Object.keys(scope).reduce(function (acc, key) {
            acc[key] = {};
            return acc;
        }, {}))
        + ';\n'
        + out
    ;
    
    function rewriteVars (node) {
        if (node.type === 'VariableDeclaration') {
            // take off the leading `var `
            var id = getScope(node);
            node.update(node.declarations.map(function (d) {
                scope[id][d.id.name] = d;
                return d.source();
            }).join(',') + ';\n');
        }
    }
    
    function rewriteIds (node) {
        if (node.type === 'Identifier') {
            var id = lookup(node);
            node.update('__scope[' + JSON.stringify(id) + '].' + node.name);
        }
    }
    
    function lookup (node) {
        for (var p = node; p; p = p.parent) {
            var id = getScope(p);
            if (scope[id][node.name]) {
                return id;
            }
        }
        return '';
    }
    
    function getScope (node) {
        for (
            var p = node;
            !isFunction(p) && p.type !== 'Program';
            p = p.parent
        );
        var id = idOf(node);
        if (!scope[id]) scope[id] = {};
        return id;
    }
    
};

function isFunction (x) {
    return x.type === 'FunctionDeclaration'
        || x.type === 'FunctionExpression'
    ;
}

function idOf (node) {
    var id = [];
    for (var n = node; n.type !== 'Program'; n = n.parent) {
        var p = n.parent;
        var kv = Object.keys(p)
            .reduce(function (acc, key) {
                if (Array.isArray(p[key])) {
                    acc.keys.push.apply(acc.keys, Object.keys(p[key]));
                    acc.values.push.apply(acc.values, p[key]);
                }
                else {
                    acc.keys.push(key);
                    acc.values.push(p[key]);
                }
                return acc;
            }, { keys : [], values : [] })
        ;
        var ix = kv.values.indexOf(n);
        var key = kv.keys[ix];
        id.push(key);
    }
    return id.join('.');
}
