const fs = require('fs');

class FileWriter {
    static replaceEditorContent(editor, range, content) {
        editor.edit(editBuilder => {
            editBuilder.replace(range, content);
        });
    }
    static createFile(path, content, callback) {
        fs.writeFile(path, content, function (error) {
            if(callback){
                if(error)
                    callback.call(this, undefined, error);
                else
                    callback.call(this, path, undefined);
            }
        })
    }
    static createFileSync(path, content){
        fs.writeFileSync(path, content);
    }
    static createFolderSync(folderPath) {
        fs.mkdirSync(folderPath);
    }
    static copyFileSync(sourcePath, targetPath) {
        fs.copyFileSync(sourcePath, targetPath);
    }
}
exports.FileWriter = FileWriter;