import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { NotificationManager } from '../output';
import { PermissionEditor } from '../inputs/permissionEditor';
import { MetadataObject, MetadataType } from '@aurahelper/core';
import { Connection } from '@aurahelper/connector';

export function run(fileUri: vscode.Uri): void {
    try {
        let filePath: string | undefined;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor){
                filePath = editor.document.uri.fsPath;
            }
        }
        const alias = Config.getOrgAlias();
        if (!alias) {
            NotificationManager.showError('Not connected to an Org. Please authorize and connect to and org and try later.');
            return;
        }
        if(filePath){
            openStandardGUI(filePath);
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function openStandardGUI(filePath: string): void {
    let input = new PermissionEditor(filePath);
    input.onValidationError(function (errorMessage) {
        NotificationManager.showError("Validation Errors: \n" + errorMessage);
    });
    input.onReport(function (report) {
        NotificationManager.showInfo(report);
    });
    input.onError(function (message) {
        NotificationManager.showError("Error: " + message);
    });
    input.onAccept(async function (options, data) {
        if (options.hasChanges) {
            NotificationManager.showInfo('The ' + data.type + ' ' + data.file + ' saved succesfully');
            if (options.deploy) {
                await deploy(data.file);
            }
        }
    });
    input.show();
}

function deploy(data: any): Promise<void> {
    return new Promise<void>((resolve) => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Deploying ' + data.type + ' ' + data.file,
            cancellable: false
        }, () => {
            return new Promise<void>(progressResolve => {
                const typesToDeploy: any = {};
                typesToDeploy[data.type] = new MetadataType(data.type, true);
                typesToDeploy[data.type].addChild(new MetadataObject(data.file, true));
                const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
                connection.deploy(typesToDeploy).then((status: any) => {
                    if (status.done) {
                        NotificationManager.showInfo('Permissions deployed succesfully to org');
                    } else {
                        NotificationManager.showError('Deployment finished with status ' + status.status);
                    }
                    progressResolve();
                    resolve();
                }).catch((error: Error) => {
                    NotificationManager.showError(error.message);
                    progressResolve();
                    resolve();
                });
            });
        });
    });
}