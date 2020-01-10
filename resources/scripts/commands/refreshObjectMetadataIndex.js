const processes = require('../processes');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;
const Config = require('../main/config');

exports.run = function () {
	try {
		window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
	} catch (error) {
		window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
	}
}

function onButtonClick(selected) {
	let user = Config.getAuthUsername();
	if (selected === 'Ok') {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "Loading available Metadata for refresh",
			cancellable: false
		}, (progress, token) => {
			return new Promise(resolve => {
				setTimeout(() => {
					processes.listMetadata.run(user, function (result) {
						resolve();
						if (result.successData) {
							window.showQuickPick(result.successData.data.objects).then((selected) => {
								if (selected) {
									window.withProgress({
										location: ProgressLocation.Notification,
										title: "Refreshing Index for " + selected,
										cancellable: false
									}, (objProgress, objCancel) => {
										return new Promise(resolve => {
											setTimeout(() => {
												processes.refreshObjectMetadataIndex.run(user, selected, function (result) {
													resolve();
													if (result.successData) {
														window.showInformationMessage(result.successData.message + ". Total: " + result.successData.data.processed);
													} else {
														window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
													}
												});
											}, 100);
										});
									});
								}
							});
						}
						else {
							window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
						}
					});
				}, 100);
			});
		});
	}
}