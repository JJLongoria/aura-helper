const Logger = require('../utils/logger');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Processes = require('../processes');
const Paths = fileSystem.Paths;
const ProcessManager = Processes.ProcessManager;

exports.run = function (uri) {
    try {
        let folderPath = Paths.getMetadataRootFolder();
        if (uri) {
            folderPath = uri.fsPath;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Compressing All XML Files",
            cancellable: false
        }, () => {
            return new Promise(resolve => {
                ProcessManager.auraHelperCompressFolder(folderPath, true).then(function (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0)
                            vscode.window.showInformationMessage(response.result.message);
                        else
                            vscode.window.showErrorMessage(response.result.message);
                    } else {
                        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
                    }
                    resolve();
                }).catch(function (error) {
                    vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
                    resolve();
                });
            });
        });

    } catch (error) {
        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}