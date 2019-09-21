const fs = require('fs');

class FileChecker{
    static isApexClass(filePath){
        return filePath.endsWith('.cls');
    }
    static isApexTrigger(filePath){
        return filePath.endsWith('.trigger');
    }
    static isJavaScript(filePath){
        return filePath.endsWith('.js');
    }
    static isAuraDoc(filePath){
        return filePath.endsWith('.auradoc');
    }
    static isAuraComponent(filePath){
        return filePath.endsWith('.cmp');
    }
    static isAuraComponentFolder(filePath){
        return filePath.indexOf('/aura/') !== -1 || filePath.indexOf('\\aura\\') !== -1;
    }
    static isExists(filePath){
        return fs.existsSync(filePath);
    }
}
exports.FileChecker = FileChecker;