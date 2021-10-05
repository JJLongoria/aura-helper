const vscode = require('vscode');
const Connection = require('@aurahelper/connector');
const NotificationManager = require('../output/notificationManager');
const { FileChecker, FileWriter } = require('@aurahelper/core').FileSystem;
const { MetadataTypes } = require('@aurahelper/core').Values;
const Config = require('../core/config');
const Paths = require('../core/paths');
const applicationContext = require('../core/applicationContext');

exports.run = function () {
	try {
		const alias = Config.getOrgAlias();
		if (!alias) {
			NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
			return;
		}
		refreshIndex();
	} catch (error) {
		NotificationManager.showCommandError(error);
	}
}

async function refreshIndex() {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Loading available SObjects for Refresh",
		cancellable: true
	}, (progress, cancelToken) => {
		return new Promise(async resolve => {
			const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
			connection.setMultiThread();
			connection.listSObjects().then((objects) => {
				resolve();
				processCustomObjectsOut(objects);
			}).catch((error) => {
				NotificationManager.showError(error);
				resolve();
			});
		});
	});
}

function processCustomObjectsOut(objects) {
	vscode.window.showQuickPick(objects).then((selected) => {
		if (objects.includes(selected)) {
			refreshObjectMetadataIndex(selected);
		}
	});
}

function refreshObjectMetadataIndex(object) {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Refresh " + object + " SObject Definition",
		cancellable: false
	}, (progress, cancelToken) => {
		return new Promise(async resolve => {
			const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
			connection.setMultiThread();
			connection.onAfterDownloadSObject((status) => {
				if (status.data) {
					if (!FileChecker.isExists(Paths.getMetadataIndexFolder()))
						FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
					FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + status.data.name + '.json', JSON.stringify(status.data, null, 2));
				}
			});
			connection.describeSObjects([object]).then(function (sObjects) {
				for (const objKey of Object.keys(sObjects)) {
					applicationContext.parserData.sObjectsData[objKey.toLowerCase()] = sObjects[objKey.toLowerCase()];
				}
				applicationContext.parserData.sObjects = Object.keys(applicationContext.parserData.sObjectsData);
				NotificationManager.showInfo(object + " SObject Definition update succesfully");
				resolve();
			});
		});
	});
}