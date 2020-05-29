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

}
module.exports = NotificationManager;