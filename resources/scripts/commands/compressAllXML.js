const Logger = require('../utils/logger');
const OutputChannel = require('../output/outputChannnel');
const Config = require('../core/config');
const vscode = require('vscode');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const CLIManager = require('@ah/cli-manager');
const { MathUtils } = require('@ah/core').CoreUtils;
const XMLCompressor = require('@ah/xml-compressor');

exports.run = function (uri) {
    try {
        let folderPath = Paths.getProjectMetadataFolder();
        if (uri) {
            folderPath = uri.fsPath;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Compressing All XML Files",
            cancellable: false
        }, (progress) => {
            return new Promise((resolve) => {
                const sortOrder = Config.getXMLSortOrder();
                //if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.onProgress((progressStatus) => {
                        progressReport(progress, progressStatus.message, progressStatus.result.percentage);
                    });
                    cliManager.compress(folderPath, sortOrder).then(() => {
                        OutputChannel.outputLine('All XML files compressed successfully');
                        resolve();
                    }).catch(() => {
                        resolve();
                    });
                /*} else {
                    const compressor = new XMLCompressor(folderPath, sortOrder);
                    compressor.onCompressFailed((status) => {
                        const message = 'File ' + status.file + ' compressed succesfully';
                        progressReport(progress, message, (status.processedFiles / status.totalFiles) * 100);
                    });
                    compressor.onCompressSuccess((status) => {
                        const message = 'File ' + status.file + ' does not support XML compression';
                        progressReport(progress, message, (status.processedFiles / status.totalFiles) * 100);
                    });
                    compressor.compress().then(() => {
                        OutputChannel.outputLine('All XML files compressed successfully');
                        resolve();
                    }).catch(() => {
                        resolve();
                    });
                }*/
            });
        });
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function progressReport(progress, message, percentage) {
    progress.report({ increment: percentage });
    // OutputChannel.outputLine(message);
}