import * as vscode from 'vscode';
var statusBar: vscode.StatusBarItem;
const { Utils } = require('@aurahelper/core').CoreUtils;


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

    static showError(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    static showCommandError(message: string): void {
        NotificationManager.showError('An error ocurred while processing command. Error: \n' + message)
    }

    static showConfirmDialog(message: string, onAccept: () => void , onCancel: () => void): void {
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

    static showWarning(message: string, onAccept: () => void , onCancel?: () => void): void {
        let options: string[] = [];
        if(!Utils.isNull(onCancel)){
            options.push('Cancel');
        }
        if(!Utils.isNull(onAccept)){
            options.push('Ok');
        }
        vscode.window.showWarningMessage(message, options).then((selected) => {
            if (selected === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

}