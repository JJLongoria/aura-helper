const Logger = require('../utils/logger');
const fileSystem = require('../fileSystem');
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const MetadataType = require('./metadataTypes');

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
            if (metadataType.xmlName === MetadataType.CUSTOM_FIELDS) {
                folderMetadataMap[metadataType.directoryName + '/fields'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.INDEX) {
                folderMetadataMap[metadataType.directoryName + '/indexes'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.BUSINESS_PROCESS) {
                folderMetadataMap[metadataType.directoryName + '/businessProcesses'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.COMPACT_LAYOUT) {
                folderMetadataMap[metadataType.directoryName + '/compactLayouts'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.RECORD_TYPE) {
                folderMetadataMap[metadataType.directoryName + '/recordTypes'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.BUTTON_OR_LINK) {
                folderMetadataMap[metadataType.directoryName + '/webLinks'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.VALIDATION_RULE) {
                folderMetadataMap[metadataType.directoryName + '/validationRules'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.SHARING_REASON) {
                folderMetadataMap[metadataType.directoryName + '/sharingReasons'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.LISTVIEW) {
                folderMetadataMap[metadataType.directoryName + '/listViews'] = metadataType;
            } else if (metadataType.xmlName === MetadataType.FIELD_SET) {
                folderMetadataMap[metadataType.directoryName + '/fieldSets'] = metadataType;
            } else if (!folderMetadataMap[metadataType.directoryName]) {
                folderMetadataMap[metadataType.directoryName] = metadataType;
            }
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

    static countCheckedChilds(object) {
        let count = 0;
        if (object && Utils.haveChilds(object)) {
            Object.keys(object.childs).forEach(function (key) {
                if (object.childs[key].checked)
                    count++;
            });
        }
        return count;
    }

    static combineMetadata(metadataTarget, metadataSource) {
        Object.keys(metadataSource).forEach(function (key) {
            const metadataTypeSource = metadataSource[key];
            const metadataTypeTarget = metadataTarget[key];
            if (metadataTypeTarget) {
                const childKeys = Object.keys(metadataTypeSource.childs);
                if (childKeys.length > 0) {
                    Object.keys(metadataTypeSource.childs).forEach(function (childKey) {
                        const metadataObjectSource = metadataTypeSource.childs[childKey];
                        const metadataObjectTarget = metadataTypeTarget.childs[childKey];
                        if (metadataObjectTarget) {
                            const grandChildKeys = Object.keys(metadataObjectSource.childs);
                            if (grandChildKeys.length > 0) {
                                Object.keys(metadataObjectSource.childs).forEach(function (grandChildKey) {
                                    const metadataItemSource = metadataObjectSource.childs[grandChildKey];
                                    const metadataItemTarget = metadataObjectTarget.childs[grandChildKey];
                                    if (metadataItemTarget && metadataItemSource.checked) {
                                        metadataTarget[key].childs[childKey].childs[grandChildKey].checked = true;
                                    } else {
                                        metadataTarget[key].childs[childKey].childs[grandChildKey] = metadataItemSource;
                                    }
                                });
                                metadataTarget[key].childs[childKey].checked = Utils.isAllChecked(metadataTarget[key].childs[childKey].childs);
                            } else {
                                metadataTarget[key].childs[childKey].checked = metadataObjectSource.checked;
                            }
                        } else {
                            metadataTarget[key].childs[childKey] = metadataObjectSource;
                        }
                    });
                    metadataTarget[key].checked = Utils.isAllChecked(metadataTarget[key].childs);
                } else {
                    metadataTarget[key].checked = metadataTypeSource.checked;
                }
            } else {
                metadataTarget[key] = metadataSource[key];
            }
        });
        return metadataTarget;
    }

    static getXMLTag(tagName, xmlValue) {
        let isJSONValue = false;
        let attributes = Utils.getAttributes(xmlValue);
        try {
            let jsonVal = JSON.parse(xmlValue);
            if (jsonVal)
                isJSONValue = true
            else
                isJSONValue = false;
        } catch (error) {
            isJSONValue = false;
        }
        let keys = Object.keys(xmlValue);
        let onlyAttrs = false;
        if (keys.length == 1 && keys.includes('@attrs'))
            onlyAttrs = true;
        if (xmlValue !== undefined && xmlValue !== '' && !onlyAttrs) {
            if (typeof xmlValue === 'string' && !isJSONValue) {
                xmlValue = Utils.escapeChars(xmlValue);
            }
            if (attributes.length > 0 && !onlyAttrs)
                return '<' + tagName.trim() + ' ' + attributes.join(' ') + '>' + xmlValue + '</' + tagName.trim() + '>';
            else
                return '<' + tagName.trim() + '>' + xmlValue + '</' + tagName.trim() + '>';

        }
        if (attributes.length > 0)
            return '<' + tagName.trim() + ' ' + attributes.join(' ') + '/>';
        else
            return '<' + tagName.trim() + '/>';
    }

    static escapeChars(value) {
        value = value.split('&amp;').join('&');
        value = value.split('&quot;').join('"');
        value = value.split('&apos;').join('\'');
        value = value.split('&lt;').join('<');
        value = value.split('&gt;').join('>');

        value = value.split('«!--').join('<!--');
        value = value.split('--»').join('-->');
        value = value.split('&').join('&amp;');
        value = value.split('"').join('&quot;');
        value = value.split('\'').join('&apos;');
        if (value.indexOf('<!') === -1) {
            value = value.split('<').join('&lt;');
            value = value.split('>').join('&gt;');
        }
        return value;
    }

    static getXMLBlock(blockName, data, compress, initIndent) {
        let xmlBlock = [];
        if (data) {
            if (Array.isArray(data)) {
                for (const dataElement of data) {
                    let line = [];
                    if (typeof dataElement === 'object') {
                        let attributes = Utils.getAttributes(dataElement);
                        if (attributes.length > 0)
                            line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '>');
                        else
                            line.push(Utils.getTabs(initIndent) + '<' + blockName + '>');
                        let orderedKeys = Object.keys(dataElement).sort(function (a, b) {
                            return a.toLowerCase().localeCompare(b.toLowerCase());
                        });
                        for (const key of orderedKeys) {
                            if (Array.isArray(dataElement[key])) {
                                dataElement[key] = dataElement[key].sort(function (a, b) {
                                    return a.toLowerCase().localeCompare(b.toLowerCase());
                                });
                                for (const arrayElement of dataElement[key]) {
                                    line.push(Utils.getXMLTag(key, arrayElement));
                                }
                            } else {
                                if (Array.isArray(dataElement[key]) || typeof dataElement[key] === 'object') {
                                    line.push(Utils.getXMLBlock(key, dataElement[key], compress, 0));
                                } else {
                                    line.push(Utils.getXMLTag(key, dataElement[key]));
                                }
                            }
                        }
                        line.push('</' + blockName + '>');
                    } else {
                        line.push(Utils.getTabs(initIndent) + Utils.getXMLTag(blockName, dataElement));
                    }
                    xmlBlock.push(line.join(''));
                }
            } else if (typeof data === 'object') {
                let line = [];
                let attributes = Utils.getAttributes(data);
                let text = Utils.getText(data);
                let lineData = [];
                let orderedKeys = Object.keys(data).sort(function (a, b) {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                });
                if (text !== undefined) {
                    text = Utils.escapeChars(text);
                    lineData.push(text);
                } else {
                    for (const key of orderedKeys) {
                        if (key !== '@attrs' && key !== '#text') {
                            lineData.push(Utils.getXMLTag(key, data[key]));
                        }
                    }
                }
                if (lineData.length > 0) {
                    if (attributes.length > 0)
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '>');
                    else
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + '>');
                    line.push(lineData.join(''));
                    line.push('</' + blockName + '>');
                } else {
                    if (attributes.length > 0)
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + ' ' + attributes.join(' ') + '/>');
                    else
                        line.push(Utils.getTabs(initIndent) + '<' + blockName + '/>');
                }
                xmlBlock.push(line.join(''));
            } else {
                xmlBlock.push(Utils.getTabs(initIndent) + Utils.getXMLTag(blockName, data));
            }
        }
        return xmlBlock;
    }

    static getAttributes(data) {
        let attributes = [];
        if (data['@attrs'] !== undefined) {
            Object.keys(data['@attrs']).forEach(function (key) {
                attributes.push(key + '="' + data['@attrs'][key] + '"');
            });
        }
        return attributes;
    }

    static getText(data) {
        let text = undefined;
        if (data['#text'] !== undefined)
            text = data['#text'];
        return text;
    }

    static getTabs(nTabs) {
        let tabs = '';
        for (let i = 0; i < nTabs; i++) {
            tabs += '\t';
        }
        return tabs;
    }

    static prepareXML(source, target) {
        Object.keys(target).forEach(function (key) {
            if (source[key] !== undefined) {
                if (Array.isArray(target[key])) {
                    target[key] = Utils.forceArray(source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        });
        return target;
    }

    static sort(elements, fields) {
        if (Array.isArray(elements)) {
            elements.sort(function (a, b) {
                if (fields && fields.length > 0) {
                    let nameA = '';
                    let nameB = '';
                    let counter = 0;
                    for (const iterator of fields) {
                        let valA = (a[iterator] !== undefined) ? a[iterator] : "";
                        let valB = (b[iterator] !== undefined) ? b[iterator] : "";
                        if (counter == 0) {
                            nameA = valA;
                            nameB = valB;
                        } else {
                            nameA += '_' + valA;
                            nameB += '_' + valB;
                        }
                        counter++;
                    }
                    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                } else {
                    return a.toLowerCase().localeCompare(b.toLowerCase());
                }
            });
        }
    }

    static forceArray(element) {
        let result = [];
        if (element !== undefined) {
            if (Array.isArray(element))
                result = element;
            else
                result.push(element);
        }
        return result;
    }

    static haveChilds(object) {
        return object && object.childs && Object.keys(object.childs).length > 0;
    }

    static getTypesForAuraHelperCommands(metadata){
        let types = [];
        Object.keys(metadata).forEach(function (typeKey) {
            if (metadata[typeKey].checked) {
                types.push(typeKey);
            } else {
                Object.keys(metadata[typeKey].childs).forEach(function (objectKey) {
                    if (metadata[typeKey].childs[objectKey].checked) {
                        types.push(typeKey + ':' + objectKey);
                    } else {
                        Object.keys(metadata[typeKey].childs[objectKey].childs).forEach(function (itemKey) {
                            if (metadata[typeKey].childs[objectKey].childs[itemKey].checked)
                            types.push(typeKey + ':' + objectKey + ':' + itemKey);
                        });
                    }
                });
            }
        });
        return types;
    }

}
module.exports = Utils;