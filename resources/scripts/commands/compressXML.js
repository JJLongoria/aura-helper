const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Processes = require('../processes');
const NotificationManager = require('../output/notificationManager');
const Paths = fileSystem.Paths;
const ProcessManager = Processes.ProcessManager;

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
            compressFile(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for compress');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function compressFile(filePath) {
    let editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath);
    } else {
        vscode.window.showTextDocument(Paths.asUri(filePath)).then(() => compress(filePath));
    }
}

function compress(filePath) {
    ProcessManager.auraHelperCompressFile(filePath, true).then(function (out) {
        if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0)
                NotificationManager.showInfo(response.result.message);
            else
                NotificationManager.showError(response.error.message);
        } else {
            NotificationManager.showCommandError(out.stdErr);
        }
    }).catch(function (error) {
        NotificationManager.showCommandError(error);
    });
}