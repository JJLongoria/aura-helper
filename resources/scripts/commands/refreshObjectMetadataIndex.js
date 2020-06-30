const ProcessManager = require('../processes').ProcessManager;
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Config = require('../core/config');
const AppContext = require('../core/applicationContext');
const NotificationManager = require('../output/notificationManager');
const Metadata = require('../metadata');
const MetadataFactory = Metadata.Factory;
const window = vscode.window;
const ProgressLocation = vscode.ProgressLocation;
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;

exports.run = function () {
	try {
		NotificationManager.showConfirmDialog('Refresh metadata index can will take several minutes. Do you want to continue?', function(){
			refreshIndex();
		});
	} catch (error) {
		NotificationManager.showCommandError(error);
	}
}

async function refreshIndex() {
	window.withProgress({
		location: ProgressLocation.Notification,
		title: "Loading available Sobjects for refresh",
		cancellable: true
	}, (progress, cancelToken) => {
		return new Promise(async resolve => {
			let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: ['CustomObject'] }, false, cancelToken);
			if (!out) {
				NotificationManager.showInfo('Operation Cancelled by User');
				resolve();
			} else if (out.stdOut) {
				let response = JSON.parse(out.stdOut);
				if (response.status === 0) {
					let user = await Config.getAuthUsername();
					processCustomObjectsOut(user, response.result.data);
					resolve();
				} else {
					NotificationManager.showCommandError(response.error.message);
					resolve();
				}
			} else {
				NotificationManager.showCommandError(out.stdErr);
				resolve();
			}
		});
	});
}

function processCustomObjectsOut(user, objects) {
	let objNames = Object.keys(objects['CustomObject'].childs);
	window.showQuickPick(objNames).then((selected) => {
		if (objNames.includes(selected)) {
			refreshObjectMetadataIndex(selected, user);
		}
	});
}

function refreshObjectMetadataIndex(object, user) {
	window.withProgress({
		location: ProgressLocation.Notification,
		title: "Refreshing Definition for " + object,
		cancellable: false
	}, (objProgress, cancelToken) => {
		return new Promise(async resolve => {
			let out = await ProcessManager.describeSchemaMetadata(user, object, cancelToken);
			if (out) {
				if (out.stdOut) {
					let metadataIndex = MetadataFactory.createMetadataFromJSONSchema(out.stdOut);
					if (metadataIndex) {
						FileWriter.createFileSync(Paths.getMetadataIndexPath() + "/" + object + ".json", JSON.stringify(metadataIndex, null, 2));
					}
					AppContext.sObjects = MetadataFactory.getSObjects(false);
					NotificationManager.showInfo("Metadata Index for " + object + " refreshed Succesfully");
				} else {
					NotificationManager.showError(out.stdErr);
				}
			} else {
				NotificationManager.showInfo('Operation Cancelled by User');
			}
			resolve();
		});
	});
}