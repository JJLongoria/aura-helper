const logger = require('../main/logger');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const metadata = require('../metadata');
const window = vscode.window;
const Range = vscode.Range;
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const MetadataCompressor = metadata.MetadataCompressor;

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        if (filePath && filePath.endsWith('.xml') && filePath.indexOf('force-app') != -1)
            compressFile(filePath);
        else
            window.showErrorMessage("The selected file isn't a XML Salesforce project file");
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function compressFile(filePath) {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath, editor);
    } else {
        window.showTextDocument(Paths.asUri(filePath)).then((editor) => compress(filePath, editor));
    }
}

function compress(filePath, editor) {
    let content = MetadataCompressor.compress(filePath);
    if (content) {
        let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
        FileWriter.replaceEditorContent(editor, replaceRange, content);
        editor.revealRange(editor.document.lineAt(0).range);
    } else {
        window.showInformationMessage("The selected file not support XML compression");
    }
}