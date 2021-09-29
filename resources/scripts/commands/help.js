const vscode = require('vscode');
exports.run = function () {
    vscode.env.openExternal(vscode.Uri.parse('https://github.com/JJLongoria/aura-helper/wiki'));
}