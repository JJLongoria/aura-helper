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
    static isProfile(filePath) { 
        return filePath.endsWith('.profile-meta.xml');
    }
    static isProfileFolder(filePath) { 
        return filePath.endsWith('/profiles') || filePath.endsWith('\\profiles');
    }
    static isExists(filePath){
        return fs.existsSync(filePath);
    }
}
exports.FileChecker = FileChecker;