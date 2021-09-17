class Editor {

    static replaceEditorContent(editor, range, content) {
        editor.edit(editBuilder => {
            editBuilder.replace(range, content);
        });
    }

}
module.exports = Editor;