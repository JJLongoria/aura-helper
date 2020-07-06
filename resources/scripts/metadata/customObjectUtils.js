const Utils = require('./utils');
const XMLParser = require('../languages').XMLParser;

class CustomObjectUtils {
  static createCustomObject(customObject) {
    let newCustomObject;
    if (customObject) {
      newCustomObject = Utils.prepareXML(customObject, CustomObjectUtils.createCustomObject());
    } else {
      newCustomObject = {
        actionOverrides: [],
        allowInChatterGroups: undefined,
        businessProcesses: [],
        compactLayoutAssignment: undefined,
        compactLayouts: [],
        customHelp: undefined,
        customHelpPage: undefined,
        customSettingsType: undefined,
        customSettingsVisibility: undefined,
        dataStewardGroup: undefined,
        dataStewardUser: undefined,
        deploymentStatus: undefined,
        deprecated: undefined,
        description: undefined,
        enableActivities: undefined,
        enableBulkApi: undefined,
        enableDivisions: undefined,
        enableEnhancedLookup: undefined,
        enableFeeds: undefined,
        enableHistory: undefined,
        enableReports: undefined,
        enableSearch: undefined,
        enableSharing: undefined,
        enableStreamingApi: undefined,
        eventType: undefined,
        externalDataSource: undefined,
        externalName: undefined,
        externalRepository: undefined,
        externalSharingModel: undefined,
        fields: [],
        fieldSets: undefined,
        fullName: undefined,
        gender: undefined,
        household: undefined,
        historyRetentionPolicy: undefined,
        indexes: [],
        label: undefined,
        listViews: [],
        namedFilter: [],
        nameField: undefined,
        pluralLabel: undefined,
        profileSearchLayouts: undefined,
        publishBehavior: undefined,
        recordTypes: [],
        recordTypeTrackFeedHistory: undefined,
        recordTypeTrackHistory: undefined,
        searchLayouts: undefined,
        sharingModel: undefined,
        sharingReasons: [],
        sharingRecalculations: [],
        startsWith: undefined,
        validationRules: undefined,
        visibility: undefined,
        webLinks: [],
      };
    }
    return newCustomObject;
  }

  static createActionOverride(actionName, comment, content, formFactor, skipRecordTypeSelect, type) {
    return {
      actionName: actionName,
      comment: comment,
      content: content,
      formFactor: formFactor,
      skipRecordTypeSelect: skipRecordTypeSelect,
      type: type,
    };
  }

  static createBussinesProcess(bussinesProcess) {
    let newBussinesProcess;
    if (bussinesProcess) {
      newBussinesProcess = Utils.prepareXML(bussinesProcess, CustomObjectUtils.createBussinesProcess());
    } else {
      newBussinesProcess = {
        description: undefined,
        fullName: undefined,
        isActive: undefined,
        namespacePrefix: undefined,
        values: [],
      };
    }
    return newBussinesProcess;
  }

  static createCompactLayout(compactLayout) {
    let newCompactLayout;
    if (compactLayout) {
      newCompactLayout = Utils.prepareXML(compactLayout, CustomObjectUtils.createCompactLayout());
    } else {
      newCompactLayout = {
        fullName: undefined,
        fields: [],
        label: undefined,
      };
    }
    return newCompactLayout;
  }

  static createCustomField(field) {
    let newField;
    if (field) {
      newField = Utils.prepareXML(field, CustomObjectUtils.createCustomField());
    } else {
      newField = {
        businessOwnerGroup: undefined,
        businessOwnerUser: undefined,
        businessStatus: undefined,
        caseSensitive: undefined,
        complianceGroup: undefined,
        customDataType: undefined,
        defaultValue: undefined,
        deleteConstraint: undefined,
        deprecated: undefined,
        description: undefined,
        displayFormat: undefined,
        displayLocationInDecimal: undefined,
        encrypted: undefined,
        encryptionScheme: undefined,
        externalDeveloperName: undefined,
        externalId: undefined,
        fieldManageability: undefined,
        formula: undefined,
        formulaTreatBlanksAs: undefined,
        fullName: undefined,
        globalPicklist: undefined,
        indexed: undefined,
        inlineHelpText: undefined,
        isAIPredictionField: undefined,
        isFilteringDisabled: undefined,
        isNameField: undefined,
        isSortingDisabled: undefined,
        label: undefined,
        length: undefined,
        lookupFilter: undefined,
        maskChar: undefined,
        maskType: undefined,
        metadataRelationshipControllingField: undefined,
        picklist: undefined,
        populateExistingRows: undefined,
        precision: undefined,
        referenceTargetField: undefined,
        referenceTo: undefined,
        relationshipLabel: undefined,
        relationshipName: undefined,
        relationshipOrder: undefined,
        reparentableMasterDetail: undefined,
        required: undefined,
        scale: undefined,
        securityClassification: undefined,
        startingNumber: undefined,
        stripMarkup: undefined,
        summarizedField: undefined,
        summaryFilterItems: [],
        summaryForeignKey: undefined,
        summaryOperation: undefined,
        trackFeedHistory: undefined,
        trackHistory: undefined,
        trackTrending: undefined,
        trueValueIndexed: undefined,
        type: undefined,
        unique: undefined,
        valueSet: undefined,
        visibleLines: undefined,
        writeRequiresMasterRead: undefined,
      };
    }
    return newField;
  }

  static createLookupFilter(active, booleanFilter, description, errorMessage, filterItems, infoMessage, isOptional) {
    return {
      active: active,
      booleanFilter: booleanFilter,
      description: description,
      errorMessage: errorMessage,
      filterItems: filterItems,
      infoMessage: infoMessage,
      isOptional: isOptional,
    };
  }

  static createFilterItem(field, operation, value, valueField) {
    return {
      field: field,
      operation: operation,
      value: value,
      valueField: valueField,
    };
  }

  static createFieldSet(availableFields, description, displayedFields, label) {
    return {
      availableFields: Utils.forceArray(availableFields),
      description: description,
      displayedFields: Utils.forceArray(displayedFields),
      label: label,
    };
  }

  static createFieldSetItem(field, isFieldManaged, isRequired) {
    return {
      field: field,
      isFieldManaged: isFieldManaged,
      isRequired: isRequired,
    };
  }

  static createHistoricRetentionPolicy(archiveAfterMonths, archiveRetentionYears, description, gracePeriodDays) {
    return {
      archiveAfterMonths: archiveAfterMonths,
      archiveRetentionYears: archiveRetentionYears,
      description: description,
      gracePeriodDays: gracePeriodDays,
    };
  }

  static createIndex(index) {
    let newIndex;
    if (index) {
      newIndex = Utils.prepareXML(index, CustomObjectUtils.createIndex());
    } else {
      newIndex = {
        fields: [],
        label: undefined,
      };
    }
    return newIndex;
  }

  static createIndexField(name, sortDirection) {
    return {
      name: name,
      sortDirection: sortDirection,
    };
  }

  static createListView(listview) {
    let newListview;
    if (listview) {
      newListview = Utils.prepareXML(listview, CustomObjectUtils.createListView());
    } else {
      newListview = {
        booleanFilter: undefined,
        columns: [],
        division: undefined,
        filterScope: undefined,
        filters: [],
        fullName: undefined,
        label: undefined,
        language: undefined,
        queue: undefined,
        sharedTo: undefined,
      };
    }
    return newListview;
  }

  static createListViewFilter(filter, operation, value) {
    return {
      filter: filter,
      operation: operation,
      value: value,
    };
  }

  static createNamedFilter(active, booleanFilter, description, errorMessage, field, filterItems, infoMessage, fullName, isOptional, name, sourceObject) {
    return {
      active: active,
      booleanFilter: booleanFilter,
      description: description,
      errorMessage: errorMessage,
      field: field,
      filterItems: Utils.forceArray(filterItems),
      infoMessage: infoMessage,
      fullName: fullName,
      isOptional: isOptional,
      name: name,
      sourceObject: sourceObject,
    };
  }

  static createPicklist(controllingField, picklistValues, restrictedPicklist, sorted) {
    return {
      controllingField: controllingField,
      picklistValues: Utils.forceArray(picklistValues),
      restrictedPicklist: restrictedPicklist,
      sorted: sorted,
    };
  }

  static createPicklistValue(color, isDefault, description, isActive) {
    return {
      color: color,
      default: isDefault,
      description: description,
      isActive: isActive,
    };
  }

  static createProfileSearchLayout(profileName, fields) {
    return {
      profileName: Utils.forceArray(profileName),
      fields: Utils.forceArray(fields),
    };
  }

  static createCustomValue(color, isDefault, description, fullName, isActive, label) {
    return {
      color: color,
      default: isDefault,
      description: description,
      fullName: fullName,
      isActive: isActive,
      label: label,
    };
  }

  static createRecordType(recordType) {
    let newRecordType;
    if (recordType) {
      newRecordType = Utils.prepareXML(recordType, CustomObjectUtils.createRecordType());
    } else {
      newRecordType = {
        active: undefined,
        businessProcess: undefined,
        compactLayoutAssignment: undefined,
        description: undefined,
        fullName: undefined,
        label: undefined,
        picklistValues: [],
      };
    }
    return newRecordType;
  }

  static createRecordTypePicklistValue(picklist, values) {
    return {
      picklist: picklist,
      values: Utils.forceArray(values),
    };
  }

  static createSearchLayout(customTabListAdditionalFields, excludedStandardButtons, listViewButtons, lookupDialogsAdditionalFields, lookupFilterFields, lookupPhoneDialogsAdditionalFields, massQuickActions, searchFilterFields, searchResultsAdditionalFields, searchResultsCustomButtons) {
    return {
      customTabListAdditionalFields: Utils.forceArray(customTabListAdditionalFields),
      excludedStandardButtons: Utils.forceArray(excludedStandardButtons),
      listViewButtons: Utils.forceArray(listViewButtons),
      lookupDialogsAdditionalFields: Utils.forceArray(lookupDialogsAdditionalFields),
      lookupFilterFields: Utils.forceArray(lookupFilterFields),
      lookupPhoneDialogsAdditionalFields: Utils.forceArray(lookupPhoneDialogsAdditionalFields),
      massQuickActions: Utils.forceArray(massQuickActions),
      searchFilterFields: Utils.forceArray(searchFilterFields),
      searchResultsAdditionalFields: Utils.forceArray(searchResultsAdditionalFields),
      searchResultsCustomButtons: Utils.forceArray(searchResultsCustomButtons),
    };
  }

  static createSharingReason(fullName, label) {
    return {
      fullName: fullName,
      label: label,
    };
  }

  static createSharingCalculations(className) {
    return {
      className: className,
    };
  }

  static createValidationRule(validationRule) {
    let newValidationRule;
    if (validationRule) {
      newValidationRule = Utils.prepareXML(validationRule, CustomObjectUtils.createValidationRule());
    } else {
      newValidationRule = {
        active: undefined,
        description: undefined,
        errorConditionFormula: undefined,
        errorDisplayField: undefined,
        errorMessage: undefined,
        fullName: undefined,
      };
    }
    return newValidationRule;
  }

  static createWebLink(weblink) {
    let newWebLink;
    if (weblink) {
      newWebLink = Utils.prepareXML(weblink, CustomObjectUtils.createWebLink());
    } else {
      newWebLink = {
        availability: undefined,
        displayType: undefined,
        encodingKey: undefined,
        fullName: undefined,
        hasMenubar: undefined,
        hasScrollbars: undefined,
        hasToolbar: undefined,
        height: undefined,
        isResizable: undefined,
        linkType: undefined,
        masterLabel: undefined,
        openType: undefined,
        page: undefined,
        position: undefined,
        protected: undefined,
        requireRowSelection: undefined,
        scontrol: undefined,
        showsLocation: undefined,
        showsStatus: undefined,
        url: undefined,
        width: undefined,
      };
    }
    return newWebLink;
  }

  static toXML(data, compress, type) {
    let xmlLines = [];
    if (data) {
      if (compress) {
        switch (type) {
          case 'CustomObject':
            xmlLines = CustomObjectUtils.getFullObjectXMLLines(data);
            break;
          case 'BusinessProcess':
            xmlLines = CustomObjectUtils.getBussinesProcessXMLLines(data, -1);
            break;
          case 'CompactLayout':
            xmlLines = CustomObjectUtils.getCompactLayoutXMLLines(data, -1);
            break;
          case 'CustomField':
            xmlLines = CustomObjectUtils.getFieldsXMLLines(data, -1);
            break;
          case 'ListView':
            xmlLines = CustomObjectUtils.getListViewsXMLLines(data, -1);
            break;
          case 'RecordType':
            xmlLines = CustomObjectUtils.getRecordTypesXMLLines(data, -1);
            break;
          case 'ValidationRule':
            xmlLines = CustomObjectUtils.getValidationRulesXMLLines(data, -1);
            break;
          case 'WebLink':
            xmlLines = CustomObjectUtils.getWeblinksXMLLines(data, -1);
            break;
          case 'Index':
            xmlLines = CustomObjectUtils.getIndexesXMLLines(data, -1);
            break;
        }
      } else {
        return XMLParser.toXML(data);
      }
    }
    return xmlLines.join('\n');
  }

  static getFullObjectXMLLines(object) {
    let xmlLines = [];
    if (object) {
      xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
      xmlLines.push('<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">');
      if (object.fullName !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', object.fullName));
      }
      if (object.label !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', object.label));
      }
      if (object.pluralLabel !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('pluralLabel', object.pluralLabel));
      }
      if (object.gender !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('gender', object.gender));
      }
      if (object.startsWith !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('startsWith', object.startsWith));
      }
      if (object.sharingModel !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('sharingModel', object.sharingModel));
      }
      if (object.visibility !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('visibility', object.visibility));
      }
      if (object.deploymentStatus !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('deploymentStatus', object.deploymentStatus));
      }
      if (object.deprecated !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('deprecated', object.deprecated));
      }
      if (object.description !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', object.description));
      }
      if (object.allowInChatterGroups !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('allowInChatterGroups', object.allowInChatterGroups));
      }
      if (object.compactLayoutAssignment !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('compactLayoutAssignment', object.compactLayoutAssignment));
      }
      if (object.customHelp !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customHelp', object.customHelp));
      }
      if (object.customHelpPage !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customHelpPage', object.customHelpPage));
      }
      if (object.customSettingsType !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customSettingsType', object.customSettingsType));
      }
      if (object.customSettingsVisibility !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customSettingsVisibility', object.customSettingsVisibility));
      }
      if (object.dataStewardGroup !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dataStewardGroup', object.dataStewardGroup));
      }
      if (object.dataStewardUser !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('dataStewardUser', object.dataStewardUser));
      }
      if (object.enableActivities !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableActivities', object.enableActivities));
      }
      if (object.enableBulkApi !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableBulkApi', object.enableBulkApi));
      }
      if (object.enableDivisions !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableDivisions', object.enableDivisions));
      }
      if (object.enableEnhancedLookup !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableEnhancedLookup', object.enableEnhancedLookup));
      }
      if (object.enableFeeds !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableFeeds', object.enableFeeds));
      }
      if (object.enableHistory !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableHistory', object.enableHistory));
      }
      if (object.enableReports !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableReports', object.enableReports));
      }
      if (object.enableSearch !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableSearch', object.enableSearch));
      }
      if (object.enableSharing !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableSharing', object.enableSharing));
      }
      if (object.enableStreamingApi !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('enableStreamingApi', object.enableStreamingApi));
      }
      if (object.eventType !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('eventType', object.eventType));
      }
      if (object.externalDataSource !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalDataSource', object.externalDataSource));
      }
      if (object.externalName !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalName', object.externalName));
      }
      if (object.externalRepository !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalRepository', object.externalRepository));
      }
      if (object.externalSharingModel !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalSharingModel', object.externalSharingModel));
      }
      if (object.household !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('household', object.household));
      }
      if (object.publishBehavior !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('publishBehavior', object.publishBehavior));
      }
      if (object.recordTypeTrackFeedHistory !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('recordTypeTrackFeedHistory', object.recordTypeTrackFeedHistory));
      }
      if (object.recordTypeTrackHistory !== undefined) {
        xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('recordTypeTrackHistory', object.recordTypeTrackHistory));
      }
      if (object.nameField !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getNameFieldXMLLines(object.nameField, 1));
      }
      if (object.actionOverrides !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('actionOverrides', object.actionOverrides, true, 1));
      }
      if (object.businessProcesses !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getBussinesProcessXMLLines(object.businessProcesses, 1));
      }
      if (object.compactLayouts !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getCompactLayoutXMLLines(object.compactLayouts, 1));
      }
      if (object.fields !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getFieldsXMLLines(object.fields, 1));
      }
      if (object.fieldSets !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getFieldSetsXMLLines(object.fieldSets, 1));
      }
      if (object.historyRetentionPolicy !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('historyRetentionPolicy', object.historyRetentionPolicy, true, 1));
      }
      if (object.indexes !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getIndexesXMLLines(object.indexes, 1));
      }
      if (object.listViews !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getListViewsXMLLines(object.indexes, 1));
      }
      if (object.namedFilter !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getNamedFiltersXMLLines(object.namedFilter, 1));
      }
      if (object.profileSearchLayouts !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getProfileSearchLayoutsXMLLines(object.profileSearchLayouts, 1));
      }
      if (object.searchLayouts !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getSearchLayoutsXMLLines(object.searchLayouts, 1));
      }
      if (object.recordTypes !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getRecordTypesXMLLines(object.recordTypes, 1));
      }
      if (object.sharingReasons !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('sharingReasons', object.sharingReasons, true, 1));
      }
      if (object.sharingRecalculations !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('sharingRecalculations', object.sharingRecalculations, true, 1));
      }
      if (object.validationRules !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getValidationRulesXMLLines(object.validationRules, 1));
      }
      if (object.webLinks !== undefined) {
        xmlLines = xmlLines.concat(CustomObjectUtils.getWeblinksXMLLines(object.webLinks, 1));
      }
      xmlLines.push('</CustomObject>');
    }
    return xmlLines;
  }

  static getBussinesProcessXMLLines(bussinessProcesses, initIndent) {
    let xmlLines = [];
    if (bussinessProcesses) {
      if (initIndent != -1) {
        for (const bussinessProces of bussinessProcesses) {
          xmlLines.push(Utils.getTabs(initIndent) + '<businessProcesses>');
          if (bussinessProces.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', bussinessProces.fullName));
          }
          if (bussinessProces.description !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', bussinessProces.description));
          }
          if (bussinessProces.namespacePrefix !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('namespacePrefix', bussinessProces.namespacePrefix));
          }
          if (bussinessProces.isActive !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isActive', bussinessProces.isActive));
          }
          if (bussinessProces.values !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('values', bussinessProces.values, true, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</businessProcesses>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<BusinessProcess xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (bussinessProcesses.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', bussinessProcesses.fullName));
        }
        if (bussinessProcesses.description !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', bussinessProcesses.description));
        }
        if (bussinessProcesses.namespacePrefix !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('namespacePrefix', bussinessProcesses.namespacePrefix));
        }
        if (bussinessProcesses.isActive !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isActive', bussinessProcesses.isActive));
        }
        if (bussinessProcesses.values !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('values', bussinessProcesses.values, true, 1));
        }
        xmlLines.push('</BusinessProcess>');
      }
    }
    return xmlLines;
  }

  static getCompactLayoutXMLLines(compactLayouts, initIndent) {
    let xmlLines = [];
    if (compactLayouts) {
      if (initIndent != -1) {
        for (const compactLayout of compactLayouts) {
          xmlLines.push(Utils.getTabs(initIndent) + '<compactLayouts>');
          if (compactLayout.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', compactLayout.fullName));
          }
          if (compactLayout.label !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', compactLayout.label));
          }
          if (compactLayout.fields !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', compactLayout.fields, true, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</compactLayouts>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<CompactLayout xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (compactLayouts.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', compactLayouts.fullName));
        }
        if (compactLayouts.label !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', compactLayouts.label));
        }
        if (compactLayouts.fields !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', compactLayouts.fields, true, 1));
        }
        xmlLines.push('</CompactLayout>');
      }
    }
    return xmlLines;
  }

  static getFieldsXMLLines(fields, initIndent) {
    let xmlLines = [];
    if (fields) {
      if (initIndent != -1) {
        for (const field of fields) {
          xmlLines.push(Utils.getTabs(initIndent) + '<fields>');
          if (field.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', field.fullName));
          }
          if (field.label !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', field.label));
          }
          if (field.type !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', field.type));
          }
          if (field.unique !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('unique', field.unique));
          }
          if (field.required !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('required', field.required));
          }
          if (field.visibleLines !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('visibleLines', field.visibleLines));
          }
          if (field.startingNumber !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('startingNumber', field.startingNumber));
          }
          if (field.length !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('length', field.length));
          }
          if (field.scale !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scale', field.scale));
          }
          if (field.precision !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('precision', field.precision));
          }
          if (field.description !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', field.description));
          }
          if (field.referenceTargetField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('referenceTargetField', field.referenceTargetField));
          }
          if (field.referenceTo !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('referenceTo', field.referenceTo));
          }
          if (field.relationshipName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipName', field.relationshipName));
          }
          if (field.relationshipLabel !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipLabel', field.relationshipLabel));
          }
          if (field.relationshipOrder !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipOrder', field.relationshipOrder));
          }
          if (field.inlineHelpText !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('inlineHelpText', field.inlineHelpText));
          }
          if (field.externalDeveloperName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('externalDeveloperName', field.externalDeveloperName));
          }
          if (field.externalId !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('externalId', field.externalId));
          }
          if (field.indexed !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indexed', field.indexed));
          }
          if (field.customDataType !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('customDataType', field.customDataType));
          }
          if (field.defaultValue !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('defaultValue', field.defaultValue));
          }
          if (field.displayFormat !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayFormat', field.displayFormat));
          }
          if (field.displayLocationInDecimal !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayLocationInDecimal', field.displayLocationInDecimal));
          }
          if (field.deleteConstraint !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('deleteConstraint', field.deleteConstraint));
          }
          if (field.deprecated !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('deprecated', field.deprecated));
          }
          if (field.businessOwnerGroup !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessOwnerGroup', field.businessOwnerGroup));
          }
          if (field.businessOwnerUser !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessOwnerUser', field.businessOwnerUser));
          }
          if (field.businessStatus !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessStatus', field.businessStatus));
          }
          if (field.caseSensitive !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('caseSensitive', field.caseSensitive));
          }
          if (field.complianceGroup !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('complianceGroup', field.complianceGroup));
          }
          if (field.encrypted !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encrypted', field.encrypted));
          }
          if (field.encryptionScheme !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encryptionScheme', field.encryptionScheme));
          }
          if (field.maskChar !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('maskChar', field.maskChar));
          }
          if (field.maskType !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('maskType', field.maskType));
          }
          if (field.fieldManageability !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fieldManageability', field.fieldManageability));
          }
          if (field.formula !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', field.formula));
          }
          if (field.formulaTreatBlanksAs !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formulaTreatBlanksAs', field.formulaTreatBlanksAs));
          }
          if (field.globalPicklist !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('globalPicklist', field.globalPicklist));
          }
          if (field.isAIPredictionField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isAIPredictionField', field.isAIPredictionField));
          }
          if (field.isFilteringDisabled !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isFilteringDisabled', field.isFilteringDisabled));
          }
          if (field.isNameField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isNameField', field.isNameField));
          }
          if (field.isSortingDisabled !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isSortingDisabled', field.isSortingDisabled));
          }
          if (field.populateExistingRows !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('populateExistingRows', field.populateExistingRows));
          }
          if (field.reparentableMasterDetail !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('reparentableMasterDetail', field.reparentableMasterDetail));
          }
          if (field.metadataRelationshipControllingField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('metadataRelationshipControllingField', field.metadataRelationshipControllingField));
          }
          if (field.securityClassification !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('securityClassification', field.securityClassification));
          }
          if (field.stripMarkup !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('stripMarkup', field.stripMarkup));
          }
          if (field.summarizedField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summarizedField', field.summarizedField));
          }
          if (field.summaryForeignKey !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryForeignKey', field.summaryForeignKey));
          }
          if (field.summaryOperation !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryOperation', field.summaryOperation));
          }
          if (field.trackFeedHistory !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackFeedHistory', field.trackFeedHistory));
          }
          if (field.trackHistory !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackHistory', field.trackHistory));
          }
          if (field.trackTrending !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackTrending', field.trackTrending));
          }
          if (field.trueValueIndexed !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trueValueIndexed', field.trueValueIndexed));
          }
          if (field.valueSet !== undefined) {
            xmlLines = xmlLines.concat(CustomObjectUtils.getValueSetXMLLines(field.valueSet, initIndent + 1));
          }
          if (field.writeRequiresMasterRead !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('writeRequiresMasterRead', field.writeRequiresMasterRead));
          }
          if (field.lookupFilter !== undefined) {
            xmlLines = xmlLines.concat(CustomObjectUtils.getLookupFiltersXMLLines(field.lookupFilter, initIndent + 1));
          }
          if (field.picklist !== undefined) {
            xmlLines = xmlLines.concat(CustomObjectUtils.getPicklistXMLLines(field.picklist, initIndent + 1));
          }
          if (field.summaryFilterItems !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('summaryFilterItems', field.summaryFilterItems, true, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</fields>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (fields.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', fields.fullName));
        }
        if (fields.label !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', fields.label));
        }
        if (fields.type !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('type', fields.type));
        }
        if (fields.unique !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('unique', fields.unique));
        }
        if (fields.required !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('required', fields.required));
        }
        if (fields.visibleLines !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('visibleLines', fields.visibleLines));
        }
        if (fields.startingNumber !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('startingNumber', fields.startingNumber));
        }
        if (fields.length !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('length', fields.length));
        }
        if (fields.scale !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('scale', fields.scale));
        }
        if (fields.precision !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('precision', fields.precision));
        }
        if (fields.description !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', fields.description));
        }
        if (fields.referenceTargetField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('referenceTargetField', fields.referenceTargetField));
        }
        if (fields.referenceTo !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('referenceTo', fields.referenceTo));
        }
        if (fields.relationshipName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('relationshipName', fields.relationshipName));
        }
        if (fields.relationshipLabel !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('relationshipLabel', fields.relationshipLabel));
        }
        if (fields.relationshipOrder !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('relationshipOrder', fields.relationshipOrder));
        }
        if (fields.inlineHelpText !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('inlineHelpText', fields.inlineHelpText));
        }
        if (fields.externalDeveloperName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalDeveloperName', fields.externalDeveloperName));
        }
        if (fields.externalId !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('externalId', fields.externalId));
        }
        if (fields.indexed !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('indexed', fields.indexed));
        }
        if (fields.customDataType !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('customDataType', fields.customDataType));
        }
        if (fields.defaultValue !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('defaultValue', fields.defaultValue));
        }
        if (fields.displayFormat !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('displayFormat', fields.displayFormat));
        }
        if (fields.displayLocationInDecimal !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('displayLocationInDecimal', fields.displayLocationInDecimal));
        }
        if (fields.deleteConstraint !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('deleteConstraint', fields.deleteConstraint));
        }
        if (fields.deprecated !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('deprecated', fields.deprecated));
        }
        if (fields.businessOwnerGroup !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('businessOwnerGroup', fields.businessOwnerGroup));
        }
        if (fields.businessOwnerUser !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('businessOwnerUser', fields.businessOwnerUser));
        }
        if (fields.businessStatus !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('businessStatus', fields.businessStatus));
        }
        if (fields.caseSensitive !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('caseSensitive', fields.caseSensitive));
        }
        if (fields.complianceGroup !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('complianceGroup', fields.complianceGroup));
        }
        if (fields.encrypted !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('encrypted', fields.encrypted));
        }
        if (fields.encryptionScheme !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('encryptionScheme', fields.encryptionScheme));
        }
        if (fields.maskChar !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('maskChar', fields.maskChar));
        }
        if (fields.maskType !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('maskType', fields.maskType));
        }
        if (fields.fieldManageability !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fieldManageability', fields.fieldManageability));
        }
        if (fields.formula !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('formula', fields.formula));
        }
        if (fields.formulaTreatBlanksAs !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('formulaTreatBlanksAs', fields.formulaTreatBlanksAs));
        }
        if (fields.globalPicklist !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('globalPicklist', fields.globalPicklist));
        }
        if (fields.isAIPredictionField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isAIPredictionField', fields.isAIPredictionField));
        }
        if (fields.isFilteringDisabled !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isFilteringDisabled', fields.isFilteringDisabled));
        }
        if (fields.isNameField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isNameField', fields.isNameField));
        }
        if (fields.isSortingDisabled !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isSortingDisabled', fields.isSortingDisabled));
        }
        if (fields.populateExistingRows !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('populateExistingRows', fields.populateExistingRows));
        }
        if (fields.reparentableMasterDetail !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('reparentableMasterDetail', fields.reparentableMasterDetail));
        }
        if (fields.metadataRelationshipControllingField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('metadataRelationshipControllingField', fields.metadataRelationshipControllingField));
        }
        if (fields.securityClassification !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('securityClassification', fields.securityClassification));
        }
        if (fields.stripMarkup !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('stripMarkup', fields.stripMarkup));
        }
        if (fields.summarizedField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('summarizedField', fields.summarizedField));
        }
        if (fields.summaryForeignKey !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('summaryForeignKey', fields.summaryForeignKey));
        }
        if (fields.summaryOperation !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('summaryOperation', fields.summaryOperation));
        }
        if (fields.trackFeedHistory !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('trackFeedHistory', fields.trackFeedHistory));
        }
        if (fields.trackHistory !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('trackHistory', fields.trackHistory));
        }
        if (fields.trackTrending !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('trackTrending', fields.trackTrending));
        }
        if (fields.trueValueIndexed !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('trueValueIndexed', fields.trueValueIndexed));
        }
        if (fields.valueSet !== undefined) {
          xmlLines = xmlLines.concat(CustomObjectUtils.getValueSetXMLLines(fields.valueSet, 1));
        }
        if (fields.writeRequiresMasterRead !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('writeRequiresMasterRead', fields.writeRequiresMasterRead));
        }
        if (fields.lookupFilter !== undefined) {
          xmlLines = xmlLines.concat(CustomObjectUtils.getLookupFiltersXMLLines(fields.lookupFilter, 1));
        }
        if (fields.picklist !== undefined) {
          xmlLines = xmlLines.concat(CustomObjectUtils.getPicklistXMLLines(fields.picklist, 1));
        }
        if (fields.summaryFilterItems !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('summaryFilterItems', fields.summaryFilterItems, true, 1));
        }
        xmlLines.push('</CustomField>');
      }
    }
    return xmlLines;
  }

  static getValueSetXMLLines(valueSet, initIndent) {
    let xmlLines = [];
    xmlLines.push(Utils.getTabs(initIndent) +'<valueSet>');
    if (valueSet.controllingField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('controllingField', valueSet.controllingField));
    }
    if (valueSet.restricted !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('restricted', valueSet.restricted));
    }
    if (valueSet.valueSetDefinition !== undefined) {
      xmlLines = xmlLines.concat(CustomObjectUtils.getValueSetDefinitionXMLLines(valueSet.valueSetDefinition, initIndent + 1));
    }
    if (valueSet.valueSettings !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('valueSettings', valueSet.valueSettings, true, initIndent + 1));
    }
    xmlLines.push(Utils.getTabs(initIndent) +'</valueSet>');
    return xmlLines;
  }

  static getValueSetDefinitionXMLLines(valueSetDefinition, initIndent) {
    let xmlLines = [];
    xmlLines.push(Utils.getTabs(initIndent) +'<valueSetDefinition>');
    if (valueSetDefinition.sorted !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sorted', valueSetDefinition.sorted));
    }
    if (valueSetDefinition.value !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('value', valueSetDefinition.value, true, initIndent + 1));
    }
    xmlLines.push(Utils.getTabs(initIndent) +'</valueSetDefinition>');
    return xmlLines;
  }

  static getLookupFiltersXMLLines(lookupFilter, initIndent) {
    let xmlLines = [];
    const filters = Utils.forceArray(lookupFilter);
    xmlLines.push(Utils.getTabs(initIndent) + '<lookupFilter>');
    for (const filter of filters) {
      if (filter.description !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', filter.description));
      }
      if (filter.active !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', filter.active));
      }
      if (filter.booleanFilter !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', filter.booleanFilter));
      }
      if (filter.infoMessage !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('infoMessage', filter.infoMessage));
      }
      if (filter.errorMessage !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('errorMessage', filter.errorMessage));
      }
      if (filter.isOptional !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isOptional', filter.isOptional));
      }
      if (filter.filterItems !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('filterItems', filter.filterItems, true, initIndent + 1));
      }
    }
    xmlLines.push(Utils.getTabs(initIndent) + '</lookupFilter>');
    return xmlLines;
  }

  static getPicklistXMLLines(picklist, initIndent) {
    let xmlLines = [];
    xmlLines.push('<picklist>');
    if (picklist.controllingField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('controllingField', picklist.controllingField));
    }
    if (picklist.restrictedPicklist !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('restrictedPicklist', picklist.restrictedPicklist));
    }
    if (picklist.sorted !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sorted', picklist.sorted));
    }
    if (picklist.picklistValues !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('picklistValues', picklist.picklistValues, true, 1));
    }
    xmlLines.push('</picklist>');
    return xmlLines;
  }

  static getFieldSetsXMLLines(fieldSets, initIndent) {
    let xmlLines = [];
    const sets = Utils.forceArray(fieldSets);
    for (const fieldSet of sets) {
      xmlLines.push(Utils.getTabs(initIndent) + '<fieldSets>');
      if (fieldSet.label !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', fieldSet.label));
      }
      if (fieldSet.description !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', fieldSet.description));
      }
      if (fieldSet.availableFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('availableFields', fieldSet.availableFields, true, 1));
      }
      if (fieldSet.displayedFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('displayedFields', fieldSet.displayedFields, true, 1));
      }
      xmlLines.push(Utils.getTabs(initIndent) + '</fieldSets>');
    }
    return xmlLines;
  }

  static getIndexesXMLLines(indexes, initIndent) {
    let xmlLines = [];
    if (indexes) {
      if (initIndent != -1) {
        for (const index of indexes) {
          xmlLines.push(Utils.getTabs(initIndent) + '<indexes>');
          if (index.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', index.fullName));
          }
          if (index.label !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', index.label));
          }
          if (index.fields !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', index.fields, true, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</indexes>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<Index xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (indexes.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', indexes.fullName));
        }
        if (indexes.label !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', indexes.label));
        }
        if (indexes.fields !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', indexes.fields, true, initIndent + 1));
        }
        xmlLines.push('</Index>');
      }
    }
    return xmlLines;
  }

  static getListViewsXMLLines(listviews, initIndent) {
    let xmlLines = [];
    if (listviews) {
      if (initIndent != -1) {
        for (const listview of listviews) {
          xmlLines.push(Utils.getTabs(initIndent) + '<listViews>');
          if (listview.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', listview.fullName));
          }
          if (listview.label !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', listview.label));
          }
          if (listview.booleanFilter !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', listview.booleanFilter));
          }
          if (listview.division !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('division', listview.division));
          }
          if (listview.filterScope !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('filterScope', listview.filterScope));
          }
          if (listview.language !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('language', listview.language));
          }
          if (listview.queue !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('queue', listview.queue));
          }
          if (listview.filters !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('filters', listview.filters, true, initIndent + 1));
          }
          if (listview.columns !== undefined) {
            xmlLines = xmlLines.concat(Utils.getXMLBlock('columns', listview.columns, true, initIndent + 1));
          }
          if (listview.sharedTo !== undefined) {
            xmlLines = xmlLines.concat(CustomObjectUtils.getSharedToXMLLines(listview.sharedTo, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</listViews>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<ListView xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (listviews.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', listviews.fullName));
        }
        if (listviews.label !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('label', listviews.label));
        }
        if (listviews.booleanFilter !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('booleanFilter', listviews.booleanFilter));
        }
        if (listviews.division !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('division', listviews.division));
        }
        if (listviews.filterScope !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('filterScope', listviews.filterScope));
        }
        if (listviews.language !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('language', listviews.language));
        }
        if (listviews.queue !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('queue', listviews.queue));
        }
        if (listviews.filters !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('filters', listviews.filters, true, 1));
        }
        if (listviews.columns !== undefined) {
          xmlLines = xmlLines.concat(Utils.getXMLBlock('columns', listviews.columns, true, 1));
        }
        if (listviews.sharedTo !== undefined) {
          xmlLines = xmlLines.concat(CustomObjectUtils.getSharedToXMLLines(listviews.sharedTo, 1));
        }
        xmlLines.push('</ListView>');
      }
    }
    return xmlLines;
  }

  static getSharedToXMLLines(sharedTo, initIndent) {
    let xmlLines = [];
    xmlLines.push(Utils.getTabs(initIndent) + '<sharedTo>');
    if (sharedTo.allCustomerPortalUsers !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('allCustomerPortalUsers', sharedTo.allCustomerPortalUsers, true, initIndent + 1));
    }
    if (sharedTo.allInternalUsers !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('allInternalUsers', sharedTo.allInternalUsers, true, initIndent + 1));
    }
    if (sharedTo.allPartnerUsers !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('allPartnerUsers', sharedTo.allPartnerUsers, true, initIndent + 1));
    }
    if (sharedTo.channelProgramGroup !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('channelProgramGroup', sharedTo.channelProgramGroup, true, initIndent + 1));
    }
    if (sharedTo.channelProgramGroups !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('channelProgramGroups', sharedTo.channelProgramGroups, true, initIndent + 1));
    }
    if (sharedTo.group !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('group', sharedTo.group, true, initIndent + 1));
    }
    if (sharedTo.guestUser !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('guestUser', sharedTo.guestUser, true, initIndent + 1));
    }
    if (sharedTo.groups !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('groups', sharedTo.groups, true, initIndent + 1));
    }
    if (sharedTo.managerSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('managerSubordinates', sharedTo.managerSubordinates, true, initIndent + 1));
    }
    if (sharedTo.managers !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('managers', sharedTo.managers, true, initIndent + 1));
    }
    if (sharedTo.portalRole !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('portalRole', sharedTo.portalRole, true, initIndent + 1));
    }
    if (sharedTo.portalRoleandSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('portalRoleandSubordinates', sharedTo.portalRoleandSubordinates, true, initIndent + 1));
    }
    if (sharedTo.role !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('role', sharedTo.role, true, initIndent + 1));
    }
    if (sharedTo.roleAndSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('roleAndSubordinates', sharedTo.roleAndSubordinates, true, initIndent + 1));
    }
    if (sharedTo.roleAndSubordinatesInternal !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('roleAndSubordinatesInternal', sharedTo.roleAndSubordinatesInternal, true, initIndent + 1));
    }
    if (sharedTo.roles !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('roles', sharedTo.roles, true, initIndent + 1));
    }
    if (sharedTo.rolesAndSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('rolesAndSubordinates', sharedTo.rolesAndSubordinates, true, initIndent + 1));
    }
    if (sharedTo.territories !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('territories', sharedTo.territories, true, initIndent + 1));
    }
    if (sharedTo.territoriesAndSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('territoriesAndSubordinates', sharedTo.territoriesAndSubordinates, true, initIndent + 1));
    }
    if (sharedTo.territory !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('territory', sharedTo.territory, true, initIndent + 1));
    }
    if (sharedTo.territoryAndSubordinates !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('territoryAndSubordinates', sharedTo.territoryAndSubordinates, true, initIndent + 1));
    }
    if (sharedTo.queue !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('queue', sharedTo.queue, true, initIndent + 1));
    }
    xmlLines.push(Utils.getTabs(initIndent) + '</sharedTo>');
    return xmlLines;
  }

  static getNamedFiltersXMLLines(namedFilters, initIndent) {
    let xmlLines = [];
    for (const filter of namedFilters) {
      xmlLines.push(Utils.getTabs(initIndent) + '<namedFilter>');
      if (filter.fullName !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', filter.fullName));
      }
      if (filter.name !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('name', filter.name));
      }
      if (filter.sourceObject !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('sourceObject', filter.sourceObject));
      }
      if (filter.description !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', filter.description));
      }
      if (filter.field !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('field', filter.field));
      }
      if (filter.active !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', filter.active));
      }
      if (filter.booleanFilter !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('booleanFilter', filter.booleanFilter));
      }
      if (filter.infoMessage !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('infoMessage', filter.infoMessage));
      }
      if (filter.errorMessage !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('errorMessage', filter.errorMessage));
      }
      if (filter.isOptional !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isOptional', filter.isOptional));
      }
      if (filter.filterItems !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('filterItems', filter.filterItems, true, initIndent + 1));
      }
      xmlLines.push(Utils.getTabs(initIndent) + '</namedFilter>');
    }
    return xmlLines;
  }

  static getNameFieldXMLLines(nameField, initIndent) {
    let xmlLines = [];
    xmlLines.push(Utils.getTabs(initIndent) + '<nameField>');
    if (nameField.fullName !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', nameField.fullName));
    }
    if (nameField.label !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', nameField.label));
    }
    if (nameField.type !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('type', nameField.type));
    }
    if (nameField.unique !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('unique', nameField.unique));
    }
    if (nameField.required !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('required', nameField.required));
    }
    if (nameField.visibleLines !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('visibleLines', nameField.visibleLines));
    }
    if (nameField.startingNumber !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('startingNumber', nameField.startingNumber));
    }
    if (nameField.length !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('length', nameField.length));
    }
    if (nameField.scale !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scale', nameField.scale));
    }
    if (nameField.precision !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('precision', nameField.precision));
    }
    if (nameField.description !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', nameField.description));
    }
    if (nameField.referenceTargetField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('referenceTargetField', nameField.referenceTargetField));
    }
    if (nameField.referenceTo !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('referenceTo', nameField.referenceTo));
    }
    if (nameField.relationshipName !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipName', nameField.relationshipName));
    }
    if (nameField.relationshipLabel !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipLabel', nameField.relationshipLabel));
    }
    if (nameField.relationshipOrder !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('relationshipOrder', nameField.relationshipOrder));
    }
    if (nameField.inlineHelpText !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('inlineHelpText', nameField.inlineHelpText));
    }
    if (nameField.externalDeveloperName !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('externalDeveloperName', nameField.externalDeveloperName));
    }
    if (nameField.externalId !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('externalId', nameField.externalId));
    }
    if (nameField.indexed !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('indexed', nameField.indexed));
    }
    if (nameField.customDataType !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('customDataType', nameField.customDataType));
    }
    if (nameField.defaultValue !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('defaultValue', nameField.defaultValue));
    }
    if (nameField.displayFormat !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayFormat', nameField.displayFormat));
    }
    if (nameField.displayLocationInDecimal !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayLocationInDecimal', nameField.displayLocationInDecimal));
    }
    if (nameField.deleteConstraint !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('deleteConstraint', nameField.deleteConstraint));
    }
    if (nameField.deprecated !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('deprecated', nameField.deprecated));
    }
    if (nameField.businessOwnerGroup !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessOwnerGroup', nameField.businessOwnerGroup));
    }
    if (nameField.businessOwnerUser !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessOwnerUser', nameField.businessOwnerUser));
    }
    if (nameField.businessStatus !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessStatus', nameField.businessStatus));
    }
    if (nameField.caseSensitive !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('caseSensitive', nameField.caseSensitive));
    }
    if (nameField.complianceGroup !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('complianceGroup', nameField.complianceGroup));
    }
    if (nameField.encrypted !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encrypted', nameField.encrypted));
    }
    if (nameField.encryptionScheme !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encryptionScheme', nameField.encryptionScheme));
    }
    if (nameField.maskChar !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('maskChar', nameField.maskChar));
    }
    if (nameField.maskType !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('maskType', nameField.maskType));
    }
    if (nameField.fieldManageability !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fieldManageability', nameField.fieldManageability));
    }
    if (nameField.formula !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formula', nameField.formula));
    }
    if (nameField.formulaTreatBlanksAs !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('formulaTreatBlanksAs', nameField.formulaTreatBlanksAs));
    }
    if (nameField.globalPicklist !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('globalPicklist', nameField.globalPicklist));
    }
    if (nameField.isAIPredictionField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isAIPredictionField', nameField.isAIPredictionField));
    }
    if (nameField.isFilteringDisabled !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isFilteringDisabled', nameField.isFilteringDisabled));
    }
    if (nameField.isNameField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isNameField', nameField.isNameField));
    }
    if (nameField.isSortingDisabled !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isSortingDisabled', nameField.isSortingDisabled));
    }
    if (nameField.populateExistingRows !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('populateExistingRows', nameField.populateExistingRows));
    }
    if (nameField.reparentableMasterDetail !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('reparentableMasterDetail', nameField.reparentableMasterDetail));
    }
    if (nameField.metadataRelationshipControllingField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('metadataRelationshipControllingField', nameField.metadataRelationshipControllingField));
    }
    if (nameField.securityClassification !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('securityClassification', nameField.securityClassification));
    }
    if (nameField.stripMarkup !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('stripMarkup', nameField.stripMarkup));
    }
    if (nameField.summarizedField !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summarizedField', nameField.summarizedField));
    }
    if (nameField.summaryForeignKey !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryForeignKey', nameField.summaryForeignKey));
    }
    if (nameField.summaryOperation !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('summaryOperation', nameField.summaryOperation));
    }
    if (nameField.trackFeedHistory !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackFeedHistory', nameField.trackFeedHistory));
    }
    if (nameField.trackHistory !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackHistory', nameField.trackHistory));
    }
    if (nameField.trackTrending !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trackTrending', nameField.trackTrending));
    }
    if (nameField.trueValueIndexed !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('trueValueIndexed', nameField.trueValueIndexed));
    }
    if (nameField.valueSet !== undefined) {
      xmlLines = xmlLines.concat(CustomObjectUtils.getValueSetXMLLines(nameField.valueSet, initIndent + 1));
    }
    if (nameField.writeRequiresMasterRead !== undefined) {
      xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('writeRequiresMasterRead', nameField.writeRequiresMasterRead));
    }
    if (nameField.lookupFilter !== undefined) {
      xmlLines = xmlLines.concat(CustomObjectUtils.getLookupFiltersXMLLines(nameField.lookupFilter, initIndent + 1));
    }
    if (nameField.picklist !== undefined) {
      xmlLines = xmlLines.concat(CustomObjectUtils.getPicklistXMLLines(nameField.picklist, initIndent + 1));
    }
    if (nameField.summaryFilterItems !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('summaryFilterItems', nameField.summaryFilterItems, true, initIndent + 1));
    }
    xmlLines.push(Utils.getTabs(initIndent) + '</nameField>');
    return xmlLines;
  }

  static getProfileSearchLayoutsXMLLines(profileSearchLayouts, initIndent) {
    let xmlLines = [];
    xmlLines.push(Utils.getTabs(initIndent) + '<profileSearchLayouts>');
    if (profileSearchLayouts.profileName !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('profileName', profileSearchLayouts.profileName, true, initIndent + 1));
    }
    if (profileSearchLayouts.fields !== undefined) {
      xmlLines = xmlLines.concat(Utils.getXMLBlock('fields', profileSearchLayouts.fields, true, initIndent + 1));
    }
    xmlLines.push(Utils.getTabs(initIndent) + '</profileSearchLayouts>');
    return xmlLines;
  }

  static getRecordTypesXMLLines(recordTypes, initIndent) {
    let xmlLines = [];
    if (recordTypes) {
      if (initIndent != -1) {
        for (const recordType of recordTypes) {
          xmlLines.push(Utils.getTabs(initIndent) + '<recordTypes>');
          if (recordType.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', recordType.fullName));
          }
          if (recordType.label !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', recordType.label));
          }
          if (recordType.description !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', recordType.description));
          }
          if (recordType.active !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', recordType.active));
          }
          if (recordType.businessProcess !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessProcess', recordType.businessProcess));
          }
          if (recordType.compactLayoutAssignment !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('compactLayoutAssignment', recordType.compactLayoutAssignment));
          }
          if (recordType.picklistValues !== undefined) {
            xmlLines = xmlLines.concat(CustomObjectUtils.getRecordTypePicklistXMLLines(recordType.picklistValues, initIndent + 1));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</recordTypes>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<RecordType xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (recordTypes.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', recordTypes.fullName));
        }
        if (recordTypes.label !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('label', recordTypes.label));
        }
        if (recordTypes.description !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', recordTypes.description));
        }
        if (recordTypes.active !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', recordTypes.active));
        }
        if (recordTypes.businessProcess !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('businessProcess', recordTypes.businessProcess));
        }
        if (recordTypes.compactLayoutAssignment !== undefined) {
          xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('compactLayoutAssignment', recordTypes.compactLayoutAssignment));
        }
        if (recordTypes.picklistValues !== undefined) {
          xmlLines = xmlLines.concat(CustomObjectUtils.getRecordTypePicklistXMLLines(recordTypes.picklistValues, initIndent + 1));
        }
        xmlLines.push('</RecordType>');
      }
    }
    return xmlLines;
  }

  static getRecordTypePicklistXMLLines(picklistValues, initIndent) {
    let xmlLines = [];
    const values = Utils.forceArray(picklistValues);
    for (const value of values) {
      xmlLines.push(Utils.getTabs(initIndent) + '<picklistValues>');
      if (value.picklist !== undefined) {
        xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('picklist', value.picklist));
      }
      if (value.values !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('values', value.values, true, 1));
      }
      xmlLines.push(Utils.getTabs(initIndent) + '</picklistValues>');
    }
    return xmlLines;
  }

  static getSearchLayoutsXMLLines(searchLayouts, initIndent) {
    let xmlLines = [];
    const layoutsToProcess = Utils.forceArray(searchLayouts);
    for (const layout of layoutsToProcess) {
      xmlLines.push(Utils.getTabs(initIndent) + '<searchLayouts>');
      if (layout.customTabListAdditionalFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('customTabListAdditionalFields', layout.customTabListAdditionalFields, true, initIndent + 1));
      }
      if (layout.excludedStandardButtons !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('excludedStandardButtons', layout.excludedStandardButtons, true, initIndent + 1));
      }
      if (layout.listViewButtons !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('listViewButtons', layout.listViewButtons, true, initIndent + 1));
      }
      if (layout.lookupDialogsAdditionalFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('lookupDialogsAdditionalFields', layout.lookupDialogsAdditionalFields, true, initIndent + 1));
      }
      if (layout.lookupFilterFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('lookupFilterFields', layout.lookupFilterFields, true, initIndent + 1));
      }
      if (layout.lookupPhoneDialogsAdditionalFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('lookupPhoneDialogsAdditionalFields', layout.lookupPhoneDialogsAdditionalFields, true, initIndent + 1));
      }
      if (layout.massQuickActions !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('massQuickActions', layout.massQuickActions, true, initIndent + 1));
      }
      if (layout.searchFilterFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('searchFilterFields', layout.searchFilterFields, true, initIndent + 1));
      }
      if (layout.searchResultsAdditionalFields !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('searchResultsAdditionalFields', layout.searchResultsAdditionalFields, true, initIndent + 1));
      }
      if (layout.searchResultsCustomButtons !== undefined) {
        xmlLines = xmlLines.concat(Utils.getXMLBlock('searchResultsCustomButtons', layout.searchResultsCustomButtons, true, initIndent + 1));
      }
      xmlLines.push(Utils.getTabs(initIndent) + '</searchLayouts>');
    }
    return xmlLines;
  }

  static getValidationRulesXMLLines(validationRules, initIndent) {
    const xmlLines = [];
    if (validationRules) {
      if (initIndent != -1) {
        for (const validationRule of validationRules) {
          xmlLines.push(Utils.getTabs(initIndent) + '<validationRules>');
          if (validationRule.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', validationRule.fullName));
          }
          if (validationRule.description !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', validationRule.description));
          }
          if (validationRule.errorConditionFormula !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('errorConditionFormula', validationRule.errorConditionFormula));
          }
          if (validationRule.errorDisplayField !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('errorDisplayField', validationRule.errorDisplayField));
          }
          if (validationRule.errorMessage !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('errorMessage', validationRule.errorMessage));
          }
          if (validationRule.active !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('active', validationRule.active));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</validationRules>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<ValidationRule xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (validationRules.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', validationRules.fullName));
        }
        if (validationRules.description !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', validationRules.description));
        }
        if (validationRules.errorConditionFormula !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('errorConditionFormula', validationRules.errorConditionFormula));
        }
        if (validationRules.errorDisplayField !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('errorDisplayField', validationRules.errorDisplayField));
        }
        if (validationRules.errorMessage !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('errorMessage', validationRules.errorMessage));
        }
        if (validationRules.active !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('active', validationRules.active));
        }
        xmlLines.push('</ValidationRule>');
      }
    }
    return xmlLines;
  }

  static getWeblinksXMLLines(weblinks, initIndent) {
    const xmlLines = [];
    if (weblinks) {
      if (initIndent != -1) {
        for (const weblink of weblinks) {
          xmlLines.push(Utils.getTabs(initIndent) + '<webLinks>');
          if (weblink.fullName !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('fullName', weblink.fullName));
          }
          if (weblink.masterLabel !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('masterLabel', weblink.masterLabel));
          }
          if (weblink.description !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('description', weblink.description));
          }
          if (weblink.displayType !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('displayType', weblink.displayType));
          }
          if (weblink.linkType !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('linkType', weblink.linkType));
          }
          if (weblink.url !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('url', weblink.url));
          }
          if (weblink.encodingKey !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('encodingKey', weblink.encodingKey));
          }
          if (weblink.availability !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('availability', weblink.availability));
          }
          if (weblink.hasMenubar !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('hasMenubar', weblink.hasMenubar));
          }
          if (weblink.hasScrollbars !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('hasScrollbars', weblink.hasScrollbars));
          }
          if (weblink.hasToolbar !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('hasToolbar', weblink.hasToolbar));
          }
          if (weblink.height !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('height', weblink.height));
          }
          if (weblink.width !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('width', weblink.width));
          }
          if (weblink.position !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('position', weblink.position));
          }
          if (weblink.isResizable !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('isResizable', weblink.isResizable));
          }
          if (weblink.openType !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('openType', weblink.openType));
          }
          if (weblink.page !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('page', weblink.page));
          }
          if (weblink.protected !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('protected', weblink.protected));
          }
          if (weblink.requireRowSelection !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('requireRowSelection', weblink.requireRowSelection));
          }
          if (weblink.scontrol !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('scontrol', weblink.scontrol));
          }
          if (weblink.showsLocation !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showsLocation', weblink.showsLocation));
          }
          if (weblink.showsStatus !== undefined) {
            xmlLines.push(Utils.getTabs(initIndent + 1) + Utils.getXMLTag('showsStatus', weblink.showsStatus));
          }
          xmlLines.push(Utils.getTabs(initIndent) + '</webLinks>');
        }
      } else {
        xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
        xmlLines.push('<WebLink xmlns="http://soap.sforce.com/2006/04/metadata">');
        if (weblinks.fullName !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('fullName', weblinks.fullName));
        }
        if (weblinks.masterLabel !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('masterLabel', weblinks.masterLabel));
        }
        if (weblinks.description !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('description', weblinks.description));
        }
        if (weblinks.displayType !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('displayType', weblinks.displayType));
        }
        if (weblinks.linkType !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('linkType', weblinks.linkType));
        }
        if (weblinks.url !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('url', weblinks.url));
        }
        if (weblinks.encodingKey !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('encodingKey', weblinks.encodingKey));
        }
        if (weblinks.availability !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('availability', weblinks.availability));
        }
        if (weblinks.hasMenubar !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasMenubar', weblinks.hasMenubar));
        }
        if (weblinks.hasScrollbars !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasScrollbars', weblinks.hasScrollbars));
        }
        if (weblinks.hasToolbar !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('hasToolbar', weblinks.hasToolbar));
        }
        if (weblinks.height !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('height', weblinks.height));
        }
        if (weblinks.width !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('width', weblinks.width));
        }
        if (weblinks.position !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('position', weblinks.position));
        }
        if (weblinks.isResizable !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('isResizable', weblinks.isResizable));
        }
        if (weblinks.openType !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('openType', weblinks.openType));
        }
        if (weblinks.page !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('page', weblinks.page));
        }
        if (weblinks.protected !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('protected', weblinks.protected));
        }
        if (weblinks.requireRowSelection !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('requireRowSelection', weblinks.requireRowSelection));
        }
        if (weblinks.scontrol !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('scontrol', weblinks.scontrol));
        }
        if (weblinks.showsLocation !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showsLocation', weblinks.showsLocation));
        }
        if (weblinks.showsStatus !== undefined) {
          xmlLines.push(Utils.getTabs(1) + Utils.getXMLTag('showsStatus', weblinks.showsStatus));
        }
        xmlLines.push('</WebLink>');
      }
    }
    return xmlLines;
  }
}
module.exports = CustomObjectUtils;
