const vscode = require('vscode');
const logger = require('./logger');

function getDocumentObject(filePath, callback){
    vscode.workspace.openTextDocument(filePath).then((document) => {
        logger.log("Document Opened ("+filePath+")");
        callback.call(this, document);
    });
}

function getDocumentText(document){
    var text = "";
    for(var i = 0; i < document.lineCount; i++){
        text += document.lineAt(i).text + "\n";
    }
    return text;
}

function getMethods(jsDocument) {
    var methods = [];
    for (var i = 0; i < jsDocument.lineCount; i++) {
        var line = jsDocument.lineAt(i);
        if (line.text.indexOf('function') != -1 && line.text.indexOf(':') != -1) {
            var method = {
                name: "",
                params: []
            };
            var splits = line.text.split(":");
            if (splits.length == 2) {
                method.name = line.text.split(":")[0].trim();
                var paramsTmp = line.text.split(":")[1].replace(" ", "").replace("function", "").replace("(", "").replace(")", "").replace("{", "").split(",");
                var params = [];
                for (var j = 0; j < paramsTmp.length; j++) {
                    params.push(paramsTmp[j].trim().replace(" ", ""));
                }
                method.params = params;
                method.signature = method.name + "(" + method.params.join(", ") + ")";
                methods.push(method);
            }
        }
    }
    return methods;
}

function isAuraDocFile(filePath) {
    return filePath.indexOf('.auradoc') != -1;
}

function isApexClassFile(filePath){
    return filePath.indexOf('.cls') != -1;
}

function isJavascriptFile(filePath){
    return filePath.indexOf('.js') != -1;
}


module.exports = {
    isAuraDocFile,
    isApexClassFile,
    isJavascriptFile,
    getMethods,
    getDocumentObject,
    getDocumentText
}