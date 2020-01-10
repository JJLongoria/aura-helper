const processes = require('../processes');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Config = require('../main/config');
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;

exports.run = function () {
    try {
        window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

let startDate;
function onButtonClick(selected) {
    let user = Config.getAuthUsername();
    if (selected === 'Ok') {
        console.time('refreshMetadataIndex');
        startDate = new Date();
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Refreshing Metadata Index",
            cancellable: false
        }, (objProgress, objCancel) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    processes.refreshAllMetadataIndex.run(user, function (objName, processed, total) {
                        objProgress.report({ message: "\nRefreshing index for " + objName + " (" + processed + "/" + total + ")" });
                    }, function (result) {
                        onFinishRefresh(result);
                        resolve();
                    });
                }, 100);
            });
        });
    }
}

function onFinishRefresh(result) {
    if (result.successData) {
        let endDate = new Date();
        console.timeEnd('refreshMetadataIndex');
        window.showInformationMessage(result.successData.message);
    } else {
        window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
    }
}