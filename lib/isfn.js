module.exports = function isFunction (x) {
    return x.type === 'FunctionDeclaration'
        || x.type === 'FunctionExpression'
    ;
};
