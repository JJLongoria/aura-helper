class ProfileUtils {

    static createProfile(profile) {
        let result = {};
        if (profile) {
            result = this.createProfile();
            let profileKeys = Object.keys(result);
            Object.keys(profile).forEach(function (key) {
                if (profileKeys.includes(key)) {
                    if (Array.isArray(profile[key]) || key === 'loginHours' || key === 'description' || key === 'userLicense' || key === 'custom')
                        result[key] = profile[key];
                    else
                        result[key].push(profile[key]);
                }
            });
            if (profile.loginHours) {
                if (!profile.loginHours.mondayStart)
                    profile.loginHours.mondayStart = -1;
                if (!profile.loginHours.mondayEnd)
                    profile.loginHours.mondayEnd = -1;
                if (!profile.loginHours.tuesdayStart)
                    profile.loginHours.tuesdayStart = -1;
                if (!profile.loginHours.tuesdayEnd)
                    profile.loginHours.tuesdayEnd = -1;
                if (!profile.loginHours.wednesdayStart)
                    profile.loginHours.wednesdayStart = -1;
                if (!profile.loginHours.wednesdayEnd)
                    profile.loginHours.wednesdayEnd = -1;
                if (!profile.loginHours.thursdayStart)
                    profile.loginHours.thursdayStart = -1;
                if (!profile.loginHours.thursdayEnd)
                    profile.loginHours.thursdayEnd = -1;
                if (!profile.loginHours.fridayStart)
                    profile.loginHours.fridayStart = -1;
                if (!profile.loginHours.fridayEnd)
                    profile.loginHours.fridayEnd = -1;
                if (!profile.loginHours.saturdayStart)
                    profile.loginHours.saturdayStart = -1;
                if (!profile.loginHours.saturdayEnd)
                    profile.loginHours.saturdayEnd = -1;
                if (!profile.loginHours.sundayStart)
                    profile.loginHours.sundayStart = -1;
                if (!profile.loginHours.sundayEnd)
                    profile.loginHours.sundayEnd = -1;
            }
        } else {
            result = {
                description: '',
                userLicense: '',
                custom: false,
                applicationVisibilities: [],
                categoryGroupVisibilities: [],
                classAccesses: [],
                customMetadataTypeAccesses: [],
                customPermissions: [],
                customSettingAccesses: [],
                externalDataSourceAccesses: [],
                fieldPermissions: [],
                fieldLevelSecurities: [],
                flowAccesses: [],
                layoutAssignments: [],
                loginHours: {},
                loginIpRanges: [],
                objectPermissions: [],
                pageAccesses: [],
                profileActionOverrides: [],
                recordTypeVisibilities: [],
                tabVisibilities: [],
                userPermissions: []
            };
        }
        return result;
    }

    static mergeProfileWithLocalData(profile, storageMetadata) {
        if (profile) {
            profile = ProfileUtils.createProfile(profile);
            Object.keys(profile).forEach(function (key) {
                let profileElement = profile[key];
                if (key === 'applicationVisibilities') {
                    for (const application of storageMetadata.applications) {
                        let found = false;
                        for (const appVisibility of profileElement) {
                            if (appVisibility.application === application) {
                                found = true;;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getApplicationVisibilityObject(application, false, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.application.toLowerCase().localeCompare(b.application.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'classAccesses') {
                    for (const apexClass of storageMetadata.classes) {
                        let found = false;
                        for (const classOnProfile of profileElement) {
                            if (classOnProfile.apexClass === apexClass) {
                                found = true;;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getClassAccessObject(apexClass, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.apexClass.toLowerCase().localeCompare(b.apexClass.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'customMetadataTypeAccesses') {
                    for (const storageCustomMetadata of storageMetadata.objects) {
                        if (storageCustomMetadata.isCustomMetadata) {
                            let found = false;
                            for (const customMetadata of profileElement) {
                                if (customMetadata.name === storageCustomMetadata) {
                                    found = true;;
                                    break;
                                }
                            }
                            if (!found) {
                                profileElement.push(ProfileUtils.getCustomMetadataAccessObject(storageCustomMetadata.name, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'customPermissions') {
                    for (const customPermission of storageMetadata.customPermissions) {
                        let found = false;
                        for (const permission of profileElement) {
                            if (permission.name === customPermission) {
                                found = true;;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getCustomPermissionObject(customPermission, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'customSettingAccesses') {
                    for (const obj of storageMetadata.objects) {
                        if (obj.isCustomSetting) {
                            let found = false;
                            for (const customSetting of profileElement) {
                                if (customSetting.name === obj.name) {
                                    found = true;;
                                    break;
                                }
                            }
                            if (!found) {
                                profileElement.push(ProfileUtils.getCustomSettingAccessObject(obj.name, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'externalDataSourceAccesses') {

                } else if (key === 'fieldPermissions') {
                    for (const storageObj of storageMetadata.objects) {
                        if (!storageObj.isCustomSetting && !storageObj.isCustomMetadata) {
                            for (const storageField of storageObj.fields) {
                                let found = false;
                                for (const field of profileElement) {
                                    if (field.field === storageObj.name + '.' + storageField) {
                                        found = true;;
                                        break;
                                    }
                                }
                                if (!found) {
                                    profileElement.push(ProfileUtils.getFieldPermissionObject(storageObj.name + '.' + storageField, false, false));
                                }
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.field.toLowerCase().localeCompare(b.field.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'fieldLevelSecurities') {

                } else if (key === 'flowAccesses') {
                    for (const storageFlow of storageMetadata.flows) {
                        let found = false;
                        for (const flow of profileElement) {
                            if (flow.flow === storageFlow) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getFlowAccessObject(storageFlow, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.flow.toLowerCase().localeCompare(b.flow.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'layoutAssignments') {
                    for (const storageLayout of storageMetadata.layouts) {
                        let found = false;
                        for (const layout of profileElement) {
                            if (layout.layout === storageLayout) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getLayoutAssignmentObject(storageLayout));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.layout.toLowerCase().localeCompare(b.layout.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'objectPermissions') {
                    for (const storageObj of storageMetadata.objects) {
                        if (!storageObj.isCustomSetting && !storageObj.isCustomMetadata) {
                            let found = false;
                            for (const object of profileElement) {
                                if (object.object === storageObj.name) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                profileElement.push(ProfileUtils.getObjectPermissionObject(storageObj.name, false, false, false, false, false, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.object.toLowerCase().localeCompare(b.object.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'pageAccesses') {
                    for (const storagePage of storageMetadata.pages) {
                        let found = false;
                        for (const page of profileElement) {
                            if (page.apexPage === storagePage) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getPageAccessObject(storagePage, false));
                        }

                    }
                    profileElement.sort(function (a, b) {
                        return a.apexPage.toLowerCase().localeCompare(b.apexPage.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'recordTypeVisibilities') {
                    for (const storageObj of storageMetadata.objects) {
                        if (!storageObj.isCustomSetting && !storageObj.isCustomMetadata) {
                            if (storageMetadata.objects.recordTypes) {
                                for (const storageRecordType of storageMetadata.objects.recordTypes) {
                                    let found = false;
                                    for (const recordType of profileElement) {
                                        if (recordType.recordType === storageObj.name + '.' + storageRecordType) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        profileElement.push(ProfileUtils.getRecordTypeVisibilityObject(storageObj.name + '.' + storageRecordType, false, false));
                                    }
                                }
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.recordType.toLowerCase().localeCompare(b.recordType.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'tabVisibilities') {
                    for (const storageTabs of storageMetadata.tabs) {
                        let found = false;
                        for (const tab of profileElement) {
                            if (tab.tab === storageTabs) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getTabVisibilityObject(storageTabs, 'Default Off'));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.tab.toLowerCase().localeCompare(b.tab.toLowerCase());
                    });
                    profile[key] = profileElement;
                } else if (key === 'userPermissions') {
                    for (const storagePermission of ProfileUtils.getAllUserPermissions()) {
                        let found = false;
                        for (const userPermission of profileElement) {
                            if (userPermission.name === storagePermission) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(ProfileUtils.getUserPermissionObject(storagePermission, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    profile[key] = profileElement;
                }
            });
        }
        return profile;
    }

    static getApplicationVisibilityObject(application, visible, def) {
        return {
            application: application,
            visible: visible,
            default: def
        }
    }

    static getClassAccessObject(apexClass, enabled) {
        return {
            apexClass: apexClass,
            enabled: enabled
        };
    }

    static getCustomMetadataAccessObject(name, enabled) {
        return {
            name: name,
            enabled: enabled
        };
    }

    static getCustomPermissionObject(name, enabled) {
        return {
            name: name,
            enabled: enabled
        }
    }

    static getCustomSettingAccessObject(name, enabled) {
        return {
            name: name,
            enabled: enabled
        }
    }

    static getFieldPermissionObject(field, readable, editable) {
        return {
            field: field,
            readable: readable,
            editable: editable,
        };
    }

    static getFlowAccessObject(flow, enabled) {
        return {
            flow: flow,
            enabled: enabled
        };
    }

    static getLayoutAssignmentObject(layout, recordType) {
        return {
            layout: layout,
            recordType: recordType
        };
    }

    static getObjectPermissionObject(object, allowRead, allowCreate, allowEdit, allowDelete, viewAllRecords, modifyAllRecords) {
        return {
            object: object,
            allowRead: allowRead,
            allowCreate: allowCreate,
            allowEdit: allowEdit,
            allowDelete: allowDelete,
            viewAllRecords: viewAllRecords,
            modifyAllRecords: modifyAllRecords
        }
    }

    static getPageAccessObject(apexPage, enabled) {
        return {
            apexPage: apexPage,
            enabled: enabled
        };
    }

    static getRecordTypeVisibilityObject(recordType, visible, def) {
        return {
            recordType: recordType,
            visible: visible,
            default: def
        };
    }

    static getTabVisibilityObject(tab, visibility) {
        return {
            tab: tab,
            visibility: visibility,
        }
    }

    static getUserPermissionObject(name, enabled) {
        return {
            name: name,
            enabled: enabled
        }
    }

    static getProfileSectionName(profileSection) {
        let profileSectionNames = {
            applicationVisibilities: "Application Visibilities",
            categoryGroupVisibilities: "Category Group Visibilities",
            classAccesses: "Class Accesses",
            customMetadataTypeAccesses: "Custom Metadata Type Accesses",
            customPermissions: "Custom Permissions",
            customSettingAccesses: "Custom Setting Accesses",
            externalDataSourceAccesses: "External Data Source Accesses",
            fieldPermissions: "Field Permissions",
            fieldLevelSecurities: "Field Level Security",
            flowAccesses: "Flow Accesses",
            layoutAssignments: "Layout Assignments",
            loginHours: "Login Hours",
            loginIpRanges: "Login IP Ranges",
            objectPermissions: "Object Permissions",
            pageAccesses: "Page Accesses",
            profileActionOverrides: "Profile Action Overrides",
            recordTypeVisibilities: "Record Type Visibilities",
            tabVisibilities: "Tab Visibilities",
            userPermissions: "User Permissions"
        };
        return profileSectionNames[profileSection];
    }

    static toXML(profile, compress) {
        let profileLines = [];
        if (profile) {
            profileLines.push('<?xml version="1.0" encoding="UTF-8"?>');
            profileLines.push('<Profile xmlns="http://soap.sforce.com/2006/04/metadata">');
            if (profile.description)
                profileLines.push('\t<description>' + profile.description + '</description>');
            if (profile.userLicense)
                profileLines.push('\t<userLicense>' + profile.userLicense + '</userLicense>');
            if (profile.custom !== undefined)
                profileLines.push('\t<custom>' + profile.custom + '</custom>');
            if (profile.applicationVisibilities) {
                for (const appVisibility of profile.applicationVisibilities) {
                    if (compress)
                        profileLines.push('\t<applicationVisibilities><application>' + appVisibility.application + '</application><default>' + appVisibility.default + '</default><visible>' + appVisibility.visible + '</visible></applicationVisibilities>');
                    else
                        profileLines.push('\t<applicationVisibilities>\n\t\t<application>' + appVisibility.application + '</application>\n\t\t<default>' + appVisibility.default + '</default>\n\t\t<visible>' + appVisibility.visible + '</visible>\n\t</applicationVisibilities>');
                }
            }
            if (profile.classAccesses) {
                for (const classAccess of profile.classAccesses) {
                    if (compress)
                        profileLines.push('\t<classAccesses><apexClass>' + classAccess.apexClass + '</apexClass><enabled>' + classAccess.enabled + '</enabled></classAccesses>');
                    else
                        profileLines.push('\t<classAccesses>\n\t\t<apexClass>' + classAccess.apexClass + '</apexClass>\n\t\t<enabled>' + classAccess.enabled + '</enabled>\n\t</classAccesses>');
                }
            }
            if (profile.customMetadataTypeAccesses) {
                for (const customMetadataAccess of profile.customMetadataTypeAccesses) {
                    if (compress)
                        profileLines.push('\t<customMetadataTypeAccesses><name>' + customMetadataAccess.name + '</name><enabled>' + customMetadataAccess.enabled + '</enabled></customMetadataTypeAccesses>');
                    else
                        profileLines.push('\t<customMetadataTypeAccesses>\n\t\t<name>' + customMetadataAccess.name + '</name>\n\t\t<enabled>' + customMetadataAccess.enabled + '</enabled>\n\t</customMetadataTypeAccesses>');
                }
            }
            if (profile.customPermissions) {
                for (const customPermission of profile.customPermissions) {
                    if (compress)
                        profileLines.push('\t<customPermissions><name>' + customPermission.name + '</name><enabled>' + customPermission.enabled + '</enabled></customPermissions>');
                    else
                        profileLines.push('\t<customPermissions>\n\t\t<name>' + customPermission.name + '</name>\n\t\t<enabled>' + customPermission.enabled + '</enabled>\n\t</customPermissions>');
                }
            }
            if (profile.customSettingAccesses) {
                for (const customSettingAccess of profile.customSettingAccesses) {
                    if (compress)
                        profileLines.push('\t<customSettingAccesses><name>' + customSettingAccess.name + '</name><enabled>' + customSettingAccess.enabled + '</enabled></customSettingAccesses>');
                    else
                        profileLines.push('\t<customSettingAccesses>\n\t\t<name>' + customSettingAccess.name + '</name>\n\t\t<enabled>' + customSettingAccess.enabled + '</enabled>\n\t</customSettingAccesses>');
                }
            }
            if (profile.externalDataSourceAccesses) {
                for (const externalDataSourceAccess of profile.externalDataSourceAccesses) {
                    if (compress)
                        profileLines.push('\t<externalDataSourceAccesses><externalDataSource>' + externalDataSourceAccess.externalDataSource + '</externalDataSource><enabled>' + externalDataSourceAccess.enabled + '</enabled></externalDataSourceAccesses>');
                    else
                        profileLines.push('\t<externalDataSourceAccesses>\n\t\t<externalDataSource>' + externalDataSourceAccess.externalDataSource + '</externalDataSource>\n\t\t<enabled>' + externalDataSourceAccess.enabled + '</enabled>\n\t</externalDataSourceAccesses>');
                }
            }
            if (profile.fieldPermissions) {
                for (const fieldPermission of profile.fieldPermissions) {
                    if (compress)
                        profileLines.push('\t<fieldPermissions><field>' + fieldPermission.field + '</field><readable>' + fieldPermission.readable + '</readable><editable>' + fieldPermission.editable + '</editable></fieldPermissions>');
                    else
                        profileLines.push('\t<fieldPermissions>\n\t\t<field>' + fieldPermission.field + '</field>\n\t\t<readable>' + fieldPermission.readable + '</readable>\n\t\t<editable>' + fieldPermission.editable + '</editable>\n\t</fieldPermissions>');
                }
            }
            if (profile.fieldLevelSecurities) {
                for (const fieldLevelSecurity of profile.fieldLevelSecurities) {
                    if (compress)
                        profileLines.push('\t<fieldLevelSecurities><field>' + fieldLevelSecurity.field + '</field><hidden>' + fieldLevelSecurity.hidden + '</editable><hidden>' + fieldLevelSecurity.readable + '</readable><editable>' + fieldLevelSecurity.editable + '</editable></fieldLevelSecurities>');
                    else
                        profileLines.push('\t<fieldLevelSecurities>\n\t\t<field>' + fieldLevelSecurity.field + '</field>\n\t\t<hidden>' + fieldLevelSecurity.hidden + '</editable>\n\t\t<hidden>' + fieldLevelSecurity.readable + '</readable>\n\t\t<editable>' + fieldLevelSecurity.editable + '</editable>\n\t</fieldLevelSecurities>');
                }
            }
            if (profile.flowAccesses) {
                for (const flowAccess of profile.flowAccesses) {
                    if (compress)
                        profileLines.push('\t<flowAccesses><flow>' + flowAccess.flow + '</flow><enabled>' + flowAccess.enabled + '</enabled></flowAccesses>');
                    else
                        profileLines.push('\t<flowAccesses>\n\t\t<flow>' + flowAccess.flow + '</flow>\n\t\t<enabled>' + flowAccess.enabled + '</enabled>\n\t</flowAccesses>');
                }
            }
            if (profile.layoutAssignments) {
                for (const layoutAssign of profile.layoutAssignments) {
                    if (compress) {
                        if (layoutAssign.recordType)
                            profileLines.push('\t<layoutAssignments><layout>' + layoutAssign.layout + '</layout><recordType>' + layoutAssign.recordType + '</recordType></layoutAssignments>');
                        else
                            profileLines.push('\t<layoutAssignments><layout>' + layoutAssign.layout + '</layout></layoutAssignments>');
                    } else {
                        if (layoutAssign.recordType)
                            profileLines.push('\t<layoutAssignments>\n\t\t<layout>' + layoutAssign.layout + '</layout>\n\t\t<recordType>' + layoutAssign.recordType + '</recordType>\n\t</layoutAssignments>');
                        else
                            profileLines.push('\t<layoutAssignments>\n\t\t<layout>' + layoutAssign.layout + '</layout>\n\t</layoutAssignments>');
                    }
                }
            }
            if (profile.loginHours) {
                profileLines.push('\t<loginHours>');
                if (profile.loginHours.mondayStart != -1)
                    profileLines.push('\t\t<mondayStart>' + profile.loginHours.mondayStart + '</mondayStart>');
                if (profile.loginHours.mondayEnd != -1)
                    profileLines.push('\t\t<mondayEnd>' + profile.loginHours.mondayEnd + '</mondayEnd>');
                if (profile.loginHours.tuesdayStart != -1)
                    profileLines.push('\t\t<tuesdayStart>' + profile.loginHours.tuesdayStart + '</tuesdayStart>');
                if (profile.loginHours.tuesdayEnd != -1)
                    profileLines.push('\t\t<tuesdayEnd>' + profile.loginHours.tuesdayEnd + '</tuesdayEnd>');
                if (profile.loginHours.wednesdayStart != -1)
                    profileLines.push('\t\t<wednesdayStart>' + profile.loginHours.wednesdayStart + '</wednesdayStart>');
                if (profile.loginHours.wednesdayEnd != -1)
                    profileLines.push('\t\t<wednesdayEnd>' + profile.loginHours.wednesdayEnd + '</wednesdayEnd>');
                if (profile.loginHours.thursdayStart != -1)
                    profileLines.push('\t\t<thursdayStart>' + profile.loginHours.thursdayStart + '</thursdayStart>');
                if (profile.loginHours.thursdayEnd != -1)
                    profileLines.push('\t\t<thursdayEnd>' + profile.loginHours.thursdayEnd + '</thursdayEnd>');
                if (profile.loginHours.fridayStart != -1)
                    profileLines.push('\t\t<fridayStart>' + profile.loginHours.fridayStart + '</fridayStart>');
                if (profile.loginHours.fridayEnd != -1)
                    profileLines.push('\t\t<fridayEnd>' + profile.loginHours.fridayEnd + '</fridayEnd>');
                if (profile.loginHours.saturdayStart != -1)
                    profileLines.push('\t\t<saturdayStart>' + profile.loginHours.saturdayStart + '</saturdayStart>');
                if (profile.loginHours.saturdayEnd != -1)
                    profileLines.push('\t\t<saturdayEnd>' + profile.loginHours.saturdayEnd + '</saturdayEnd>');
                if (profile.loginHours.sundayStart != -1)
                    profileLines.push('\t\t<sundayStart>' + profile.loginHours.sundayStart + '</sundayStart>');
                if (profile.loginHours.sundayEnd != -1)
                    profileLines.push('\t\t<sundayEnd>' + profile.loginHours.sundayEnd + '</sundayEnd>');
                profileLines.push('\t</loginHours>');
            }
            if (profile.loginIpRanges) {
                for (const ipRange of profile.loginIpRanges) {
                    if (compress) {
                        if (ipRange.description)
                            profileLines.push('\t<loginIpRanges><startAddress>' + ipRange.startAddress + '</startAddress><endAddress>' + ipRange.endAddress + '</endAddress><description>' + ipRange.description + '</description></loginIpRanges>');
                        else
                            profileLines.push('\t<loginIpRanges><startAddress>' + ipRange.startAddress + '</startAddress><endAddress>' + ipRange.endAddress + '</endAddress></loginIpRanges>');
                    } else {
                        if (ipRange.description)
                            profileLines.push('\t<loginIpRanges>\n\t\t<startAddress>' + ipRange.startAddress + '</startAddress>\n\t\t<endAddress>' + ipRange.endAddress + '</endAddress>\n\t\t<description>' + ipRange.description + '</description>\n\t</loginIpRanges>');
                        else
                            profileLines.push('\t<loginIpRanges>\n\t\t<startAddress>' + ipRange.startAddress + '</startAddress>\n\t\t<endAddress>' + ipRange.endAddress + '</endAddress>\n\t</loginIpRanges>');
                    }
                }
            }
            if (profile.objectPermissions) {
                for (const objPermission of profile.objectPermissions) {
                    if (compress)
                        profileLines.push('\t<objectPermissions><object>' + objPermission.object + '</object><allowRead>' + objPermission.allowRead + '</allowRead><allowCreate>' + objPermission.allowCreate + '</allowCreate><allowEdit>' + objPermission.allowEdit + '</allowEdit><allowDelete>' + objPermission.allowDelete + '</allowDelete><viewAllRecords>' + objPermission.viewAllRecords + '</viewAllRecords><modifyAllRecords>' + objPermission.modifyAllRecords + '</modifyAllRecords></objectPermissions>');
                    else
                        profileLines.push('\t<objectPermissions>\n\t\t<object>' + objPermission.object + '</object>\n\t\t<allowRead>' + objPermission.allowRead + '</allowRead>\n\t\t<allowCreate>' + objPermission.allowCreate + '</allowCreate>\n\t\t<allowEdit>' + objPermission.allowEdit + '</allowEdit>\n\t\t<allowDelete>' + objPermission.allowDelete + '</allowDelete>\n\t\t<viewAllRecords>' + objPermission.viewAllRecords + '</viewAllRecords>\n\t\t<modifyAllRecords>' + objPermission.modifyAllRecords + '</modifyAllRecords>\n\t</objectPermissions>');
                }
            }
            if (profile.pageAccesses) {
                for (const pageAccess of profile.pageAccesses) {
                    if (compress)
                        profileLines.push('\t<pageAccesses><apexPage>' + pageAccess.apexPage + '</apexPage><enabled>' + pageAccess.enabled + '</enabled></pageAccesses>');
                    else
                        profileLines.push('\t<pageAccesses>\n\t\t<apexPage>' + pageAccess.apexPage + '</apexPage>\n\t\t<enabled>' + pageAccess.enabled + '</enabled>\n\t</pageAccesses>');
                }
            }
            if (profile.profileActionOverrides) {
                for (const profileActionOverride of profile.profileActionOverrides) {
                    if (compress) {
                        if (profileActionOverride.content)
                            profileLines.push('\t<profileActionOverrides><actionName>' + profileActionOverride.actionName + '</actionName><type>' + profileActionOverride.type + '</type><content>' + profileActionOverride.content + '</content><formFactor>' + profileActionOverride.formFactor + '</formFactor><pageOrSobjectType>' + profileActionOverride.pageOrSobjectType + '</pageOrSobjectType><recordType>' + profileActionOverride.recordType + '</recordType></profileActionOverrides>');
                        else
                            profileLines.push('\t<profileActionOverrides><actionName>' + profileActionOverride.actionName + '</actionName><type>' + profileActionOverride.type + '</type><formFactor>' + profileActionOverride.formFactor + '</formFactor><pageOrSobjectType>' + profileActionOverride.pageOrSobjectType + '</pageOrSobjectType><recordType>' + profileActionOverride.recordType + '</recordType></profileActionOverrides>');
                    } else {
                        if (profileActionOverride.content)
                            profileLines.push('\t<profileActionOverrides>\n\t\t<actionName>' + profileActionOverride.actionName + '</actionName>\n\t\t<type>' + profileActionOverride.type + '</type>\n\t\t<content>' + profileActionOverride.content + '</content>\n\t\t<formFactor>' + profileActionOverride.formFactor + '</formFactor>\n\t\t<pageOrSobjectType>' + profileActionOverride.pageOrSobjectType + '</pageOrSobjectType>\n\t\t<recordType>' + profileActionOverride.recordType + '</recordType>\n\t</profileActionOverrides>');
                        else
                            profileLines.push('\t<profileActionOverrides>\n\t\t<actionName>' + profileActionOverride.actionName + '</actionName>\n\t\t<type>' + profileActionOverride.type + '</type>\n\t\t<formFactor>' + profileActionOverride.formFactor + '</formFactor>\n\t\t<pageOrSobjectType>' + profileActionOverride.pageOrSobjectType + '</pageOrSobjectType>\n\t\t<recordType>' + profileActionOverride.recordType + '</recordType>\n\t\t</profileActionOverrides>');
                    }
                }
            }
            if (profile.recordTypeVisibilities) {
                for (const rtVisibility of profile.recordTypeVisibilities) {
                    if (compress)
                        profileLines.push('\t<recordTypeVisibilities><recordType>' + rtVisibility.recordType + '</recordType><visible>' + rtVisibility.visible + '</visible><default>' + rtVisibility.default + '</default></recordTypeVisibilities>');
                    else
                        profileLines.push('\t<recordTypeVisibilities>\n\t\t<recordType>' + rtVisibility.recordType + '</recordType>\n\t\t<visible>' + rtVisibility.visible + '</visible>\n\t\t<default>' + rtVisibility.default + '</default>\n\t</recordTypeVisibilities>');
                }
            }
            if (profile.tabVisibilities) {
                for (const tabVisibility of profile.tabVisibilities) {
                    if (compress)
                        profileLines.push('\t<tabVisibilities><tab>' + tabVisibility.tab + '</tab><visibility>' + tabVisibility.visibility + '</visibility></tabVisibilities>');
                    else
                        profileLines.push('\t<tabVisibilities>\n\t\t<tab>' + tabVisibility.tab + '</tab>\n\t\t<visibility>' + tabVisibility.visibility + '</visibility>\n\t</tabVisibilities>');
                }
            }
            if (profile.userPermissions) {
                for (const userPermission of profile.userPermissions) {
                    if (compress)
                        profileLines.push('\t<userPermissions><name>' + userPermission.name + '</name><enabled>' + userPermission.enabled + '</enabled></userPermissions>');
                    else
                        profileLines.push('\t<userPermissions>\n\t\t<name>' + userPermission.name + '</name>\n\t\t<enabled>' + userPermission.enabled + '</enabled>\n\t</userPermissions>');
                }
            }
            profileLines.push('</Profile>');
        }
        return profileLines.join('\n');
    }

    static getAllUserPermissions() {
        return ["AccessCMC", "ActivateContract", "ActivateOrder", "ActivitiesAccess", "AddDirectMessageMembers", "AllowLightningLogin", "AllowUniversalSearch", "AllowViewEditConvertedLeads", "AllowViewKnowledge", "ApexRestServices", "ApiEnabled", "ApiUserOnly", "ApproveContract", "AssignPermissionSets", "AssignTopics", "AssignUserToSkill", "AuthorApex", "BulkApiHardDelete", "BulkMacrosAllowed", "CanApproveFeedPost", "CanEditPrompts", "CanInsertFeedSystemFields", "CanUseNewDashboardBuilder", "CanVerifyComment", "ChangeDashboardColors", "ChatterComposeUiCodesnippet", "ChatterEditOwnPost", "ChatterEditOwnRecordPost", "ChatterFileLink", "ChatterInternalUser", "ChatterInviteExternalUsers", "ChatterOwnGroups", "CloseConversations", "ConfigCustomRecs", "ConnectOrgToEnvironmentHub", "ContentAdministrator", "ContentHubUser", "ContentWorkspaces", "ConvertLeads", "CreateContentSpace", "CreateCustomizeDashboards", "CreateCustomizeFilters", "CreateCustomizeReports", "CreateDashboardFolders", "CreateLtngTempFolder", "CreateLtngTempInPub", "CreatePackaging", "CreateReportFolders", "CreateReportInLightning", "CreateTopics", "CreateWorkBadgeDefinition", "CreateWorkspaces", "CustomSidebarOnAllPages", "CustomizeApplication", "DataExport", "DebugApex", "DelegatedTwoFactor", "DeleteActivatedContract", "DeleteTopics", "DistributeFromPersWksp", "EditActivatedOrders", "EditBrandTemplates", "EditCaseComments", "EditEvent", "EditHtmlTemplates", "EditKnowledge", "EditMyDashboards", "EditMyReports", "EditOppLineItemUnitPrice", "EditPublicDocuments", "EditPublicFilters", "EditPublicTemplates", "EditReadonlyFields", "EditTask", "EditTopics", "EmailMass", "EmailSingle", "EnableCommunityAppLauncher", "EnableNotifications", "ExportReport", "FeedPinning", "ForceTwoFactor", "GiveRecognitionBadge", "GovernNetworks", "HideReadByList", "IPRestrictRequests", "IdentityEnabled", "ImportCustomObjects", "ImportLeads", "ImportPersonal", "InboundMigrationToolsUser", "InstallPackaging", "LightningConsoleAllowedForUser", "LightningExperienceUser", "ListEmailSend", "LtngPromoReserved01UserPerm", "ManageAnalyticSnapshots", "ManageAuthProviders", "ManageBusinessHourHolidays", "ManageCallCenters", "ManageCases", "ManageCategories", "ManageCertificates", "ManageChatterMessages", "ManageContentPermissions", "ManageContentProperties", "ManageContentTypes", "ManageCustomPermissions", "ManageCustomReportTypes", "ManageDashbdsInPubFolders", "ManageDataCategories", "ManageDataIntegrations", "ManageDynamicDashboards", "ManageEmailClientConfig", "ManageExchangeConfig", "ManageHealthCheck", "ManageHubConnections", "ManageInteraction", "ManageInternalUsers", "ManageIpAddresses", "ManageKnowledge", "ManageKnowledgeImportExport", "ManageLeads", "ManageLoginAccessPolicies", "ManageMobile", "ManageNetworks", "ManagePackageLicenses", "ManagePasswordPolicies", "ManageProfilesPermissionsets", "ManagePropositions", "ManagePvtRptsAndDashbds", "ManageQuotas", "ManageRecommendationStrategies", "ManageRemoteAccess", "ManageReportsInPubFolders", "ManageRoles", "ManageSearchPromotionRules", "ManageSessionPermissionSets", "ManageSharing", "ManageSolutions", "ManageSubscriptions", "ManageSynonyms", "ManageTranslation", "ManageTwoFactor", "ManageUnlistedGroups", "ManageUsers", "MassInlineEdit", "MergeTopics", "ModerateChatter", "ModerateNetworkUsers", "ModifyAllData", "ModifyDataClassification", "ModifyMetadata", "NewReportBuilder", "OutboundMigrationToolsUser", "OverrideForecasts", "Packaging2", "PasswordNeverExpires", "PreventClassicExperience", "PrivacyDataAccess", "PublishPackaging", "QueryAllFiles", "RemoveDirectMessageMembers", "ResetPasswords", "RunFlow", "RunReports", "SandboxTestingInCommunityApp", "ScheduleJob", "ScheduleReports", "SelectFilesFromSalesforce", "SendAnnouncementEmails", "SendSitRequests", "ShareInternalArticles", "ShowCompanyNameAsUserBadge", "SolutionImport", "SubmitMacrosAllowed", "SubscribeDashboardRolesGrps", "SubscribeDashboardToOtherUsers", "SubscribeReportRolesGrps", "SubscribeReportToOtherUsers", "SubscribeReportsRunAsUser", "SubscribeToLightningDashboards", "SubscribeToLightningReports", "TraceXdsQueries", "TransactionalEmailSend", "TransferAnyCase", "TransferAnyEntity", "TransferAnyLead", "TwoFactorApi", "UseTeamReassignWizards", "UseWebLink", "ViewAllCustomSettings", "ViewAllData", "ViewAllForecasts", "ViewAllUsers", "ViewCaseInteraction", "ViewDataAssessment", "ViewDataCategories", "ViewEncryptedData", "ViewEventLogFiles", "ViewFlowUsageAndFlowEventData", "ViewHealthCheck", "ViewHelpLink", "ViewMyTeamsDashboards", "ViewPublicDashboards", "ViewPublicReports", "ViewRoles", "ViewSetup", "ViewUserPII"];
    }
}
module.exports = ProfileUtils;