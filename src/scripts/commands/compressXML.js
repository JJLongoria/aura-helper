const vscode = require('vscode');
const OutputChannel = require('../output/outputChannnel');
const Config = require('../core/config');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const CLIManager = require('@aurahelper/cli-manager');
const XMLCompressor = require('@aurahelper/xml-compressor');

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        if (filePath)
            compressFile(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for compress');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function compressFile(filePath) {
    let editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath);
    } else {
        vscode.window.showTextDocument(Paths.toURI(filePath)).then(() => compress(filePath));
    }
}

function compress(filePath) {
    const sortOrder = Config.getXMLSortOrder();
    if (Config.useAuraHelperCLI()) {
        const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
        cliManager.compress(filePath, sortOrder).then(() => {
            OutputChannel.outputLine('XML file compressed successfully');
        }).catch((error) => {
            throw error;
        });
    } else {
        const compressor = new XMLCompressor(filePath, sortOrder);
        compressor.compress().then(() => {
            OutputChannel.outputLine('XML file compressed successfully');
        }).catch((error) => {
            throw error;
        });
    }
}