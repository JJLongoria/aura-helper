const vscode = require('vscode');
const Metadata = require('../metadata');
const NotificationManager = require('../output/notificationManager');


exports.run = function () {
    try {
        NotificationManager.showConfirmDialog('Refresh metadata index can will take several minutes. Do you want to continue?', function () {
            refreshIndex();
        });
    } catch (error) {
        NotificationManager.showCommandError(error)
    }
}

function refreshIndex() {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Refreshing SObjects Definitions",
        cancellable: true
    }, (objProgress, cancelToken) => {
        return new Promise(async resolve => {
            Metadata.Connection.refreshSObjectsIndex(objProgress, cancelToken).then(function () {
                NotificationManager.showInfo('Refreshing SObject Definitios finished Succesfully');
                resolve();
            }).catch(function (error) {
                NotificationManager.showError(error);
                resolve();
            });
        });
    });
}
