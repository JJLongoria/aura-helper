const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');


exports.run = function(fileUri) {
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
            addToProfile(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for add to Profiles');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addToProfile(filePath){
    
}