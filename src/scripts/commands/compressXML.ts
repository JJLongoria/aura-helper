import * as vscode from 'vscode';
import { OutputChannel, NotificationManager } from '../output';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { CLIManager } from '@aurahelper/cli-manager';
import { XMLCompressor } from '@aurahelper/xml-compressor';

export function run(fileUri: vscode.Uri): void {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor){
                filePath = editor.document.uri.fsPath;
            }
        }
        if (filePath) {
            compressFile(filePath);
        } else {
            NotificationManager.showError('Any file selected or opened on editor for compress');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function compressFile(filePath: string): void {
    let editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath);
    } else {
        vscode.window.showTextDocument(Paths.toURI(filePath)).then(() => compress(filePath));
    }
}

function compress(filePath: string): void {
    const sortOrder = Config.getXMLSortOrder();
    if (Config.useAuraHelperCLI()) {
        const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
        cliManager.compress(filePath, sortOrder).then(() => {
            OutputChannel.outputLine('XML file compressed successfully');
        }).catch((error: any) => {
            throw error;
        });
    } else {
        const compressor = new XMLCompressor(filePath, sortOrder);
        compressor.compress().then(() => {
            OutputChannel.outputLine('XML file compressed successfully');
        }).catch((error: Error) => {
            throw error;
        });
    }
}