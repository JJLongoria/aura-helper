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

function getMethodsContent(fileStructure, methodTemplate, paramTemplate) {
    var content = "";
    for (let i = 0; i < fileStructure.length; i++) {
        if(fileStructure[i].type === "func"){
            content += getMethodContent(fileStructure[i], methodTemplate, paramTemplate);
        }
    }
    return content;
}

function getMethodContent(structure, methodTemplate, paramTemplate) {
    var content = fileUtils.getDocumentText(methodTemplate);
    var paramsContent = "";
    var methodDesc = "<!-- Method Description Here -->";
    if(structure.comment){
        methodDesc = structure.comment.description;
        for (let i = 0; i < structure.comment.params.length; i++) {
            paramsContent += getParamContentFromComment(structure.comment.params[i], paramTemplate);
        }
    }
    else{
        for (let i = 0; i < structure.params.length; i++) {
            if(structure.params[i].type === "param"){
                paramsContent += getParamContent(structure.params[i], paramTemplate);
            }
        }
    }
    content = content.replace("{!method.name}", structure.token.content);
    content = content.replace("{!method.description}", methodDesc);
    content = content.replace("{!method.signature}", getMethodSignature(structure));
    content = content.replace("{!method.params}", paramsContent);
    return content;
}

function getParamContent(param, paramTemplate) {
    var content = fileUtils.getDocumentText(paramTemplate);
    content = content.replace("{!param.name}", param.token.content).replace("{!param.type}", "*").replace("{!param.description}", "<!-- Param Description Here -->");
    return content;
}

function getParamContentFromComment(commentParam, paramTemplate) {
    var content = fileUtils.getDocumentText(paramTemplate);
    content = content.replace("{!param.name}", commentParam.name).replace("{!param.type}", commentParam.type).replace("{!param.description}", commentParam.description);
    return content;
}

function getMethodSignature(structure){
    let signature = structure.token.content;
    let params = [];
    for (let i = 0; i < structure.params.length; i++) {
        if(structure.params[i].type === "param"){
            params.push(structure.params[i].token.content);
        }
    }
    signature = signature + "(" + params.join(", ") + ")";
    return signature;
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

function getBaseAuraDocTemplateSnippet(){
    let content = "<aura:documentation>\n";
    content += "\t<aura:description>\n";
    content += "\t\t<!-- Component Description -->\n";
    content += "\t\t<!-- Create your HTML template here -->\n";
    content += "\t\t<!-- Use keywords {!helperMethods} or {!controllerMethods}. Use them wherever you want to include the methods section of each JavaScript file -->\n";
    content += "\t\t<!-- Example: -->\n";
    content += "\t\t<h6><b>Short description</b> of the component</h6>";
    content += "\t\t<p>\n";
    content += "\t\t\tHelper methods:\n";
    content += "\t\t\t<ul>\n";
    content += "\t\t\t\t{!helperMethods}\n";
    content += "\t\t\t</ul>\n";
    content += "\t\t</p>\n";
    content += "\t</aura:description>\n";
    content += "\t<aura:example name=\"ExampleName\" ref=\"ExampleComponent\" label=\"ExampleLabel\">\n";
    content += "\t\t\n";
    content += "\t</aura:example>\n";
    content += "/<aura:documentation>";
    return content;
}

function getAuraDocMethodTemplateSnippet(){
    let content = "<!-- Create your own method HTML template here -->\n";
    content += "<!-- This template will be repeated once for each method and the result will replace the keywords {!helperMethods} or {!controllerMethods} -->\n";
    content += "<!-- On this template you can use the keywords {!method.name} {!method.signature} {!method.description} or {!method.params} -->\n";
    content += "<!-- Example -->\n";
    content += "<li>\n";
    content += "\t<b>{!method.signature}:</b> {!method.description}\n";
    content += "\t<ul>\n";
    content += "\t\t{!method.params}\n";
    content += "\t\t<!-- Method usage example -->\n";
    content += "\t\t\t<p>\n";
    content += "\t\t\t\t<pre>\n";
    content += "\t\t\t\t</pre>\n";
    content += "\t\t\t</p>\n";
    content += "\t\t<!-- End example -->\n";
    content += "\t</ul>\n";
    content += "/<li>";
    return content;
}

function getAuraDocParamTemplateSnippet(){
    let content = "<!-- Create your own method parameter HTML template here -->\n";
    content += "<!-- This template will be repeated once for each parameter and the result will replace the keyword {!method.params} -->\n";
    content += "<!-- On this template you can use the keyword {!param.name} {!param.type} or {!param.description} -->\n";
    content += "<!-- Example -->\n";
    content += "<li><i>{!param.name} ({!param.type}): </li>{!param.description}\n";
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
    getRendererFileSnippet,
    getBaseAuraDocTemplateSnippet,
    getAuraDocMethodTemplateSnippet,
    getAuraDocParamTemplateSnippet,
    getMethodSignature
}