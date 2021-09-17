const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');
const InputFactory = require('../inputs/factory');
const { FileReader, FileChecker } = require('@ah/core').FileSystem;
const { MetadataUtils } = require('@ah/core').CoreUtils;
const Paths = require('../core/paths');
const Config = require('../core/config');
const CLIManager = require('@ah/cli-manager');
const Ignore = require('@ah/ignore');
const Connection = require('@ah/connector');

exports.run = async function () {
    let ignoreOption = await InputFactory.createIgnoreOptionsSelector();
    if (!ignoreOption)
        return;
    let ignoreFilePath;
    if (ignoreOption === 'Use Custom Ignore File') {
        ignoreFilePath = await InputFactory.createFileDialog('Select ahignore', false, { 'JSON files': ['json'] });
        if (ignoreFilePath && ignoreFilePath[0])
            ignoreFilePath = ignoreFilePath[0].fsPath;
        else {
            return;
        }
    }
    else
        ignoreFilePath = Paths.getAHIgnoreFile();
    if (!FileChecker.isExists(ignoreFilePath)) {
        NotificationManager.showError('Ignore File does not exists (' + ignoreFilePath + ')');
        return;
    }
    try {
        let metadataToIgnore = JSON.parse(FileReader.readFileSync(ignoreFilePath));
        let selection = await InputFactory.createIgnoreTypesSelector(Object.keys(metadataToIgnore));
        let items;
        if (selection.indexOf(',') !== -1) {
            items = selection.split(',');
        } else {
            items = [selection];
        }
        let compress = await InputFactory.createCompressSelector();
        if (!compress)
            return;
        const sortOrder = Config.getXMLSortOrder();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Ignoring metadata from your local project',
            cancellable: true
        }, (progress, cancelToken) => {
            return new Promise(async (resolve) => {
                if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        NotificationManager.showInfo('Operation Cancelled');
                        cliManager.abortProcess();
                    });
                    cliManager.setIgnoreFile(ignoreFilePath);
                    cliManager.setCompressFiles(compress === 'Yes');
                    cliManager.setSortOrder(sortOrder);
                    cliManager.onProgress((status) => {
                        progress.report({
                            message: status.message
                        });
                    });
                    cliManager.ignoreMetadata(items).then(() => {
                        NotificationManager.showInfo('Ignored Metadata finished succesfully');
                        resolve();
                    }).catch((error) => {
                        NotificationManager.showError(error.message);
                        resolve();
                    });
                } else {
                    const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                    cancelToken.onCancellationRequested(() => {
                        NotificationManager.showInfo('Operation Cancelled');
                        connection.abortConnection();
                    });
                    progress.report({
                        message: 'Getting All Available Metadata Types'
                    });
                    connection.listMetadataTypes().then((metadataDetails) => {
                        const ignore = new Ignore(ignoreFilePath);
                        ignore.setCompress(compress === 'Yes').setSortOrder(sortOrder).setTypesToIgnore(items);
                        ignore.onStartProcessType((metadataTypeName) => {
                            progress.report({
                                message: 'Processing ' + metadataTypeName + ' Metadata Type'
                            });
                        });
                        ignore.ignoreProjectMetadata(Paths.getProjectFolder(), metadataDetails);
                        resolve();
                    }).catch((error) => {
                        NotificationManager.showError(error.message);
                        resolve();
                    });
                }
            });
        });
    } catch (error) {
        NotificationManager.showError(error.message);
    }
}