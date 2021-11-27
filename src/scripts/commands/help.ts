import * as vscode from 'vscode';
export function run() {
    vscode.env.openExternal(vscode.Uri.parse('https://github.com/JJLongoria/aura-helper/wiki'));
};