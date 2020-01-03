const Utils = require('./utils');
const AuraParser = require('../languages').AuraParser;

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
                description: undefined,
                externalDataSourceAccesses: [],
                fieldPermissions: [],
                fieldLevelSecurities: [],
                flowAccesses: [],
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

    static toXML(profile, compress) {
        let xmlLines = [];
        if (profile) {
            if (compress) {
                xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
                xmlLines.push('<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">');
                if (profile.label)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', profile.label));
                if (profile.description)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', profile.description));
                if (profile.userLicense)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('userLicense', profile.userLicense));
                if (profile.license)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('license', profile.license));
                if (profile.hasActivationRequired !== undefined)
                    xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasActivationRequired', profile.hasActivationRequired));
                if (profile.applicationVisibilities) {
                    Utils.sort(profile.applicationVisibilities, ['application']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('applicationVisibilities', profile.applicationVisibilities, true, 1));
                }
                if (profile.classAccesses) {
                    Utils.sort(profile.classAccesses, ['apexClass']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('classAccesses', profile.classAccesses, true, 1));
                }
                if (profile.customMetadataTypeAccesses) {
                    Utils.sort(profile.customMetadataTypeAccesses, ['name']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customMetadataTypeAccesses', profile.customMetadataTypeAccesses, true, 1));
                }
                if (profile.customPermissions) {
                    Utils.sort(profile.customPermissions, ['name']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('customPermissions', profile.customPermissions, true, 1));
                }
                if (profile.externalDataSourceAccesses) {
                    Utils.sort(profile.externalDataSourceAccesses, ['externalDataSource']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('externalDataSourceAccesses', profile.externalDataSourceAccesses, true, 1));
                }
                if (profile.fieldPermissions) {
                    Utils.sort(profile.fieldPermissions, ['field']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('fieldPermissions', profile.fieldPermissions, true, 1));
                }
                if (profile.objectPermissions) {
                    Utils.sort(profile.objectPermissions, ['object']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('objectPermissions', profile.objectPermissions, true, 1));
                }
                if (profile.pageAccesses) {
                    Utils.sort(profile.pageAccesses, ['apexPage']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('pageAccesses', profile.pageAccesses, true, 1));
                }
                if (profile.recordTypeVisibilities) {
                    Utils.sort(profile.recordTypeVisibilities, ['recordType']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('recordTypeVisibilities', profile.recordTypeVisibilities, true, 1));
                }
                if (profile.tabSettings) {
                    Utils.sort(profile.tabVisibilities, ['tab']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('tabSettings', profile.tabSettings, true, 1));
                }
                if (profile.userPermissions) {
                    Utils.sort(profile.userPermissions, ['name']);
                    xmlLines = xmlLines.concat(Utils.getXMLBlock('userPermissions', profile.userPermissions, true, 1));
                }
                xmlLines.push('</PermissionSet>');
            } else {
                return AuraParser.toXML(profile);
            }

        }
        return xmlLines.join('\n');
    }

    static getAllUserPermissions() {
        return ["AccessCMC", "ActivateContract", "ActivateOrder", "ActivitiesAccess", "AddDirectMessageMembers", "AllowLightningLogin", "AllowUniversalSearch", "AllowViewEditConvertedLeads", "AllowViewKnowledge", "ApexRestServices", "ApiEnabled", "ApiUserOnly", "ApproveContract", "AssignPermissionSets", "AssignTopics", "AssignUserToSkill", "AuthorApex", "BulkApiHardDelete", "BulkMacrosAllowed", "CanApproveFeedPost", "CanEditPrompts", "CanInsertFeedSystemFields", "CanUseNewDashboardBuilder", "CanVerifyComment", "ChangeDashboardColors", "ChatterComposeUiCodesnippet", "ChatterEditOwnPost", "ChatterEditOwnRecordPost", "ChatterFileLink", "ChatterInternalUser", "ChatterInviteExternalUsers", "ChatterOwnGroups", "CloseConversations", "ConfigCustomRecs", "ConnectOrgToEnvironmentHub", "ContentAdministrator", "ContentHubUser", "ContentWorkspaces", "ConvertLeads", "CreateContentSpace", "CreateCustomizeDashboards", "CreateCustomizeFilters", "CreateCustomizeReports", "CreateDashboardFolders", "CreateLtngTempFolder", "CreateLtngTempInPub", "CreatePackaging", "CreateReportFolders", "CreateReportInLightning", "CreateTopics", "CreateWorkBadgeDefinition", "CreateWorkspaces", "CustomSidebarOnAllPages", "CustomizeApplication", "DataExport", "DebugApex", "DelegatedTwoFactor", "DeleteActivatedContract", "DeleteTopics", "DistributeFromPersWksp", "EditActivatedOrders", "EditBrandTemplates", "EditCaseComments", "EditEvent", "EditHtmlTemplates", "EditKnowledge", "EditMyDashboards", "EditMyReports", "EditOppLineItemUnitPrice", "EditPublicDocuments", "EditPublicFilters", "EditPublicTemplates", "EditReadonlyFields", "EditTask", "EditTopics", "EmailMass", "EmailSingle", "EnableCommunityAppLauncher", "EnableNotifications", "ExportReport", "FeedPinning", "ForceTwoFactor", "GiveRecognitionBadge", "GovernNetworks", "HideReadByList", "IPRestrictRequests", "IdentityEnabled", "ImportCustomObjects", "ImportLeads", "ImportPersonal", "InboundMigrationToolsUser", "InstallPackaging", "LightningConsoleAllowedForUser", "LightningExperienceUser", "ListEmailSend", "LtngPromoReserved01UserPerm", "ManageAnalyticSnapshots", "ManageAuthProviders", "ManageBusinessHourHolidays", "ManageCallCenters", "ManageCases", "ManageCategories", "ManageCertificates", "ManageChatterMessages", "ManageContentPermissions", "ManageContentProperties", "ManageContentTypes", "ManageCustomPermissions", "ManageCustomReportTypes", "ManageDashbdsInPubFolders", "ManageDataCategories", "ManageDataIntegrations", "ManageDynamicDashboards", "ManageEmailClientConfig", "ManageExchangeConfig", "ManageHealthCheck", "ManageHubConnections", "ManageInteraction", "ManageInternalUsers", "ManageIpAddresses", "ManageKnowledge", "ManageKnowledgeImportExport", "ManageLeads", "ManageLoginAccessPolicies", "ManageMobile", "ManageNetworks", "ManagePackageLicenses", "ManagePasswordPolicies", "ManageProfilesPermissionsets", "ManagePropositions", "ManagePvtRptsAndDashbds", "ManageQuotas", "ManageRecommendationStrategies", "ManageRemoteAccess", "ManageReportsInPubFolders", "ManageRoles", "ManageSearchPromotionRules", "ManageSessionPermissionSets", "ManageSharing", "ManageSolutions", "ManageSubscriptions", "ManageSynonyms", "ManageTranslation", "ManageTwoFactor", "ManageUnlistedGroups", "ManageUsers", "MassInlineEdit", "MergeTopics", "ModerateChatter", "ModerateNetworkUsers", "ModifyAllData", "ModifyDataClassification", "ModifyMetadata", "NewReportBuilder", "OutboundMigrationToolsUser", "OverrideForecasts", "Packaging2", "PasswordNeverExpires", "PreventClassicExperience", "PrivacyDataAccess", "PublishPackaging", "QueryAllFiles", "RemoveDirectMessageMembers", "ResetPasswords", "RunFlow", "RunReports", "SandboxTestingInCommunityApp", "ScheduleJob", "ScheduleReports", "SelectFilesFromSalesforce", "SendAnnouncementEmails", "SendSitRequests", "ShareInternalArticles", "ShowCompanyNameAsUserBadge", "SolutionImport", "SubmitMacrosAllowed", "SubscribeDashboardRolesGrps", "SubscribeDashboardToOtherUsers", "SubscribeReportRolesGrps", "SubscribeReportToOtherUsers", "SubscribeReportsRunAsUser", "SubscribeToLightningDashboards", "SubscribeToLightningReports", "TraceXdsQueries", "TransactionalEmailSend", "TransferAnyCase", "TransferAnyEntity", "TransferAnyLead", "TwoFactorApi", "UseTeamReassignWizards", "UseWebLink", "ViewAllCustomSettings", "ViewAllData", "ViewAllForecasts", "ViewAllUsers", "ViewCaseInteraction", "ViewDataAssessment", "ViewDataCategories", "ViewEncryptedData", "ViewEventLogFiles", "ViewFlowUsageAndFlowEventData", "ViewHealthCheck", "ViewHelpLink", "ViewMyTeamsDashboards", "ViewPublicDashboards", "ViewPublicReports", "ViewRoles", "ViewSetup", "ViewUserPII"];
    }
}
module.exports = PermissionSetUtils;