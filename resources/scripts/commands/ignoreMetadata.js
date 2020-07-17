const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');
const InputFactory = require('../inputs/factory');
const fileSystem = require('../fileSystem');
const metadata = require('../metadata');
const ProcessManager = require('../processes/processManager');
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const MetadataUtils = metadata.Utils;

exports.run = async function () {
    let ignoreOption = await InputFactory.createIgnoreOptionsSelector();
    if (!ignoreOption)
        return;
    let ignoreFilePath;
    if (ignoreOption === 'Use Custom Ignore File') {
        ignoreFilePath = await getCustomIgnoreFile();
    } else {
        ignoreFilePath = Paths.getWorkspaceFolder() + '/.ahignore.json';
    }
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
        let options = {
            compress: compress,
            types: items.join(','),
            ignoreFile: ignoreFilePath
        };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Ignoring metadata from your local project',
            cancellable: false
        }, () => {
            return new Promise(async (resolve) => {
                let out = await ProcessManager.auraHelperIgnore(options, true);
                if (out) {
                    if (out.stdOut) {
                        NotificationManager.showInfo('Metadata Ignored successfully');
                    } else {
                        NotificationManager.showError(out.stdErr);
                    }
                } else {
                    NotificationManager.showError('Unknown error');
                }
                resolve();
            });
        });
    } catch (error) {
        NotificationManager.showError('Ignore File does not exists (' + ignoreFilePath + ')');
    }
}

function getCustomIgnoreFile() {
    return new Promise((resolve) => {
        vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            canSelectFolders: false,
            openLabel: "Select ahignore",
            filters: { 'JSON files': ['json'] }
        }).then(function (uri) {
            if (uri && uri.length > 0) {
                resolve(uri[0].fsPath);
            } else {
                resolve(undefined);
            }
        });
    });
}