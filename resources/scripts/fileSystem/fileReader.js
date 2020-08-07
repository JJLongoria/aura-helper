const fs = require('fs');
const path = require('path');

class FileReader {
    static readDocument(document) {
        var lines = [];
        for (var i = 0; i < document.lineCount; i++) {
            lines.push(document.lineAt(i).text);
        }
        return lines.join('\n');
    }
    
    static readFileSync(filePath) {
        return fs.readFileSync(filePath, 'utf8');
    }

    static readFile(filePath, callback) { 
        fs.readFile(filePath, callback);
    }

    static readDirSync(folderPath, filters) {
        let folderContent = fs.readdirSync(folderPath);
        if (filters) {
            let result = [];
            for (const contentPath of folderContent) {
                if (filters.onlyFolders && fs.lstatSync(folderPath + '/' + contentPath).isDirectory()) {
                    result.push(contentPath);
                } else if (filters.onlyFiles) {
                    if (fs.lstatSync(folderPath + '/' + contentPath).isFile()) {
                        if (filters.extensions && filters.extensions.length > 0) {
                            if (filters.extensions.includes(path.extname(contentPath)))
                                result.push(contentPath);
                        } else {
                            result.push(contentPath);
                        }
                    }
                } else {
                    if (filters.extensions && filters.extensions.length > 0) {
                        if (filters.extensions.includes(path.extname(contentPath)))
                            result.push(contentPath);
                    } else {
                        result.push(contentPath);
                    }
                }
            }
            return result;
        } else {
            return folderContent;
        }
    }



    static getAllFiles(dir, done) {
        let results = [];
        fs.readdir(dir, function (err, list) {
            if (err)
                return done(err);
            var pending = list.length;
            if (!pending)
                return done(null, results);
            list.forEach(function (file) {
                file = path.resolve(dir, file);
                fs.stat(file, function (err, stat) {
                    // If directory, execute a recursive call
                    if (stat && stat.isDirectory()) {
                        // Add directory to array [comment if you need to remove the directories from the array]
                        results.push(file);
                        FileReader.getAllFiles(file, function (err, res) {
                            results = results.concat(res);
                            if (!--pending)
                                done(null, results);
                        });
                    } else {
                        results.push(file);
                        if (!--pending)
                            done(null, results);
                    }
                });
            });
        });
    };
}
exports.FileReader = FileReader;