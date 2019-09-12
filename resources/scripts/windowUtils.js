const vscode = require('vscode');
let statusBarItem;

function createStatusBarItem() {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 130);
    statusBarItem.command = "aurahelper.statusbar.pressed";
    return statusBarItem;
}

function updateStatusBarItem(show, text, type) {
    if(type){
        if(type === 'load'){
            text = '$(sync) ' + text;
        }
    }
    statusBarItem.text = `${text}`;
    if (show)
        statusBarItem.show();
    else
        statusBarItem.hide();
    return statusBarItem;
}

function showInformationMessage(message, items, callback) {
    return vscode.window.showInformationMessage(message, items).then((selected) => {
        callback.call(this, selected);
    });
}

function showQuickPick(elements, placeholder, callback) {
    vscode.window.showQuickPick(elements, { placeHolder: placeholder }).then(selected => {
        callback.call(this, selected);
    });
}

function showInputBoxText(placeholder, callback) {
    vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: function (text) {
            var regex = /^[a-zA-Z]+$/;
            if (!regex.test(text))
                return text;
            return null;;
        }
    }).then(text => {
        callback.call(this, text);
    });
}

function showInputBoxNumber(placeholder, callback) {
    vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: function (text) {
            var regex = /^[0-9]+$/;
            if (!regex.test(text))
                return text;
            return null;;
        }
    }).then(text => {
        callback.call(this, text);
    });
}

function showInputBox(placeholder, callback) {
    vscode.window.showInputBox({
        placeHolder: placeholder
    }).then(text => {
        callback.call(this, text);
    });
}

function openDocumentOnEditor(strPath, callback) {
    vscode.window.showTextDocument(vscode.Uri.file(strPath)).then(editor => {
        if (callback)
            callback.call(this, editor);
    });
}

function showErrorMessage(message) {
    vscode.window.showErrorMessage(message);
}

module.exports = {
    showQuickPick,
    showInputBoxText,
    showInputBoxNumber,
    showInputBox,
    openDocumentOnEditor,
    showInformationMessage,
    showErrorMessage,
    createStatusBarItem,
    updateStatusBarItem
}