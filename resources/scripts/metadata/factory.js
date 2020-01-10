const fileSystem = require('../fileSystem');
const MetadataTypes = require('./metadataTypes');
const Utils = require('./utils');
const languages = require('../languages');
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

}
module.exports = MetadataFactory;