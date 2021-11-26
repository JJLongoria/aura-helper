const vscode = require('vscode');
const Config = require('../core/config');
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const PackageGenerator = require('@aurahelper/package-generator');
const CLIManager = require('@aurahelper/cli-manager');
const GitManager = require('@aurahelper/git-manager');
const Connection = require('@aurahelper/connector');
const MetadataFactory = require('@aurahelper/metadata-factory');
const Ignore = require('@aurahelper/ignore');
const { FileChecker, FileWriter } = require('@aurahelper/core/src/fileSystem');

exports.run = function () {
    try {
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        openStandardGUI();
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

async function openStandardGUI() {
    let input = new MetadataSelectorInput('Package Generator');
    input.addInitOption('Download From Org', 'Select to Describe Metadata from auth Org. In otherwise Describe Metadata from Local', MetadataSelectorInput.getDownloadAction());
    input.addInitOption('All Namespaces', 'Select to Download Metadata from All Namespaces. (Only Apply if download from Org. If not select, download only Org Namespaces Metadata)', MetadataSelectorInput.getDownloadAllAction());
    input.addInitOption('GIT', 'Select to Create Package and Destructive Files from GIT Changes. (Not Apply if Select Download from Org)', MetadataSelectorInput.getGitAction());
    input.addInitOption('Packages', 'Select to Create Package with metadata from other Packages. (Not Apply if Select Download from Org or GIT)', MetadataSelectorInput.getPackagesAction());

    input.addFinishOption('Use Wildcards', 'Select to use wildcards when apply, in otherwise put the elements explicit on the file', MetadataSelectorInput.getWildcardsAction(), ['Download From Org', 'All Namespaces', 'Download From Local']);
    input.addFinishOption('Destructive Changes', 'Select to create a Destructive Changes file, in otherwise create a Package XML file', MetadataSelectorInput.getDestructiveAction(), ['Download From Org', 'All Namespaces', 'Download From Local']);
    input.addFinishOption('After Deploy', 'Select to create the Destrucive Changes file to delete data after deploy changes. In otherwise create delete file before deploy', MetadataSelectorInput.getDeployAfterAction(), ['Download From Org', 'All Namespaces', 'Download From Local', 'GIT']);
    input.addFinishOption('Ignore File', 'Select to use the project ignore file to avoid put the specified metadata types into the package', MetadataSelectorInput.getIgnoreAction(), ['GIT']);

    input.addFinishOption('Custom Folder', 'Select to choose the folder to save the file. In otherwise create the file on the project manifest folder', MetadataSelectorInput.getCustomFolderAction());
    input.onError((message) => {
        NotificationManager.showError(message);
    });
    input.onAccept(async (options, data) => {
        if (options) {
            let folder = Paths.getManifestPath();
            if (options[MetadataSelectorInput.getCustomFolderAction()]) {
                let uri = await InputFactory.createFolderDialog('Select folder to save the file', false);
                folder = (uri && uri.length > 0) ? uri[0].fsPath : undefined;
            }
            if(!FileChecker.isExists(folder))
                FileWriter.createFolderSync(folder);
            if (folder) {
                if (options[MetadataSelectorInput.getGitAction()]) {
                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Creating Package from Git',
                        cancellable: false,
                    }, (progress, cancelToken) => {
                        return new Promise(async (resolve) => {
                            const source = data.source === data.activeBranch ? data.target : data.source;
                            const target = data.source === data.activeBranch ? undefined : data.target;
                            const deployOrder = options[MetadataSelectorInput.getDeployAfterAction()] ? 'after' : 'before';
                            const useIgnore = options[MetadataSelectorInput.getIgnoreAction()];
                            if (Config.useAuraHelperCLI()) {
                                const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                                cliManager.setIgnoreFile(Paths.getAHIgnoreFile());
                                cliManager.onProgress((status) => {
                                    progress.report({
                                        message: status.message,
                                    });
                                });
                                cliManager.createPackageFromGit(source, target, 'both', deployOrder, useIgnore).then(() => {
                                    NotificationManager.showInfo('Files created successfully');
                                    resolve();
                                }).catch((error) => {
                                    NotificationManager.showError(error.message);
                                    resolve();
                                });
                            } else {
                                try {
                                    progress.report({
                                        message: 'Running Git Diff',
                                    });
                                    const gitDiffs = await new GitManager(Paths.getProjectFolder()).getDiffs(source, target);
                                    const username = Config.getOrgAlias();
                                    progress.report({
                                        message: 'Describe Local Metadata Types',
                                    });
                                    const connection = new Connection(username, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                                    const metadataDetails = await connection.listMetadataTypes();
                                    const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                                    progress.report({
                                        message: 'Analyzing Process Diffs for get Metadata changes',
                                    });
                                    const metadataFromGitDiffs = MetadataFactory.createMetadataTypesFromGitDiffs(Paths.getProjectFolder(), gitDiffs, folderMetadataMap);
                                    if (useIgnore) {
                                        progress.report({
                                            message: 'Ignoring Metadata',
                                        });
                                        const ignore = new Ignore(Paths.getAHIgnoreFile());
                                        metadataFromGitDiffs.toDeploy = ignore.ignoreMetadata(metadataFromGitDiffs.toDeploy);
                                        metadataFromGitDiffs.toDelete = ignore.ignoreMetadata(metadataFromGitDiffs.toDelete);
                                    }

                                    const packageGenerator = new PackageGenerator(Config.getAPIVersion()).setExplicit();
                                    packageGenerator.createPackage(metadataFromGitDiffs.toDeploy, folder);
                                    if (deployOrder === 'before') {
                                        packageGenerator.createBeforeDeployDestructive(metadataFromGitDiffs.toDelete, folder);
                                    } else {
                                        packageGenerator.createAfterDeployDestructive(metadataFromGitDiffs.toDelete, folder);
                                    }
                                    NotificationManager.showInfo('Files created successfully');
                                    resolve();
                                } catch (error) {
                                    NotificationManager.showError(error.message);
                                    resolve();
                                }
                            }
                        });
                    });
                } else if (options[MetadataSelectorInput.getPackagesAction()]) {
                    const packageGenerator = new PackageGenerator(Config.getAPIVersion());
                    if (data.mergeOption === 'Merge By Type') {
                        packageGenerator.setMergePackagesFiles()
                        packageGenerator.mergePackages(data.files, folder);
                    } else if (data.mergeOption === 'Merge Full Packages') {
                        packageGenerator.setMergePackagesFiles();
                        packageGenerator.mergePackagesFull(data.files, folder);
                    } else if (data.mergeOption === 'Merge Full Destructive Before') {
                        packageGenerator.setMergePackagesFiles();
                        packageGenerator.setIsDestructive();
                        packageGenerator.setBeforeDeploy();
                        packageGenerator.mergePackagesFull(data.files, folder);
                    } else if (data.mergeOption === 'Merge Full Destructive After') {
                        packageGenerator.setMergePackagesFiles();
                        packageGenerator.setIsDestructive();
                        packageGenerator.setBeforeDeploy(false);
                        packageGenerator.mergePackagesFull(data.files, folder);
                    }
                    NotificationManager.showInfo('Files merged successfully');
                } else {
                    const packageGenerator = new PackageGenerator(Config.getAPIVersion());
                    packageGenerator.setExplicit(!options[MetadataSelectorInput.getWildcardsAction()]);
                    let createdFile = '';
                    if (options[MetadataSelectorInput.getDestructiveAction()]) {
                        if (options[MetadataSelectorInput.getDeployAfterAction()]) {
                            createdFile = 'Destructive After Deploy';
                            packageGenerator.createAfterDeployDestructive(data, folder);
                        } else {
                            createdFile = 'Destructive Before Deploy';
                            packageGenerator.createBeforeDeployDestructive(data, folder);
                        }
                    } else {
                        createdFile = 'Package XML';
                        packageGenerator.createPackage(data, folder);
                    }
                    NotificationManager.showInfo(createdFile + ' file created successfully');
                }
            }
        }
    });
    input.show();

}