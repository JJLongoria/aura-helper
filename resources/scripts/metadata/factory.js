const fileSystem = require('../fileSystem');
const MetadataTypes = require('./metadataTypes');
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
                    } else if (folder == 'lwc') {
                         metadata[metadataType.xmlName] = MetadataFactory.getMetadataObjects(folderPath, true);
                    } else if (folder == 'labels') {
                         let customLabels = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_LABELS, false);
                         customLabels.childs = MetadataFactory.getMetadataObjects(folderPath, true);
                         metadata[MetadataTypes.CUSTOM_LABELS] = customLabels;
                         let customLabel = MetadataFactory.createMetadataType(MetadataTypes.CUSTOM_LABEL, false);
                         customLabel.childs = MetadataFactory.getCustomLabelsMetadataFromFile(folderPath);
                         metadata[MetadataTypes.CUSTOM_LABEL] = customLabel;
                    } else if (folder == 'workflows') {
                         metadata = MetadataFactory.getWorkflowsMetadata(metadata, folderPath);
                    } else if (folder != 'objectTranslations' && folder != 'reports' && folder != 'emailTemplates' && folder != 'dashboards') {
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
          for (const label of customLabels.CustomLabels.labels) {
               objects[label.fullName] = MetadataFactory.createMetadataObject(label.fullName, false);
          }
          return objects;
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
                    if (Array.isArray(workflow.Workflow.alerts)) {
                         for (const alert of workflow.Workflow.alerts) {
                              workflowAlerts.childs[alert.fullName] = MetadataFactory.createMetadataItem(alert.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_ALERT].childs[workflowObject] = workflowAlerts;
                         }
                    } else {
                         workflowAlerts.childs[workflow.Workflow.alerts.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.alerts.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_ALERT].childs[workflowObject] = workflowAlerts;
                    }
               }
               if (workflow.Workflow.fieldUpdates) {
                    let workflowAlerts = MetadataFactory.createMetadataObject(workflowObject, false);
                    if (Array.isArray(workflow.Workflow.fieldUpdates)) {
                         for (const fieldUpdate of workflow.Workflow.fieldUpdates) {
                              workflowAlerts.childs[fieldUpdate.fullName] = MetadataFactory.createMetadataItem(fieldUpdate.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE].childs[workflowObject] = workflowAlerts;
                         }
                    } else {
                         let workflowAlerts = MetadataFactory.createMetadataObject(workflowObject, false);
                         workflowAlerts.childs[workflow.Workflow.fieldUpdates.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.fieldUpdates.fullName, false);
                    }
               }
               if (workflow.Workflow.knowledgePublishes) {
                    let workflowPublish = MetadataFactory.createMetadataObject(workflowObject, false);
                    if (Array.isArray(workflow.Workflow.knowledgePublishes)) {
                         for (const knowledPublish of workflow.Workflow.knowledgePublishes) {
                              workflowPublish.childs[knowledPublish.fullName] = MetadataFactory.createMetadataItem(knowledPublish.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[workflowObject] = workflowPublish;
                         }
                    } else {
                         workflowPublish.childs[workflow.Workflow.knowledgePublishes.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.knowledgePublishes.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[workflowObject] = workflowPublish;
                    }
               }
               if (workflow.Workflow.outboundMessages) {
                    let workflowOutbound = MetadataFactory.createMetadataObject(workflowObject, false);
                    if (Array.isArray(workflow.Workflow.outboundMessages)) {
                         for (const outboundMessage of workflow.Workflow.outboundMessages) {
                              workflowOutbound.childs[outboundMessage.fullName] = MetadataFactory.createMetadataItem(outboundMessage.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[workflowObject] = workflowOutbound;
                         }
                    } else {
                         workflowOutbound.childs[workflow.Workflow.outboundMessages.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.outboundMessages.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[workflowObject] = workflowOutbound;
                    }
               }
               if (workflow.Workflow.rules) {
                    let workflowRule = MetadataFactory.createMetadataObject(workflowObject, false);
                    if (Array.isArray(workflow.Workflow.rules)) {
                         for (const rule of workflow.Workflow.rules) {
                              workflowRule.childs[rule.fullName] = MetadataFactory.createMetadataItem(rule.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_RULE].childs[workflowObject] = workflowRule;
                         }
                    } else {
                         workflowRule.childs[workflow.Workflow.rules.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.rules.fullName, false);
                         metadata[MetadataTypes.WORKFLOW_RULE].childs[workflowObject] = workflowRule;
                    }
               }
               if (workflow.Workflow.tasks) {
                    let workflowTask = MetadataFactory.createMetadataObject(workflowObject, false);
                    if (Array.isArray(workflow.Workflow.tasks)) {
                         for (const task of workflow.Workflow.tasks) {
                              workflowTask.childs[task.fullName] = MetadataFactory.createMetadataItem(task.fullName, false);
                              metadata[MetadataTypes.WORKFLOW_TASK].childs[workflowObject] = workflowTask;
                         }
                    } else {
                         workflowTask.childs[workflow.Workflow.tasks.fullName] = MetadataFactory.createMetadataItem(workflow.Workflow.tasks.fullName, false);
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
                    } else {
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