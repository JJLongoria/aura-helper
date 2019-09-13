const fs = require('fs');

class FileChecker{
    static isApexClass(filePath){
        return filePath.indexOf('.cls') != -1;
    }
    static isApexTrigger(filePath){
        return filePath.indexOf('.trigger') != -1;
    }
    static isJavaScript(filePath){
        return filePath.indexOf('.js') != -1;
    }
    static isAuraDoc(filePath){
        return filePath.indexOf('.auradoc') != -1;
    }
    static isAuraComponent(filePath){
        return filePath.indexOf('.cmp') != -1;
    }
    static isAuraComponentFolder(filePath){
        return filePath.indexOf('/aura/') !== -1 || filePath.indexOf('\\aura\\') !== -1;
    }
    static isExists(filePath){
        return fs.existsSync(filePath);
    }
}
exports.FileChecker = FileChecker;