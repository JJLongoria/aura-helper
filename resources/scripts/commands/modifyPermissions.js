const vscode = require('vscode');
const { FileChecker, FileReader, FileWriter, PathUtils } = require('@aurahelper/core').FileSystem;
const { StrUtils, MetadataUtils } = require('@aurahelper/core').CoreUtils;
const { MetadataTypes } = require('@aurahelper/core').Values;
const InputFactory = require('../inputs/factory');
const OutputChannel = require('../output/outputChannnel');
const NotificationManager = require('../output/notificationManager');
const Paths = require('../core/paths');
const Config = require('../core/config');
const CLIManager = require('@aurahelper/cli-manager');
const XMLCompressor = require('@aurahelper/xml-compressor');
const MetadataFactory = require('@aurahelper/metadata-factory');
const Connection = require('@aurahelper/connector');
const { XMLParser, XMLUtils } = require('@aurahelper/languages').XML;
const XMLDefinitions = require('@aurahelper/xml-definitions');

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        if (filePath)
            modifyPermissions(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for modify permissions');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function modifyPermissions(filePath) {
    filePath = PathUtils.getAbsolutePath(filePath);
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Loading Metadata Types from Local",
        cancellable: false
    }, (progress, cancelToken) => {
        return new Promise(async (resolve) => {
            const metadataTypes = await getLocalMetadata(undefined);
            if (!metadataTypes[MetadataTypes.PROFILE] && !metadataTypes[MetadataTypes.PERMISSION_SET] && !metadataTypes[MetadataTypes.MUTING_PERMISSION_SET]) {
                NotificationManager.showError('Profiles, Permission Sets or Muting Permission Sets not found on your local project');
            } else {
                showPermissionsMetadata(filePath, metadataTypes);
            }
            resolve();
        });

    });
}

function getLocalMetadata(types) {
    return new Promise(function (resolve, reject) {
        if (Config.useAuraHelperCLI()) {
            const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
            cliManager.describeLocalMetadata(types).then((metadataTypes) => {
                resolve(metadataTypes);
            }).catch((error) => {
                reject(error);
            });
        } else {
            const connection = new Connection(Config.getOrgAlias(), Config.getAPIVersion(), Paths.getProjectFolder());
            connection.listMetadataTypes().then((metadataDetails) => {
                const folderMetadataMap = MetadataFactory.createFolderMetadataMap(metadataDetails);
                const metadataTypes = MetadataFactory.createMetadataTypesFromFileSystem(folderMetadataMap, Paths.getProjectFolder());
                resolve(metadataTypes);
            }).catch((error) => {
                reject(error);
            });
        }
    });
}

async function showPermissionsMetadata(filePath, metadataTypes) {
    let suffix;
    let fileMetadataType;
    if (filePath.indexOf('-meta.xml') !== -1)
        filePath = StrUtils.replace(filePath, '-meta.xml', '');
    const fileSplits = filePath.split('.');
    suffix = fileSplits[fileSplits.length - 1];
    const items = [];
    for (const mtDataName of Object.keys(metadataTypes)) {
        const metadataType = metadataTypes[mtDataName];
        if (metadataType.suffix === suffix) {
            fileMetadataType = metadataType;
        }
    }
    if (metadataTypes[MetadataTypes.PROFILE]) {
        const XMLDefinition = XMLDefinitions.getDefinition(MetadataTypes.PROFILE, Config.getAPIVersion());
        const types = XMLDefinitions.getMetadataTypes(XMLDefinition);
        if (types.includes(fileMetadataType.name))
            items.push(MetadataTypes.PROFILE);
    }
    if (metadataTypes[MetadataTypes.PERMISSION_SET]) {
        const XMLDefinition = XMLDefinitions.getDefinition(MetadataTypes.PERMISSION_SET, Config.getAPIVersion());
        const types = XMLDefinitions.getMetadataTypes(XMLDefinition);
        if (types.includes(fileMetadataType.name))
            items.push(MetadataTypes.PERMISSION_SET);
    }
    if (metadataTypes[MetadataTypes.MUTING_PERMISSION_SET]) {
        const XMLDefinition = XMLDefinitions.getDefinition(MetadataTypes.PERMISSION_SET, Config.getAPIVersion());
        const types = XMLDefinitions.getMetadataTypes(XMLDefinition);
        if (types.includes(fileMetadataType.name))
            items.push(MetadataTypes.MUTING_PERMISSION_SET);
    }
    if (items.length === 0) {
        NotificationManager.showError('The selected file of ' + fileMetadataType.name + ' Metadata Type not support edit permissions');
        return;
    }
    const selectedPermissionsType = (items.length === 1) ? items[0] : await InputFactory.createSingleSelectorInput(items, 'Select the Permissions Type to Edit');
    if (selectedPermissionsType) {
        const selectedPermissions = await InputFactory.createMultiSelectorInput(Object.keys(metadataTypes[selectedPermissionsType].childs), 'Select ' + selectedPermissionsType + ' to add permissions', true);
        if (selectedPermissions) {
            modifyPermissionFiles(filePath, fileMetadataType, metadataTypes, selectedPermissions, selectedPermissionsType);
        }
    }
}

async function modifyPermissionFiles(filePath, fileMetadataType, metadataTypes, selectedPermissions, selectedPermissionsType) {
    const permissionsToEdit = selectedPermissions.split(',');
    const XMLDefinition = XMLDefinitions.getDefinition(selectedPermissionsType, Config.getAPIVersion());
    const baseName = PathUtils.getBasename(filePath);
    const fileWithoutSuffix = baseName.substring(0, baseName.lastIndexOf('.'));
    const xmlElementData = getXMLElementData(XMLDefinition, fileMetadataType.name);
    const editableFields = getEditableFields(xmlElementData, permissionsToEdit.length > 0);
    const separator = xmlElementData.fields[xmlElementData.sortOrder[0]].separator;
    let objName = (separator) ? fileWithoutSuffix.substring(0, fileWithoutSuffix.indexOf(separator)) : fileWithoutSuffix;
    let itemName = (separator) ? fileWithoutSuffix.substring(fileWithoutSuffix.indexOf(separator) + 1) : undefined;
    if (!objName) {
        const folderPath = StrUtils.replace(filePath, fileMetadataType.path + '/', '');
        const folderSplits = folderPath.split('/');
        objName = folderSplits[0];
    }
    if (editableFields && editableFields.length > 0) {
        for (const permissionToEdit of permissionsToEdit) {
            const permissionMetadata = metadataTypes[selectedPermissionsType].childs[permissionToEdit];
            const xmlRoot = XMLParser.parseXML(FileReader.readFileSync(permissionMetadata.path));
            const xmlFile = XMLUtils.cleanXMLFile(XMLDefinition, xmlRoot[selectedPermissionsType]);
            if (xmlFile[xmlElementData.key]) {
                let elementName = (objName && itemName && separator) ? objName + separator + itemName : ((objName) ? objName : itemName);
                for (const fieldData of xmlRoot[selectedPermissionsType][xmlElementData.key]) {
                    if (fieldData[xmlElementData.fieldKey] === elementName) {
                        for (const editableField of editableFields) {
                            if (editableField.type === 'boolean') {
                                if (fieldData[editableField.name]) {
                                    editableField.nChecked++;
                                } else {
                                    editableField.nUnchecked++;
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const value of editableFields) {
            value.value = value.nChecked >= value.nUnchecked || value.value;
        }
    }
    let selectedPermissionValues;
    if (fileMetadataType.name === MetadataTypes.CUSTOM_TAB) {
        let valuesToShow = [];
        for (const enumValue of xmlElementData.fields[editableFields[0].name].values) {
            valuesToShow.push(enumValue.label);
        }
        selectedPermissionValues = await InputFactory.createSingleSelectorInput(valuesToShow, 'Set ' + fileMetadataType.name + ' visibility values', true);
    } else if (fileMetadataType.name === MetadataTypes.LAYOUT) {
        let valuesToShow = ['Master'];
        if (metadataTypes[MetadataTypes.RECORD_TYPE] && metadataTypes[MetadataTypes.RECORD_TYPE].childs[objName]) {
            for (const rtItem of Object.keys(metadataTypes[MetadataTypes.RECORD_TYPE].childs[objName].childs)) {
                valuesToShow.push(metadataTypes[MetadataTypes.RECORD_TYPE].childs[objName].childs[rtItem].name);
            }
        }
        selectedPermissionValues = await InputFactory.createSingleSelectorInput(valuesToShow, 'Set ' + fileMetadataType.name + ' record type assignment', true);
    } else {
        selectedPermissionValues = await InputFactory.createMultiSelectorInput(editableFields, 'Set ' + fileMetadataType.name + ' permission values', true);
    }
    if (!selectedPermissionValues)
        return;
    const compress = await InputFactory.createCompressSelector(true);
    if (!compress)
        return;
    const filesToCompress = [];
    const permissionValues = selectedPermissionValues.split(',');
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Modifing Permissions from selected files'
    }, (progress) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                for (const permissionToEdit of permissionsToEdit) {
                    const permissionMetadata = metadataTypes[selectedPermissionsType].childs[permissionToEdit];
                    const xmlRoot = XMLParser.parseXML(FileReader.readFileSync(permissionMetadata.path));
                    const uniqueFields = [];
                    const checkedFields = [];
                    const uncheckedFields = [];
                    if (xmlRoot[selectedPermissionsType]) {
                        const xmlFile = XMLUtils.cleanXMLFile(XMLDefinition, xmlRoot[selectedPermissionsType]);
                        let exists = false;
                        let elementName = (objName && itemName && separator) ? objName + separator + itemName : ((objName) ? objName : itemName);
                        if (fileMetadataType.name === MetadataTypes.LAYOUT) {
                            if (selectedPermissionValues === 'Master') {
                                elementName = selectedPermissionValues;
                            } else {
                                elementName = objName + xmlElementData.fields.recordType.separator + selectedPermissionValues;
                            }
                        }
                        for (const xmlElement of xmlFile[xmlElementData.key]) {
                            if (fileMetadataType.name === MetadataTypes.LAYOUT) {
                                if (elementName === 'Master' && xmlElement.recordType === undefined && xmlElement[xmlElementData.sortOrder[0]].startsWith(objName)) {
                                    exists = true;
                                } else if (xmlElement.recordType === elementName) {
                                    exists = true;
                                }
                                if (exists) {
                                    xmlElement[xmlElementData.sortOrder[0]] = objName + separator + itemName;
                                    break;
                                }
                            } else {
                                if (xmlElement[xmlElementData.sortOrder[0]] === elementName) {
                                    exists = true;
                                    for (const fieldName of Object.keys(xmlElementData.fields)) {
                                        const fieldData = xmlElementData.fields[fieldName];
                                        if (fieldData.editable) {
                                            if (fileMetadataType.name === MetadataTypes.CUSTOM_TAB) {
                                                xmlElement[fieldName] = fieldData.getValue(selectedPermissionValues);
                                            } else {
                                                if (permissionValues.includes(fieldName) && !xmlElement[fieldName]) {
                                                    xmlElement[fieldName] = true;
                                                    checkedFields.push(fieldName);
                                                } else if (!permissionValues.includes(fieldName) && xmlElement[fieldName]) {
                                                    xmlElement[fieldName] = false;
                                                    uncheckedFields.push(fieldName);
                                                }
                                            }
                                            if (fieldData.editable && fieldData.unique) {
                                                uniqueFields.push({ field: fieldName, value: xmlElement[fieldName], datatype: fieldData.datatype });
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        if (!exists) {
                            const obj = {};
                            if (fileMetadataType.name === MetadataTypes.LAYOUT) {
                                obj[xmlElementData.sortOrder[0]] = objName + separator + itemName;
                                if (elementName !== 'Master') {
                                    obj.recordType = elementName;
                                }
                            } else {
                                for (const fieldName of Object.keys(xmlElementData.fields)) {
                                    const fieldData = xmlElementData.fields[fieldName];
                                    if (fieldData.default === '{!value}')
                                        obj[fieldName] = (separator) ? (objName + separator + itemName) : (!objName ? itemName : objName);
                                    else if (fileMetadataType.name === MetadataTypes.CUSTOM_TAB && fieldData.datatype === 'enum') {
                                        obj[fieldName] = fieldData.getValue(selectedPermissionValues);
                                    } else {
                                        if (permissionValues.includes(fieldName)) {
                                            obj[fieldName] = true;
                                            checkedFields.push(fieldName);
                                        } else {
                                            obj[fieldName] = false;
                                            uncheckedFields.push(fieldName);
                                        }
                                    }
                                    if (fieldData.editable && fieldData.unique) {
                                        uniqueFields.push({ field: fieldName, value: obj[fieldName], datatype: fieldData.datatype });
                                    }
                                }
                            }
                            xmlFile[xmlElementData.key].push(obj);
                        }
                        MetadataUtils.handleUniqueFields(xmlFile, xmlElementData, uniqueFields, objName, itemName);
                        MetadataUtils.handleControlledFields(xmlFile, xmlElementData, checkedFields, objName, itemName);
                        MetadataUtils.handleControlledFields(xmlFile, xmlElementData, uncheckedFields, objName, itemName);
                        xmlRoot[selectedPermissionsType] = xmlFile;
                        FileWriter.createFileSync(permissionMetadata.path, XMLParser.toXML(xmlRoot));
                        filesToCompress.push(permissionMetadata.path);
                    }
                }
                const sortOrder = Config.getXMLSortOrder();
                if (compress === 'Yes') {
                    //if (Config.useAuraHelperCLI()) {
                    const cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
                    cliManager.compress(filesToCompress, sortOrder).then(() => {
                        NotificationManager.showInfo('Modify Permissions finished succesfully');
                        OutputChannel.outputLine('XML file compressed successfully');
                        resolve();
                    }).catch((error) => {
                        throw error;
                    });
                    /*} else {
                        const compressor = new XMLCompressor(permissionMetadata.path, sortOrder);
                        compressor.compress().then(() => {
                            OutputChannel.outputLine('XML file compressed successfully');
                        }).catch((error) => {
                            throw error;
                        });
                    }*/
                } else {
                    NotificationManager.showInfo('Modify Permissions finished succesfully');
                    resolve();
                }
            }, 100);
        });
    });
}

function getXMLElementData(XMLDefinition, metadataTypeName) {
    for (const xmlData of Object.keys(XMLDefinition)) {
        const xmlFieldData = XMLDefinition[xmlData];
        if (xmlFieldData.fields && xmlFieldData.fields[xmlFieldData.sortOrder[0]] && xmlFieldData.fields[xmlFieldData.sortOrder[0]].metadataType === metadataTypeName && xmlData !== 'customSettingAccesses') {
            return xmlFieldData;
        }
    }
    return undefined;
}

function getEditableFields(xmlElementFields, skipUniques) {
    const editableFields = [];
    for (const fieldKey of Object.keys(xmlElementFields.fields)) {
        const fieldData = xmlElementFields.fields[fieldKey];
        if (fieldData.editable) {
            if (skipUniques && fieldData.unique)
                continue;
            editableFields.push({
                name: fieldKey,
                type: fieldData.datatype,
                value: fieldData.default,
                nChecked: 0,
                nUnchecked: 0
            });
        }
    }
    return editableFields;
}