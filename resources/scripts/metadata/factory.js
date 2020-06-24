const FileSystem = require('../fileSystem');
const Paths = FileSystem.Paths;
const FileReader = FileSystem.FileReader;


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

     static getSObjects(fromSFDX) {
          let sObjects = {};
          if (fromSFDX) {
               let customObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/customObjects';
               let standardObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/standardObjects';
               let customObjectsFiles = FileReader.readDirSync(customObjectsFolder);
               if (customObjectsFiles && customObjectsFiles.length > 0) {
                    for (const fileName of customObjectsFiles) {
                         let objName = fileName.substring(0, fileName.indexOf('.'));
                         sObjects[objName.toLowerCase()] = objName;
                    }
               }
               let standardObjectFiles = FileReader.readDirSync(standardObjectsFolder);
               if (standardObjectFiles && standardObjectFiles.length > 0) {
                    for (const fileName of standardObjectFiles) {
                         let objName = fileName.substring(0, fileName.indexOf('.'));
                         sObjects[objName.toLowerCase()] = objName;
                    }
               }
          } else {
               let metadataPath = Paths.getMetadataIndexPath();
               let files = FileReader.readDirSync(metadataPath);
               if (files && files.length > 0) {
                    for (const fileName of files) {
                         let obj = JSON.parse(FileReader.readFileSync(metadataPath + '/' + fileName));
                         sObjects[obj.name.toLowerCase()] = obj;
                    }
               } else {
                    let customObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/customObjects';
                    let standardObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/standardObjects';
                    let customObjectsFiles = FileReader.readDirSync(customObjectsFolder);
                    if (customObjectsFiles && customObjectsFiles.length > 0) {
                         for (const fileName of customObjectsFiles) {
                              let objName = fileName.substring(0, fileName.indexOf('.'));
                              sObjects[objName.toLowerCase()] = objName;
                         }
                    }
                    let standardObjectFiles = FileReader.readDirSync(standardObjectsFolder);
                    if (standardObjectFiles && standardObjectFiles.length > 0) {
                         for (const fileName of standardObjectFiles) {
                              let objName = fileName.substring(0, fileName.indexOf('.'));
                              sObjects[objName.toLowerCase()] = objName;
                         }
                    }
               }
          }

          return sObjects;
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
               custom: false,
               customSetting: false,
               namespace: undefined,
               fields: {},
               recordTypes: []
          };
          let field = {
               name: undefined,
               label: undefined,
               length: undefined,
               type: undefined,
               custom: undefined,
               nillable: undefined,
               relationshipName: undefined,
               namespace: undefined,
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
                         if (field.name) {
                              let splits = field.name.split('__');
                              let namespace = undefined;
                              if (splits.length > 2) {
                                   namespace = splits[0].trim();
                              }
                              field.namespace = namespace;
                              metadataIndex.fields[field.name] = field;
                         }
                         field = {
                              name: undefined,
                              label: undefined,
                              length: undefined,
                              type: undefined,
                              custom: undefined,
                              nillable: undefined,
                              relationshipName: undefined,
                              namespace: undefined,
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
                         if (field.name) {
                              let splits = field.name.split('__');
                              let namespace = undefined;
                              if (splits.length > 2) {
                                   namespace = splits[0].trim();
                              }
                              field.namespace = namespace;
                              metadataIndex.fields[field.name] = field;
                         }
                         field = {
                              name: undefined,
                              label: undefined,
                              length: undefined,
                              type: undefined,
                              custom: undefined,
                              nillable: undefined,
                              relationshipName: undefined,
                              namespace: undefined,
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
                    if (keyValue.name === 'name') {
                         let splits = keyValue.value.split('__');
                         let namespace = undefined;
                         if (splits.length > 2) {
                              namespace = splits[0].trim();
                         }
                         metadataIndex.namespace = namespace;
                         metadataIndex.name = keyValue.value;
                    }
                    if (keyValue.name === 'label')
                         metadataIndex.label = keyValue.value;
                    if (keyValue.name === 'labelPlural')
                         metadataIndex.labelPlural = keyValue.value;
                    if (keyValue.name === 'keyPrefix')
                         metadataIndex.keyPrefix = keyValue.value;
                    if (keyValue.name === 'queryable')
                         metadataIndex.queryable = keyValue.value === 'true';
                    if (keyValue.name === 'custom')
                         metadataIndex.custom = keyValue.value === 'true';
                    if (keyValue.name === 'customSetting')
                         metadataIndex.customSetting = keyValue.value === 'true';
               } else if (isOnReference && line.indexOf('[') === -1) {
                    field.referenceTo.push(line.replace(new RegExp('"', 'g'), "").trim());
               } else if (isOnPicklistVal && line.indexOf('[') === -1) {
                    let keyValue = MetadataFactory.getJSONNameValuePair(line);
                    if (keyValue.name === 'active')
                         pickVal.active = keyValue.value === 'true';
                    if (keyValue.name === 'defaultValue')
                         pickVal.defaultValue = keyValue.value === 'true';
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
                              field.custom = keyValue.value === 'true';
                         if (keyValue.name === 'nillable')
                              field.nillable = keyValue.value === 'true';
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
                              rt.default = keyValue.value === 'true';
                    }
               }
          }
          if (!metadataIndex.name)
               return undefined;
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