const Utils = require('./utils');
const MetadataTypes = require('./metadataTypes');
const XMLParser = require('../languages').XMLParser;

const XML_METADATA = {
    label: {
        key: "label",
        label: "Label",
        editable: false,
        datatype: "string",
        minApi: 1,
        maxApi: -1, // -1 means actual api version
    },
    userLicense: {
        key: "userLicense",
        label: "User License",
        editable: false,
        datatype: "string",
        minApi: 38,
        maxApi: -1,
    },
    license: {
        key: "license",
        label: "License",
        editable: false,
        datatype: "string",
        minApi: 1,
        maxApi: 37,
    },
    description: {
        key: "description",
        label: "Description",
        editable: true,
        datatype: "string",
        minApi: 1,
        maxApi: -1,
    },
    hasActivationRequired: {
        key: "hasActivationRequired",
        label: "Has Activation Required",
        editable: false,
        datatype: 'boolean',
        minApi: 37,
        maxApi: -1,
    },
    applicationVisibilities: {
        key: "applicationVisibilities",
        label: "Application Visibilities",
        editable: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_APPLICATION,
        minApi: 1,
        maxApi: -1,
        xmlData: {
            fieldKey: "application",
            sortOrder: ["application"],
            fields: {
                application: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
                visible: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
            }
        },
        create: function (application, visible) {
            return {
                application: application,
                visible: (visible) ? visible : false,
            }
        },
    },
    classAccesses: {
        key: "classAccesses",
        label: "Class Accesses",
        editable: true,
        datatype: 'array',
        metadataType: MetadataTypes.APEX_CLASS,
        minApi: 1,
        maxApi: -1,
        xmlData: {
            fieldKey: "apexClass",
            sortOrder: ["apexClass"],
            fields: {
                apexClass: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
            }
        },
        create: function (apexClass, enabled) {
            return {
                apexClass: apexClass,
                enabled: (enabled) ? enabled : false,
            };
        },
    },
    customMetadataTypeAccesses: {
        key: "customMetadataTypeAccesses",
        label: "Custom Metadata Type Accesses",
        editable: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_METADATA,
        minApi: 47,
        maxApi: -1,
        xmlData: {
            fieldKey: "name",
            sortOrder: ["name"],
            fields: {
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                name: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
            }
        },
        create: function (name, enabled) {
            return {
                enabled: (enabled) ? enabled : false,
                name: name,
            };
        }
    },
    customPermissions: {
        key: "customPermissions",
        label: "Custom Permissions",
        editable: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_PERMISSION,
        minApi: 31,
        maxApi: -1,
        xmlData: {
            fieldKey: "name",
            sortOrder: ["name"],
            fields: {
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                name: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
            }
        },
        create: function (name, enabled) {
            return {
                enabled: (enabled) ? enabled : false,
                name: name,
            };
        },
    },
    customSettingAccesses: {
        key: "customSettingAccesses",
        label: "Custom Settings Accesses",
        editable: true,
        merge: false,
        datatype: 'array',
        minApi: 47,
        maxApi: -1,
        metadataType: MetadataTypes.CUSTOM_OBJECT,
        xmlData: {
            fieldKey: "name",
            sortOrder: ["name"],
            fields: {
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                name: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
            }
        },
        create: function (name, enabled) {
            return {
                enabled: (enabled) ? enabled : false,
                name: name,
            };
        },
    },
    externalDataSourceAccesses: {
        key: "externalDataSourceAccesses",
        label: "External Data Source Accesses",
        editable: true,
        datatype: 'array',
        minApi: 27,
        maxApi: -1,
        metadataType: MetadataTypes.EXTERNAL_DATA_SOURCE,
        xmlData: {
            fieldKey: "externalDataSource",
            sortOrder: ["externalDataSource"],
            fields: {
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                externalDataSource: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}'
                },
            }
        },
        create: function (externalDataSource, enabled) {
            return {
                enabled: (enabled) ? enabled : false,
                externalDataSource: externalDataSource,
            };
        },
    },
    fieldPermissions: {
        key: "fieldPermissions",
        label: "Field Permissions",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_FIELDS,
        minApi: 23,
        maxApi: -1,
        xmlData: {
            fieldKey: "field",
            sortOrder: ["field"],
            fields: {
                readable: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                field: {
                    datatype: "string",
                    separator: ".",
                    unique: true,
                    editable: false,
                    default: "{!value}",
                },
                editable: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "readable",
                            valueToCompare: true,
                            valueToSet: true
                        }
                    ]
                },
            }
        },
        create: function (field, readable, editable) {
            return {
                editable: (editable) ? editable : false,
                field: field,
                readable: (readable) ? readable : false,
            };
        },
    },
    objectPermissions: {
        key: "objectPermissions",
        label: "Object Permissions",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_OBJECT,
        minApi: 1,
        maxApi: -1,
        xmlData: {
            fieldKey: "object",
            sortOrder: ["object"],
            fields: {
                allowRead: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                    controlledFields: [
                        {
                            field: "allowCreate",
                            valueToCompare: false,
                            valueToSet: false
                        },
                        {
                            field: "allowEdit",
                            valueToCompare: false,
                            valueToSet: false
                        },
                        {
                            field: "allowDelete",
                            valueToCompare: false,
                            valueToSet: false
                        },
                        {
                            field: "viewAllRecords",
                            valueToCompare: false,
                            valueToSet: false
                        },
                        {
                            field: "modifyAllRecords",
                            valueToCompare: false,
                            valueToSet: false
                        }
                    ]
                },
                allowCreate: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                    controlledFields: [
                        {
                            field: "allowRead",
                            valueToCompare: true,
                            valueToSet: true
                        }
                    ]
                },
                allowEdit: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                    controlledFields: [
                        {
                            field: "allowRead",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "allowDelete",
                            valueToCompare: false,
                            valueToSet: false
                        },
                        {
                            field: "modifyAllRecords",
                            valueToCompare: false,
                            valueToSet: false
                        }
                    ]
                },
                allowDelete: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "allowRead",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "allowEdit",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "modifyAllRecords",
                            valueToCompare: false,
                            valueToSet: false
                        }
                    ]
                },
                viewAllRecords: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "allowRead",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "modifyAllRecords",
                            valueToCompare: false,
                            valueToSet: false
                        }
                    ]
                },
                object: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
                modifyAllRecords: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "allowRead",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "allowEdit",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "allowDelete",
                            valueToCompare: true,
                            valueToSet: true
                        },
                        {
                            field: "viewAllRecords",
                            valueToCompare: true,
                            valueToSet: true
                        }
                    ]
                },
            }
        },
        create: function (object, allowRead, allowCreate, allowEdit, allowDelete, viewAllRecords, modifyAllRecords) {
            return {
                allowCreate: (allowCreate) ? allowCreate : false,
                allowDelete: (allowDelete) ? allowDelete : false,
                allowEdit: (allowEdit) ? allowEdit : false,
                allowRead: (allowRead) ? allowRead : false,
                modifyAllRecords: (modifyAllRecords) ? modifyAllRecords : false,
                object: object,
                viewAllRecords: (viewAllRecords) ? viewAllRecords : false
            };
        },
    },
    pageAccesses: {
        key: "pageAccesses",
        label: "Visualforce Accesses",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.APEX_PAGE,
        minApi: 1,
        maxApi: -1,
        xmlData: {
            fieldKey: "apexPage",
            sortOrder: ["apexPage"],
            fields: {
                apexPage: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}'
                },
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
            }
        },
        create: function (apexPage, enabled) {
            return {
                apexPage: apexPage,
                enabled: (enabled) ? enabled : false,
            };
        },
    },
    recordTypeVisibilities: {
        key: "recordTypeVisibilities",
        label: "Record Type Visibilities",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.RECORD_TYPE,
        minApi: 29,
        maxApi: -1,
        xmlData: {
            fieldKey: "recordType",
            sortOrder: ["recordType"],
            fields: {
                recordType: {
                    datatype: "string",
                    separator: ".",
                    unique: true,
                    editable: false,
                    default: "{!value}",
                },
                visible: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true
                },
            }
        },
        create: function (recordType, visible) {
            return {
                recordType: recordType,
                visible: (visible) ? visible : false,
            };
        },
    },
    tabSettings: {
        key: "tabSettings",
        label: "Tab Settings",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.TAB,
        minApi: 1,
        maxApi: -1,
        xmlData: {
            fieldKey: "tab",
            sortOrder: ["tab"],
            fields: {
                tab: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: "{!value}",
                },
                visibility: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: "DefaultOn",
                    values: [
                        {
                            label: "Default On",
                            value: "DefaultOn",
                        },
                        {
                            label: "Default Off",
                            value: "DefaultOff",
                        },
                        {
                            label: "Hidden",
                            value: "Hidden",
                        }
                    ],
                    getValue: function (label) {
                        for (let enumVal of this.values) {
                            if (enumVal.label === label)
                                return enumVal.value;
                        }
                        return undefined;
                    },
                    getLabel: function (value) {
                        for (let enumVal of this.values) {
                            if (enumVal.value === value)
                                return enumVal.label;
                        }
                        return undefined;
                    }
                },
            }
        },
        create: function (tab, visibility) {
            return {
                tab: tab,
                visibility: (visibility) ? visibility : false,
            };
        },
    },
    userPermissions: {
        key: "userPermissions",
        label: "User Permissions",
        editable: true,
        merge: false,
        datatype: 'array',
        minApi: 29,
        maxApi: -1,
        xmlData: {
            fieldKey: "name",
            sortOrder: ["name"],
            fields: {
                enabled: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: true,
                },
                name: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
            }
        },
        create: function (name, enabled) {
            return {
                enabled: (enabled) ? enabled : false,
                name: name,
            };
        },
    }
}

class PermissionSetUtils {

    static getXMLMetadata() {
        return XML_METADATA;
    }

    static createPermissionSet(permissionSet) {
        let result = {};
        if (permissionSet) {
            result = Utils.prepareXML(permissionSet, PermissionSetUtils.createPermissionSet());
            Object.keys(result).forEach(function (elementKey) {
                if (Array.isArray(result[elementKey])) {
                    let elementData = XML_METADATA[elementKey];
                    Utils.sort(result[elementKey], elementData.xmlData.sortOrder);
                }
            });
        } else {
            result = Utils.createXMLFile(XML_METADATA);
        }
        return result;
    }

    static getPermissionSetSectionName(profileSection) {
        return XML_METADATA[profileSection].label;
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