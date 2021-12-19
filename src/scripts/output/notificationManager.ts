import * as vscode from 'vscode';
import { CoreUtils } from '@aurahelper/core';
const Utils = CoreUtils.Utils;
var statusBar: vscode.StatusBarItem;

export class NotificationManager {

    static showStatusBar(content: string): void {
        if (!statusBar) {
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        }
        statusBar.text = content;
        statusBar.show();
    }

    static hideStatusBar(): void {
        statusBar.text = '';
        statusBar.hide();
    }

    static showError(message: any): void {
        vscode.window.showErrorMessage(message);
    }

    static showCommandError(message: any): void {
        NotificationManager.showError('An error ocurred while processing command. Error: \n' + message);
    }

    static showConfirmDialog(message: string, onAccept: () => void, onCancel?: () => void): void {
        vscode.window.showInformationMessage(message, 'Cancel', 'Ok').then((selected) => {
            if (selected === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

    static showInfo(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    static showWarning(message: string, onAccept?: () => void, onCancel?: () => void): void {
        let options: vscode.MessageItem[] = [];
        if (!Utils.isNull(onCancel)) {
            options.push({
                title: 'Cancel',
                isCloseAffordance: true,
            });
        }
        if (!Utils.isNull(onAccept)) {
            options.push({
                title: 'Ok',
                isCloseAffordance: true,
            });
        }
        vscode.window.showWarningMessage<vscode.MessageItem>(message, ...options).then((selected) => {
            if (selected?.title === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

}