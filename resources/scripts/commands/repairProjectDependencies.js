const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Metadata = require('../metadata');
const Config = require('../main/config');
const languages = require('../languages');
const MetadataFactory = Metadata.Factory;
const MetadataConnection = Metadata.Connection;
const MetadataUtils = Metadata.Utils;
const MetadataTypes = Metadata.MetadataTypes;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const CustomApplicationUtils = Metadata.CustomApplicationUtils;
const ProfileUtils = Metadata.ProfileUtils;
const ProgressLocation = vscode.ProgressLocation;
const window = vscode.window;
const AuraParser = languages.AuraParser;


exports.run = async function () {
    let metadataPath = Paths.getMetadataRootFolder();
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Repairing project dependencies",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async resolve => {
            progress.report({ message: "Getting Metadata from File System" });
            loadMetadataFromFileSystem(function (folderMetadataMap, metadataFromFileSystem) {
                Object.keys(folderMetadataMap).forEach(function (folder) {
                    let metadataType = folderMetadataMap[folder];
                    if (metadataType.xmlName === MetadataTypes.CUSTOM_APPLICATION) {
                        progress.report({ message: "Repairing Custom Application Dependencies" });
                        repairCustomApplicationsDependencies(metadataFromFileSystem[metadataType.xmlName], metadataPath + '/' + folder, metadataFromFileSystem);
                    } else if (metadataType.xmlName === MetadataTypes.PROFILE) {
                        progress.report({ message: "Repairing Profile Dependencies" });
                        repairProfileDependencies(metadataFromFileSystem[metadataType.xmlName], metadataPath + '/' + folder, metadataFromFileSystem);
                    } else if (metadataType.xmlName === MetadataTypes.PERMISSION_SET) {
                        progress.report({ message: "Repairing Permission Set Dependencies" });
                        repairPermissionSetDependencies(metadataFromFileSystem[metadataType.xmlName], metadataPath + '/' + folder, metadataFromFileSystem);
                    }
                    resolve();
                });
            });
        });
    });
}

function repairCustomApplicationsDependencies(customApps, folder, metadataFromFileSystem) {
    let customObjects = metadataFromFileSystem[MetadataTypes.CUSTOM_OBJECT].childs;
    let profiles = metadataFromFileSystem[MetadataTypes.PROFILE].childs;
    let recordTypes = metadataFromFileSystem[MetadataTypes.RECORD_TYPE].childs;
    let tabs = metadataFromFileSystem[MetadataTypes.TAB].childs;
    Object.keys(customApps.childs).forEach(function (key) {
        let app = customApps.childs[key];
        let filePath = folder + '/' + app.name + '.app-meta.xml';
        let root = AuraParser.parseXML(FileReader.readFileSync(filePath), true);
        let customApp = CustomApplicationUtils.createCustomApplication(root.CustomApplication);
        let actionsToRemove = [];
        let profileActionsToRemove = [];
        let tabsToRemove = [];
        let mappingsToRemove = [];
        let index = 0;
        let anyRemove = false;
        for (let actionOverride of customApp.actionOverrides) {
            if (actionOverride.pageOrSobjectType !== 'standard-home' && actionOverride.pageOrSobjectType !== 'record-home') {
                if (actionOverride.pageOrSobjectType && !customObjects[actionOverride.pageOrSobjectType])
                    actionsToRemove.push(index);
            }
            index++;
        }
        actionsToRemove = actionsToRemove.reverse();
        for (let actionIndex of actionsToRemove) {
            customApp.actionOverrides.splice(actionIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (let profileAction of customApp.profileActionOverrides) {
            if (profileAction.pageOrSobjectType !== 'standard-home' && profileAction.pageOrSobjectType !== 'record-home') {
                if (!customObjects[profileAction.pageOrSobjectType] && !profileActionsToRemove.includes(index))
                    profileActionsToRemove.push(index);
            }
            if (profileAction.pageOrSobjectType !== 'standard-home' && profileAction.pageOrSobjectType !== 'record-home') {
                let rtName = profileAction.recordType.substring((profileAction.pageOrSobjectType + '.').length);
                if ((!recordTypes[profileAction.pageOrSobjectType] || !recordTypes[profileAction.pageOrSobjectType].childs[rtName]) && !profileActionsToRemove.includes(index))
                    profileActionsToRemove.push(index);
            }
            if (!profiles[profileAction.profile] && !profileActionsToRemove.includes(index))
                profileActionsToRemove.push(index);
            index++;
        }
        profileActionsToRemove = profileActionsToRemove.reverse();
        for (let actionIndex of profileActionsToRemove) {
            customApp.profileActionOverrides.splice(actionIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (let tab of customApp.tabs) {
            if (!tabs[tab] && !tabsToRemove.includes(index) && tab.indexOf('standard-') === -1)
                tabsToRemove.push(index);
            index++;
        }
        tabsToRemove = tabsToRemove.reverse();
        for (let tabIndex of tabsToRemove) {
            customApp.tabs = customApp.tabs.splice(tabIndex, tabIndex + 1);
            anyRemove = true;
        }
        if (customApp.workspaceConfig && customApp.workspaceConfig.mappings) {
            customApp.workspaceConfig.mappings = MetadataUtils.forceArray(customApp.workspaceConfig.mappings);
            index = 0;
            for (const mapping of customApp.workspaceConfig.mappings) {
                if (!tabs[mapping.tab] && !mappingsToRemove.includes(index) && mapping.tab.indexOf('standard-') === -1)
                    mappingsToRemove.push(index);
                index++;
            }
            mappingsToRemove = mappingsToRemove.reverse();
            for (let mappingIndex of mappingsToRemove) {
                customApp.workspaceConfig.mappings = customApp.workspaceConfig.mappings.splice(mappingIndex, mappingIndex + 1);
                anyRemove = true;
            }
        }
        if (anyRemove) {
            let content = CustomApplicationUtils.toXML(customApp, true)
            FileWriter.createFileSync(filePath, content);
        }
    });
}

function repairProfileDependencies(profiles, folder, metadataFromFileSystem) {
    let customApps = metadataFromFileSystem[MetadataTypes.CUSTOM_APPLICATION].childs;
    let apexClasses = metadataFromFileSystem[MetadataTypes.APEX_CLASS].childs;
    let customObjects = metadataFromFileSystem[MetadataTypes.CUSTOM_OBJECT].childs;
    let customPermissions = metadataFromFileSystem[MetadataTypes.CUSTOM_PERMISSION].childs;
    let customFields = metadataFromFileSystem[MetadataTypes.CUSTOM_FIELD].childs;
    let flows = metadataFromFileSystem[MetadataTypes.FLOWS].childs;
    let layouts = metadataFromFileSystem[MetadataTypes.LAYOUT].childs;
    let apexPages = metadataFromFileSystem[MetadataTypes.APEX_PAGE].childs;
    let recordTypes = metadataFromFileSystem[MetadataTypes.RECORD_TYPE].childs;
    let tabs = metadataFromFileSystem[MetadataTypes.TAB].childs;
    let customMetadata = metadataFromFileSystem[MetadataTypes.CUSTOM_METADATA].childs;
    Object.keys(profiles.childs).forEach(function (key) {
        let profile = profiles.childs[key];
        let filePath = folder + '/' + profile.name + '.profile-meta.xml';
        let index = 0;
        let anyRemove = false;
        let appsToRemove = [];
        let classesToRemote = [];
        let customPermissionToRemove = [];
        let fieldsToRemove = [];
        let flowsToRemove = [];
        let layoutsToRemove = [];
        let objectsToRemove = [];
        let pagesToRemove = [];
        let recordTypesToRemove = [];
        let tabsToRemove = [];
        let customMetadataToRemove = [];
        let customSettingsToRemove = [];
        index = 0;
        for (const appVisibility of profile.applicationVisibilities) {
            if (!customApps[appVisibility.application] && !appsToRemove.includes(index))
                appsToRemove.push(index);
            index++;
        }
        appsToRemove = appsToRemove.reverse();
        for (let appIndex of appsToRemove) {
            profile.applicationVisibilities.splice(appIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const classAccess of profile.classAccesses) {
            if (!apexClasses[classAccess.apexClass] && !classesToRemote.includes(index))
                classesToRemote.push(index);
            index++;
        }
        classesToRemote = classesToRemote.reverse();
        for (let classIndex of classesToRemote) {
            profile.classAccesses.splice(classIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customMetadataAccess of profile.customMetadataTypeAccesses) {
            if (!customMetadata[customMetadataAccess.name] && !customMetadataToRemove.includes(index))
            customMetadataToRemove.push(index);
            index++;
        }
        customMetadataToRemove = customMetadataToRemove.reverse();
        for (let customMetadataIndex of customMetadataToRemove) {
            profile.customMetadataTypeAccesses.splice(customMetadataIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customPermission of profile.customPermissions) {
            if (!customPermissions[customPermission.name] && !customPermissionToRemove.includes(index))
                customPermissionToRemove.push(index);
            index++;
        }
        customPermissionToRemove = customPermissionToRemove.reverse();
        for (let permissionIndex of customPermissionToRemove) {
            profile.customPermissions.splice(permissionIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customSettingAccess of profile.customSettingAccesses) {
            if (!customObjects[customSettingAccess.name] && !customSettingsToRemove.includes(index))
                customSettingsToRemove.push(index);
            index++;
        }
        customSettingsToRemove = customSettingsToRemove.reverse();
        for (let customSettingIndex of customSettingsToRemove) {
            profile.customSettingAccesses.splice(customSettingIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const fieldPermission of profile.fieldPermissions) {
            let sObject = fieldPermission.field.substring(0, fieldPermission.field.indexOf('.'));
            let field = fieldPermission.field.substring(fieldPermission.field.indexOf('.') + 1);
            if ((!customFields[sObject] || !customFields[sObject].childs[field]) && !fieldsToRemove.includes(index))
                fieldsToRemove.push(index);
            index++;
        }
        fieldsToRemove = fieldsToRemove.reverse();
        for (let fieldIndex of fieldsToRemove) {
            profile.fieldPermissions.splice(fieldIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const flowAccess of profile.flowAccesses) {
            if (!flows[flowAccess.flow] && !flowsToRemove.includes(index))
                flowsToRemove.push(index);
            index++;
        }
        flowsToRemove = flowsToRemove.reverse();
        for (let flowIndex of flowsToRemove) {
            profile.flowAccesses.splice(flowIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const layoutAssignment of profile.layoutAssignments) {
            let sObject = layoutAssignment.layout.substring(0, layoutAssignment.layout.indexOf('-'));
            let layout = layoutAssignment.layout.substring(layoutAssignment.layout.indexOf('-') + 1);
            if ((!layouts[sObject] || !layouts[sObject].childs[layout]) && !layoutsToRemove.includes(index))
                layoutsToRemove.push(index);
            index++;
        }
        layoutsToRemove = layoutsToRemove.reverse();
        for (let layoutIndex of layoutsToRemove) {
            profile.layoutAssignments.splice(layoutIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const objectPermission of profile.objectPermissions) {
            if (!customObjects[objectPermission.object] && !objectsToRemove.includes(index))
                objectsToRemove.push(index);
            index++;
        }
        objectsToRemove = objectsToRemove.reverse();
        for (let objectIndex of objectsToRemove) {
            profile.objectPermissions.splice(objectIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const pageAccess of profile.pageAccesses) {
            if (!apexPages[pageAccess.page] && !pagesToRemove.includes(index))
                pagesToRemove.push(index);
            index++;
        }
        pagesToRemove = pagesToRemove.reverse();
        for (let pageIndex of pagesToRemove) {
            profile.pageAccesses.splice(pageIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const recordTypeVisibility of profile.recordTypeVisibilities) {
            let sObject = recordTypeVisibility.recordType.substring(0, recordTypeVisibility.recordType.indexOf('.'));
            let recordType = recordTypeVisibility.recordType.substring(recordTypeVisibility.recordType.indexOf('.') + 1);
            if ((!recordTypes[sObject] || !recordTypes[sObject].childs[recordType]) && !recordTypesToRemove.includes(index))
                recordTypesToRemove.push(index);
            index++;
        }
        recordTypesToRemove = recordTypesToRemove.reverse();
        for (let rtIndex of recordTypesToRemove) {
            profile.recordTypeVisibilities.splice(rtIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const tabVisibility of profile.tabVisibilities) {
            if (!tabs[tabVisibility.tab] && !tabsToRemove.includes(index))
                tabsToRemove.push(index);
            index++;
        }
        tabsToRemove = tabsToRemove.reverse();
        for (let tabIndex of tabsToRemove) {
            profile.tabVisibilities.splice(tabIndex, 1);
            anyRemove = true;
        }
        if (anyRemove) {
            let content = ProfileUtils.toXML(profile, true)
            FileWriter.createFileSync(filePath, content);
        }
    });
}

function repairPermissionSetDependencies(permissionSets, folder, metadataFromFileSystem) {
    let customApps = metadataFromFileSystem[MetadataTypes.CUSTOM_APPLICATION].childs;
    let apexClasses = metadataFromFileSystem[MetadataTypes.APEX_CLASS].childs;
    let customObjects = metadataFromFileSystem[MetadataTypes.CUSTOM_OBJECT].childs;
    let customPermissions = metadataFromFileSystem[MetadataTypes.CUSTOM_PERMISSION].childs;
    let customFields = metadataFromFileSystem[MetadataTypes.CUSTOM_FIELD].childs;
    let apexPages = metadataFromFileSystem[MetadataTypes.APEX_PAGE].childs;
    let recordTypes = metadataFromFileSystem[MetadataTypes.RECORD_TYPE].childs;
    let tabs = metadataFromFileSystem[MetadataTypes.TAB].childs;
    let customMetadata = metadataFromFileSystem[MetadataTypes.CUSTOM_METADATA].childs;
    Object.keys(permissionSets.childs).forEach(function (key) {
        let permissionSet = permissionSets.childs[key];
        let filePath = folder + '/' + permissionSet.name + '.profile-meta.xml';
        let index = 0;
        let anyRemove = false;
        let appsToRemove = [];
        let classesToRemote = [];
        let customPermissionToRemove = [];
        let fieldsToRemove = [];
        let objectsToRemove = [];
        let pagesToRemove = [];
        let recordTypesToRemove = [];
        let tabsToRemove = [];
        let customMetadataToRemove = [];
        let customSettingsToRemove = [];
        index = 0;
        for (const appVisibility of permissionSet.applicationVisibilities) {
            if (!customApps[appVisibility.application] && !appsToRemove.includes(index))
                appsToRemove.push(index);
            index++;
        }
        appsToRemove = appsToRemove.reverse();
        for (let appIndex of appsToRemove) {
            permissionSet.applicationVisibilities.splice(appIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const classAccess of permissionSet.classAccesses) {
            if (!apexClasses[classAccess.apexClass] && !classesToRemote.includes(index))
                classesToRemote.push(index);
            index++;
        }
        classesToRemote = classesToRemote.reverse();
        for (let classIndex of classesToRemote) {
            permissionSet.classAccesses.splice(classIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customMetadataAccess of permissionSet.customMetadataTypeAccesses) {
            if (!customMetadata[customMetadataAccess.name] && !customMetadataToRemove.includes(index))
            customMetadataToRemove.push(index);
            index++;
        }
        customMetadataToRemove = customMetadataToRemove.reverse();
        for (let customMetadataIndex of customMetadataToRemove) {
            permissionSet.customMetadataTypeAccesses.splice(customMetadataIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customPermission of permissionSet.customPermissions) {
            if (!customPermissions[customPermission.name] && !customPermissionToRemove.includes(index))
                customPermissionToRemove.push(index);
            index++;
        }
        customPermissionToRemove = customPermissionToRemove.reverse();
        for (let permissionIndex of customPermissionToRemove) {
            permissionSet.customPermissions.splice(permissionIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const customSettingAccess of permissionSet.customSettingAccesses) {
            if (!customObjects[customSettingAccess.name] && !customSettingsToRemove.includes(index))
                customSettingsToRemove.push(index);
            index++;
        }
        customSettingsToRemove = customSettingsToRemove.reverse();
        for (let customSettingIndex of customSettingsToRemove) {
            permissionSet.customSettingAccesses.splice(customSettingIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const fieldPermission of permissionSet.fieldPermissions) {
            let sObject = fieldPermission.field.substring(0, fieldPermission.field.indexOf('.'));
            let field = fieldPermission.field.substring(fieldPermission.field.indexOf('.') + 1);
            if ((!customFields[sObject] || !customFields[sObject].childs[field]) && !fieldsToRemove.includes(index))
                fieldsToRemove.push(index);
            index++;
        }
        fieldsToRemove = fieldsToRemove.reverse();
        for (let fieldIndex of fieldsToRemove) {
            permissionSet.fieldPermissions.splice(fieldIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const objectPermission of permissionSet.objectPermissions) {
            if (!customObjects[objectPermission.object] && !objectsToRemove.includes(index))
                objectsToRemove.push(index);
            index++;
        }
        objectsToRemove = objectsToRemove.reverse();
        for (let objectIndex of objectsToRemove) {
            permissionSet.objectPermissions.splice(objectIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const pageAccess of permissionSet.pageAccesses) {
            if (!apexPages[pageAccess.page] && !pagesToRemove.includes(index))
                pagesToRemove.push(index);
            index++;
        }
        pagesToRemove = pagesToRemove.reverse();
        for (let pageIndex of pagesToRemove) {
            permissionSet.pageAccesses.splice(pageIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const recordTypeVisibility of permissionSet.recordTypeVisibilities) {
            let sObject = recordTypeVisibility.recordType.substring(0, recordTypeVisibility.recordType.indexOf('.'));
            let recordType = recordTypeVisibility.recordType.substring(recordTypeVisibility.recordType.indexOf('.') + 1);
            if ((!recordTypes[sObject] || !recordTypes[sObject].childs[recordType]) && !recordTypesToRemove.includes(index))
                recordTypesToRemove.push(index);
            index++;
        }
        recordTypesToRemove = recordTypesToRemove.reverse();
        for (let rtIndex of recordTypesToRemove) {
            permissionSet.recordTypeVisibilities.splice(rtIndex, 1);
            anyRemove = true;
        }
        index = 0;
        for (const tabVisibility of permissionSet.tabSettings) {
            if (!tabs[tabVisibility.tab] && !tabsToRemove.includes(index))
                tabsToRemove.push(index);
            index++;
        }
        tabsToRemove = tabsToRemove.reverse();
        for (let tabIndex of tabsToRemove) {
            permissionSet.tabSettings.splice(tabIndex, 1);
            anyRemove = true;
        }
        if (anyRemove) {
            let content = ProfileUtils.toXML(permissionSet, true)
            FileWriter.createFileSync(filePath, content);
        }
    });
}

async function loadMetadataFromFileSystem(callback) {
    let user = await Config.getAuthUsername();
    MetadataConnection.getMetadataObjectsListFromOrg(user, false, undefined, undefined, function (metadataObjects) {
        let metadata = {};
        if (metadataObjects) {
            let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
            metadata = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
            callback.call(this, folderMetadataMap, metadata);
        }
    });
}
