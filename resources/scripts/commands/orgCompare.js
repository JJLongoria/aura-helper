const vscode = require('vscode');
const Config = require('../core/config');
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');
const MetadataFactory = require('@ah/metadata-factory');
const Connection = require('@ah/connector');
const CLIManager = require('@ah/cli-manager');
const PackageGenerator = require('@ah/package-generator');
const Paths = require('../core/paths');
const { FileChecker, FileWriter } = require('@ah/core').FileSystem;
const { MetadataUtils } = require('@ah/core').CoreUtils;

exports.run = async function () {
    let loadMessage = 'Comparing Org Metadata with your local metadata -- (Only affects metadata types that you have in your local project)';
    let compareOptions = await InputFactory.createCompareOptionSelector();
    let sourceOrg;
    let targetOrg;
    if (!compareOptions)
        return;
    if (compareOptions === 'Compare Different Orgs') {
        let authOrgs = await getAuthOrgs();
        sourceOrg = await InputFactory.createAuthOrgsSelector(authOrgs, true);
        if (!sourceOrg)
            return;
        if (sourceOrg.indexOf(')') !== -1)
            sourceOrg = sourceOrg.split(')')[1].trim();
        let targetOrgs = [];
        for (let org of authOrgs) {
            if (org.alias !== sourceOrg)
                targetOrgs.push(org);
        }
        targetOrg = await InputFactory.createAuthOrgsSelector(targetOrgs, false);
        if (!targetOrg)
            return;
        if (targetOrg.indexOf(')') !== -1)
            targetOrg = targetOrg.split(')')[1].trim();
        loadMessage = 'Comparing between Orgs. Source: ' + sourceOrg + ' --  Target: ' + targetOrg;
    }
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: loadMessage,
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async function (resolve) {
            try {
                try {
                    if (Config.useAuraHelperCLI()) {
                        const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                        let result;
                        cliManager.onProgress((status) => {
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
                            openStandardGUI(result);
                        } else {
                            vscode.window.showWarningMessage('Operation cancelled by user');
                        }
                        resolve();
                    } else {
                        let metadataSource;
                        let metadataTarget;
                        if (compareOptions === 'Compare Different Orgs') {
                            const connectionSource = new Connection(sourceOrg, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            const connectionTarget = new Connection(targetOrg, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            connectionSource.setMultiThread();
                            connectionTarget.setMultiThread();
                            const sourceMetadataDetails = await connectionSource.listMetadataTypes();
                            connectionSource.onAfterDownloadType((status) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Source',
                                    increment: status.increment
                                });
                            });
                            connectionTarget.onAfterDownloadType((status) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Target',
                                    increment: status.increment
                                });
                            });
                            progress.report({
                                message: 'Describe Metadata Types from Source',
                                increment: undefined,
                            });
                            metadataSource = await connectionSource.describeMetadataTypes(sourceMetadataDetails, false);
                            const targetMetadataDetails = await connectionTarget.listMetadataTypes();
                            progress.report({
                                message: 'Describe Metadata Types from Source',
                                increment: undefined,
                            });
                            metadataTarget = await connectionTarget.describeMetadataTypes(targetMetadataDetails, false);
                        } else {
                            const connectionTarget = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                            connectionTarget.setMultiThread();
                            progress.report({
                                message: 'Describe Metadata Types from Local',
                                increment: undefined,
                            });
                            const metadataDetails = await connectionTarget.listMetadataTypes();
                            const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                            metadataSource = MetadataFactory.createMetadataTypesFromFileSystem(folderMetadataMap, Paths.getProjectFolder());
                            progress.report({
                                message: 'Describe Metadata Types from Org',
                                increment: undefined,
                            });
                            connectionTarget.onAfterDownloadType((status) => {
                                progress.report({
                                    message: 'MetadataType: ' + status.entityType + ' from Org',
                                    increment: status.increment
                                });
                            });
                            metadataTarget = await connectionTarget.describeMetadataTypes(metadataDetails, false);
                        }
                        progress.report({
                            message: 'Comparing Metadata Types',
                            increment: undefined
                        });
                        const compareResult = MetadataUtils.compareMetadata(metadataSource, metadataTarget);
                        if (compareResult) {
                            openStandardGUI(compareResult);
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

function getAuthOrgs() {
    return new Promise((resolve) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Loading Auth Orgs",
            cancellable: false
        }, (progress, cancelToken) => {
            return new Promise(async (loadResolve) => {
                const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.listAuthOrgs().then((authOrgs) => {
                    loadResolve();
                    resolve(authOrgs);
                }).catch((error) => {
                    loadResolve();
                    resolve();
                });
            });
        });
    });
}

function openStandardGUI(metadata) {
    let input = new MetadataSelectorInput('Select Metadata Types for Delete from your Org');
    input.setMetadata(metadata);
    input.allowDelete(true);
    input.onDelete(async (metadata) => {
        deleteMetadata(metadata, function (message, isError) {
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

function deleteMetadata(metadataToDelete, callback) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Deleting Selected Metadata from Org",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async resolve => {
            try {
                const apiVersion = Config.getAPIVersion();
                const usuername = Config.getOrgAlias();
                const namespace = Config.getNamespace();
                const folder = Paths.getPackageFolder();
                if (!FileChecker.isExists(folder))
                    FileWriter.createFolderSync(folder);
                const packageGenerator = new PackageGenerator(apiVersion);
                packageGenerator.setExplicit();
                packageGenerator.createPackage({}, folder);
                packageGenerator.createAfterDeployDestructive(metadataToDelete, folder);
                const connection = new Connection(usuername, apiVersion, Paths.getProjectFolder(), namespace);
                connection.setPackageFolder(folder);
                connection.deployPackage(undefined, undefined, true).then((status) => {
                    if (status.done) {
                        if (callback)
                            callback.call(this, 'Metadata Deleted Successfully', false);
                    } else {
                        if (callback)
                            callback.call(this, 'Deleting finished with status ' + status.status, false);
                    }
                    resolve();
                }).catch((error) => {
                    if (callback)
                        callback.call(this, error.message, true);
                    resolve();
                });
                resolve();
            } catch (error) {
                if (callback)
                    callback.call(this, error.message, true);
                resolve();
            }
        });
    });
}
