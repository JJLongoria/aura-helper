function getJSFunctionSnippet(numParams){
    var funcBody = `\${1:funcName} : function(`;
    if(numParams > 0){
        var params = [];
        for (let i = 0; i < numParams; i++) {
            var nParam = i + 1;
            var snippetNum = i + 2;
            params.push(`\${${snippetNum}:param_${nParam}}`);
        }
        funcBody += params.join(`, `);
    }
    funcBody += `){\n\t$0\n},`;
    return funcBody;
}

module.exports = {
    getJSFunctionSnippet
}