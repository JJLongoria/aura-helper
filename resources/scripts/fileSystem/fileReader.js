const fs = require('fs');

class FileReader{
    static readDocument(document){
        var lines = [];
        for (var i = 0; i < document.lineCount; i++) {
            lines.push(document.lineAt(i).text);
        }
        return lines.join('\n');
    }
    static readFileSync(filePath){
        return fs.readFileSync(filePath, 'utf8');
    }
    static readDirSync(folderPath){
        return fs.readdirSync(folderPath);
    }
}
exports.FileReader = FileReader;