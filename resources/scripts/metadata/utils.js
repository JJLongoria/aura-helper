const Logger = require('../main/logger');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;

class Utils {

    static getMetadataFromFileSystem() {
        let result = {
            sObjects: [],
        }
        let rootFolder = Paths.getMetadataRootFolder();
        let folders = FileReader.readDirSync(rootFolder);
        for (const folder of folders) {
            let childFolder = rootFolder + '/' + folder;
            if (folder === 'objects')
                result[folder] = this.getSObjects(childFolder);
            else if (folder !== 'aura' && folder != 'lwc' && folder != 'customMetadata' && folder != 'objectTranslations' && folder != 'reports' && folder != 'emailTemplates' && folder != 'dashboards')
                result[folder] = this.getFileNames(childFolder);
        }
        return result;
    }

    static getFileNames(folderPath) {
        let names = [];
        let files = FileReader.readDirSync(folderPath);
        for (const file of files) {
            let name = file.substr(0, file.indexOf('.'));
            if (!names.includes(name))
                names.push(name);
        }
        return names;
    }

    static getSObjects(folderPath) {
        let sObjects = [];
        let objFolders = FileReader.readDirSync(folderPath);
        for (const objFolder of objFolders) {
            sObjects.push(this.getSObjectData(folderPath + '/' + objFolder));
        }
        return sObjects;
    }

    static getSObjectData(objFolder) {
        let sObject = {
            name: Paths.getBasename(objFolder),
            fields: [],
            recordTypes: [],
            compactLayouts: [],
            listViews: [],
            validationRules: [],
            webLinks: [],
            isCustomSetting: false,
            isCustomMetadata: false,
        };
        let folders = FileReader.readDirSync(objFolder);
        for (const folder of folders) {
            if (!folder.endsWith('.xml'))
                sObject[folder] = this.getFileNames(objFolder + '/' + folder);
            else {
                let mainFile = FileReader.readFileSync(objFolder + '/' + folder);
                if (mainFile.indexOf('<customSettingsType>') != -1)
                    sObject.isCustomSetting = true;
                if (folder.indexOf('__mdt') != -1)
                    sObject.isCustomMetadata = true;
            }
        }
        return sObject;
    }

    static createFolderMetadataMap(dataFromOrg) {
        let folderMetadataMap = {};
        for (const metadataType of dataFromOrg) {
            folderMetadataMap[metadataType.directoryName] = metadataType;
        }
        return folderMetadataMap;
    }

    static isAnyChecked(objects) {
        let nChecked = 0;
        let nUnchecked = 0;
        Object.keys(objects).forEach(function (key) {
            if (objects[key].checked)
                nChecked++;
            else
                nUnchecked++;
        });
        return nChecked > 0 && nUnchecked > 0;
    }

    static isAllChecked(objects) {
        let nChecked = 0;
        Object.keys(objects).forEach(function (key) {
            if (objects[key].checked)
                nChecked++;
        });
        return Object.keys(objects).length === nChecked;
    }

    static checkAll(objects, parent, grandParent) {
        if (!parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                    Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                        objects[key].childs[childKey].childs[grandChildKey].checked = true;
                    });
                });
            });
        } else if (parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = true;
                });
            });
        } else {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = true;
            });
        }
    }

    static uncheckAll(objects, parent, grandParent) {
        if (!parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                    Object.keys(objects[key].childs[childKey].childs).forEach(function (grandChildKey) {
                        objects[key].childs[childKey].childs[grandChildKey].checked = false;
                    });
                });
            });
        } else if (parent && !grandParent) {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
                Object.keys(objects[key].childs).forEach(function (childKey) {
                    objects[key].childs[childKey].checked = false;
                });
            });
        } else {
            Object.keys(objects).forEach(function (key) {
                objects[key].checked = false;
            });
        }
    }

    static getXMLTag(tagName, xmlValue) {
        if (xmlValue !== undefined && xmlValue !== '')
            return '<' + tagName.trim() + '>' + xmlValue + '</' + tagName.trim() + '>'
        return '';
    }

}
module.exports = Utils;