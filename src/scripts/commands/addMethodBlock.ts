import * as vscode from 'vscode';
import { SnippetUtils } from '../utils/snippetUtils';
import { NotificationManager, Editor } from '../output';
import { Paths } from '../core/paths';
import { JavaScript } from '@aurahelper/languages';
import { AuraJSFunction, CoreUtils, FileChecker, FileReader } from '@aurahelper/core';
const StrUtils = CoreUtils.StrUtils;
const JSParser = JavaScript.JSParser;
const window = vscode.window;

export function run(): void {
    try {
        const editor = window.activeTextEditor;
        if (!editor) {
            return;
        }
        if (FileChecker.isAuraDoc(editor.document.uri.fsPath)) {
            addMethodBlock(editor);
        } else {
            NotificationManager.showError('The selected file is not an Aura Doc');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function addMethodBlock(editor: vscode.TextEditor): void {
    const filePath = editor.document.uri.fsPath;
    const helperPath = Paths.getAuraBundleHelperPath(filePath);
    const controllerPath = Paths.getAuraBundleControllerPath(filePath);
    let helperMethods: AuraJSFunction[] | undefined = [];
    let controllerMethods: AuraJSFunction[] | undefined = [];
    if (FileChecker.isExists(helperPath)) {
        helperMethods = new JSParser(helperPath).parse()!.methods;
    }
    if (FileChecker.isExists(controllerPath)) {
        controllerMethods = new JSParser(controllerPath).parse()!.methods;
    }
    let options = [];
    if (controllerMethods && controllerMethods.length > 0) {
        options.push("Controller Functions");
    }
    if (helperMethods && helperMethods.length > 0) {
        options.push("Helper Functions");
    }
    if (options.length > 0) {
        window.showQuickPick(options, { placeHolder: "Select file for get functions" }).then((fileSelected: any) => processFileSelected(fileSelected, controllerMethods, helperMethods, editor));
    } else {
        window.showInformationMessage("Not JavaScript files found on bundle");
    }
}

function processFileSelected(fileSelected: string, controllerMethods: AuraJSFunction[] | undefined, helperMethods: AuraJSFunction[] | undefined, editor: vscode.TextEditor): void {
    let funcNames: string[] = [];
    if (fileSelected === "Controller Functions" && controllerMethods) {
        for (let i = 0; i < controllerMethods.length; i++) {
            const method = controllerMethods[i];
            if (method.signature) {
                funcNames.push(method.signature);
            }
        }
    }
    else if (fileSelected === "Helper Functions" && helperMethods) {
        for (let i = 0; i < helperMethods.length; i++) {
            const method = helperMethods[i];
            if (method.signature) {
                funcNames.push(method.signature);
            }
        }
    }
    if (funcNames.length > 0) {
        window.showQuickPick(funcNames, { placeHolder: "Select the method for add on Documentation file" }).then((funcSelected) => processFunctionSelected(fileSelected, funcSelected, controllerMethods, helperMethods, editor));
    } else {
        window.showInformationMessage("Not methods found in selected file");
    }
}

function processFunctionSelected(fileSelected: string, funcSelected: string | undefined, controllerMethods: AuraJSFunction[] | undefined, helperMethods: AuraJSFunction[] | undefined, editor: vscode.TextEditor): void {
    let docTemplateContent = FileReader.readFileSync(Paths.getAuraDocUserTemplate());
    var methods: AuraJSFunction[] | undefined = [];
    if (fileSelected === "Controller Functions") {
        methods = controllerMethods;
    }
    else if (fileSelected === "Helper Functions") {
        methods = helperMethods;
    }
    if (methods) {
        for (let i = 0; i < methods.length; i++) {
            const method = methods[i];
            if (method.signature === funcSelected) {
                let auraDocTemplateJSON = JSON.parse(docTemplateContent);
                var methodContent = SnippetUtils.getMethodContent(method, auraDocTemplateJSON.methodBody, auraDocTemplateJSON.paramBody, auraDocTemplateJSON.returnBody, StrUtils.getWhitespaces(editor.selection.start.character)).trimLeft();
                Editor.replaceEditorContent(editor, editor.selection, methodContent);
            }
        }
    }
}