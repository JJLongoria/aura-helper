const vscode = require('vscode');
var statusBar;


class NotificationManager {

    static showStatusBar(content) {
        if (!statusBar)
            statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        statusBar.text = content;
        statusBar.show();
    }

    static hideStatusBar() {
        statusBar.text = '';
        statusBar.hide();
    }

    static showError(message) {
        vscode.window.showErrorMessage(message);
    }

    static showCommandError(message) {
        NotificationManager.showError('An error ocurred while processing command. Error: \n' + message)
    }

    static showConfirmDialog(message, onAccept, onCancel) {
        vscode.window.showInformationMessage(message, 'Cancel', 'Ok').then((selected) => {
            if (selected === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

    static showInfo(message) {
        vscode.window.showInformationMessage(message);
    }

    static showWarning(message, onAccept, onCancel) {
        vscode.window.showWarningMessage(message, (onCancel !==  undefined) ? 'Cancel' : undefined, (onAccept !==  undefined) ? 'Ok' : undefined).then((selected) => {
            if (selected === 'Ok' && onAccept) {
                onAccept.call(this);
            } else if (onCancel) {
                onCancel.call(this);
            }
        });
    }

}
module.exports = NotificationManager;