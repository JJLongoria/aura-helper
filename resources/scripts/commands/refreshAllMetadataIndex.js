const vscode = require('vscode');
const Metadata = require('../metadata');


exports.run = function () {
    try {
        vscode.window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
    } catch (error) {
        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function onButtonClick(selected) {
    if (selected === 'Ok') {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Refreshing SObjects Definitions",
            cancellable: true
        }, (objProgress, cancelToken) => {
            return new Promise(async resolve => {
                Metadata.Connection.refreshSObjectsIndex(objProgress, cancelToken).then(function () {
                    vscode.window.showInformationMessage('Refreshing SObject Definitios finished Succesfully');
                    resolve();
                }).catch(function (error) {
                    vscode.window.showErrorMessage(error);
                    resolve();
                });
            });
        });
    }
}
