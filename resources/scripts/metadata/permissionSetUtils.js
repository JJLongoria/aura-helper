const Utils = require('./utils');
const XMLParser = require('../languages').XMLParser;

class PermissionSetUtils {

    static createPermissionSet(permissionSet) {
        let newPermissionSet = {};
        if (permissionSet) {
            newPermissionSet = Utils.prepareXML(permissionSet, PermissionSetUtils.createPermissionSet());
        } else {
            newPermissionSet = {
                applicationVisibilities: [],
                classAccesses: [],
                customMetadataTypeAccesses: [],
                customPermissions: [],
                customSettingAccesses: [],
                description: undefined,
                externalDataSourceAccesses: [],
                fieldPermissions: [],
                hasActivationRequired: undefined,
                label: undefined,
                license: undefined,
                objectPermissions: [],
                pageAccesses: [],
                recordTypeVisibilities: [],
                tabSettings: [],
                userLicense: undefined,
                userPermissions: [],
            };
        }
        return newPermissionSet;
    }

    static mergePermissionSetWithLocalData(permissionSet, storageMetadata) {
        if (permissionSet) {
            Object.keys(permissionSet).forEach(function (key) {
                let profileElement = permissionSet[key];
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
                            profileElement.push(PermissionSetUtils.createPermissionSetApplicationVisibility(application, false, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.application.toLowerCase().localeCompare(b.application.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                            profileElement.push(PermissionSetUtils.createPermissionSetApexClassAccess(apexClass, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.apexClass.toLowerCase().localeCompare(b.apexClass.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                                profileElement.push(PermissionSetUtils.createPermissionSetCustomMetadataTypeAccess(storageCustomMetadata.name, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                            profileElement.push(PermissionSetUtils.createPermissionSetCustomPermissions(customPermission, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                                profileElement.push(PermissionSetUtils.createPermissionSetCustomSettingAccesses(obj.name, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                                    profileElement.push(PermissionSetUtils.createPermissionSetFieldPermissions(storageObj.name + '.' + storageField, false, false));
                                }
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.field.toLowerCase().localeCompare(b.field.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                                profileElement.push(PermissionSetUtils.createPermissionSetObjectPermissions(storageObj.name, false, false, false, false, false, false));
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.object.toLowerCase().localeCompare(b.object.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                            profileElement.push(PermissionSetUtils.createPermissionSetApexPageAccess(storagePage, false));
                        }

                    }
                    profileElement.sort(function (a, b) {
                        return a.apexPage.toLowerCase().localeCompare(b.apexPage.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
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
                                        profileElement.push(PermissionSetUtils.createPermissionSetRecordTypeVisibility(storageObj.name + '.' + storageRecordType, false));
                                    }
                                }
                            }
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.recordType.toLowerCase().localeCompare(b.recordType.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
                } else if (key === 'tabSettings') {
                    for (const storageTabs of storageMetadata.tabs) {
                        let found = false;
                        for (const tab of profileElement) {
                            if (tab.tab === storageTabs) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(PermissionSetUtils.createPermissionSetTabSetting(storageTabs, 'DefaultOff'));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.tab.toLowerCase().localeCompare(b.tab.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
                } else if (key === 'userPermissions') {
                    for (const storagePermission of PermissionSetUtils.getAllUserPermissions()) {
                        let found = false;
                        for (const userPermission of profileElement) {
                            if (userPermission.name === storagePermission) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            profileElement.push(PermissionSetUtils.createPermissionSetUserPermission(storagePermission, false));
                        }
                    }
                    profileElement.sort(function (a, b) {
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                    });
                    permissionSet[key] = profileElement;
                }
            });
        }
        return permissionSet;
    }

    static createPermissionSetApplicationVisibility(application, visible, def) {
        return {
            application: application,
            visible: visible,
            default: def
        }
    }

    static createPermissionSetApexClassAccess(apexClass, enabled) {
        return {
            apexClass: apexClass,
            enabled: enabled
        };
    }

    static createPermissionSetCustomMetadataTypeAccess(name, enabled) {
        return {
            name: name,
            enabled: enabled
        };
    }

    static createPermissionSetCustomSettingAccesses(name, enabled) { 
        return {
            name: name,
            enabled: enabled
        };
    }

    static createPermissionSetCustomPermissions(name, enabled) {
        return {
            name: name,
            enabled: enabled
        }
    }

    static createPermissionSetExternalDataSourceAccess(enabled, externalDataSource) {
        return {
            enabled: enabled,
            externalDataSource: externalDataSource
        }
    }

    static createPermissionSetFieldPermissions(field, readable, editable) {
        return {
            field: field,
            readable: readable,
            editable: editable,
        };
    }

    static createPermissionSetObjectPermissions(object, allowRead, allowCreate, allowEdit, allowDelete, viewAllRecords, modifyAllRecords) {
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

    static createPermissionSetApexPageAccess(apexPage, enabled) {
        return {
            apexPage: apexPage,
            enabled: enabled
        };
    }

    static createPermissionSetRecordTypeVisibility(recordType, visible) {
        return {
            recordType: recordType,
            visible: visible,
        };
    }

    static createPermissionSetTabSetting(tab, visibility) {
        return {
            tab: tab,
            visibility: visibility,
        }
    }

    static createPermissionSetUserPermission(name, enabled) {
        return {
            name: name,
            enabled: enabled
        }
    }

    static toXML(permissionSet, compress) {
        let xmlLines = [];
        if (permissionSet) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (permissionSet.label)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', permissionSet.label));
                if (permissionSet.description)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', permissionSet.description));
                if (permissionSet.userLicense)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('userLicense', permissionSet.userLicense));
                if (permissionSet.license)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('license', permissionSet.license));
                if (permissionSet.hasActivationRequired !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasActivationRequired', permissionSet.hasActivationRequired));
                if (permissionSet.applicationVisibilities) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('applicationVisibilities', permissionSet.applicationVisibilities, true, 1));
                }
                if (permissionSet.classAccesses) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('classAccesses', permissionSet.classAccesses, true, 1));
                }
                if (permissionSet.customMetadataTypeAccesses) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customMetadataTypeAccesses', permissionSet.customMetadataTypeAccesses, true, 1));
                }
                if (permissionSet.customPermissions) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customPermissions', permissionSet.customPermissions, true, 1));
                }
                if (permissionSet.externalDataSourceAccesses) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('externalDataSourceAccesses', permissionSet.externalDataSourceAccesses, true, 1));
                }
                if (permissionSet.fieldPermissions) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldPermissions', permissionSet.fieldPermissions, true, 1));
                }
                if (permissionSet.objectPermissions) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('objectPermissions', permissionSet.objectPermissions, true, 1));
                }
                if (permissionSet.pageAccesses) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('pageAccesses', permissionSet.pageAccesses, true, 1));
                }
                if (permissionSet.recordTypeVisibilities) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('recordTypeVisibilities', permissionSet.recordTypeVisibilities, true, 1));
                }
                if (permissionSet.tabSettings) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('tabSettings', permissionSet.tabSettings, true, 1));
                }
                if (permissionSet.userPermissions) {
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('userPermissions', permissionSet.userPermissions, true, 1));
                }
                xmlLines.push('</PermissionSet>');
            } else {
                return XMLParser.toXML(permissionSet);
            }

        }
        return xmlLines.join('\n');
    }

    static getAllUserPermissions() {
        return ["AccessCMC", "ActivateContract", "ActivateOrder", "ActivitiesAccess", "AddDirectMessageMembers", "AllowLightningLogin", "AllowUniversalSearch", "AllowViewEditConvertedLeads", "AllowViewKnowledge", "ApexRestServices", "ApiEnabled", "ApiUserOnly", "ApproveContract", "AssignPermissionSets", "AssignTopics", "AssignUserToSkill", "AuthorApex", "BulkApiHardDelete", "BulkMacrosAllowed", "CanApproveFeedPost", "CanEditPrompts", "CanInsertFeedSystemFields", "CanUseNewDashboardBuilder", "CanVerifyComment", "ChangeDashboardColors", "ChatterComposeUiCodesnippet", "ChatterEditOwnPost", "ChatterEditOwnRecordPost", "ChatterFileLink", "ChatterInternalUser", "ChatterInviteExternalUsers", "ChatterOwnGroups", "CloseConversations", "ConfigCustomRecs", "ConnectOrgToEnvironmentHub", "ContentAdministrator", "ContentHubUser", "ContentWorkspaces", "ConvertLeads", "CreateContentSpace", "CreateCustomizeDashboards", "CreateCustomizeFilters", "CreateCustomizeReports", "CreateDashboardFolders", "CreateLtngTempFolder", "CreateLtngTempInPub", "CreatePackaging", "CreateReportFolders", "CreateReportInLightning", "CreateTopics", "CreateWorkBadgeDefinition", "CreateWorkspaces", "CustomSidebarOnAllPages", "CustomizeApplication", "DataExport", "DebugApex", "DelegatedTwoFactor", "DeleteActivatedContract", "DeleteTopics", "DistributeFromPersWksp", "EditActivatedOrders", "EditBrandTemplates", "EditCaseComments", "EditEvent", "EditHtmlTemplates", "EditKnowledge", "EditMyDashboards", "EditMyReports", "EditOppLineItemUnitPrice", "EditPublicDocuments", "EditPublicFilters", "EditPublicTemplates", "EditReadonlyFields", "EditTask", "EditTopics", "EmailMass", "EmailSingle", "EnableCommunityAppLauncher", "EnableNotifications", "ExportReport", "FeedPinning", "ForceTwoFactor", "GiveRecognitionBadge", "GovernNetworks", "HideReadByList", "IPRestrictRequests", "IdentityEnabled", "ImportCustomObjects", "ImportLeads", "ImportPersonal", "InboundMigrationToolsUser", "InstallPackaging", "LightningConsoleAllowedForUser", "LightningExperienceUser", "ListEmailSend", "LtngPromoReserved01UserPerm", "ManageAnalyticSnapshots", "ManageAuthProviders", "ManageBusinessHourHolidays", "ManageCallCenters", "ManageCases", "ManageCategories", "ManageCertificates", "ManageChatterMessages", "ManageContentPermissions", "ManageContentProperties", "ManageContentTypes", "ManageCustomPermissions", "ManageCustomReportTypes", "ManageDashbdsInPubFolders", "ManageDataCategories", "ManageDataIntegrations", "ManageDynamicDashboards", "ManageEmailClientConfig", "ManageExchangeConfig", "ManageHealthCheck", "ManageHubConnections", "ManageInteraction", "ManageInternalUsers", "ManageIpAddresses", "ManageKnowledge", "ManageKnowledgeImportExport", "ManageLeads", "ManageLoginAccessPolicies", "ManageMobile", "ManageNetworks", "ManagePackageLicenses", "ManagePasswordPolicies", "ManageProfilesPermissionsets", "ManagePropositions", "ManagePvtRptsAndDashbds", "ManageQuotas", "ManageRecommendationStrategies", "ManageRemoteAccess", "ManageReportsInPubFolders", "ManageRoles", "ManageSearchPromotionRules", "ManageSessionPermissionSets", "ManageSharing", "ManageSolutions", "ManageSubscriptions", "ManageSynonyms", "ManageTranslation", "ManageTwoFactor", "ManageUnlistedGroups", "ManageUsers", "MassInlineEdit", "MergeTopics", "ModerateChatter", "ModerateNetworkUsers", "ModifyAllData", "ModifyDataClassification", "ModifyMetadata", "NewReportBuilder", "OutboundMigrationToolsUser", "OverrideForecasts", "Packaging2", "PasswordNeverExpires", "PreventClassicExperience", "PrivacyDataAccess", "PublishPackaging", "QueryAllFiles", "RemoveDirectMessageMembers", "ResetPasswords", "RunFlow", "RunReports", "SandboxTestingInCommunityApp", "ScheduleJob", "ScheduleReports", "SelectFilesFromSalesforce", "SendAnnouncementEmails", "SendSitRequests", "ShareInternalArticles", "ShowCompanyNameAsUserBadge", "SolutionImport", "SubmitMacrosAllowed", "SubscribeDashboardRolesGrps", "SubscribeDashboardToOtherUsers", "SubscribeReportRolesGrps", "SubscribeReportToOtherUsers", "SubscribeReportsRunAsUser", "SubscribeToLightningDashboards", "SubscribeToLightningReports", "TraceXdsQueries", "TransactionalEmailSend", "TransferAnyCase", "TransferAnyEntity", "TransferAnyLead", "TwoFactorApi", "UseTeamReassignWizards", "UseWebLink", "ViewAllCustomSettings", "ViewAllData", "ViewAllForecasts", "ViewAllUsers", "ViewCaseInteraction", "ViewDataAssessment", "ViewDataCategories", "ViewEncryptedData", "ViewEventLogFiles", "ViewFlowUsageAndFlowEventData", "ViewHealthCheck", "ViewHelpLink", "ViewMyTeamsDashboards", "ViewPublicDashboards", "ViewPublicReports", "ViewRoles", "ViewSetup", "ViewUserPII"];
    }
}
module.exports = PermissionSetUtils;