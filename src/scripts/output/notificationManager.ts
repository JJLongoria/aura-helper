import * as vscode from 'vscode';
var statusBar: vscode.StatusBarItem;
const { Utils } = require('@aurahelper/core').CoreUtils;


class NotificationManager {

    static showStatusBar(content: string) {
        if (!statusBar) {
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        }
        statusBar.text = content;
        statusBar.show();
    }

    static hideStatusBar() {
        statusBar.text = '';
        statusBar.hide();
    }

    static showError(message: string) {
        vscode.window.showErrorMessage(message);
    }

    static showCommandError(message: string) {
        NotificationManager.showError('An error ocurred while processing command. Error: \n' + message)
    }

    static showConfirmDialog(message: string, onAccept: () => void , onCancel: () => void) {
        vscode.window.showInformationMessage(message, 'Cancel', 'Ok').then((selected) => {
            if (selected === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

    static showInfo(message: string) {
        vscode.window.showInformationMessage(message);
    }

    static showWarning(message: string, onAccept: () => void , onCancel?: () => void) {
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
module.exports = NotificationManager;