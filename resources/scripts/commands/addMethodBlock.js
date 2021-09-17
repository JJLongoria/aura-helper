const SnippetUtils = require('../utils/snippetUtils');
const vscode = require('vscode');
const Editor = require('../output/editor');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const { FileChecker, FileReader } = require('@ah/core').FileSystem;
const { StrUtils } = require('@ah/core').CoreUtils;
const { JSParser } = require('@ah/languages').JavaScript;
const window = vscode.window;

exports.run = function() {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isAuraDoc(editor.document.uri.fsPath)) {
            addMethodBlock(editor);
        } else {
            NotificationManager.showError('The selected file is not an Aura Doc');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addMethodBlock(editor) {
    let filePath = editor.document.uri.fsPath;
    let helperPath = Paths.getAuraBundleHelperPath(filePath);
    let controllerPath = Paths.getAuraBundleControllerPath(filePath);
    let helperMethods;
    let controllerMethods;
    if (FileChecker.isExists(helperPath)) {
        helperMethods = new JSParser(helperPath).parse().methods;
    }
    if (FileChecker.isExists(controllerPath)) {
        controllerMethods = new JSParser(controllerPath).parse().methods;
    }
    let options = [];
    if (controllerMethods && controllerMethods.length > 0)
        options.push("Controller Functions");
    if (helperMethods && helperMethods.length > 0)
        options.push("Helper Functions");
    if (options.length > 0) {
        window.showQuickPick(options, { placeHolder: "Select file for get functions" }).then((fileSelected) => processFileSelected(fileSelected, controllerMethods, helperMethods, editor));
    } else {
        window.showInformationMessage("Not JavaScript files found on bundle");
    }

}

function processFileSelected(fileSelected, controllerMethods, helperMethods, editor) {
    let funcNames = [];
    if (fileSelected == "Controller Functions") {
        for (let i = 0; i < controllerMethods.length; i++) {
            const method = controllerMethods[i];
            funcNames.push(method.signature);
        }
    }
    else if (fileSelected == "Helper Functions") {
        for (let i = 0; i < helperMethods.length; i++) {
            const method = helperMethods[i];
            funcNames.push(method.signature);
        }
    }
    if (funcNames.length > 0) {
        window.showQuickPick(funcNames, { placeHolder: "Select the method for add on Documentation file" }).then((funcSelected) => processFunctionSelected(fileSelected, funcSelected, controllerMethods, helperMethods, editor));
    } else {
        window.showInformationMessage("Not methods found in selected file");
    }
}

function processFunctionSelected(fileSelected, funcSelected, controllerMethods, helperMethods, editor) {
    let docTemplateContent = FileReader.readFileSync(Paths.getAuraDocUserTemplate());
    var methods = [];
    if (fileSelected == "Controller Functions") {
        methods = controllerMethods;
    }
    else if (fileSelected == "Helper Functions") {
        methods = helperMethods;
    }
    for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        if (method.signature == funcSelected) {
            let auraDocTemplateJSON = JSON.parse(docTemplateContent);
            var methodContent = SnippetUtils.getMethodContent(method, auraDocTemplateJSON.methodBody, auraDocTemplateJSON.paramBody, auraDocTemplateJSON.returnBody, StrUtils.getWhitespaces(editor.selection.start.character)).trimLeft();
            Editor.replaceEditorContent(editor, editor.selection, methodContent);
        }
    }
}