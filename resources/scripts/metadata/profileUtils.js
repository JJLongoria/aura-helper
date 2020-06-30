const Utils = require('./utils');
const MetadataTypes = require('./metadataTypes');
const XMLParser = require('../languages').XMLParser;
const AppContext = require('../core/applicationContext');
const InputValidator = require('../inputs/inputValidator');
const Config = require('../core/config');

const XML_METADATA = {
    description: {
        key: "description",
        label: "Description",
        editable: true,
        merge: false,
        datatype: "string",
        minApi: 30,
        maxApi: -1, // -1 means actual api version
    },
    userLicense: {
        key: "userLicense",
        label: "User License",
        editable: false,
        merge: false,
        datatype: "string",
        minApi: 17,
        maxApi: -1,
    },
    custom: {
        key: "custom",
        label: "Custom",
        editable: false,
        merge: false,
        datatype: 'boolean',
        minApi: 30,
        maxApi: -1,
    },
    applicationVisibilities: {
        key: "applicationVisibilities",
        label: "Application Visibilities",
        editable: true,
        merge: true,
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
                default: {
                    datatype: "boolean",
                    unique: true,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "visible",
                            valueToCompare: true,
                            valueToSet: true
                        }
                    ]
                },
            }
        },
        create: function (application, visible, def) {
            return {
                application: application,
                default: (def) ? def : false,
                visible: (visible) ? visible : false,
            }
        },
    },
    categoryGroupVisibilities: {
        key: "categoryGroupVisibilities",
        label: "Category Group Visibilities",
        editable: true,
        merge: false,
        datatype: 'array',
        minApi: 41,
        maxApi: -1,
        metadataType: MetadataTypes.DATA_CATEGORY_GROUP,
        xmlData: {
            fieldKey: "dataCategoryGroup",
            sortOrder: ["dataCategoryGroup"],
            fields: {
                dataCategories: {
                    datatype: "array",
                    unique: false,
                    editable: true,
                    default: [],
                },
                dataCategoryGroup: {
                    datatype: "string",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
                visibility: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: 'ALL',
                    values: [
                        {
                            label: "ALL",
                            value: "ALL",
                        },
                        {
                            label: "CUSTOM",
                            value: "CUSTOM",
                        },
                        {
                            label: "NONE",
                            value: "NONE",
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
        create: function (dataCategoryGroup, dataCategories, visibility) {
            return {
                dataCategories: dataCategories,
                dataCategoryGroup: dataCategoryGroup,
                visibility: (visibility) ? visibility : false,
            }
        },
    },
    classAccesses: {
        key: "classAccesses",
        label: "Class Accesses",
        editable: true,
        merge: true,
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
        merge: false,
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
        merge: true,
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
        merge: false,
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
    fieldLevelSecurities: {
        key: "fieldLevelSecurities",
        label: "Field Level Securities",
        editable: true,
        merge: true,
        datatype: 'array',
        metadataType: MetadataTypes.CUSTOM_FIELDS,
        minApi: 1,
        maxApi: 22,
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
                    default: '{!value}',
                    editable: false,
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
                hidden: {
                    datatype: "boolean",
                    unique: false,
                    editable: true,
                    default: false,
                    controlledFields: [
                        {
                            field: "readable",
                            valueToCompare: true,
                            valueToSet: false
                        },
                        {
                            field: "editable",
                            valueToCompare: true,
                            valueToSet: false
                        }
                    ]
                }
            }
        },
        create: function (field, readable, editable, hidden) {
            return {
                editable: (editable) ? editable : false,
                field: field,
                hidden: (hidden) ? hidden : false,
                readable: (readable) ? readable : false,
            };
        },
    },
    fullName: {
        key: "fullName",
        label: "Full Name",
        editable: false,
        merge: false,
        datatype: 'string',
        minApi: 1,
        maxApi: -1,
    },
    layoutAssignments: {
        key: "layoutAssignments",
        label: "Layout Assignments",
        editable: true,
        merge: false,
        datatype: 'array',
        metadataType: MetadataTypes.LAYOUT,
        minApi: 25,
        maxApi: -1,
        xmlData: {
            fieldKey: "layout",
            sortOrder: ["recordType"],
            fields: {
                layout: {
                    datatype: "string",
                    separator: "-",
                    unique: true,
                    editable: false,
                    default: '{!value}',
                },
                recordType: {
                    datatype: "string",
                    separator: ".",
                    metadataType: MetadataTypes.RECORD_TYPE,
                    unique: true,
                    editable: true,
                    default: '{!value}',
                },
            }
        },
        create: function (layout, recordType) {
            return {
                layout: layout,
                recordType: recordType,
            };
        },
    },
    loginHours: {
        key: "loginHours",
        label: "Login Hours",
        editable: true,
        merge: false,
        datatype: 'object',
        minApi: 25,
        maxApi: -1,
        xmlData: {
            fieldKey: undefined,
            fields: {
                mondayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                mondayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                tuesdayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                tuesdayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                wednesdayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                wednesdayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                thursdayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                thursdayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                fridayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                fridayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                saturdayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                saturdayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                sundayStart: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
                sundayEnd: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: undefined,
                    values: getLoginHoursEnumValues(),
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
        create: function (loginHours) {
            return {
                mondayStart: loginHours.mondayStart,
                mondayEnd: loginHours.mondayEnd,
                tuesdayStart: loginHours.tuesdayStart,
                tuesdayEnd: loginHours.tuesdayEnd,
                wednesdayStart: loginHours.wednesdayStart,
                wednesdayEnd: loginHours.wednesdayEnd,
                thursdayStart: loginHours.thursdayStart,
                thursdayEnd: loginHours.thursdayEnd,
                fridayStart: loginHours.fridayStart,
                fridayEnd: loginHours.fridayEnd,
                saturdayStart: loginHours.saturdayStart,
                saturdayEnd: loginHours.saturdayEnd,
                sundayStart: loginHours.sundayStart,
                sundayEnd: loginHours.sundayEnd
            };
        }
    },
    loginIpRanges: {
        key: "loginIpRanges",
        label: "Login IP Ranges",
        editable: true,
        merge: false,
        datatype: 'array',
        minApi: 17,
        maxApi: -1,
        xmlData: {
            fieldKey: "startAddress+endAddress",
            sortOrder: ["startAddress", "endAddress"],
            fields: {
                description: {
                    datatype: "string",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                    validate: function(value){
                        if(value && value.length > 255){
                            return "Description to long. Remove at least " + (value.length - 255) + " characters";
                        }
                        return undefined;
                    }
                },
                endAddress: {
                    datatype: "string",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                    validate: function(value){
                        if(!InputValidator.isIPv4(value) && !InputValidator.isIPv6(value)){
                            return "Wrong IPv4 or IPv6 format";
                        }
                        return undefined;
                    }
                },
                startAddress: {
                    datatype: "string",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                    validate: function(value){
                        if(!InputValidator.isIPv4(value) && !InputValidator.isIPv6(value)){
                            return "Wrong IPv4 or IPv6 format";
                        }
                        return undefined;
                    }
                },
            }
        },
        create: function (description, startAddress, endAddress) {
            return {
                description: description,
                endAddress: endAddress,
                startAddress: startAddress,
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
    profileActionOverrides: {
        key: "profileActionOverrides",
        label: "Profile Action Overrides",
        editable: false,
        merge: false,
        datatype: 'array',
        minApi: 37,
        maxApi: 44,
        xmlData: {
            fieldKey: undefined,
            sortOrder: ["actionName", "pageOrSobjectType"],
            fields: {
                actionName: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                    values: [
                        {
                            label: "Accept",
                            value: "accept",
                        },
                        {
                            label: "Clone",
                            value: "clone",
                        },
                        {
                            label: "Delete",
                            value: "delete",
                        },
                        {
                            label: "Edit",
                            value: "edit",
                        },
                        {
                            label: "List",
                            value: "list",
                        },
                        {
                            label: "New",
                            value: "new",
                        },
                        {
                            label: "Tab",
                            value: "tab",
                        },
                        {
                            label: "View",
                            value: "view",
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
                pageOrSobjectType: {
                    datatype: "string",
                    editable: true,
                    default: "{!value}",
                    metadataType: MetadataTypes.CUSTOM_OBJECT,
                    unique: false,
                },
                recordType: {
                    datatype: "string",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                    metadataType: MetadataTypes.RECORD_TYPE,
                },
                content: {
                    datatype: "string",
                    unique: false,
                    editable: true,
                    default: "{!value}",
                },
                formFactor: {
                    datatype: "enum",
                    unique: true,
                    editable: true,
                    default: "default",
                    values: [
                        {
                            label: "Default",
                            value: "default",
                        },
                        {
                            label: "Flexi Page",
                            value: "flexipage",
                        },
                        {
                            label: "Lightning Component",
                            value: "lightningcomponent",
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
                type: {
                    datatype: "enum",
                    unique: false,
                    editable: true,
                    default: "default",
                    values: [
                        {
                            label: "Default",
                            value: "default",
                        },
                        {
                            label: "Flexi Page",
                            value: "flexipage",
                        },
                        {
                            label: "Lightning Component",
                            value: "lightningcomponent",
                        },
                        {
                            label: "S-Control",
                            value: "scontrol",
                        },
                        {
                            label: "Standard",
                            value: "standard",
                        },
                        {
                            label: "Visualforce",
                            value: "visualforce",
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
        create: function (actionName, pageOrSobjectType, recordType, content, formFactor, type) {
            return {
                actionName: actionName,
                content: content,
                formFactor: formFactor,
                pageOrSobjectType: pageOrSobjectType,
                recordType: recordType,
                type: type,
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
                default: {
                    datatype: "boolean",
                    unique: true,
                    editable: true,
                    default: false,
                },
                personAccountDefault: {
                    datatype: "boolean",
                    unique: true,
                    editable: true,
                    default: false,
                },
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
        create: function (recordType, def, personAccountDefault, visible) {
            return {
                default: (def) ? def : false,
                personAccountDefault: personAccountDefault,
                recordType: recordType,
                visible: (visible) ? visible : false,
            };
        },
    },
    tabVisibilities: {
        key: "tabVisibilities",
        label: "Tab Visibilities",
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
            sortOrder: ["name", "enabled"],
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

class ProfileUtils {

    static getXMLMetadata() {
        return XML_METADATA;
    }

    static createProfile(profile) {
        let result = {};
        if (profile) {
            result = ProfileUtils.createProfile();
            result = Utils.prepareXML(profile, result,);
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

    static mergeProfileWithLocalData(profile, metadata) {
        if (profile) {
            let lastVersion = Config.getLastVersion();
            let orgVersion = parseInt(Config.getOrgVersion());
            Object.keys(XML_METADATA).forEach(function (xmlField) {
                let fieldData = XML_METADATA[xmlField];
                let metadataType = (fieldData.metadataType === MetadataTypes.LAYOUT) ? MetadataTypes.RECORD_TYPE : fieldData.metadataType;
                if (fieldData.merge && metadataType && metadata[metadataType] && Utils.haveChilds(metadata[metadataType]) && Utils.availableOnVersion(fieldData, lastVersion, orgVersion)) {
                    let fieldKeys = Object.keys(fieldData.xmlData.fields);
                    let metadataObjects = metadata[metadataType].childs;
                    if (!profile[fieldData.key])
                        profile[fieldData.key] = [];
                    Object.keys(metadataObjects).forEach(function (objectKey) {
                        let objData = AppContext.sObjects[objectKey.toLowerCase()];
                        let metadataObject = metadataObjects[objectKey];
                        if (Utils.haveChilds(metadataObject)) {
                            Object.keys(metadataObject.childs).forEach(function (itemKey) {
                                let field = (fieldData.metadataType === MetadataTypes.LAYOUT) ? fieldKeys[1] : fieldData.xmlData.fieldKey;
                                let elementName = objectKey + fieldData.xmlData.fields[field].separator + itemKey;
                                let found = false;
                                let layoutToAssign;
                                for (let xmlElement of profile[fieldData.key]) {
                                    if (!layoutToAssign && fieldData.metadataType === MetadataTypes.LAYOUT && xmlElement[fieldData.xmlData.fieldKey].indexOf(objectKey + fieldData.xmlData.fields[fieldData.xmlData.fieldKey].separator) !== -1 && !xmlElement[field])
                                        layoutToAssign = xmlElement[fieldData.xmlData.fieldKey];
                                    if (xmlElement[field] === elementName) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    let nullable = true;
                                    if (metadataType === MetadataTypes.CUSTOM_FIELDS){
                                        let fData;
                                        if(objData && objData.fields)
                                            fData= objData.fields[itemKey];
                                        nullable = !fData || fData.nillable;
                                    }
                                    if (fieldData.metadataType === MetadataTypes.LAYOUT)
                                        profile[fieldData.key].push(fieldData.create(layoutToAssign, elementName));
                                    else if (metadataType !== MetadataTypes.CUSTOM_FIELDS || (metadataType === MetadataTypes.CUSTOM_FIELDS && nullable)){
                                        let dataToAdd = {};
                                        Object.keys(fieldData.xmlData.fields).forEach(function (field) {
                                            let fData = fieldData.xmlData.fields[field];
                                            if (fData.default === '{!value}')
                                                dataToAdd[field] = elementName;
                                            else
                                                dataToAdd[field] = fData.default;
                                        });
                                        profile[fieldData.key].push(dataToAdd);
                                    }
                                }
                            });
                        } else {
                            let found = false;
                            for (let xmlElement of profile[fieldData.key]) {
                                if (xmlElement[fieldData.xmlData.fieldKey] === objectKey) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                let dataToAdd = {};
                                Object.keys(fieldData.xmlData.fields).forEach(function (field) {
                                    let fData = fieldData.xmlData.fields[field];
                                    if (fData.default === '{!value}')
                                        dataToAdd[field] = objectKey;
                                    else
                                        dataToAdd[field] = fData.default;
                                });
                                profile[fieldData.key].push(dataToAdd);
                            }
                        }
                    });
                    Utils.sort(profile[fieldData.key], fieldData.xmlData.sortOrder);
                }
            });
        }
        return profile;
    }

    static getProfileSectionName(profileSection) {
        return XML_METADATA[profileSection].label;
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

function getLoginHoursEnumValues() {
    return [
        {
            label: "-- None --",
            value: undefined,
        },
        {
            label: "12:00 AM",
            value: 0,
        },
        {
            label: "1:00 AM",
            value: 60,
        },
        {
            label: "2:00 AM",
            value: 120,
        },
        {
            label: "3:00 AM",
            value: 180,
        },
        {
            label: "4:00 AM",
            value: 240,
        },
        {
            label: "5:00 AM",
            value: 300,
        },
        {
            label: "6:00 AM",
            value: 360,
        },
        {
            label: "7:00 AM",
            value: 420,
        },
        {
            label: "8:00 AM",
            value: 480,
        },
        {
            label: "9:00 AM",
            value: 540,
        },
        {
            label: "10:00 AM",
            value: 600,
        },
        {
            label: "11:00 AM",
            value: 660,
        },
        {
            label: "12:00 PM",
            value: 720,
        },
        {
            label: "1:00 PM",
            value: 780,
        },
        {
            label: "2:00 PM",
            value: 840,
        },
        {
            label: "3:00 PM",
            value: 900,
        },
        {
            label: "4:00 PM",
            value: 960,
        },
        {
            label: "5:00 PM",
            value: 1020,
        },
        {
            label: "6:00 PM",
            value: 1080,
        },
        {
            label: "7:00 PM",
            value: 1140,
        },
        {
            label: "8:00 PM",
            value: 1200,
        },
        {
            label: "9:00 PM",
            value: 1260,
        },
        {
            label: "10:00 PM",
            value: 1320,
        },
        {
            label: "11:00 PM",
            value: 1380,
        },
        {
            label: "End of Day",
            value: 1440,
        }
    ];
}