var isfn = require('./isfn.js');
var idof = require('./idof.js');

module.exports = function getScope (scope, node) {
    for (
        var p = node;
        !isfn(p) && p.type !== 'Program';
        p = p.parent
    );
    var id = idof(node);
    if (node.type === 'VariableDeclaration') {
        // the var gets stripped off so the id needs updated
        id = id.replace(/\.init$/, '.right');
    }
    if (!scope[id]) scope[id] = {};
    return id;
};
