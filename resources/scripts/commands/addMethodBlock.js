const snippetUtils = require('../utils/snippetUtils');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const JavaScriptParser = languages.JavaScriptParser;

exports.run = function() {
    try {
        var editor = window.activeTextEditor;
        if (!editor)
            return;
        if (FileChecker.isAuraDoc(editor.document.uri.fsPath)) {
            addMethodBlock(editor);
        } else {
            NotificationManager.showError('The selected file is not an Apex Class');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addMethodBlock(editor) {
    let filePath = editor.document.uri.fsPath;
    let helperPath = Paths.getBundleHelperPath(filePath);
    let controllerPath = Paths.getBundleControllerPath(filePath);
    let helper;
    let controller;
    if (FileChecker.isExists(helperPath)) {
        helper = JavaScriptParser.parse(FileReader.readFileSync(helperPath));
    }
    if (FileChecker.isExists(controllerPath)) {
        controller = JavaScriptParser.parse(FileReader.readFileSync(controllerPath));
    }
    let options = [];
    if (controller)
        options.push("Controller Functions");
    if (helper)
        options.push("Helper Functions");
    if (options.length > 0) {
        window.showQuickPick(options, { placeHolder: "Select file for get functions" }).then((fileSelected) => processFileSelected(fileSelected, controller, helper, editor));
    } else {
        window.showInformationMessage("Nor JavaScript files found on bundle");
    }

}

function processFileSelected(fileSelected, controller, helper, editor) {
    let funcNames = [];
    if (fileSelected == "Controller Functions") {
        for (let i = 0; i < controller.functions.length; i++) {
            const method = controller.functions[i];
            funcNames.push(method.signature);
        }
    }
    else if (fileSelected == "Helper Functions") {
        for (let i = 0; i < helper.functions.length; i++) {
            const method = helper.functions[i];
            funcNames.push(method.signature);
        }
    }
    if (funcNames.length > 0) {
        window.showQuickPick(funcNames, { placeHolder: "Select the method for add on Documentation file" }).then((funcSelected) => processFunctionSelected(fileSelected, funcSelected, controller, helper, editor));
    } else {
        window.showInformationMessage("Not methods found in selected file");
    }
}

function processFunctionSelected(fileSelected, funcSelected, controller, helper, editor) {
    let docTemplateContent = FileReader.readFileSync(Paths.getAuraDocumentUserTemplatePath());
    var methods = [];
    if (fileSelected == "Controller Functions") {
        methods = controller.functions;
    }
    else if (fileSelected == "Helper Functions") {
        methods = helper.functions;
    }
    for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        if (method.signature == funcSelected) {
            let auraDocTemplateJSON = JSON.parse(docTemplateContent);
            var methodContent = snippetUtils.getMethodContent(method, auraDocTemplateJSON.methodBody, auraDocTemplateJSON.paramBody, snippetUtils.getWhitespaces(editor.selection.start.character)).trimLeft();
            FileWriter.replaceEditorContent(editor, editor.selection, methodContent);
        }
    }
}