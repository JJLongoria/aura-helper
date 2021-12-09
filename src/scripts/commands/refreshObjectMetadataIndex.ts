import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { applicationContext } from '../core/applicationContext';
import { NotificationManager } from '../output';
import { Connection } from '@aurahelper/connector';
import { FileChecker, FileWriter } from '@aurahelper/core';

export function run(): void {
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
	}, () => {
		return new Promise<void>(async resolve => {
			const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
			connection.setMultiThread();
			connection.listSObjects().then((objects: any) => {
				resolve();
				processCustomObjectsOut(objects);
			}).catch((error: Error) => {
				NotificationManager.showError(error);
				resolve();
			});
		});
	});
}

function processCustomObjectsOut(objects: string[]): void {
	vscode.window.showQuickPick(objects).then((selected: string | undefined) => {
		if (selected && objects.includes(selected)) {
			refreshObjectMetadataIndex(selected);
		}
	});
}

function refreshObjectMetadataIndex(object: any) {
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Refresh " + object + " SObject Definition",
		cancellable: false
	}, () => {
		return new Promise<void>(async resolve => {
			const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
			connection.setMultiThread();
			connection.onAfterDownloadSObject((status: any) => {
				if (status.data) {
					if (!FileChecker.isExists(Paths.getMetadataIndexFolder())){
						FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
					}
					FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + status.data.name + '.json', JSON.stringify(status.data, null, 2));
				}
			});
			connection.describeSObjects([object]).then(function (sObjects: any) {
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