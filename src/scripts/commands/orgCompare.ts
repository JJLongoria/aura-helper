import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { NotificationManager } from '../output';
import { MetadataSelector } from '../inputs/metadataSelector';
import { InputFactory } from '../inputs/factory';
import { CoreUtils, FileChecker, FileWriter } from '@aurahelper/core';
import { CLIManager } from '@aurahelper/cli-manager';
import { SFConnector } from '@aurahelper/connector';
import { MetadataFactory } from '@aurahelper/metadata-factory';
import { PackageGenerator } from '@aurahelper/package-generator';
import { applicationContext } from '../core/applicationContext';
const MetadataUtils = CoreUtils.MetadataUtils;

export async function run() {
    const alias = Config.getOrgAlias();
    if (!alias) {
        NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
        return;
    }
    let loadMessage = 'Comparing Org Metadata with your local metadata -- (Only affects metadata types that you have in your local project)';
    let compareOptions = await InputFactory.createCompareOptionSelector();
    let sourceOrg: string;
    let targetOrg: string;
    if (!compareOptions){
        return;
    }
    if (compareOptions === 'Compare Different Orgs') {
        let authOrgs: any = await getAuthOrgs();
        sourceOrg = await InputFactory.createAuthOrgsSelector(authOrgs, true);
        if (!sourceOrg){
            return;
        }
        if (sourceOrg.indexOf(')') !== -1){
            sourceOrg = sourceOrg.split(')')[1].trim();
        }
        let targetOrgs = [];
        for (let org of authOrgs) {
            if (org.alias !== sourceOrg){
                targetOrgs.push(org);
            }
        }
        targetOrg = await InputFactory.createAuthOrgsSelector(targetOrgs, false);
        if (!targetOrg){
            return;
        }
        if (targetOrg.indexOf(')') !== -1){
            targetOrg = targetOrg.split(')')[1].trim();
        }
        loadMessage = 'Comparing between Orgs. Source: ' + sourceOrg + ' --  Target: ' + targetOrg;
    }
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: loadMessage,
        cancellable: true
    }, (progress) => {
        return new Promise<void>(async function (resolve) {
            try {
                try {
                    if (Config.useAuraHelperCLI()) {
                        const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                        if(applicationContext.ahSFDXPluginInstalled){
                            cliManager.useAuraHelperSFDX(applicationContext.ahSFDXPluginInstalled);
                        } else if(applicationContext.ahSFPluginInstalled){
                            cliManager.useAuraHelperSF(applicationContext.ahSFPluginInstalled);
                        }
                        let result;
                        cliManager.onProgress((status: any) => {
                            if (status.result.increment !== undefined && status.result.increment > -1) {
                                progress.report({
                                    message: status.message,
                                    increment: status.result.increment
                                });
                            } else {
                                progress.report({
                                    message: status.message,
                                });
                            }
                        });
                        if (compareOptions === 'Compare Different Orgs') {
                            result = await cliManager.compareOrgBetween(sourceOrg, targetOrg);
                        } else {
                            result = await cliManager.compareWithOrg();
                        }
                        if (result) {
                            openStandardGUI(result, compareOptions, targetOrg);
                        } else {
                            vscode.window.showWarningMessage('Operation cancelled by user');
                        }
                        resolve();
                    } else {
                        let metadataSource;
                        let metadataTarget;
                        if (compareOptions === 'Compare Different Orgs') {
                            const connectionSource = new SFConnector(sourceOrg, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            const connectionTarget = new SFConnector(targetOrg, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            connectionSource.setMultiThread();
                            connectionTarget.setMultiThread();
                            const sourceMetadataDetails = await connectionSource.listMetadataTypes();
                            connectionSource.onAfterDownloadType((status: any) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Source',
                                    increment: status.increment
                                });
                            });
                            connectionTarget.onAfterDownloadType((status: any) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Target',
                                    increment: status.increment
                                });
                            });
                            progress.report({
                                message: 'Describe Metadata Types from Source',
                                increment: undefined,
                            });
                            metadataSource = await connectionSource.describeMetadataTypes(sourceMetadataDetails, false, Config.getConfig().metadata.groupGlobalQuickActions);
                            const targetMetadataDetails = await connectionTarget.listMetadataTypes();
                            progress.report({
                                message: 'Describe Metadata Types from Source',
                                increment: undefined,
                            });
                            metadataTarget = await connectionTarget.describeMetadataTypes(targetMetadataDetails, false, Config.getConfig().metadata.groupGlobalQuickActions);
                        } else {
                            targetOrg = Config.getOrgAlias();
                            const connectionTarget = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            connectionTarget.setMultiThread();
                            progress.report({
                                message: 'Describe Metadata Types from Local',
                                increment: undefined,
                            });
                            const metadataDetails = await connectionTarget.listMetadataTypes();
                            const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                            metadataSource = MetadataFactory.createMetadataTypesFromFileSystem(folderMetadataMap, Paths.getProjectFolder(), Config.getConfig().metadata.groupGlobalQuickActions);
                            progress.report({
                                message: 'Describe Metadata Types from Org',
                                increment: undefined,
                            });
                            connectionTarget.onAfterDownloadType((status: any) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Org',
                                    increment: status.increment
                                });
                            });
                            metadataTarget = await connectionTarget.describeMetadataTypes(metadataDetails, false, Config.getConfig().metadata.groupGlobalQuickActions);
                        }
                        progress.report({
                            message: 'Comparing Metadata Types',
                            increment: undefined
                        });
                        const compareResult = MetadataUtils.compareMetadata(metadataSource, metadataTarget);
                        if (compareResult) {
                            openStandardGUI(compareResult, compareOptions, targetOrg);
                        } else {
                            vscode.window.showWarningMessage('Operation cancelled by user');
                        }
                        resolve();
                    }
                } catch (error) {
                    NotificationManager.showCommandError(error);
                    resolve();
                }
            } catch (error) {
                NotificationManager.showCommandError(error);
                resolve();
            }
        });
    });
}

function getAuthOrgs(): Promise<any>{
    return new Promise<any>((resolve) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Loading Auth Orgs",
            cancellable: false
        }, () => {
            return new Promise<void>(async (loadResolve) => {
                const connection = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.listAuthOrgs().then((authOrgs: any[]) => {
                    loadResolve();
                    resolve(authOrgs);
                }).catch(() => {
                    loadResolve();
                    resolve(undefined);
                });
            });
        });
    });
}

function openStandardGUI(metadata: any, compareOptions: string, target: string) {
    let title = 'Select Metadata Types to Delete';
    if (compareOptions === 'Compare Local and Org') {
        title += ' or Retrieve';
    }
    title += ' from ' + target + ' Org';
    let input = new MetadataSelector(title);
    if (compareOptions === 'Compare Local and Org') {
        input.addFinishOption('Retrieve', 'Retrieve selected Metadata Types to Local Project', MetadataSelector.getRetrieveAction());
        // input.addFinishOption('Compress', 'Compress all XML Retrieved files', MetadataSelector.getCompressAction());
    }
    input.setMetadata(metadata);
    input.allowDelete(true);
    input.onAccept((options, data) => {
        if (compareOptions === 'Compare Local and Org') {
            if (options[MetadataSelector.getRetrieveAction()]) {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    cancellable: false,
                    title: "Retrieving Selected data from " + target
                }, () => {
                    return new Promise<void>(async (resolve) => {
                        try {
                            let folder = Paths.getManifestPath();
                            if (!FileChecker.isExists(folder)){
                                FileWriter.createFolderSync(folder);
                            }
                            const packageGenerator = new PackageGenerator(Config.getAPIVersion());
                            packageGenerator.setExplicit(true);
                            packageGenerator.createPackage(data, folder);
                            const connection = new SFConnector(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            const retrieveOut = await connection.retrieve(false);
                            NotificationManager.showInfo('Metadata Retrieved Succesfully');
                        } catch (error) {
                            console.log(error);
                            NotificationManager.showError(error);
                        }
                        resolve();
                    });
                });

            }
        }
    });
    input.onDelete(async (metadata) => {
        deleteMetadata(metadata, (message: string, isError: boolean) => {
            if (isError) {
                NotificationManager.showError(message);
            } else {
                metadata = MetadataUtils.deleteCheckedMetadata(metadata);
                NotificationManager.showInfo(message);
                input.setMetadata(metadata);
                input.reset();
            }
        });
    });
    input.show();
}

function deleteMetadata(metadataToDelete: any, callback: any): void {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Deleting Selected Metadata from Org",
        cancellable: true
    }, (): Promise<void> => {
        return new Promise<void>(async resolve => {
            try {
                const apiVersion = Config.getAPIVersion();
                const usuername = Config.getOrgAlias();
                const namespace = Config.getNamespace();
                const folder = Paths.getPackageFolder();
                if (!FileChecker.isExists(folder)){
                    FileWriter.createFolderSync(folder);
                }
                const packageGenerator = new PackageGenerator(apiVersion);
                packageGenerator.setExplicit();
                packageGenerator.createPackage({}, folder);
                packageGenerator.createAfterDeployDestructive(metadataToDelete, folder);
                const connection = new SFConnector(usuername, apiVersion, Paths.getProjectFolder(), namespace);
                connection.setPackageFolder(folder);
                connection.deployPackage(undefined, undefined, true).then((status: any) => {
                    if (status.done) {
                        if (callback){
                            callback.call('Metadata Deleted Successfully', false);
                        }
                    } else {
                        if (callback){
                            callback.call('Deleting finished with status ' + status.status, false);
                        }
                    }
                    resolve();
                }).catch((error: Error) => {
                    if (callback){
                        callback.call(error.message, true);
                    }
                    resolve();
                });
                resolve();
            } catch (error) {
                if (callback){
                    callback.call(error, true);
                }
                resolve();
            }
        });
    });
}
