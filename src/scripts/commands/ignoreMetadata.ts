import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { InputFactory } from '../inputs/factory';
import { FileChecker, FileReader } from '@aurahelper/core';
import { CLIManager } from '@aurahelper/cli-manager';
import { SFConnector } from '@aurahelper/connector';
import { Ignore } from '@aurahelper/ignore';

export async function run() {
    const alias = Config.getOrgAlias();
    if (!alias) {
        NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
        return;
    }
    let ignoreOption = await InputFactory.createIgnoreOptionsSelector();
    if (!ignoreOption) {
        return;
    }
    let ignoreFilePath: string;
    if (ignoreOption === 'Use Custom Ignore File') {
        const ignoreFilePathUri = await InputFactory.createFileDialog('Select ahignore', false, { 'JSON files': ['json'] });
        if (ignoreFilePathUri && ignoreFilePathUri[0]){
            ignoreFilePath = ignoreFilePathUri[0].fsPath;
        }else {
            return;
        }
    }
    else{
        ignoreFilePath = Paths.getAHIgnoreFile();
    }
    if (!FileChecker.isExists(ignoreFilePath)) {
        NotificationManager.showError('Ignore File does not exists (' + ignoreFilePath + ')');
        return;
    }
    try {
        let metadataToIgnore = JSON.parse(FileReader.readFileSync(ignoreFilePath));
        let selection = await InputFactory.createIgnoreTypesSelector(Object.keys(metadataToIgnore));
        let items: string[];
        if (selection.indexOf(',') !== -1) {
            items = selection.split(',');
        } else {
            items = [selection];
        }
        let compress = await InputFactory.createCompressSelector();
        if (!compress){
            return;
        }
        const sortOrder = Config.getXMLSortOrder();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Ignoring metadata from your local project',
            cancellable: true
        }, (progress, cancelToken) => {
            return new Promise<void>(async (resolve) => {
                if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        NotificationManager.showInfo('Operation Cancelled');
                        cliManager.abortProcess();
                    });
                    cliManager.setIgnoreFile(ignoreFilePath);
                    cliManager.setCompressFiles(compress === 'Yes');
                    cliManager.setSortOrder(sortOrder);
                    cliManager.onProgress((status: any) => {
                        progress.report({
                            message: status.message
                        });
                    });
                    cliManager.ignoreMetadata(items).then(() => {
                        NotificationManager.showInfo('Ignore Metadata finished succesfully');
                        resolve();
                    }).catch((error: Error) => {
                        NotificationManager.showError(error.message);
                        resolve();
                    });
                } else {
                    const connection = new SFConnector(alias, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        NotificationManager.showInfo('Operation Cancelled');
                        connection.abortConnection();
                    });
                    progress.report({
                        message: 'Getting All Available Metadata Types'
                    });
                    connection.listMetadataTypes().then((metadataDetails: any[]) => {
                        const ignore = new Ignore(ignoreFilePath);
                        ignore.setCompress(compress === 'Yes').setSortOrder(sortOrder).setTypesToIgnore(items);
                        ignore.onStartProcessType((metadataTypeName: string) => {
                            progress.report({
                                message: 'Processing ' + metadataTypeName + ' Metadata Type'
                            });
                        });
                        ignore.ignoreProjectMetadata(Paths.getProjectFolder(), metadataDetails);
                        resolve();
                        NotificationManager.showInfo('Ignore Metadata finished succesfully');
                    }).catch((error: Error) => {
                        NotificationManager.showError(error.message);
                        resolve();
                    });
                }
            });
        });
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}