var falafel = require('falafel');

module.exports = function (src) {
    var scopeName = '__' + (Math.pow(16, 8) * Math.random()).toString(16);
    var scope = {};
    
    var out = [ rewriteVars, rewriteIds ].reduce(function (src, fn) {
        return String(falafel(src, fn));
    }, src);
    
    return 'function () {\n'
        + 'var ' + scopeName + '='
        + JSON.stringify(Object.keys(scope).reduce(function (acc, key) {
            acc[key] = {};
            return acc;
        }, {}))
        + ';\n'
        + out
        + ';return {scope:' + scopeName + '}}'
    ;
    
    function rewriteVars (node) {
        if (node.type === 'VariableDeclaration') {
            // take off the leading `var `
            var id = getScope(node);
            node.update(node.declarations.map(function (d) {
                scope[id][d.id.name] = d;
                return d.source();
            }).join(','));
        }
    }
    
    function rewriteIds (node) {
        if (node.type === 'Identifier' && !isFunction(node.parent)) {
            var id = JSON.stringify(lookup(node));
            node.update(scopeName + '[' + id + '].' + node.name);
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
        if (node.type === 'VariableDeclaration') {
            // the var gets stripped off so the id needs updated
            id = id.replace(/\.init$/, '.right');
        }
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
        if (!isFunction(n)) continue;
        
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
        id.unshift(key);
    }
    return id.join('.');
}
