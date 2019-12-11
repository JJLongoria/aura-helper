const fs = require('fs');
const rimraf = require("rimraf");
const unzipper = require('unzipper');

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
    static copyFileSync(sourcePath, targetPath) {
        fs.copyFileSync(sourcePath, targetPath);
    }
    static delete(folderPath) {
        rimraf.sync(folderPath);
    }
    static async unzip(zipFile, targetPath, callback) {
        let rstream = fs.createReadStream(zipFile).pipe(unzipper.Extract({
            path: targetPath
        }));
        rstream.on('close', (fd) => {
            if (callback)
                callback.call(this, fd);
        });
    }
}
exports.FileWriter = FileWriter;