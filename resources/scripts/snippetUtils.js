const logger = require('./logger');
const fileUtils = require('./fileUtils');

function getApexComment(apexClassOrMethod, addOpenAndClose) {
    let comment = ``;
    let whitespace = '';
    let firstChar = '/**';
    if (apexClassOrMethod.methodName !== undefined) {
        // Generating the Snippet as a string.
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${apexClassOrMethod.methodName} description}\n${whitespace} *\n`;
        // The padding is a string that is a bunch of spaces equal to the maximum size of the variable.
        let snippetNum = 2;
        for (let variable of apexClassOrMethod.parameters) {
            var varName = variable.name;
            var varType = variable.type;
            // No need to import any right-pad node libraries here!
            comment += `${whitespace} * ## \${${snippetNum}:${varName}} (${varType}): \${${snippetNum}:${varName} description}\n`;
            snippetNum++;
        }
        // If we DIDN'T find the word "void" in the method signature, show the return line
        if (apexClassOrMethod.hasReturn) {
            comment += `${whitespace} *\n${whitespace} * @@ Return ${apexClassOrMethod.returnType}: \${${snippetNum}:return description}\n`;
        }
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    } else if (apexClassOrMethod.className !== undefined) {
        if (addOpenAndClose)
            comment += `${whitespace}${firstChar}`;
        comment += `\n${whitespace} * \${1:${apexClassOrMethod.className} description}\n`;
        comment += `${whitespace} *\n`;
        comment += `${whitespace} * @@ TestClass => \${2:${apexClassOrMethod.className} test class}\n`;
        if (addOpenAndClose)
            comment += `${whitespace} */`;
    }
    logger.log('comment', comment);
    return comment;
}

function getJSFunctionSnippet(numParams) {
    var funcBody = `\${1:funcName} : function(`;
    if (numParams > 0) {
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

function getMethodsContent(methods, methodTemplate, paramTemplate) {
    var content = "";
    for (let i = 0; i < methods.length; i++) {
        content += getMethodContent(methods[i], methodTemplate, paramTemplate);
    }
    return content;
}

function getMethodContent(method, methodTemplate, paramTemplate) {
    var content = fileUtils.getDocumentText(methodTemplate);
    var paramsContent = "";
    for (let i = 0; i < method.params.length; i++) {
        paramsContent += getParamContent(method.params[i], paramTemplate);
    }
    content = content.replace("{!method.name}", method.name);
    content = content.replace("{!method.signature}", method.signature);
    content = content.replace("{!method.params}", paramsContent);
    return content;
}

function getParamContent(param, paramTemplate) {
    var content = fileUtils.getDocumentText(paramTemplate);
    content = content.replace("{!param.name}", param);
    return content;
}

function getAuraDocumentationSnippet(controllerMethods, helperMethods, docTemplate, methodTemplate, paramTemplate) {
    var documentationText = fileUtils.getDocumentText(docTemplate);
    var helperMethodsContent = getMethodsContent(helperMethods, methodTemplate, paramTemplate);
    var controllerMethodsContent = getMethodsContent(controllerMethods, methodTemplate, paramTemplate);
    documentationText = documentationText.replace("{!helperMethods}", helperMethodsContent).replace("{!controllerMethods}", controllerMethodsContent);
    return documentationText;
}

function getCSSFileSnippet(){
    return ".THIS {\n}"
}

function getDesignFileSnippet(){
    return "<design:component >\n\t\n</design:component>"
}

function getSVGFileSnippet(){
    let content = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n";
    content += "<svg width=\"120px\" height=\"120px\" viewBox=\"0 0 120 120\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";
    content += "\t<g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n";
    content += "\t\t<path d=\"M120,108 C120,114.6 114.6,120 108,120 L12,120 C5.4,120 0,114.6 0,108 L0,12 C0,5.4 5.4,0 12,0 L108,0 C114.6,0 120,5.4 120,12 L120,108 L120,108 Z\" id=\"Shape\" fill=\"#2A739E\"/>\n";
    content += "\t\t<path d=\"M77.7383308,20 L61.1640113,20 L44.7300055,63.2000173 L56.0543288,63.2000173 L40,99.623291 L72.7458388,54.5871812 L60.907727,54.5871812 L77.7383308,20 Z\" id=\"Path-1\" fill=\"#FFFFFF\"/>\n";
    content += "\t</g>\n"
    content += "</svg>";
    return content;
}

function getControllerHelperFileSnippet(firstMethodName){
    let content = "({";
    if(firstMethodName.indexOf('Controller') !== -1)
        content += firstMethodName + " : function (component, event, helper) {\n\t\n}";
    else
        content += firstMethodName + " : function (component) {\n\t\n}";
    content += "})";
    return content;
}

function getRendererFileSnippet(){
    let content = "({";
    content += "\n\n// Your renderer method overrides go here\n\n"
    content += "})";
    return content;
}

module.exports = {
    getJSFunctionSnippet,
    getApexComment,
    getAuraDocumentationSnippet,
    getControllerHelperFileSnippet,
    getCSSFileSnippet,
    getDesignFileSnippet,
    getSVGFileSnippet,
    getRendererFileSnippet
}