const vscode = require('vscode');
const { FileChecker, FileReader, FileWriter, Paths } = require('../fileSystem');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');
const ProcessManager = require('../processes/processManager');
const StrUtils = require('../utils/strUtils');
const METADATA_TYPES = require('../metadata/metadataTypes');
const { ProfileUtils, } = require('../metadata');
const { XMLParser } = require('../languages');
const MetadataUtils = require('../metadata/utils');
const AppContext = require('../core/applicationContext');

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
            addToProfile(filePath);
        else
            NotificationManager.showError('Any file selected or opened on editor for add to Profiles');
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function addToProfile(filePath) {
    filePath = StrUtils.replace(filePath, '\\', '/');
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Loading Metadata Types from Local",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async (resolve) => {
            const metadataTypes = await getLocalMetadata(undefined, cancelToken);
            if (!metadataTypes[METADATA_TYPES.PROFILE]) {
                NotificationManager.showError('Profiles not found on your local project');
            } else {
                showProfiles(filePath, metadataTypes);
            }
            resolve();
        });

    });
}

function getLocalMetadata(types, cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false, types: types }, true, cancelToken);
        if (!out) {
            NotificationManager.showInfo('Operation Cancelled by User');
            resolve();
        } else if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                resolve(response.result.data);
            } else {
                NotificationManager.showCommandError(response.error.message);
                resolve();
            }
        } else {
            NotificationManager.showCommandError(out.stdErr);
            resolve();
        }
    });
}

async function showProfiles(filePath, metadataTypes) {
    let suffix;
    let fileMetadataType;
    if (filePath.indexOf('-meta.xml') !== -1)
        filePath = StrUtils.replace(filePath, '-meta.xml', '');
    const fileSplits = filePath.split('.');
    suffix = fileSplits[fileSplits.length - 1];
    const selectedProfiles = await InputFactory.createMultiSelectorInput(Object.keys(metadataTypes[METADATA_TYPES.PROFILE].childs), 'Select Profiles to add permissions');
    if (selectedProfiles) {
        for (const mtDataName of Object.keys(metadataTypes)) {
            const metadataType = metadataTypes[mtDataName];
            if (metadataType.suffix === suffix) {
                fileMetadataType = metadataType;
            }
        }
        if (!fileMetadataType) {
            NotificationManager.showError('Metadata Type not supported on Profiles');
        } else {
            modifyProfiles(filePath, fileMetadataType, metadataTypes, selectedProfiles);
        }

    }
}

async function modifyProfiles(filePath, fileMetadataType, metadataTypes, selectedProfiles) {
    const baseName = Paths.getBasename(filePath);
    const fileWithoutSuffix = baseName.substring(0, baseName.lastIndexOf('.'));
    const xmlElementData = getXMLElementData(fileMetadataType.name);
    const editableFields = getEditableFields(xmlElementData, selectedProfiles.indexOf(',') !== -1);
    const separator = xmlElementData.xmlData.fields[xmlElementData.xmlData.fieldKey].separator;
    let objName = (separator) ? fileWithoutSuffix.substring(0, fileWithoutSuffix.indexOf(separator)) : fileWithoutSuffix;
    let itemName = (separator) ? fileWithoutSuffix.substring(fileWithoutSuffix.indexOf(separator) + 1) : undefined;
    if (!objName) {
        const folderPath = StrUtils.replace(filePath, fileMetadataType.path + '/', '');
        const folderSplits = folderPath.split('/');
        objName = folderSplits[0];
    }
    let selectedPermissionValues;
    if (fileMetadataType.name === METADATA_TYPES.TAB) {
        let valuesToShow = [];
        for (const enumValue of xmlElementData.xmlData.fields[editableFields[0].name].values) {
            valuesToShow.push(enumValue.label);
        }
        selectedPermissionValues = await InputFactory.createSingleSelectorInput(valuesToShow, 'Set ' + fileMetadataType.name + ' visibility values');
    } else if (fileMetadataType.name === METADATA_TYPES.LAYOUT) {
        let valuesToShow = ['Master'];
        if (metadataTypes[METADATA_TYPES.RECORD_TYPE] && metadataTypes[METADATA_TYPES.RECORD_TYPE].childs[objName]) {
            for (const rtItem of Object.keys(metadataTypes[METADATA_TYPES.RECORD_TYPE].childs[objName].childs)) {
                valuesToShow.push(metadataTypes[METADATA_TYPES.RECORD_TYPE].childs[objName].childs[rtItem].name);
            }
        }
        selectedPermissionValues = await InputFactory.createSingleSelectorInput(valuesToShow, 'Set ' + fileMetadataType.name + ' record type assignment');
    } else {
        selectedPermissionValues = await InputFactory.createMultiSelectorInput(editableFields, 'Set ' + fileMetadataType.name + ' permission values');
    }
    if (selectedPermissionValues !== undefined) {
        const compress = await InputFactory.createCompressSelector();
        if (compress) {
            const permissionValues = selectedPermissionValues.split(',');
            const profilesToEdit = selectedProfiles.split(',');
            for (const profileToEdit of profilesToEdit) {
                const profileMetadata = metadataTypes[METADATA_TYPES.PROFILE].childs[profileToEdit];
                const xmlRoot = XMLParser.parseXML(FileReader.readFileSync(profileMetadata.path));
                const uniqueFields = [];
                const checkedFields = [];
                const uncheckedFields = [];
                if (xmlRoot[METADATA_TYPES.PROFILE]) {
                    const profile = ProfileUtils.createProfile(xmlRoot[METADATA_TYPES.PROFILE]);
                    let exists = false;
                    let elementName = (objName && itemName && separator) ? objName + separator + itemName : ((objName) ? objName : itemName);
                    if (fileMetadataType.name === METADATA_TYPES.LAYOUT) {
                        if (selectedPermissionValues === 'Master') {
                            elementName = selectedPermissionValues;
                        } else {
                            elementName = objName + xmlElementData.xmlData.fields.recordType.separator + selectedPermissionValues;
                        }
                    }
                    for (const xmlElement of profile[xmlElementData.key]) {
                        if (fileMetadataType.name === METADATA_TYPES.LAYOUT) {
                            if (elementName === 'Master' && xmlElement.recordType === undefined && xmlElement[xmlElementData.xmlData.fieldKey].startsWith(objName)) {
                                exists = true;
                            } else if (xmlElement.recordType === elementName) {
                                exists = true;
                            }
                            if (exists) {
                                xmlElement[xmlElementData.xmlData.fieldKey] = objName + separator + itemName;
                                break;
                            }
                        } else {
                            if (xmlElement[xmlElementData.xmlData.fieldKey] === elementName) {
                                exists = true;
                                for (const fieldName of Object.keys(xmlElementData.xmlData.fields)) {
                                    const fieldData = xmlElementData.xmlData.fields[fieldName];
                                    if (fieldData.editable) {
                                        if (fileMetadataType.name === METADATA_TYPES.TAB) {
                                            xmlElement[fieldName] = fieldData.getValue(selectedPermissionValues);
                                        } else {
                                            if (permissionValues.includes(fieldName)) {
                                                xmlElement[fieldName] = true;
                                                checkedFields.push(fieldName);
                                            } else {
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
                        if (fileMetadataType.name === METADATA_TYPES.LAYOUT) {
                            obj[xmlElementData.xmlData.fieldKey] = objName + separator + itemName;
                            if (elementName !== 'Master') {
                                obj.recordType = elementName;
                            }
                        } else {
                            for (const fieldName of Object.keys(xmlElementData.xmlData.fields)) {
                                const fieldData = xmlElementData.xmlData.fields[fieldName];
                                if (fieldData.default === '{!value}')
                                    obj[fieldName] = (separator) ? (objName + separator + itemName) : (!objName ? itemName : objName);
                                if (fileMetadataType.name === METADATA_TYPES.TAB && fieldData.datatype === 'enum') {
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
                        profile[xmlElementData.key].push(obj);
                    }
                    MetadataUtils.handleUniqueFields(profile, xmlElementData, uniqueFields, objName, itemName);
                    MetadataUtils.handleControlledFields(profile, xmlElementData, checkedFields, objName, itemName);
                    MetadataUtils.handleControlledFields(profile, xmlElementData, uncheckedFields, objName, itemName);
                    xmlRoot[METADATA_TYPES.PROFILE] = profile;
                    FileWriter.createFileSync(profileMetadata.path, ProfileUtils.toXML(xmlRoot));
                    if (compress === 'Yes')
                        await ProcessManager.auraHelperCompressFile(profileMetadata.path, true);
                }
            }
        }

    }
}

function getXMLElementData(metadataTypeName) {
    for (const profileFieldKey of Object.keys(ProfileUtils.getXMLMetadata())) {
        const profileFieldData = ProfileUtils.getXMLMetadata()[profileFieldKey];
        if (profileFieldData.metadataType === metadataTypeName && profileFieldKey !== 'customSettingAccesses') {
            return profileFieldData;
        }
    }
    return undefined;
}

function getEditableFields(xmlElementFields, skipUniques) {
    const editableFields = [];
    for (const fieldKey of Object.keys(xmlElementFields.xmlData.fields)) {
        const fieldData = xmlElementFields.xmlData.fields[fieldKey];
        if (fieldData.editable) {
            if (skipUniques && fieldData.unique)
                continue;
            editableFields.push({
                name: fieldKey,
                type: fieldData.datatype,
                value: fieldData.default
            });
        }
    }
    return editableFields;
}