const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Processes = require('../processes');
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
            vscode.window.showErrorMessage('Any file selected or opened on editor for compress');
    } catch (error) {
        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
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
                vscode.window.showInformationMessage(response.result.message);
            else
                vscode.window.showErrorMessage(response.error.message);
        } else {
            vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
        }
    }).catch(function (error) {
        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    });
}