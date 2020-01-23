const fileSystem = require('../fileSystem');
const MetadataTypes = require('./metadataTypes');
const Utils = require('./utils');
const StrUtils = require('../utils/strUtils');
const languages = require('../languages');
const Logger = require('../main/logger');
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const AuraParser = languages.AuraParser;

class MetadataFactory {
     static createMetadataType(name, checked) {
          return {
               name: name,
               checked: (checked) ? checked : false,
               childs: {}
          };
     }

     static createMetadataObject(name, checked) {
          return {
               name: name,
               checked: (checked) ? checked : false,
               childs: {}
          };
     }

     static createMetadataItem(name, checked) {
          return {
               name: name,
               checked: (checked) ? checked : false,
          };
     }

     static getMetadataObjectsFromFileSystem(folderMetadataMap) {
          let metadata = {};
          let folders = FileReader.readDirSync(Paths.getMetadataRootFolder());
          for (const folder of folders) {
               let metadataType = folderMetadataMap[folder];
               if (metadataType) {
                    let folderPath = Paths.getMetadataRootFolder() + '/' + folder;
                    if (folder == 'objects') {
                         metadata = MetadataFactory.getCustomObjectsMetadata(metadata, folderPath);
                    } else if (folder == 'approvalProcesses') {
                         metadata[metadataType.xmlName] = MetadataFactory.getApprovalProcessesMetadataFromFolder(folderPath);
                    } else if (folder == 'customMetadata') {
                         metadata[metadataType.xmlName] = MetadataFactory.getCustomMetadataFromFolder(folderPath);
                    } else if (folder == 'dashboards') {
                         metadata[metadataType.xmlName] = MetadataFactory.getDashboardsMetadataFromFolder(folderPath);
                    } else if (folder == 'documents') {
                         metadata[metadataType.xmlName] = MetadataFactory.getDocumentsMetadataFromFolder(folderPath);
                    } else if (folder == 'duplicateRules') {
                         metadata[metadataType.xmlName] = MetadataFactory.getDuplicateRulesMetadataFromFolder(folderPath);
                    } else if (folder == 'email') {
                         metadata[metadataType.xmlName] = MetadataFactory.getEmailTemplateMetadataFromFolder(folderPath);
                    } else if (folder == 'flows') {
                         metadata[metadataType.xmlName] = MetadataFactory.getFlowsMetadataFromFolder(folderPath);
                    } else if (folder == 'layouts') {
                         metadata[metadataType.xmlName] = MetadataFactory.getLayoutsMetadataFromFolder(folderPath);
                    } else if (folder == 'objectTranslations') {
                         metadata[metadataType.xmlName] = MetadataFactory.getObjectTranslationsMetadataFromFolder(folderPath);
                    } else if (folder == 'reports') {
                         metadata[metadataType.xmlName] = MetadataFactory.getReportsMetadataFromFolder(folderPath);
                    } else if (folder == 'quickActions') {
                         metadata[metadataType.xmlName] = MetadataFactory.getQuickActionsMetadataFromFolder(folderPath);
                    } else if (folder == 'lwc') {
                         let newMetadata = MetadataFactory.createMetadataType(metadataType.xmlName, false);
                         newMetadata.childs = MetadataFactory.getMetadataObjects(folderPath, true);
                         metadata[metadataType.xmlName] = newMetadata;
                    } else if (folder == 'aura') {
                         let newMetadata = MetadataFactory.createMetadataType(metadataType.xmlName, false);
                         newMetadata.childs = MetadataFactory.getMetadataObjects(folderPath, true);
                         metadata[metadataType.xmlName] = newMetadata;
                    } else if (folder == 'labels') {
                         let customLabels = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_LABELS, false);
                         customLabels.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.CUSTOM_LABELS] = customLabels;
                         let customLabel = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_LABEL, false);
                         customLabel.childs = MetadataFactory.getCustomLabelsMetadataFromFile(folderPath);
                         metadata[MetadataTypes.CUSTOM_LABEL] = customLabel;
                    } else if (folder == 'assignmentRules') {
                         let assignmentRules = MetadataFactory.createMetadataType(MetadataTypes.ASSIGNMENT_RULES, false);
                         assignmentRules.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.ASSIGNMENT_RULES] = assignmentRules;
                         let assignmentRule = MetadataFactory.createMetadataType(MetadataTypes.ASSIGNMENT_RULES, false);
                         assignmentRule.childs = MetadataFactory.getAssignmentRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.ASSIGNMENT_RULE] = assignmentRule;
                    } else if (folder == 'autoResponseRules') {
                         let autoResponseRules = MetadataFactory.createMetadataType(MetadataTypes.AUTORESPONSE_RULES, false);
                         autoResponseRules.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.AUTORESPONSE_RULES] = autoResponseRules;
                         let autoResponseRule = MetadataFactory.createMetadataType(MetadataTypes.AUTORESPONSE_RULE, false);
                         autoResponseRule.childs = MetadataFactory.getAutoResponseRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.AUTORESPONSE_RULE] = autoResponseRule;
                    } else if (folder == 'escalationRules') {
                         let escalationRules = MetadataFactory.createMetadataType(MetadataTypes.ESCALATION_RULES, false);
                         escalationRules.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.ESCALATION_RULES] = escalationRules;
                         let escalationRule = MetadataFactory.createMetadataType(MetadataTypes.ESCALATION_RULE, false);
                         escalationRule.childs = MetadataFactory.getEscalationRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.ESCALATION_RULE] = escalationRule;
                    } else if (folder == 'matchingRules') {
                         let matchingRules = MetadataFactory.createMetadataType(MetadataTypes.MATCHING_RULES, false);
                         matchingRules.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.MATCHING_RULES] = matchingRules;
                         let matchingRule = MetadataFactory.createMetadataType(MetadataTypes.MATCHING_RULE, false);
                         matchingRule.childs = MetadataFactory.getMatchingRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.MATCHING_RULE] = matchingRule;
                    } else if (folder == 'sharingRules') {
                         let sharingRules = MetadataFactory.createMetadataType(MetadataTypes.SHARING_RULE, false);
                         sharingRules.childs = MetadataFactory.getMetadataObjects(folderPath, false);
                         metadata[MetadataTypes.SHARING_RULE] = sharingRules;
                         let sharingCriteriaRules = MetadataFactory.createMetadataType(MetadataTypes.SHARING_CRITERIA_RULE, false);
                         sharingCriteriaRules.childs = MetadataFactory.getSharingCriteriaRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.SHARING_CRITERIA_RULE] = sharingCriteriaRules;
                         let sharingOwnerRules = MetadataFactory.createMetadataType(MetadataTypes.SHARING_OWNER_RULE, false);
                         sharingOwnerRules.childs = MetadataFactory.getSharingOwnerRulesMetadataFromFile(folderPath);
                         metadata[MetadataTypes.SHARING_OWNER_RULE] = sharingOwnerRules;
                    } else if (folder == 'workflows') {
                         metadata = MetadataFactory.getWorkflowsMetadata(metadata, folderPath);
                    } else {
                         let newMetadata = MetadataFactory.createMetadataType(metadataType.xmlName, false);
                         newMetadata.childs = MetadataFactory.getMetadataObjects(folderPath);
                         metadata[metadataType.xmlName] = newMetadata;
                    }
               }
          }
          return metadata;
     }

     static getCustomLabelsMetadataFromFile(folderPath) {
          let filePath = folderPath + '/CustomLabels.labels-meta.xml';
          let customLabels = AuraParser.parseXML(FileReader.readFileSync(filePath));
          let objects = {};
          if (customLabels.CustomLabels && customLabels.CustomLabels.labels) {
               let labels = Utils.forceArray(customLabels.CustomLabels.labels);
               for (const label of labels) {
                    objects[label.fullName] = MetadataFactory.createMetadataObject(label.fullName, false);
               }
          }
          return objects;
     }

     static getAssignmentRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.AssignmentRules && xmlData.AssignmentRules.assignmentRule) {
                    let rules = Utils.forceArray(xmlData.AssignmentRules.assignmentRule);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getAutoResponseRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.AutoResponseRules && xmlData.AutoResponseRules.autoresponseRule) {
                    let rules = Utils.forceArray(xmlData.AutoResponseRules.autoresponseRule);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getEscalationRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.EscalationRules && xmlData.EscalationRules.escalationRule) {
                    let rules = Utils.forceArray(xmlData.EscalationRules.escalationRule);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getMatchingRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.MatchingRules && xmlData.MatchingRules.matchingRule) {
                    let rules = Utils.forceArray(xmlData.MatchingRules.matchingRule);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getSharingCriteriaRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.SharingRules && xmlData.SharingRules.sharingCriteriaRules) {
                    let rules = Utils.forceArray(xmlData.SharingRules.sharingCriteriaRules);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getSharingOwnerRulesMetadataFromFile(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let objects = {};
          for (const file of files) {
               let sObj = file.substring(0, file.indexOf('.'));
               objects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               let xmlData = AuraParser.parseXML(FileReader.readFileSync(folderPath + '/' + file));
               if (xmlData.SharingRules && xmlData.SharingRules.sharingOwnerRules) {
                    let rules = Utils.forceArray(xmlData.SharingRules.sharingOwnerRules);
                    for (const rule of rules) {
                         objects[sObj].childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                    }
               }

          }
          return objects;
     }

     static getApprovalProcessesMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_METADATA, false);
          let metadataObjects = {};
          for (const file of files) {
               let fileParts = file.split('.');
               let sObj = fileParts[0];
               let metadataName = fileParts[1];
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               if (metadataName && metadataName.length > 0 && !metadataObjects[sObj].childs[metadataName])
                    metadataObjects[sObj].childs[metadataName] = MetadataFactory.createMetadataItem(metadataName, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getDuplicateRulesMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.DUPLICATE_RULE, false);
          let metadataObjects = {};
          for (const file of files) {
               let fileParts = file.split('.');
               let sObj = fileParts[0];
               let rule = fileParts[1];
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               if (rule && rule.length > 0 && !metadataObjects[sObj].childs[rule])
                    metadataObjects[sObj].childs[rule] = MetadataFactory.createMetadataItem(rule, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getQuickActionsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.QUICK_ACTION, false);
          let metadataObjects = {};
          for (const file of files) {
               let fileParts = file.split('.');
               let sObj = fileParts[0];
               let action = fileParts[1];
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               if (action && action.length > 0 && !metadataObjects[sObj].childs[action])
                    metadataObjects[sObj].childs[action] = MetadataFactory.createMetadataItem(action, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getDashboardsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.DASHBOARD, false);
          let metadataObjects = {};
          for (const dashboardFolder of files) {
               if (dashboardFolder.indexOf('.') === -1) {
                    if (!metadataObjects[dashboardFolder])
                         metadataObjects[dashboardFolder] = MetadataFactory.createMetadataObject(dashboardFolder, false);
                    let dashboards = FileReader.readDirSync(folderPath + '/' + dashboardFolder);
                    for (const dashboard of dashboards) {
                         let name = dashboard.substring(0, dashboard.indexOf('.'));
                         if (name && name.length > 0 && !metadataObjects[dashboardFolder].childs[name])
                              metadataObjects[dashboardFolder].childs[name] = MetadataFactory.createMetadataItem(name, false);
                    }
               }
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getReportsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.REPORTS, false);
          let metadataObjects = {};
          for (const reportsFolder of files) {
               if (reportsFolder.indexOf('.') === -1) {
                    if (!metadataObjects[reportsFolder])
                         metadataObjects[reportsFolder] = MetadataFactory.createMetadataObject(reportsFolder, false);
                    let reports = FileReader.readDirSync(folderPath + '/' + reportsFolder);
                    for (const report of reports) {
                         let name = report.substring(0, report.indexOf('.'));
                         if (name && name.length > 0 && !metadataObjects[reportsFolder].childs[name])
                              metadataObjects[reportsFolder].childs[name] = MetadataFactory.createMetadataItem(name, false);
                    }
               }
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getDocumentsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.DOCUMENT, false);
          let metadataObjects = {};
          for (const docFolder of files) {
               if (docFolder.indexOf('.') === -1) {
                    if (!metadataObjects[docFolder])
                         metadataObjects[docFolder] = MetadataFactory.createMetadataObject(docFolder, false);
                    let docs = FileReader.readDirSync(folderPath + '/' + docFolder);
                    for (const doc of docs) {
                         let name = doc.substring(0, doc.indexOf('.'));
                         if (name && name.length > 0 && !metadataObjects[docFolder].childs[name])
                              metadataObjects[docFolder].childs[name] = MetadataFactory.createMetadataItem(name, false);
                    }
               }
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getObjectTranslationsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS, false);
          let metadataObjects = {};
          for (const translationFolder of files) {
               let fileParts = translationFolder.split('-');
               let sObj = fileParts[0];
               let translation = fileParts[1];
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               if (translation && translation.length > 0 && !metadataObjects[sObj].childs[translation])
                    metadataObjects[sObj].childs[translation] = MetadataFactory.createMetadataItem(translation, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getEmailTemplateMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.EMAIL_TEMPLATE, false);
          let metadataObjects = {};
          for (const emailFolder of files) {
               if (emailFolder.indexOf('.') === -1) {
                    if (!metadataObjects[emailFolder])
                         metadataObjects[emailFolder] = MetadataFactory.createMetadataObject(emailFolder, false);
                    let emails = FileReader.readDirSync(folderPath + '/' + emailFolder);
                    for (const email of emails) {
                         let name = email.substring(0, email.indexOf('.'));
                         if (name && name.length > 0 && !metadataObjects[emailFolder].childs[name])
                              metadataObjects[emailFolder].childs[name] = MetadataFactory.createMetadataItem(name, false);
                    }
               }
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getFlowsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.FLOWS, false);
          let metadataObjects = {};
          for (const flowFile of files) {
               let name = flowFile.substring(0, flowFile.indexOf('.'));
               let flow = undefined
               let version = undefined;
               if (name.indexOf('-') !== -1) {
                    flow = name.substring(0, name.indexOf('-')).trim();
                    version = name.substring(name.indexOf('-') + 1).trim();
               } else {
                    flow = name.trim();
               }
               if (!metadataObjects[flow])
                    metadataObjects[flow] = MetadataFactory.createMetadataObject(flow, false);
               if (version && version.length > 0)
                    metadataObjects[flow].childs[version] = MetadataFactory.createMetadataItem(version, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getLayoutsMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.LAYOUT, false);
          let metadataObjects = {};
          for (const layoutFile of files) {
               let name = layoutFile.substring(0, layoutFile.indexOf('.'));
               let sObj = name.substring(0, name.indexOf('-')).trim();
               let layout = name.substring(name.indexOf('-') + 1).trim();
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               if (layout && layout.length > 0)
                    metadataObjects[sObj].childs[layout] = MetadataFactory.createMetadataItem(layout, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getCustomMetadataFromFolder(folderPath) {
          let files = FileReader.readDirSync(folderPath);
          let metadataType = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM, false);
          let metadataObjects = {};
          for (const file of files) {
               let fileParts = file.split('.');
               let sObj = fileParts[0];
               let approvalName = fileParts[1];
               if (!metadataObjects[sObj])
                    metadataObjects[sObj] = MetadataFactory.createMetadataObject(sObj, false);
               metadataObjects[sObj].childs[approvalName] = MetadataFactory.createMetadataItem(approvalName, false);
          }
          metadataType.childs = metadataObjects;
          return metadataType;
     }

     static getWorkflowsMetadata(metadata, folderPath) {
          let files = FileReader.readDirSync(folderPath);
          metadata[MetadataTypes.WORKFLOW] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW, false);
          metadata[MetadataTypes.WORKFLOW_ALERT] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_ALERT, false);
          metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_FIELD_UPDATE, false);
          metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH, false);
          metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE, false);
          metadata[MetadataTypes.WORKFLOW_RULE] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_RULE, false);
          //metadata[MetadataTypes.WORKFLOW_SEND] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW, false);
          metadata[MetadataTypes.WORKFLOW_TASK] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW_TASK, false);
          for (const workflowFile of files) {
               let filePath = folderPath + '/' + workflowFile;
               let workflowObject = workflowFile.substring(0, workflowFile.indexOf('.'));
               metadata[MetadataTypes.WORKFLOW].childs[workflowObject] = MetadataFactory.createMetadataObject(workflowObject, false);
               let workflow = AuraParser.parseXML(FileReader.readFileSync(filePath));
               if (workflow.Workflow.alerts) {
                    let workflowAlerts = MetadataFactory.createMetadataObject(workflowObject, false);
                    let alerts = Utils.forceArray(workflow.Workflow.alerts);
                    for (const alert of alerts) {
                         workflowAlerts.childs[alert.fullName] = MetadataFactory.createMetadataItem(alert.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_ALERT].childs[workflowObject] = workflowAlerts;
                    }
               }
               if (workflow.Workflow.fieldUpdates) {
                    let workflowFieldUpdates = MetadataFactory.createMetadataObject(workflowObject, false);
                    let fields = Utils.forceArray(workflow.Workflow.fieldUpdates);
                    for (const fieldUpdate of fields) {
                         workflowFieldUpdates.childs[fieldUpdate.fullName] = MetadataFactory.createMetadataItem(fieldUpdate.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE].childs[workflowObject] = workflowFieldUpdates;
                    }
               }
               if (workflow.Workflow.knowledgePublishes) {
                    let workflowPublish = MetadataFactory.createMetadataObject(workflowObject, false);
                    let publishes = Utils.forceArray(workflow.Workflow.knowledgePublishes);
                    for (const knowledPublish of publishes) {
                         workflowPublish.childs[knowledPublish.fullName] = MetadataFactory.createMetadataItem(knowledPublish.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[workflowObject] = workflowPublish;
                    }
               }
               if (workflow.Workflow.outboundMessages) {
                    let workflowOutbound = MetadataFactory.createMetadataObject(workflowObject, false);
                    let outbouds = Utils.forceArray(workflow.Workflow.outboundMessages);
                    for (const outboundMessage of outbouds) {
                         workflowOutbound.childs[outboundMessage.fullName] = MetadataFactory.createMetadataItem(outboundMessage.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[workflowObject] = workflowOutbound;
                    }
               }
               if (workflow.Workflow.rules) {
                    let workflowRule = MetadataFactory.createMetadataObject(workflowObject, false);
                    let rules = Utils.forceArray(workflow.Workflow.rules);
                    for (const rule of rules) {
                         workflowRule.childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_RULE].childs[workflowObject] = workflowRule;
                    }
               }
               if (workflow.Workflow.tasks) {
                    let workflowTask = MetadataFactory.createMetadataObject(workflowObject, false);
                    let tasks = Utils.forceArray(workflow.Workflow.tasks);
                    for (const task of tasks) {
                         workflowTask.childs[task.fullName] = MetadataFactory.createMetadataItem(task.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_TASK].childs[workflowObject] = workflowTask;
                    }
               }
          }
          return metadata;
     }

     static getCustomObjectsMetadata(metadata, objectsPath) {
          let files = FileReader.readDirSync(objectsPath);
          metadata[MetadataTypes.CUSTOM_FIELDS] = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_FIELDS, false);;
          metadata[MetadataTypes.RECORD_TYPE] = MetadataFactory.createMetadataType(MetadataTypes.RECORD_TYPE, false);
          metadata[MetadataTypes.LISTVIEW] = MetadataFactory.createMetadataType(MetadataTypes.LISTVIEW, false);
          metadata[MetadataTypes.BUSINESS_PROCESS] = MetadataFactory.createMetadataType(MetadataTypes.BUSINESS_PROCESS, false);
          metadata[MetadataTypes.COMPACT_LAYOUT] = MetadataFactory.createMetadataType(MetadataTypes.COMPACT_LAYOUT, false);
          metadata[MetadataTypes.VALIDATION_RULE] = MetadataFactory.createMetadataType(MetadataTypes.VALIDATION_RULE, false);
          metadata[MetadataTypes.BUTTON_OR_LINK] = MetadataFactory.createMetadataType(MetadataTypes.BUTTON_OR_LINK, false);
          for (const objFolder of files) {
               let objPath = objectsPath + '/' + objFolder;
               let fields = MetadataFactory.createMetadataObject(objFolder, false);
               fields.childs = MetadataFactory.getMetadataItems(objPath + '/fields');
               let recordTypes = MetadataFactory.createMetadataObject(objFolder, false);
               recordTypes.childs = MetadataFactory.getMetadataItems(objPath + '/recordTypes');
               let listviews = MetadataFactory.createMetadataObject(objFolder, false);
               listviews.childs = MetadataFactory.getMetadataItems(objPath + '/listViews');
               let bussinesProcesses = MetadataFactory.createMetadataObject(objFolder, false);
               bussinesProcesses.childs = MetadataFactory.getMetadataItems(objPath + '/businessProcesses');
               let compactLayouts = MetadataFactory.createMetadataObject(objFolder, false);
               compactLayouts.childs = MetadataFactory.getMetadataItems(objPath + '/compactLayouts');
               let validationRules = MetadataFactory.createMetadataObject(objFolder, false);
               validationRules.childs = MetadataFactory.getMetadataItems(objPath + '/validationRules');
               let weblinks = MetadataFactory.createMetadataObject(objFolder, false);
               weblinks.childs = MetadataFactory.getMetadataItems(objPath + '/webLinks');
               metadata[MetadataTypes.CUSTOM_FIELDS].childs[objFolder] = fields;
               metadata[MetadataTypes.RECORD_TYPE].childs[objFolder] = recordTypes;
               metadata[MetadataTypes.LISTVIEW].childs[objFolder] = listviews;
               metadata[MetadataTypes.BUSINESS_PROCESS].childs[objFolder] = bussinesProcesses;
               metadata[MetadataTypes.COMPACT_LAYOUT].childs[objFolder] = compactLayouts;
               metadata[MetadataTypes.VALIDATION_RULE].childs[objFolder] = validationRules;
               metadata[MetadataTypes.BUTTON_OR_LINK].childs[objFolder] = weblinks;
          }
          return metadata;
     }

     static getMetadataObjects(folderPath, onlyFolders) {
          let objects = {};
          let objNamesAdded = [];
          if (FileChecker.isExists(folderPath)) {
               let files = FileReader.readDirSync(folderPath);
               for (const file of files) {
                    if (onlyFolders && file.indexOf('.') == -1) {
                         if (!objNamesAdded.includes(file)) {
                              objects[file] = MetadataFactory.createMetadataObject(file, false);
                              objNamesAdded.push(file);
                         }
                    } else if (!onlyFolders) {
                         let name = file.substring(0, file.indexOf('.'));
                         if (!objNamesAdded.includes(name)) {
                              objects[name] = MetadataFactory.createMetadataObject(name, false);
                              objNamesAdded.push(name);
                         }
                    }
               }
          }
          return objects;
     }

     static getMetadataItems(folderPath, onlyFolders) {
          let items = {};
          let itemsAdded = [];
          if (FileChecker.isExists(folderPath)) {
               let files = FileReader.readDirSync(folderPath);
               for (const file of files) {
                    if (onlyFolders && file.indexOf('.') == -1) {
                         if (!itemsAdded.includes(file)) {
                              items[file] = this.createMetadataItem(file, false);
                              itemsAdded.push(file);
                         }
                    } else {
                         let name = file.substring(0, file.indexOf('.'));
                         if (!itemsAdded.includes(name)) {
                              items[name] = this.createMetadataItem(name, false);
                              itemsAdded.push(name);
                         }
                    }
               }
          }
          return items;
     }

     static getMetadataFromGitDiffs(diffs, folderMetadataMap) {
          let metadataRootFolder = Paths.getMetadataRootFolder();
          let metadataForDeploy = {};
          let metadataForDelete = {};
          for (const diff of diffs) {
               let baseFolder = Paths.getFolderPath(Paths.getWorkspaceFolder() + '/' + diff.path);
               let fileNameWithExt = Paths.getBasename(diff.path);
               let fileName = fileNameWithExt.substring(0, fileNameWithExt.indexOf('.'));
               baseFolder = baseFolder.replace(metadataRootFolder + '/', '');
               let baseFolderSplits = baseFolder.split('/');
               let fistPartBaseFolder = baseFolderSplits[0];
               let lastPartFolder = baseFolderSplits[baseFolderSplits.length - 1];
               let metadataType;
               if (fistPartBaseFolder === 'lwc' && (fileNameWithExt === '.eslintrc.json' || fileNameWithExt === '.jsconfig.eslintrc.json'))
                    continue;
               if (fistPartBaseFolder === 'objects') {
                    metadataType = folderMetadataMap[fistPartBaseFolder + '/' + lastPartFolder];
               } else {
                    metadataType = folderMetadataMap[baseFolder];
               }
               if (!metadataType)
                    metadataType = folderMetadataMap[fistPartBaseFolder];
               if (metadataType) {
                    if (diff.mode === 'new file') {
                         let metadata = MetadataFactory.createMetadataType(metadataType.xmlName, true);
                         let childs = MetadataFactory.getMetadataObjectsFromGitDiff(metadataType, baseFolderSplits, fileName);
                         if (!metadataForDeploy[metadata.name])
                              metadataForDeploy[metadata.name] = metadata;
                         Object.keys(childs).forEach(function (childKey) {
                              if (!metadataForDeploy[metadata.name].childs[childKey])
                                   metadataForDeploy[metadata.name].childs[childKey] = childs[childKey];
                              if (childs[childKey].childs && Object.keys(childs[childKey].childs).length > 0) {
                                   Object.keys(childs[childKey].childs).forEach(function (grandChildKey) {
                                        if (!metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey])
                                             metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey] = childs[childKey].childs[grandChildKey];
                                   });
                              }
                         });
                    } else if (diff.mode === 'deleted file') {
                         let metadata = MetadataFactory.createMetadataType(metadataType.xmlName, true);
                         let childs = MetadataFactory.getMetadataObjectsFromGitDiff(metadataType, baseFolderSplits, fileName);
                         if (metadataType.xmlName !== MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS) {
                              if ((metadataType.xmlName === MetadataTypes.AURA && !fileNameWithExt.endsWith('.cmp') && !fileNameWithExt.endsWith('.evt') && !fileNameWithExt.endsWith('.app')) || (metadataType.xmlName === MetadataTypes.LWC && !fileNameWithExt.endsWith('.html'))) {
                                   if (!metadataForDeploy[metadata.name])
                                        metadataForDeploy[metadata.name] = metadata;
                                   Object.keys(childs).forEach(function (childKey) {
                                        if (!metadataForDeploy[metadata.name].childs[childKey])
                                             metadataForDeploy[metadata.name].childs[childKey] = childs[childKey];
                                        if (childs[childKey].childs && Object.keys(childs[childKey].childs).length > 0) {
                                             Object.keys(childs[childKey].childs).forEach(function (grandChildKey) {
                                                  if (!metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey])
                                                       metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey] = childs[childKey].childs[grandChildKey];
                                             });
                                        }
                                   });
                              } else {
                                   if (!metadataForDelete[metadata.name])
                                        metadataForDelete[metadata.name] = metadata;
                                   Object.keys(childs).forEach(function (childKey) {
                                        if (!metadataForDelete[metadata.name].childs[childKey])
                                             metadataForDelete[metadata.name].childs[childKey] = childs[childKey];
                                        if (childs[childKey].childs && Object.keys(childs[childKey].childs).length > 0) {
                                             Object.keys(childs[childKey].childs).forEach(function (grandChildKey) {
                                                  if (!metadataForDelete[metadata.name].childs[childKey].childs[grandChildKey])
                                                       metadataForDelete[metadata.name].childs[childKey].childs[grandChildKey] = childs[childKey].childs[grandChildKey];
                                             });
                                        }
                                   });
                              }
                         }
                    } else if (diff.mode === 'edit file') {
                         if (baseFolder.toLowerCase() === 'workflows') {
                              MetadataFactory.getWorkflowsFromDiff(diff, metadataForDeploy, metadataForDelete, fileName)
                         } if (baseFolder.toLowerCase() === 'assignmentRules') {
                              MetadataFactory.getAssignmentRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName)
                         } if (baseFolder.toLowerCase() === 'autoResponseRules') {
                              MetadataFactory.getAutoresponseRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName)
                         } if (baseFolder.toLowerCase() === 'labels') {
                              MetadataFactory.getCustomLabelsFromDiff(diff, metadataForDeploy, metadataForDelete, fileName)
                         } if (baseFolder.toLowerCase() === 'sharingRules') {
                              MetadataFactory.getSharingRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName)
                         } else {
                              let metadata = MetadataFactory.createMetadataType(metadataType.xmlName, true);
                              let childs = MetadataFactory.getMetadataObjectsFromGitDiff(metadataType, baseFolderSplits, fileName);
                              if (!metadataForDeploy[metadata.name])
                                   metadataForDeploy[metadata.name] = metadata;
                              Object.keys(childs).forEach(function (childKey) {
                                   if (!metadataForDeploy[metadata.name].childs[childKey])
                                        metadataForDeploy[metadata.name].childs[childKey] = childs[childKey];
                                   if (childs[childKey].childs && Object.keys(childs[childKey].childs).length > 0) {
                                        Object.keys(childs[childKey].childs).forEach(function (grandChildKey) {
                                             if (!metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey])
                                                  metadataForDeploy[metadata.name].childs[childKey].childs[grandChildKey] = childs[childKey].childs[grandChildKey];
                                        });
                                   }
                              });
                         }
                    }
               }
          }
          if (metadataForDelete[MetadataTypes.AURA]) {
               Object.keys(metadataForDelete[MetadataTypes.AURA].childs).forEach(function (childKey) {
                    if (metadataForDeploy[MetadataTypes.AURA] && metadataForDeploy[MetadataTypes.AURA].childs[childKey])
                         delete metadataForDeploy[MetadataTypes.AURA].childs[childKey];
               });
               if (metadataForDeploy[MetadataTypes.AURA] && Object.keys(metadataForDeploy[MetadataTypes.AURA].childs).length === 0)
                    delete metadataForDeploy[MetadataTypes.AURA];

          }
          if (metadataForDelete[MetadataTypes.LWC]) {
               Object.keys(metadataForDelete[MetadataTypes.LWC].childs).forEach(function (childKey) {
                    if (metadataForDeploy[MetadataTypes.LWC] && metadataForDeploy[MetadataTypes.LWC].childs[childKey])
                         delete metadataForDeploy[MetadataTypes.LWC].childs[childKey];
               });
               if (metadataForDeploy[MetadataTypes.LWC] && Object.keys(metadataForDeploy[MetadataTypes.LWC].childs).length === 0)
                    delete metadataForDeploy[MetadataTypes.LWC];
          }
          if (metadataForDelete[MetadataTypes.WORKFLOW]) {
               Object.keys(metadataForDelete[MetadataTypes.WORKFLOW].childs).forEach(function (childKey) {
                    if (metadataForDeploy[MetadataTypes.WORKFLOW] && metadataForDeploy[MetadataTypes.WORKFLOW].childs[childKey])
                         delete metadataForDeploy[MetadataTypes.WORKFLOW].childs[childKey];
               });
               if (metadataForDeploy[MetadataTypes.WORKFLOW] && Object.keys(metadataForDeploy[MetadataTypes.WORKFLOW].childs).length === 0)
                    delete metadataForDeploy[MetadataTypes.WORKFLOW];
          }

          return {
               metadataForDeploy: metadataForDeploy,
               metadataForDelete: metadataForDelete
          }
     }

     static getMetadataObjectsFromGitDiff(metadataType, baseFolderSplits, fileName) {
          let especialTypes = [MetadataTypes.CUSTOM_METADATA, MetadataTypes.APPROVAL_PROCESSES, MetadataTypes.DUPLICATE_RULE,
          MetadataTypes.QUICK_ACTION, MetadataTypes.LAYOUT, MetadataTypes.AURA, MetadataTypes.LWC, MetadataTypes.ASSIGNMENT_RULES, MetadataTypes.AUTORESPONSE_RULES,
          MetadataTypes.WORKFLOW, MetadataTypes.CUSTOM_LABELS, MetadataTypes.SHARING_RULE, MetadataTypes.FLOWS];
          let objects = {};
          let fistPartBaseFolder = baseFolderSplits[0];
          if (baseFolderSplits.length > 1 && !especialTypes.includes(metadataType.xmlName)) {
               let metadataObjectFolderName = baseFolderSplits[1];
               if (!objects[metadataObjectFolderName])
                    objects[metadataObjectFolderName] = MetadataFactory.createMetadataObject(metadataObjectFolderName, true);
               if (fistPartBaseFolder === 'objects' && baseFolderSplits.length > 2) {
                    objects[metadataObjectFolderName].childs[fileName] = MetadataFactory.createMetadataItem(fileName, true);
               } else if (baseFolderSplits.length > 1) {
                    objects[metadataObjectFolderName].childs[fileName] = MetadataFactory.createMetadataItem(fileName, true);
               }
          } else if (metadataType.xmlName === MetadataTypes.CUSTOM_METADATA || metadataType.xmlName === MetadataTypes.APPROVAL_PROCESSES || metadataType.xmlName === MetadataTypes.DUPLICATE_RULE || metadataType.xmlName === MetadataTypes.QUICK_ACTION) {
               let fileNameParts = fileName.split('.');
               let sobj = fileNameParts[0].trim();
               let item = fileNameParts[1].trim();
               if (!objects[sobj])
                    objects[sobj] = MetadataFactory.createMetadataObject(sobj, true);
               if (!objects[sobj].childs[item])
                    objects[sobj].childs[item] = MetadataFactory.createMetadataItem(item, true);
          } else if (metadataType.xmlName === MetadataTypes.LAYOUT) {
               let sobj = fileName.substring(0, fileName.indexOf('-')).trim();
               let item = fileName.substring(fileName.indexOf('-') + 1).trim();
               if (!objects[sobj])
                    objects[sobj] = MetadataFactory.createMetadataObject(sobj, true);
               if (!objects[sobj].childs[item])
                    objects[sobj].childs[item] = MetadataFactory.createMetadataItem(item, true);
          } else if (metadataType.xmlName === MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS) {
               let folderName = baseFolderSplits[0];
               let sobj = folderName.substring(0, folderName.indexOf('-')).trim();
               let item = folderName.substring(folderName.indexOf('-') + 1).trim();
               if (!objects[sobj])
                    objects[sobj] = MetadataFactory.createMetadataObject(sobj, true);
               if (!objects[sobj].childs[item])
                    objects[sobj].childs[item] = MetadataFactory.createMetadataItem(item, true);
          } else if (metadataType.xmlName === MetadataTypes.STATIC_RESOURCE) {
               if (baseFolderSplits.length === 1) {
                    if (!objects[fileName])
                         objects[fileName] = MetadataFactory.createMetadataObject(fileName, true);
               } else {
                    if (!objects[baseFolderSplits[1]])
                         objects[baseFolderSplits[1]] = MetadataFactory.createMetadataObject(baseFolderSplits[1], true);
               }
          } else if (metadataType.xmlName === MetadataTypes.FLOW) {
               if (fileName.indexOf('-') !== -1) {
                    let sobj = fileName.substring(0, fileName.indexOf('-')).trim();
                    let item = fileName.substring(fileName.indexOf('-') + 1).trim();
                    if (!objects[sobj])
                         objects[sobj] = MetadataFactory.createMetadataObject(sobj, true);
                    if (!objects[sobj].childs[item])
                         objects[sobj].childs[item] = MetadataFactory.createMetadataItem(item, true);
               } else {
                    if (!objects[fileName])
                         objects[fileName] = MetadataFactory.createMetadataObject(fileName, true);
               }
          } else if (metadataType.xmlName === MetadataTypes.AURA || metadataType.xmlName === MetadataTypes.LWC) {
               if (baseFolderSplits[1] && !objects[baseFolderSplits[1]])
                    objects[baseFolderSplits[1]] = MetadataFactory.createMetadataObject(baseFolderSplits[1], true);
          } else {
               if (!objects[fileName])
                    objects[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          }
          return objects;
     }

     static getAssignmentRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName) {
          if (!metadataForDeploy[MetadataTypes.ASSIGNMENT_RULES])
               metadataForDeploy[MetadataTypes.ASSIGNMENT_RULES] = MetadataFactory.createMetadataType(MetadataTypes.ASSIGNMENT_RULES, true);
          if (!metadataForDeploy[MetadataTypes.ASSIGNMENT_RULES].childs[fileName])
               metadataForDeploy[MetadataTypes.ASSIGNMENT_RULES].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          let nameTag = 'fullName';
          if (diff.removeChanges.length > 0) {
               let startSubtipe = false;
               let onMember = false;
               let fullNameContent = '';
               for (const changedLine of diff.removeChanges) {
                    let parentTagOpen = MetadataFactory.startXMLTag(changedLine, 'assignmentRule');
                    let parentTagClose = MetadataFactory.endXMLTag(changedLine, 'assignmentRule');
                    if (parentTagOpen !== undefined) {
                         startSubtipe = true;
                    }
                    if (startSubtipe) {
                         let startNameTag = MetadataFactory.startXMLTag(changedLine, nameTag);
                         let endNameTag = MetadataFactory.endXMLTag(changedLine, nameTag);
                         if (startNameTag !== undefined && endNameTag !== undefined) {
                              let startTagIndex = changedLine.indexOf('<' + nameTag + '>');
                              let endTagIndex = changedLine.indexOf('</' + nameTag + '>');
                              fullNameContent = changedLine.substring(startTagIndex, endTagIndex);
                              fullNameContent = fullNameContent.substring(fullNameContent.indexOf('>') + 1);
                         }
                         else if (startNameTag !== undefined) {
                              onMember = true;
                              fullNameContent += changedLine;
                         } else if (onMember) {
                              fullNameContent += changedLine;
                         } else if (endNameTag !== undefined) {
                              onMember = false;
                              fullNameContent += changedLine;
                         }
                    }
                    if (parentTagClose !== undefined) {
                         Logger.log('fullNameContent', fullNameContent);
                         startSubtipe = false;
                         fullNameContent = fullNameContent.trim();
                         if (fullNameContent.length > 0) {
                              let type = MetadataTypes.ASSIGNMENT_RULE;
                              if (!metadataForDelete[type])
                                   metadataForDelete[type] = MetadataFactory.createMetadataType(type, true);
                              if (!metadataForDelete[type].childs[fileName])
                                   metadataForDelete[type].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
                              metadataForDelete[type].childs[fileName].childs[fullNameContent] = MetadataFactory.createMetadataItem(fullNameContent, true);
                              fullNameContent = '';
                         }
                    }
               }
          }
     }

     static getAutoresponseRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName) {
          if (!metadataForDeploy[MetadataTypes.AUTORESPONSE_RULES])
               metadataForDeploy[MetadataTypes.AUTORESPONSE_RULES] = MetadataFactory.createMetadataType(MetadataTypes.AUTORESPONSE_RULES, true);
          if (!metadataForDeploy[MetadataTypes.AUTORESPONSE_RULES].childs[fileName])
               metadataForDeploy[MetadataTypes.AUTORESPONSE_RULES].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          let nameTag = 'fullName';
          if (diff.removeChanges.length > 0) {
               let startSubtipe = false;
               let onMember = false;
               let fullNameContent = '';
               for (const changedLine of diff.removeChanges) {
                    let parentTagOpen = MetadataFactory.startXMLTag(changedLine, 'autoResponseRule');
                    let parentTagClose = MetadataFactory.endXMLTag(changedLine, 'autoResponseRule');
                    if (parentTagOpen !== undefined) {
                         startSubtipe = true;
                    }
                    if (startSubtipe) {
                         let startNameTag = MetadataFactory.startXMLTag(changedLine, nameTag);
                         let endNameTag = MetadataFactory.endXMLTag(changedLine, nameTag);
                         if (startNameTag !== undefined && endNameTag !== undefined) {
                              let startTagIndex = changedLine.indexOf('<' + nameTag + '>');
                              let endTagIndex = changedLine.indexOf('</' + nameTag + '>');
                              fullNameContent = changedLine.substring(startTagIndex, endTagIndex);
                              fullNameContent = fullNameContent.substring(fullNameContent.indexOf('>') + 1);
                         }
                         else if (startNameTag !== undefined) {
                              onMember = true;
                              fullNameContent += changedLine;
                         } else if (onMember) {
                              fullNameContent += changedLine;
                         } else if (endNameTag !== undefined) {
                              onMember = false;
                              fullNameContent += changedLine;
                         }
                    }
                    if (parentTagClose !== undefined) {
                         Logger.log('fullNameContent', fullNameContent);
                         startSubtipe = false;
                         fullNameContent = fullNameContent.trim();
                         if (fullNameContent.length > 0) {
                              let type = MetadataTypes.AUTORESPONSE_RULE;
                              if (!metadataForDelete[type])
                                   metadataForDelete[type] = MetadataFactory.createMetadataType(type, true);
                              if (!metadataForDelete[type].childs[fileName])
                                   metadataForDelete[type].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
                              metadataForDelete[type].childs[fileName].childs[fullNameContent] = MetadataFactory.createMetadataItem(fullNameContent, true);
                              fullNameContent = '';
                         }
                    }
               }
          }
     }

     static getCustomLabelsFromDiff(diff, metadataForDeploy, metadataForDelete, fileName) {
          if (!metadataForDeploy[MetadataTypes.CUSTOM_LABELS])
               metadataForDeploy[MetadataTypes.CUSTOM_LABELS] = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_LABELS, true);
          if (!metadataForDeploy[MetadataTypes.CUSTOM_LABELS].childs[fileName])
               metadataForDeploy[MetadataTypes.CUSTOM_LABELS].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          let nameTag = 'fullName';
          if (diff.removeChanges.length > 0) {
               let startSubtipe = false;
               let onMember = false;
               let fullNameContent = '';
               for (const changedLine of diff.removeChanges) {
                    let parentTagOpen = MetadataFactory.startXMLTag(changedLine, 'labels');
                    let parentTagClose = MetadataFactory.endXMLTag(changedLine, 'labels');
                    if (parentTagOpen !== undefined) {
                         startSubtipe = true;
                    }
                    if (startSubtipe) {
                         let startNameTag = MetadataFactory.startXMLTag(changedLine, nameTag);
                         let endNameTag = MetadataFactory.endXMLTag(changedLine, nameTag);
                         if (startNameTag !== undefined && endNameTag !== undefined) {
                              let startTagIndex = changedLine.indexOf('<' + nameTag + '>');
                              let endTagIndex = changedLine.indexOf('</' + nameTag + '>');
                              fullNameContent = changedLine.substring(startTagIndex, endTagIndex);
                              fullNameContent = fullNameContent.substring(fullNameContent.indexOf('>') + 1);
                         }
                         else if (startNameTag !== undefined) {
                              onMember = true;
                              fullNameContent += changedLine;
                         } else if (onMember) {
                              fullNameContent += changedLine;
                         } else if (endNameTag !== undefined) {
                              onMember = false;
                              fullNameContent += changedLine;
                         }
                    }
                    if (parentTagClose !== undefined) {
                         Logger.log('fullNameContent', fullNameContent);
                         startSubtipe = false;
                         fullNameContent = fullNameContent.trim();
                         if (fullNameContent.length > 0) {
                              let type = MetadataTypes.CUSTOM_LABEL;
                              if (!metadataForDelete[type])
                                   metadataForDelete[type] = MetadataFactory.createMetadataType(type, true);
                              if (!metadataForDelete[type].childs[fileName])
                                   metadataForDelete[type].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
                              metadataForDelete[type].childs[fileName].childs[fullNameContent] = MetadataFactory.createMetadataItem(fullNameContent, true);
                              fullNameContent = '';
                         }
                    }
               }
          }
     }

     static getSharingRulesFromDiff(diff, metadataForDeploy, metadataForDelete, fileName) {
          if (!metadataForDeploy[MetadataTypes.SHARING_RULE])
               metadataForDeploy[MetadataTypes.SHARING_RULE] = MetadataFactory.createMetadataType(MetadataTypes.SHARING_RULE, true);
          if (!metadataForDeploy[MetadataTypes.SHARING_RULE].childs[fileName])
               metadataForDeploy[MetadataTypes.SHARING_RULE].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          let nameTag = 'fullName';
          if (diff.removeChanges.length > 0) {
               let startSubtipe = false;
               let onMember = false;
               let fullNameContent = '';
               for (const changedLine of diff.removeChanges) {
                    let parentTagOpen = MetadataFactory.isSharingRuleSubtypeStartTag(changedLine);
                    let parentTagClose = MetadataFactory.isSharingRuleSubtypeStartTag(changedLine);
                    if (parentTagOpen !== undefined) {
                         startSubtipe = true;
                    }
                    if (startSubtipe) {
                         let startNameTag = MetadataFactory.startXMLTag(changedLine, nameTag);
                         let endNameTag = MetadataFactory.endXMLTag(changedLine, nameTag);
                         if (startNameTag !== undefined && endNameTag !== undefined) {
                              let startTagIndex = changedLine.indexOf('<' + nameTag + '>');
                              let endTagIndex = changedLine.indexOf('</' + nameTag + '>');
                              fullNameContent = changedLine.substring(startTagIndex, endTagIndex);
                              fullNameContent = fullNameContent.substring(fullNameContent.indexOf('>') + 1);
                         }
                         else if (startNameTag !== undefined) {
                              onMember = true;
                              fullNameContent += changedLine;
                         } else if (onMember) {
                              fullNameContent += changedLine;
                         } else if (endNameTag !== undefined) {
                              onMember = false;
                              fullNameContent += changedLine;
                         }
                    }
                    if (parentTagClose !== undefined) {
                         Logger.log('fullNameContent', fullNameContent);
                         startSubtipe = false;
                         fullNameContent = fullNameContent.trim();
                         if (fullNameContent.length > 0) {
                              let type = MetadataFactory.getSharingRulesChildsByTag()[parentTagClose];
                              if (!metadataForDelete[type])
                                   metadataForDelete[type] = MetadataFactory.createMetadataType(type, true);
                              if (!metadataForDelete[type].childs[fileName])
                                   metadataForDelete[type].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
                              metadataForDelete[type].childs[fileName].childs[fullNameContent] = MetadataFactory.createMetadataItem(fullNameContent, true);
                              fullNameContent = '';
                         }
                    }
               }
          }
     }

     static getWorkflowsFromDiff(diff, metadataForDeploy, metadataForDelete, fileName) {
          if (!metadataForDeploy[MetadataTypes.WORKFLOW])
               metadataForDeploy[MetadataTypes.WORKFLOW] = MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW, true);
          if (!metadataForDeploy[MetadataTypes.WORKFLOW].childs[fileName])
               metadataForDeploy[MetadataTypes.WORKFLOW].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
          let nameTag = 'fullName';
          if (diff.removeChanges.length > 0) {
               let startSubtipe = false;
               let onMember = false;
               let fullNameContent = '';
               for (const changedLine of diff.removeChanges) {
                    let parentTagOpen = MetadataFactory.isWorkflowSubtypeStartTag(changedLine);
                    let parentTagClose = MetadataFactory.isWorkflowSubtypeEndTag(changedLine);
                    if (parentTagOpen !== undefined) {
                         startSubtipe = true;
                    }
                    if (startSubtipe) {
                         let startNameTag = MetadataFactory.startXMLTag(changedLine, nameTag);
                         let endNameTag = MetadataFactory.endXMLTag(changedLine, nameTag);
                         if (startNameTag !== undefined && endNameTag !== undefined) {
                              let startTagIndex = changedLine.indexOf('<' + nameTag + '>');
                              let endTagIndex = changedLine.indexOf('</' + nameTag + '>');
                              fullNameContent = changedLine.substring(startTagIndex, endTagIndex);
                              fullNameContent = fullNameContent.substring(fullNameContent.indexOf('>') + 1);
                         }
                         else if (startNameTag !== undefined) {
                              onMember = true;
                              fullNameContent += changedLine;
                         } else if (onMember) {
                              fullNameContent += changedLine;
                         } else if (endNameTag !== undefined) {
                              onMember = false;
                              fullNameContent += changedLine;
                         }
                    }
                    if (parentTagClose !== undefined) {
                         Logger.log('fullNameContent', fullNameContent);
                         startSubtipe = false;
                         fullNameContent = fullNameContent.trim();
                         if (fullNameContent.length > 0) {
                              let type = MetadataFactory.getWorkflowChildsByTag()[parentTagClose];
                              if (!metadataForDelete[type])
                                   metadataForDelete[type] = MetadataFactory.createMetadataType(type, true);
                              if (!metadataForDelete[type].childs[fileName])
                                   metadataForDelete[type].childs[fileName] = MetadataFactory.createMetadataObject(fileName, true);
                              metadataForDelete[type].childs[fileName].childs[fullNameContent] = MetadataFactory.createMetadataItem(fullNameContent, true);
                              fullNameContent = '';
                         }
                    }
               }
          }
     }

     static getWorkflowChildsByTag() {
          return {
               alerts: MetadataTypes.WORKFLOW_ALERT,
               fieldUpdates: MetadataTypes.WORKFLOW_FIELD_UPDATE,
               knowledgePublishes: MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH,
               outboundMessages: MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE,
               rules: MetadataTypes.WORKFLOW_RULE,
               tasks: MetadataTypes.WORKFLOW_TASK
          };
     }

     static getSharingRulesChildsByTag() {
          return {
               sharingCriteriaRules: MetadataTypes.SHARING_CRITERIA_RULE,
               sharingOwnerRules: MetadataTypes.SHARING_OWNER_RULE,
          };
     }

     static startXMLTag(content, tag) {
          if (content.indexOf('<' + tag + '>') !== -1)
               return tag;
          return undefined;
     }

     static endXMLTag(content, tag) {
          if (content.indexOf('</' + tag + '>') !== -1)
               return tag;
          return undefined;
     }

     static isWorkflowSubtypeStartTag(changedLine) {
          for (const subtype of Object.keys(MetadataFactory.getWorkflowChildsByTag())) {
               let tag = MetadataFactory.startXMLTag(changedLine, subtype);
               if (tag !== undefined)
                    return tag;
          }
          return undefined;
     }

     static isWorkflowSubtypeEndTag(changedLine) {
          for (const subtype of Object.keys(MetadataFactory.getWorkflowChildsByTag())) {
               let tag = MetadataFactory.endXMLTag(changedLine, subtype);
               if (tag !== undefined)
                    return tag;
          }
          return undefined;
     }

     static isSharingRuleSubtypeStartTag(changedLine) {
          for (const subtype of Object.keys(MetadataFactory.getSharingRulesChildsByTag())) {
               let tag = MetadataFactory.startXMLTag(changedLine, subtype);
               if (tag !== undefined)
                    return tag;
          }
          return undefined;
     }

     static isSharingRuleSubtypeEndTag(changedLine) {
          for (const subtype of Object.keys(MetadataFactory.getSharingRulesChildsByTag())) {
               let tag = MetadataFactory.endXMLTag(changedLine, subtype);
               if (tag !== undefined)
                    return tag;
          }
          return undefined;
     }

     static createMetadataFromJSONSchema(strJson) {
          let isOnFields = false;
          let isOnRts = false;
          let isOnReference = false;
          let isOnPicklistVal = false;
          let bracketIndent = 0;
          let metadataIndex = {
               name: undefined,
               label: undefined,
               labelPlural: undefined,
               keyPrefix: undefined,
               queryable: undefined,
               fields: [],
               recordTypes: []
          };
          let field = {
               name: undefined,
               label: undefined,
               length: undefined,
               type: undefined,
               custom: undefined,
               relationshipName: undefined,
               picklistValues: [],
               referenceTo: []
          };
          let pickVal = {
               active: undefined,
               defaultValue: undefined,
               label: undefined,
               value: undefined
          };
          let rt = {
               devName: undefined,
               name: undefined,
               default: undefined
          };
          for (let line of strJson.split('\n')) {
               line = line.trim();
               if (line.indexOf('{') !== -1)
                    bracketIndent++;
               else if (line.indexOf('}') !== -1) {
                    bracketIndent--;
                    if (isOnRts) {
                         if (rt.name)
                              metadataIndex.recordTypes.push(rt);
                         rt = {
                              devName: undefined,
                              name: undefined,
                              default: undefined
                         };
                    }
                    if (isOnPicklistVal) {
                         if (pickVal.value)
                              field.picklistValues.push(pickVal);
                         pickVal = {
                              active: undefined,
                              defaultValue: undefined,
                              label: undefined,
                              value: undefined
                         };
                    }
                    else if (isOnFields) {
                         if (field.name)
                              metadataIndex.fields.push(field);
                         field = {
                              name: undefined,
                              label: undefined,
                              length: undefined,
                              type: undefined,
                              custom: undefined,
                              relationshipName: undefined,
                              picklistValues: [],
                              referenceTo: []
                         };
                    }
               }
               if (bracketIndent === 2) {
                    if (line.indexOf('fields') !== -1 && line.indexOf(':') !== -1 && line.indexOf('[') !== -1)
                         isOnFields = true;
                    if (isOnFields && line.indexOf(']') !== -1 && line.indexOf('[') === -1) {
                         isOnFields = false;
                         isOnReference = false;
                         isOnPicklistVal = false;
                         if (field.name)
                              metadataIndex.fields.push(field);
                         field = {
                              name: undefined,
                              label: undefined,
                              length: undefined,
                              type: undefined,
                              custom: undefined,
                              relationshipName: undefined,
                              picklistValues: [],
                              referenceTo: []
                         };
                    }

                    if (line.indexOf('recordTypeInfos') !== -1 && line.indexOf(':') !== -1 && line.indexOf('[') !== -1)
                         isOnRts = true;
                    if (isOnRts && line.indexOf(']') !== -1 && line.indexOf('[') === -1) {
                         isOnRts = false;
                         if (rt.name)
                              metadataIndex.recordTypes.push(rt);
                         rt = {
                              devName: undefined,
                              name: undefined,
                              default: undefined
                         };
                    }
               }
               if (isOnReference && line.indexOf(']') !== -1) {
                    isOnReference = false;
               }
               if (isOnPicklistVal && line.indexOf(']') !== -1) {
                    isOnPicklistVal = false;
               }
               if (bracketIndent === 2 && !isOnFields && !isOnRts) {
                    let keyValue = MetadataFactory.getJSONNameValuePair(line);
                    if (keyValue.name === 'name')
                         metadataIndex.name = keyValue.value;
                    if (keyValue.name === 'label')
                         metadataIndex.label = keyValue.value;
                    if (keyValue.name === 'labelPlural')
                         metadataIndex.labelPlural = keyValue.value;
                    if (keyValue.name === 'keyPrefix')
                         metadataIndex.keyPrefix = keyValue.value;
                    if (keyValue.name === 'queryable')
                         metadataIndex.queryable = keyValue.value;
               } else if (isOnReference && line.indexOf('[') === -1) {
                    field.referenceTo.push(line.replace(new RegExp('"', 'g'), "").trim());
               } else if (isOnPicklistVal && line.indexOf('[') === -1) {
                    let keyValue = MetadataFactory.getJSONNameValuePair(line);
                    if (keyValue.name === 'active')
                         pickVal.active = keyValue.value;
                    if (keyValue.name === 'defaultValue')
                         pickVal.defaultValue = keyValue.value;
                    if (keyValue.name === 'label')
                         pickVal.label = keyValue.value;
                    if (keyValue.name === 'value')
                         pickVal.value = keyValue.value;
               } else if (isOnFields && !isOnPicklistVal && !isOnReference) {
                    if (bracketIndent === 3) {
                         let keyValue = MetadataFactory.getJSONNameValuePair(line);
                         if (keyValue.name === 'name')
                              field.name = keyValue.value;
                         if (keyValue.name === 'label')
                              field.label = keyValue.value;
                         if (keyValue.name === 'type')
                              field.type = keyValue.value;
                         if (keyValue.name === 'length')
                              field.length = keyValue.value;
                         if (keyValue.name === 'custom')
                              field.custom = keyValue.value;
                         if (keyValue.name === 'relationshipName' && keyValue.value != 'null')
                              field.relationshipName = keyValue.value;
                         if (keyValue.name === "referenceTo" && line.indexOf(']') === -1) {
                              isOnReference = true;
                              isOnPicklistVal = false;
                         }
                         if (keyValue.name === "picklistValues" && line.indexOf(']') === -1) {
                              isOnPicklistVal = true;
                              isOnReference = false;
                         }
                    }
               } else if (isOnRts) {
                    if (bracketIndent === 3) {
                         let keyValue = MetadataFactory.getJSONNameValuePair(line);
                         if (keyValue.name === 'name')
                              rt.name = keyValue.value;
                         if (keyValue.name === 'developerName')
                              rt.developerName = keyValue.value;
                         if (keyValue.name === 'defaultRecordTypeMapping')
                              rt.default = keyValue.value;
                    }
               }
          }
          return metadataIndex;
     }

     static getJSONNameValuePair(line) {
          let tmpLine = line.replace('{', "").replace("}", "");
          if (tmpLine.indexOf('[') !== -1 && tmpLine.indexOf(']') === -1)
               tmpLine = tmpLine.replace("[", "");
          let splits = tmpLine.split(':');
          let fieldName;
          let fieldValue;
          if (splits.length >= 0 && splits[0])
               fieldName = splits[0].trim().replace(new RegExp('"', "g"), "").replace(new RegExp("'", "g"), "");
          if (splits.length >= 1 && splits[1]) {
               fieldValue = splits[1].trim().replace(new RegExp('"', "g"), "").replace(new RegExp("'", "g"), "");
               if (fieldValue.endsWith(","))
                    fieldValue = fieldValue.substring(0, fieldValue.length - 1);
               else
                    fieldValue = fieldValue.substring(0, fieldValue.length);
          }
          return {
               name: fieldName,
               value: fieldValue
          };
     }

     static isSObject(objectName) {
          let startsWith = [
               "Apex",
               "Topic",
               "Web",
               "Work",
               "Forecasting",
               "Process",
               "Lightning",
               "Live",
               "Permission",
               "Category",
               "Chatter",
               "Collaboration",
               "Content",
               "Auth",
               "Brand",
               "Business",
               "App",
               "Async",
               "Aura",
               "User",
               "Email",
               "Secur",
               "Search",
               "Scontrol",
               "Platform",
               "List",
               "Idea",
               "Flow",
               "Field",
               "External",
               "Expression",
               "Event",
               "Entity",
               "Duplicate",
               "Data",
               "Dash",
               "Custom",
               "Case",
               "Cal",
               "Ass",
               "Action",
               "Task",
               "Stamp",
               "Lo",
               "Embed",
               "Domain",
               "Csp",
               "Color",
               "AcceptedEventRelation",
               "Sol",
               "Skill",
               "Site",
               "Setup",
               "Session",
               "Saml",
               "Relation",
               "Recommendation",
               "RecentlyViewed",
               "Quote"
          ];

          let containsTokens = [
               "Share",
               "History",
               "ChangeEvent",
               "Feed",
          ];
          let starts = false;
          let contains = false;
          for (const sw of startsWith) {
               if (objectName.startsWith(sw) && !objectName.endsWith('__c')) {
                    if (objectName != 'Quote' && objectName != 'Test' && objectName != 'Task' && objectName != 'Asset' && objectName != 'User' && objectName != 'EmailMessage' && objectName != 'EmailTemplate' && objectName != 'Event' && objectName != 'Case' && objectName != 'CaseComment') {
                         starts = true;
                         break;
                    }
               }
          }
          if (!starts) {
               for (const cont of containsTokens) {
                    if (objectName.indexOf(cont) !== -1) {
                         contains = true;
                         break;
                    }
               }
          }
          return !starts && !contains;
     }
}
module.exports = MetadataFactory;