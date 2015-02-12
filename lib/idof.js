var keyof = require('./keyof.js');
var isfn = require('./isfn.js');

module.exports = function idOf (node) {
    var id = [];
    for (var n = node; n.type !== 'Program'; n = n.parent) {
        if (!isfn(n)) continue;
        var key = keyof(n).join('.');
        id.unshift(key);
    }
    return id.join('.');
};
