const Utils = require('./utils');
const XMLParser = require('../languages').XMLParser;

class ProfileUtils {

    static createProfile(profile) {
        let result = {};
        if (profile) {
            result = ProfileUtils.createProfile();
            result = Utils.prepareXML(profile, result);
            if (!result.loginHours)
                result.loginHours = {};
            if (result.loginHours) {
                if (!result.loginHours.mondayStart)
                    result.loginHours.mondayStart = -1;
                if (!result.loginHours.mondayEnd)
                    result.loginHours.mondayEnd = -1;
                if (!result.loginHours.tuesdayStart)
                    result.loginHours.tuesdayStart = -1;
                if (!result.loginHours.tuesdayEnd)
                    result.loginHours.tuesdayEnd = -1;
                if (!result.loginHours.wednesdayStart)
                    result.loginHours.wednesdayStart = -1;
                if (!result.loginHours.wednesdayEnd)
                    result.loginHours.wednesdayEnd = -1;
                if (!result.loginHours.thursdayStart)
                    result.loginHours.thursdayStart = -1;
                if (!result.loginHours.thursdayEnd)
                    result.loginHours.thursdayEnd = -1;
                if (!result.loginHours.fridayStart)
                    result.loginHours.fridayStart = -1;
                if (!result.loginHours.fridayEnd)
                    result.loginHours.fridayEnd = -1;
                if (!result.loginHours.saturdayStart)
                    result.loginHours.saturdayStart = -1;
                if (!result.loginHours.saturdayEnd)
                    result.loginHours.saturdayEnd = -1;
                if (!result.loginHours.sundayStart)
                    result.loginHours.sundayStart = -1;
                if (!result.loginHours.sundayEnd)
                    result.loginHours.sundayEnd = -1;
            }
        } else {
            result = {
                description: undefined,
                userLicense: undefined,
                custom: undefined,
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
                fullName: undefined,
                layoutAssignments: [],
                loginHours: undefined,
                loginIpRanges: [],
                objectPermissions: [],
                pageAccesses: [],
                profileActionOverrides: [],
                recordTypeVisibilities: [],
                tabVisibilities: [],
                userPermissions: [],
            };
        }
        return result;
    }

    static mergeProfileWithLocalData(profile, storageMetadata) {
        if (profile) {
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
                            if (storageObj.recordTypes) {
                                for (const storageRecordType of storageObj.recordTypes) {
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
                            profileElement.push(ProfileUtils.getTabVisibilityObject(storageTabs, 'DefaultOff'));
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
            if (compress) {
                profileLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                profileLines.push('<Profile xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (profile.fullName)
                    profileLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', profile.fullName));
                if (profile.description)
                    profileLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', profile.description));
                if (profile.userLicense)
                    profileLines.push(Utils.getTabs(1) + Utils.getXMLTag('userLicense', profile.userLicense));
                if (profile.custom !== undefined)
                    profileLines.push(Utils.getTabs(1) + Utils.getXMLTag('custom', profile.custom));
                if (profile.applicationVisibilities) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('applicationVisibilities', profile.applicationVisibilities, true, 1));
                }
                if (profile.classAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('classAccesses', profile.classAccesses, true, 1));
                }
                if (profile.customMetadataTypeAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('customMetadataTypeAccesses', profile.customMetadataTypeAccesses, true, 1));
                }
                if (profile.customPermissions) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('customPermissions', profile.customPermissions, true, 1));
                }
                if (profile.customSettingAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('customSettingAccesses', profile.customSettingAccesses, true, 1));
                }
                if (profile.externalDataSourceAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('externalDataSourceAccesses', profile.externalDataSourceAccesses, true, 1));
                }
                if (profile.fieldPermissions) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('fieldPermissions', profile.fieldPermissions, true, 1));
                }
                if (profile.fieldLevelSecurities) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('fieldLevelSecurities', profile.fieldLevelSecurities, true, 1));
                }
                if (profile.flowAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('flowAccesses', profile.flowAccesses, true, 1));
                }
                if (profile.layoutAssignments) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('layoutAssignments', profile.layoutAssignments, true, 1));
                }
                if (profile.loginHours) {
                    profileLines.push('\t<loginHours>');
                    if (profile.loginHours.mondayStart != -1 && profile.loginHours.mondayStart != undefined)
                        profileLines.push('\t\t<mondayStart>' + profile.loginHours.mondayStart + '</mondayStart>');
                    if (profile.loginHours.mondayEnd != -1 && profile.loginHours.mondayEnd != undefined)
                        profileLines.push('\t\t<mondayEnd>' + profile.loginHours.mondayEnd + '</mondayEnd>');
                    if (profile.loginHours.tuesdayStart != -1 && profile.loginHours.tuesdayStart != undefined)
                        profileLines.push('\t\t<tuesdayStart>' + profile.loginHours.tuesdayStart + '</tuesdayStart>');
                    if (profile.loginHours.tuesdayEnd != -1 && profile.loginHours.tuesdayEnd != undefined)
                        profileLines.push('\t\t<tuesdayEnd>' + profile.loginHours.tuesdayEnd + '</tuesdayEnd>');
                    if (profile.loginHours.wednesdayStart != -1 && profile.loginHours.wednesdayStart != undefined)
                        profileLines.push('\t\t<wednesdayStart>' + profile.loginHours.wednesdayStart + '</wednesdayStart>');
                    if (profile.loginHours.wednesdayEnd != -1 && profile.loginHours.wednesdayEnd != undefined)
                        profileLines.push('\t\t<wednesdayEnd>' + profile.loginHours.wednesdayEnd + '</wednesdayEnd>');
                    if (profile.loginHours.thursdayStart != -1 && profile.loginHours.thursdayStart != undefined)
                        profileLines.push('\t\t<thursdayStart>' + profile.loginHours.thursdayStart + '</thursdayStart>');
                    if (profile.loginHours.thursdayEnd != -1 && profile.loginHours.thursdayEnd != undefined)
                        profileLines.push('\t\t<thursdayEnd>' + profile.loginHours.thursdayEnd + '</thursdayEnd>');
                    if (profile.loginHours.fridayStart != -1 && profile.loginHours.fridayStart != undefined)
                        profileLines.push('\t\t<fridayStart>' + profile.loginHours.fridayStart + '</fridayStart>');
                    if (profile.loginHours.fridayEnd != -1 && profile.loginHours.fridayEnd != undefined)
                        profileLines.push('\t\t<fridayEnd>' + profile.loginHours.fridayEnd + '</fridayEnd>');
                    if (profile.loginHours.saturdayStart != -1 && profile.loginHours.saturdayStart != undefined)
                        profileLines.push('\t\t<saturdayStart>' + profile.loginHours.saturdayStart + '</saturdayStart>');
                    if (profile.loginHours.saturdayEnd != -1 && profile.loginHours.saturdayEnd != undefined)
                        profileLines.push('\t\t<saturdayEnd>' + profile.loginHours.saturdayEnd + '</saturdayEnd>');
                    if (profile.loginHours.sundayStart != -1 && profile.loginHours.sundayStart != undefined)
                        profileLines.push('\t\t<sundayStart>' + profile.loginHours.sundayStart + '</sundayStart>');
                    if (profile.loginHours.sundayEnd != -1 && profile.loginHours.sundayEnd != undefined)
                        profileLines.push('\t\t<sundayEnd>' + profile.loginHours.sundayEnd + '</sundayEnd>');
                    profileLines.push('\t</loginHours>');
                }
                if (profile.loginIpRanges) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('loginIpRanges', profile.loginIpRanges, true, 1));
                }
                if (profile.objectPermissions) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('objectPermissions', profile.objectPermissions, true, 1));
                }
                if (profile.pageAccesses) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('pageAccesses', profile.pageAccesses, true, 1));
                }
                if (profile.profileActionOverrides) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('profileActionOverrides', profile.profileActionOverrides, true, 1));
                }
                if (profile.recordTypeVisibilities) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('recordTypeVisibilities', profile.recordTypeVisibilities, true, 1));
                }
                if (profile.tabVisibilities) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('tabVisibilities', profile.tabVisibilities, true, 1));
                }
                if (profile.userPermissions) {
                    profileLines = profileLines.concat(Utils.getXMLBlock('userPermissions', profile.userPermissions, true, 1));
                }
                profileLines.push('</Profile>');

            } else {
                return XMLParser.toXML(profile);
            }

        }
        return profileLines.join('\n');
    }

    static getAllUserPermissions() {
        return ["AccessCMC", "ActivateContract", "ActivateOrder", "ActivitiesAccess", "AddDirectMessageMembers", "AllowLightningLogin", "AllowUniversalSearch", "AllowViewEditConvertedLeads", "AllowViewKnowledge", "ApexRestServices", "ApiEnabled", "ApiUserOnly", "ApproveContract", "AssignPermissionSets", "AssignTopics", "AssignUserToSkill", "AuthorApex", "BulkApiHardDelete", "BulkMacrosAllowed", "CanApproveFeedPost", "CanEditPrompts", "CanInsertFeedSystemFields", "CanUseNewDashboardBuilder", "CanVerifyComment", "ChangeDashboardColors", "ChatterComposeUiCodesnippet", "ChatterEditOwnPost", "ChatterEditOwnRecordPost", "ChatterFileLink", "ChatterInternalUser", "ChatterInviteExternalUsers", "ChatterOwnGroups", "CloseConversations", "ConfigCustomRecs", "ConnectOrgToEnvironmentHub", "ContentAdministrator", "ContentHubUser", "ContentWorkspaces", "ConvertLeads", "CreateContentSpace", "CreateCustomizeDashboards", "CreateCustomizeFilters", "CreateCustomizeReports", "CreateDashboardFolders", "CreateLtngTempFolder", "CreateLtngTempInPub", "CreatePackaging", "CreateReportFolders", "CreateReportInLightning", "CreateTopics", "CreateWorkBadgeDefinition", "CreateWorkspaces", "CustomSidebarOnAllPages", "CustomizeApplication", "DataExport", "DebugApex", "DelegatedTwoFactor", "DeleteActivatedContract", "DeleteTopics", "DistributeFromPersWksp", "EditActivatedOrders", "EditBrandTemplates", "EditCaseComments", "EditEvent", "EditHtmlTemplates", "EditKnowledge", "EditMyDashboards", "EditMyReports", "EditOppLineItemUnitPrice", "EditPublicDocuments", "EditPublicFilters", "EditPublicTemplates", "EditReadonlyFields", "EditTask", "EditTopics", "EmailMass", "EmailSingle", "EnableCommunityAppLauncher", "EnableNotifications", "ExportReport", "FeedPinning", "ForceTwoFactor", "GiveRecognitionBadge", "GovernNetworks", "HideReadByList", "IPRestrictRequests", "IdentityEnabled", "ImportCustomObjects", "ImportLeads", "ImportPersonal", "InboundMigrationToolsUser", "InstallPackaging", "LightningConsoleAllowedForUser", "LightningExperienceUser", "ListEmailSend", "LtngPromoReserved01UserPerm", "ManageAnalyticSnapshots", "ManageAuthProviders", "ManageBusinessHourHolidays", "ManageCallCenters", "ManageCases", "ManageCategories", "ManageCertificates", "ManageChatterMessages", "ManageContentPermissions", "ManageContentProperties", "ManageContentTypes", "ManageCustomPermissions", "ManageCustomReportTypes", "ManageDashbdsInPubFolders", "ManageDataCategories", "ManageDataIntegrations", "ManageDynamicDashboards", "ManageEmailClientConfig", "ManageExchangeConfig", "ManageHealthCheck", "ManageHubConnections", "ManageInteraction", "ManageInternalUsers", "ManageIpAddresses", "ManageKnowledge", "ManageKnowledgeImportExport", "ManageLeads", "ManageLoginAccessPolicies", "ManageMobile", "ManageNetworks", "ManagePackageLicenses", "ManagePasswordPolicies", "ManageProfilesPermissionsets", "ManagePropositions", "ManagePvtRptsAndDashbds", "ManageQuotas", "ManageRecommendationStrategies", "ManageRemoteAccess", "ManageReportsInPubFolders", "ManageRoles", "ManageSearchPromotionRules", "ManageSessionPermissionSets", "ManageSharing", "ManageSolutions", "ManageSubscriptions", "ManageSynonyms", "ManageTranslation", "ManageTwoFactor", "ManageUnlistedGroups", "ManageUsers", "MassInlineEdit", "MergeTopics", "ModerateChatter", "ModerateNetworkUsers", "ModifyAllData", "ModifyDataClassification", "ModifyMetadata", "NewReportBuilder", "OutboundMigrationToolsUser", "OverrideForecasts", "Packaging2", "PasswordNeverExpires", "PreventClassicExperience", "PrivacyDataAccess", "PublishPackaging", "QueryAllFiles", "RemoveDirectMessageMembers", "ResetPasswords", "RunFlow", "RunReports", "SandboxTestingInCommunityApp", "ScheduleJob", "ScheduleReports", "SelectFilesFromSalesforce", "SendAnnouncementEmails", "SendSitRequests", "ShareInternalArticles", "ShowCompanyNameAsUserBadge", "SolutionImport", "SubmitMacrosAllowed", "SubscribeDashboardRolesGrps", "SubscribeDashboardToOtherUsers", "SubscribeReportRolesGrps", "SubscribeReportToOtherUsers", "SubscribeReportsRunAsUser", "SubscribeToLightningDashboards", "SubscribeToLightningReports", "TraceXdsQueries", "TransactionalEmailSend", "TransferAnyCase", "TransferAnyEntity", "TransferAnyLead", "TwoFactorApi", "UseTeamReassignWizards", "UseWebLink", "ViewAllCustomSettings", "ViewAllData", "ViewAllForecasts", "ViewAllUsers", "ViewCaseInteraction", "ViewDataAssessment", "ViewDataCategories", "ViewEncryptedData", "ViewEventLogFiles", "ViewFlowUsageAndFlowEventData", "ViewHealthCheck", "ViewHelpLink", "ViewMyTeamsDashboards", "ViewPublicDashboards", "ViewPublicReports", "ViewRoles", "ViewSetup", "ViewUserPII"];
    }
}
module.exports = ProfileUtils;