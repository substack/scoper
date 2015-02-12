var isfn = require('./isfn.js');
var getscope = require('./getscope.js');

module.exports = function lookup (scope, node) {
    for (var p = node; p; p = p.parent) {
        if (isfn(p) || p.type === 'Program') {
            var id = getscope(scope, p);
            if (scope[id][node.name]) {
                return id;
            }
        }
    }
    return undefined;
};
