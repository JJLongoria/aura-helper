const Logger = require('../utils/logger');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const Processes = require('../processes');
const NotificationManager = require('../output/notificationManager');
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
                            NotificationManager.showInfo(response.result.message);
                        else
                            NotificationManager.showError(response.result.message);
                    } else {
                        NotificationManager.showCommandError(out.stdErr);
                    }
                    resolve();
                }).catch(function (error) {
                    NotificationManager.showCommandError(error);
                    resolve();
                });
            });
        });

    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}