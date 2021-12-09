import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { applicationContext } from '../core/applicationContext';
import { Apex } from '@aurahelper/languages';
import { ApexConstructor, ApexNodeTypes, CoreUtils, FileChecker, FileReader } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
const StrUtils = CoreUtils.StrUtils;
const ApexParser = Apex.ApexParser;
const Window = vscode.window;
const SnippetString = vscode.SnippetString;
const Position = vscode.Position;

export function run(): void {
    try {
        let filePath;
        let editor = Window.activeTextEditor;
        if (editor) {
            filePath = editor.document.uri.fsPath;
        }
        if (editor && filePath && FileChecker.isApexClass(filePath)) {
            const node = new ApexParser().setContent(FileReader.readDocument(editor.document)).setSystemData(applicationContext.parserData).resolveReferences();
            implementClasses(editor, node);
        } else {
            NotificationManager.showError("The selected file isn't an Apex Class");
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function implementClasses(editor: vscode.TextEditor, apexClass: any): void {
    const methodsToCreate = [];
    const constructorsToCreate = [];
    if (!Utils.isNull(apexClass.extends)) {
        if (Utils.hasKeys(apexClass.extends.methods)) {
            for (const method of apexClass.extends.getOrderedChilds(ApexNodeTypes.METHOD)) {
                if (!Utils.isNull(method.definitionModifier) && (method.definitionModifier.textToLower === 'abstract' || method.definitionModifier.textToLower === 'virtual')) {
                    if (!ApexParser.isMethodExists(apexClass, method)) {
                        methodsToCreate.push(method);
                    }
                }
            }
        }
        if (Utils.hasKeys(apexClass.extends.constructors)) {
            for (const constructor of apexClass.extends.getOrderedChilds(ApexNodeTypes.CONSTRUCTOR)) {
                const tmp = new ApexConstructor(constructor);
                tmp.name = apexClass.name;
                tmp.simplifiedSignature = StrUtils.replace(tmp.simplifiedSignature || '', constructor.name, apexClass.name).toLowerCase();
                tmp.signature = StrUtils.replace(tmp.signature || '', constructor.name, apexClass.name).toLowerCase();
                if (!ApexParser.isConstructorExists(apexClass, tmp)) {
                    constructorsToCreate.push(tmp);
                }
            }
        }
    }
    let lastMethodToken;
    const lastClassToken = apexClass.endToken;
    const startClassToken = apexClass.startToken;
    const lastMethod = apexClass.getLastChild(ApexNodeTypes.METHOD);
    const lastConstructor = apexClass.getLastChild(ApexNodeTypes.CONSTRUCTOR);
    if (lastMethod && lastConstructor) {
        if (lastMethod.endToken.range.start.isBefore(lastConstructor.endToken.range.start.isBefore())) {
            lastMethodToken = lastConstructor.endToken;
        } else {
            lastMethodToken = lastMethod.endToken;
        }
    } else if (lastMethod) {
        lastMethodToken = lastMethod.endToken;
    } else if (lastConstructor) {
        lastMethodToken = lastConstructor.endToken;
    }
    if (methodsToCreate.length > 0 || constructorsToCreate.length > 0) {
        let content = '';
        if (lastMethodToken) {
            content = '\n\n';
        }
        for (const constructor of constructorsToCreate) {
            content += ((!lastMethodToken) ? '\t' : '') + constructor.signature + ' {\n\t\n' + ((!lastMethodToken) ? '\t' : '') + '}\n\n';
        }
        for (const method of methodsToCreate) {
            if (method.datatype && method.datatype.name.toLowerCase() !== 'void') {
                content += ((!lastMethodToken) ? '\t' : '') + ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t' + ((!lastMethodToken) ? '\t' : '') + method.datatype.name + ' returnedValue = null;\n\t\n\t' + ((!lastMethodToken) ? '\t' : '') + 'return returnedValue;\n' + ((!lastMethodToken) ? '\t' : '') + '}\n\n';
            } else {
                content += ((!lastMethodToken) ? '\t' : '') + ((method.overrideSignature) ? method.overrideSignature : method.signature) + ' {\n\t\n' + ((!lastMethodToken) ? '\t' : '') + '}\n\n';
            }
        }
        if (lastMethodToken) {
            editor.insertSnippet(new SnippetString(content), new Position(lastMethodToken.range.end.line, lastMethodToken.range.end.character));
        } else if (lastClassToken) {
            content = '\n\n' + content + '\n';
            editor.insertSnippet(new SnippetString(content), new Position(startClassToken.range.start.line, startClassToken.range.end.character));
        }
    } else {
        NotificationManager.showInfo("This Class has no methods or constructors to implement");
    }
}