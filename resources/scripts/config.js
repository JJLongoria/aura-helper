const vscode = require('vscode');

function getConfig(){
    return vscode.workspace.getConfiguration('aurahelper');
}

module.exports = {
    getConfig
}