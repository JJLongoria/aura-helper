const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');


exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        if (filePath)
            addToPermissionSet(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for add to Permission Set');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addToPermissionSet(filePath) {

}