var falafel = require('falafel');

module.exports = function (src) {
    var names = [ 'scope', 'function', 'literal' ]
        .reduce(function (acc, name) {
            acc[name] = '__' + (Math.pow(16, 8) * Math.random()).toString(16);
            return acc;
        }, {})
    ;
    
    var scope = {};
    var fns = {};
    var literal = {};
    
    var out = [ rewriteVars, rewriteIds, normalizeFns ]
        .reduce(function (src, fn) {
            return String(falafel(src, fn));
        }, src)
    ;
    
    return '(function () {\n'
        + 'var ' + names.scope + '='
        + JSON.stringify(Object.keys(scope).reduce(function (acc, key) {
            acc[key] = {};
            return acc;
        }, {}))
        + ';\n'
        + 'var ' + names['function'] + '={'
        + Object.keys(fns).map(function (id) {
            return JSON.stringify(id) + ':' + fns[id]
        }, '').join(',\n') + '};\n'
        + 'var ' + names.literal + '={'
        + Object.keys(literal).map(function (id) {
            return JSON.stringify(id) + ':' + '[' + literal[id].join(',') + ']'
        }, '').join(',\n') + '};\n'
        + ';return {' + Object.keys(names).map(function (name) {
            return JSON.stringify(name) + ':' + names[name];
        }) + ',run:function(){' + out + '}'
        + '};\n'
        + out // duplicate at the end won't execute, but needed for hoisting
        + '})()'
    ;
    
    function rewriteVars (node) {
        if (node.type === 'VariableDeclaration') {
            // take off the leading `var `
            var id = getScope(node);
            node.update(node.declarations.map(function (d) {
                scope[id][d.id.name] = d;
                return d.source();
            }).join(',') + ';');
        }
        if (node.type === 'Literal') {
            var id = getScope(node);
            if (!literal[id]) literal[id] = [];
            var ix = literal[id].length;
            literal[id].push(node.source());
            
            var sid = JSON.stringify(id);
            node.update(names.literal + '[' + sid + '][' + ix + ']');
        }
    }
    
    function rewriteIds (node) {
        if (node.type === 'Identifier' && !isFunction(node.parent)) {
            var id = lookup(node);
            if (id === undefined) return;
            var sid = JSON.stringify(id);
            node.update(names.scope + '[' + sid + '].' + node.name);
        }
    }
    
    function normalizeFns (node) {
        if (isFunction(node)) {
            var id = idOf(node);
            fns[id] = node.source();
            node.body.update('{'
                + 'return ' + names['function']
                + '[' + JSON.stringify(id) + ']'
                + '.apply(this, arguments)'
                + '}'
            );
        }
    }
    
    function lookup (node) {
        for (var p = node; p; p = p.parent) {
            if (isFunction(p) || p.type === 'Program') {
                var id = getScope(p);
                if (scope[id][node.name]) {
                    return id;
                }
            }
        }
        return undefined;
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
        var key = keyOf(n).join('.');
        id.unshift(key);
    }
    return id.join('.');
}

function keyOf (node) {
    var p = node.parent;
    var kv = Object.keys(p)
        .reduce(function (acc, key) {
            acc.keys.push(key);
            acc.values.push(p[key]);
            acc.top.push(undefined);
            
            if (Array.isArray(p[key])) {
                var keys = Object.keys(p[key]);
                acc.keys.push.apply(acc.keys, keys);
                acc.values.push.apply(acc.values, p[key]);
                acc.top.push.apply(
                    acc.top,
                    keys.map(function () { return key })
                );
            }
            
            return acc;
        }, { keys : [], values : [], top : [] })
    ;
    var ix = kv.values.indexOf(node);
    return [ kv.top[ix], kv.keys[ix] ].filter(Boolean);
}
