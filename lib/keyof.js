module.exports = function keyOf (node) {
    if (!node.parent) return [];
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
};
