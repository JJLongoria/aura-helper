const logger = require('../main/logger');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const metadataUtils = require('../metadataUtils');
const AuraParser = languages.AuraParser;
const window = vscode.window;
const Range = vscode.Range;
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const profileUtils = metadataUtils.ProfileUtils;


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
        if (filePath && FileChecker.isProfile(filePath))
            compressProfile(filePath);
        else
            window.showErrorMessage("The selected file isn't a profile file");
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function compressProfile(filePath) {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath, editor);
    } else {
        window.showTextDocument(Paths.asUri(filePath)).then((editor) => compress(filePath, editor));
    }
}

function compress(filePath, editor) {
    let root = AuraParser.parseXML(FileReader.readFileSync(filePath));
    let content = '';
    if (root.Profile) {
        let profile = profileUtils.createProfile(root.Profile);
        content = profileUtils.toXML(profile, true);
    }
    let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
    FileWriter.replaceEditorContent(editor, replaceRange, content);
    editor.revealRange(editor.document.lineAt(0).range);
}
