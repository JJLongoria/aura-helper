import * as vscode from 'vscode';

export class Editor {

    static replaceEditorContent(editor: vscode.TextEditor, range: vscode.Range, content: string): void {
        editor.edit(editBuilder => {
            editBuilder.replace(range, content);
        });
    }

}