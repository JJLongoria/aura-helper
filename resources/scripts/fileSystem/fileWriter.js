const fs = require('fs');
const path = require('path');

class FileWriter {
    static replaceEditorContent(editor, range, content) {
        editor.edit(editBuilder => {
            editBuilder.replace(range, content);
        });
    }
    static createFile(path, content, callback) {
        fs.writeFile(path, content, function (error) {
            if (callback) {
                if (error)
                    callback.call(this, undefined, error);
                else
                    callback.call(this, path, undefined);
            }
        })
    }
    static createFileSync(path, content) {
        fs.writeFileSync(path, content);
    }
    static createFolderSync(folderPath) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    static copyFile(source, target, callback) { 
        fs.copyFile(source, target, callback);
    }

    static copyFileSync(sourcePath, targetPath) {
        fs.copyFileSync(sourcePath, targetPath);
    }
    static delete(pathToDelete) {
        if (fs.existsSync(pathToDelete)) {
            if (fs.lstatSync(pathToDelete).isDirectory()) {
                fs.readdirSync(pathToDelete).forEach(function (entry) {
                    var entry_path = path.join(pathToDelete, entry);
                    if (fs.lstatSync(entry_path).isDirectory()) {
                        FileWriter.delete(entry_path);
                    } else {
                        fs.unlinkSync(entry_path);
                    }
                });
                fs.rmdirSync(pathToDelete);
            } else {
                fs.unlinkSync(pathToDelete);
            }
        }
    }
}
exports.FileWriter = FileWriter;