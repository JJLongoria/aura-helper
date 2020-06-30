const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const NotificationManager = require('../output/notificationManager');
const ApexParser = languages.ApexParser;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Window = vscode.window;
const SnippetString = vscode.SnippetString;
const Position = vscode.Position;

exports.run = function () {
    try {
        let filePath;
        let editor = Window.activeTextEditor;
        if (editor)
            filePath = editor.document.uri.fsPath;
        if (FileChecker.isApexClass(filePath)) {
            implementClasses(editor, ApexParser.getFileStructure(FileReader.readDocument(editor.document)));
        } else {
            NotificationManager.showError("The selected file isn't an Apex Class");
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function implementClasses(editor, apexClass) {
    let inheritedMethods = [];
    let methodsForCreate = [];
    if (apexClass.extends && apexClass.extends.methods && apexClass.extends.methods.length > 0) {
        for (const method of apexClass.extends.methods) {
            if (method.definitionModifier === 'abstract' || method.definitionModifier === 'virtual')
                inheritedMethods.push(method);
        }
    }
    for (const inheritedMethod of inheritedMethods) {
        if (!isMethodExists(inheritedMethod, apexClass.methods) && !isMethodExists(inheritedMethod, apexClass.constructors)) {
            methodsForCreate.push(inheritedMethod);
        }
    }
    let lastMethodToken;
    let lastClassToken = apexClass.lastToken;
    if (apexClass.methods && apexClass.methods.length > 0) {
        let lastMethod = apexClass.methods[apexClass.methods.length - 1];
        lastMethodToken = lastMethod.lastToken;
    }
    if (methodsForCreate.length > 0) {
        if (lastMethodToken) {
            let content = '\n\n';
            for (const method of methodsForCreate) {
                if (method.datatype && method.datatype.toLowerCase() !== 'void')
                    content += ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t' + method.datatype + ' returnedValue = null;\n\t\n\treturn returnedValue;\n}\n\n';
                else
                    content += ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t\n}\n\n';
            }
            editor.insertSnippet(new SnippetString(content), new Position(lastMethodToken.line, lastMethodToken.endColumn));
        } else if (lastClassToken) {
            let content = '';
            for (const method of methodsForCreate) {
                if (method.datatype && method.datatype.toLowerCase() !== 'void')
                    content += '\t' + ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t\t' + method.datatype + ' returnedValue = null;\n\t\t\n\t\treturn returnedValue;\n\t}\n\n';
                else
                    content += '\t' + ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t\t\n\t}\n\n';
            }
            editor.insertSnippet(new SnippetString(content), new Position(lastClassToken.line, 0));
        }
    } else {
        NotificationManager.showInfo("This Class has no methods to implement");
    }
}

function isMethodExists(method, methods) {
    if (methods && methods.length > 0) {
        for (const existingMethod of methods) {
            let existingSignature = getSortSignature(existingMethod);
            let signature = getSortSignature(method);
            if (existingSignature.toLowerCase() === signature.toLowerCase())
                return true;
        }
    }
    return false;
}

function getSortSignature(method) {
    let signature = method.name;
    let params = [];
    if (method.params && method.params.length > 0) {
        for (const param of method.params) {
            params.push(param.datatype + ' ' + param.name);
        }
    }
    signature += '(' + params.join(', ') + ')';
    return signature;
}