var falafel = require('falafel');
var idOf = require('./lib/idof.js');
var isFunction = require('./lib/isfn.js');

module.exports = function (src, opts) {
    if (!opts) opts = {};
    var names = opts.names || {};
    if (!names.scope) names.scope = rname();
    if (!names['function']) names['function'] = rname();
    if (!names.literal) names.literal = rname();
    
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
        + ';return {'
            + Object.keys(names).map(function (name) {
                return JSON.stringify(name) + ':' + names[name];
            })
            + ',names:' + JSON.stringify(names)
            + ',run:function(){' + out + '}'
            + ',patch:function(opts){'
              + 'if (!opts) opts = {};\n'
              + 'if (opts.literal) ' + names.literal + '= opts.literal;\n'
              + 'if (opts["function"]) ' + names['function'] + '= opts["function"];\n'
              + 'if (opts.scope) ' + names.scope + '= opts.scope;\n'
            + '}'
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

function rname () {
    return '__' + (Math.pow(16, 8) * Math.random()).toString(16);
}
