const vscode = require('vscode');

function showInformationMessage(message){
    vscode.window.showInformationMessage(message);
}

function showQuickPick(elements, placeholder, callback){
    vscode.window.showQuickPick(elements, {placeHolder: placeholder}).then(selected => {
        callback.call(this, selected);
    });
}

function showInputBoxText(placeholder, callback){
    vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: function(text){
            var regex = /^[a-zA-Z]+$/;
            if (!regex.test(text))
                return text;
            return null;;
        }
    }).then(text =>{
        callback.call(this, text);
    });
}

function showInputBoxNumber(placeholder, callback){
    vscode.window.showInputBox({
        placeHolder: placeholder,
        validateInput: function(text){
            var regex = /^[0-9]+$/;
            if (!regex.test(text))
                return text;
            return null;;
        }
    }).then(text =>{
        callback.call(this, text);
    });
}

function showInputBox(placeholder, callback){
    vscode.window.showInputBox({
        placeHolder: placeholder
    }).then(text =>{
        callback.call(this, text);
    });
}

function openDocumentOnEditor(strPath, callback){
    vscode.window.showTextDocument(vscode.Uri.file(strPath)).then(editor =>{
        if(callback)
            callback.call(this, editor);
    });
}

module.exports = {
    showQuickPick,
    showInputBoxText,
    showInputBoxNumber,
    showInputBox,
    openDocumentOnEditor,
    showInformationMessage
}