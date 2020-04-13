const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Config = require('../main/config');
const Metadata = require('../metadata');
const MetadataFactory = Metadata.Factory;
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;

exports.run = function () {
	try {
		window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
	} catch (error) {
		window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
	}
}

async function onButtonClick(selected) {
	let user = await Config.getAuthUsername();
	if (selected === 'Ok') {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "Loading available Metadata for refresh",
			cancellable: true
		}, (progress, cancelToken) => {
			return new Promise(resolve => {
				let buffer = [];
				let bufferError = [];
				ProcessManager.describeMetadata(user, 'CustomObject', undefined, cancelToken, function (event, data) {
					switch (event) {
						case ProcessEvent.STD_OUT:
							buffer = buffer.concat(data);
							break;
						case ProcessEvent.END:
							processCustomObjectsOut(user, buffer.toString());
							resolve();
							break;
						default:
							break;
					}
				});
			});
		});
	}
}

function processCustomObjectsOut(user, stdOut) {
	if (stdOut) {
		let data = JSON.parse(stdOut);
		if (data.status === 0) {
			let objNames = [];
			let dataList = [];
			if (Array.isArray(data.result))
				dataList = data.result
			else
				dataList.push(data.result);
			for (const data of dataList) {
				objNames.push(data.fullName);
			}
			window.showQuickPick(objNames).then((selected) => {
				if (objNames.includes(selected)) {
					refreshObjectMetadataIndex(selected, user);
				}
			});
		}
	}
}

function refreshObjectMetadataIndex(object, user) {
	window.withProgress({
		location: ProgressLocation.Notification,
		title: "Refreshing Index for " + object,
		cancellable: false
	}, (objProgress, cancelToken) => {
		return new Promise(resolve => {
			let buffer = [];
			let bufferError = [];
			ProcessManager.describeSchemaMetadata(user, object, cancelToken, function (event, data) {
				switch (event) {
					case ProcessEvent.STD_OUT:
						buffer = buffer.concat(data);
						break;
					case ProcessEvent.ERR_OUT:
					case ProcessEvent.ERROR:
						bufferError = bufferError.concat(data);
						break;
					case ProcessEvent.END:
						if (buffer.length > 0) {
							let metadataIndex = MetadataFactory.createMetadataFromJSONSchema(buffer.toString());
							if (metadataIndex) {
								FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + object + ".json", JSON.stringify(metadataIndex, null, 2));
								window.showInformationMessage("Metadata Index for " + object + " refreshed Succesfully");
							}
							resolve();
						} else {
							window.showErrorMessage("Error refreshing index for object " + object + ". Error: " + bufferError.toString());
							resolve();
						}
						break;
					default:
						break;
				}
			});
		});
	});
}