import * as vscode from 'vscode';
import { OutputChannel, NotificationManager } from '../output';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { CLIManager } from '@aurahelper/cli-manager';
import { applicationContext } from '../core/applicationContext';

export function run(uri: vscode.Uri): void {
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
            return new Promise<void>((resolve) => {
                const sortOrder = Config.getXMLSortOrder();
                //if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.useAuraHelperSFDX(applicationContext.ahPluginInstalled);
                    cliManager.onProgress((progressStatus: any) => {
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

function progressReport(progress: any, _message: string, percentage: number): void {
    progress.report({ increment: percentage });
    // OutputChannel.outputLine(message);
}