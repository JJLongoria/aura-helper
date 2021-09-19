const vscode = require('vscode');
const { FileChecker, FileReader } = require('@aurahelper/core').FileSystem;
const { ApexParser } = require('@aurahelper/languages').Apex;
const { StrUtils } = require('@aurahelper/core').CoreUtils;
const { ApexNodeTypes } = require('@aurahelper/core').Values;
const applicationContext = require('../core/applicationContext');
const Config = require('../core/config');

class ApexHoverProvider {

    provideHover(document, position) {
        return new Promise((resolve, reject) => {
            try {
                let hover;
                if (Config.getConfig().documentation.enableHoverInformation) {
                    if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
                        hover = provideHoverInformation(document, position);
                    }
                }
                resolve(hover);
            } catch (error) {
                reject(error);
            }
        });
    }

    static register() {
        applicationContext.context.subscriptions.push(vscode.languages.registerHoverProvider({ scheme: "file", language: "apex" }, new ApexHoverProvider()));
    }

}
module.exports = ApexHoverProvider;

function provideHoverInformation(document, position) {
    let content = '';
    const editor = vscode.window.activeTextEditor;
    let lineNum = (position !== undefined) ? position.line : editor.selection.active.line;
    let newPosition = position;
    let processNode = true;
    if (lineNum > 0) {
        let endLoop = false;
        let onComment = false;
        let initLine = lineNum;
        lineNum--;
        while (!endLoop) {
            const line = editor.document.lineAt(lineNum).text.trim();
            if (line.startsWith('@')) {
                lineNum--;
                continue;
            }
            if (line.startsWith('//'))
                endLoop = true;
            if (line.endsWith('*/') || StrUtils.contains(line, '*/')) {
                onComment = true;
            }
            if (line.startsWith('/*') || StrUtils.contains(line, '/*')) {
                processNode = onComment;
                onComment = false;
                endLoop = true;
            }
            if (StrUtils.contains(line, '{') && lineNum - 1 !== position.line ) {
                processNode = false;
                endLoop = true;
            }
            if (onComment && StrUtils.contains(line, '}')) {
                endLoop = true;
                processNode = false;
            }
            if (!endLoop) {
                lineNum--;
            }
            if (lineNum === 0) {
                endLoop = true;
            }
        }
        if (initLine !== lineNum)
            newPosition = new vscode.Position(lineNum, 0);
    }
    if (processNode) {
        const node = new ApexParser().setContent(FileReader.readDocument(editor.document)).setSystemData(applicationContext.parserData).setCursorPosition(newPosition).isDeclarationOnly(true).parse();
        if (node.comment) {
            node.comment.processComment(applicationContext.parserData.template);
        }
    }
    return new vscode.Hover(new vscode.MarkdownString(content));
}