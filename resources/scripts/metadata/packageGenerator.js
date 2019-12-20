const MetadataTypes = require('./metadataTypes');
const MetadataUtils = require('./utils');
const MetadataFactory = require('./factory');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const AuraParser = languages.AuraParser;


const START_XML_FILE = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
const PACKAGE_TAG_START = "<Package xmlns=\"http://soap.sforce.com/2006/04/metadata\">";
const PACKAGE_TAG_END = "</Package>";
const VERSION_TAG_START = "<version>";
const VERSION_TAG_END = "</version>";
const TYPES_TAG_START = "<types>";
const TYPES_TAG_END = "</types>";
const NAME_TAG_START = "<name>";
const NAME_TAG_END = "</name>";
const MEMBERS_TAG_START = "<members>";
const MEMBERS_TAG_END = "</members>";

class PackageGenerator {

    static mergePackages(packagePaths) {
        let result;
        for (const packagePath of packagePaths) {
            let pkg = AuraParser.parseXML(FileReader.readFileSync(packagePath));
            let preparedPkg = PackageGenerator.createPackageFromXMLPackage(pkg);
            if (!result)
                result = preparedPkg;
            else
                result = PackageGenerator.mergePackage(result, preparedPkg);
        }
        return PackageGenerator.createPackageFromMerged(result);
    }

    static createPackageFromXMLPackage(pkg) {
        let result;
        if (pkg.Package) {
            result = {
                version: pkg.Package.version
            };
            let types = [];
            if (Array.isArray(pkg.Package.types))
                types = pkg.Package.types;
            else
                types.push(pkg.Package.types);
            for (const type of types) {
                if (!result[type.name])
                    result[type.name] = [];
                let members = [];
                if (Array.isArray(type.members))
                    members = type.members;
                else
                    members.push(type.members);
                for (const member of members) {
                    result[type.name].push(member);
                }
            }
        }
        return result;
    }

    static mergePackage(target, source) {
        Object.keys(target).forEach(function (key) {
            if (key !== 'version') {
                if (source[key]) {
                    for (const sourceMember of source[key]) {
                        if (!target[key].includes(sourceMember))
                            target[key].push(sourceMember);
                    }
                }
                target[key] = target[key].sort();
            } else {
                if (source.version > target.version)
                    target.version = source.version;
            }
        });
        return target
    }

    static createPackageFromMerged(pkg) {
        let pkgLines = [];
        pkgLines.push(START_XML_FILE);
        pkgLines.push(PACKAGE_TAG_START);
        Object.keys(pkg).forEach(function (key) {
            if (key !== 'version') {
                pkgLines.push('\t' + TYPES_TAG_START);
                for (const member of pkg[key]) {
                    pkgLines.push('\t\t' + MEMBERS_TAG_START + member + MEMBERS_TAG_END);
                }
                pkgLines.push('\t\t' + NAME_TAG_START + key + NAME_TAG_END);
                pkgLines.push('\t' + TYPES_TAG_END);
            }
        });
        pkgLines.push('\t' + VERSION_TAG_START + pkg.version + '.0' + VERSION_TAG_END);
        pkgLines.push(PACKAGE_TAG_END);
        return pkgLines.join('\n');
    }

    static createPackage(metadata, version, forRetrieve) {
        forRetrieve = (forRetrieve != undefined) ? forRetrieve : true;
        let packageContent = [];
        packageContent.push(START_XML_FILE);
        packageContent.push(PACKAGE_TAG_START);
        if (!forRetrieve) {
            let addWorkflow = false;
            if (metadata[MetadataTypes.WORKFLOW])
                addWorkflow = true;
            let workflow = (metadata[MetadataTypes.WORKFLOW]) ? metadata[MetadataTypes.WORKFLOW] : MetadataFactory.createMetadataType(MetadataTypes.WORKFLOW, false);
            if (metadata[MetadataTypes.WORKFLOW_ALERT] && metadata[MetadataTypes.WORKFLOW_ALERT].childs) {
                Object.keys(metadata[MetadataTypes.WORKFLOW_ALERT].childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (metadata[MetadataTypes.WORKFLOW_ALERT].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_ALERT].childs[key].childs))) {
                        workflow.childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(metadata[MetadataTypes.WORKFLOW_ALERT].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_ALERT].childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE] && metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE].childs) {
                let workflowFieldUpdates = metadata[MetadataTypes.WORKFLOW_FIELD_UPDATE];
                Object.keys(workflowFieldUpdates.childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (workflowFieldUpdates.childs[key].checked || MetadataUtils.isAnyChecked(workflowFieldUpdates.childs[key].childs))) {
                        workflow.childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(workflowFieldUpdates.childs[key].checked || MetadataUtils.isAnyChecked(workflowFieldUpdates.childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH] && metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs) {
                Object.keys(metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[key].childs))) {
                        workflow.childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH].childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE] && metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs) {
                Object.keys(metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[key].childs))) {
                        workflow.childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE].childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (metadata[MetadataTypes.WORKFLOW_RULE] && metadata[MetadataTypes.WORKFLOW_RULE].childs) {
                Object.keys(metadata[MetadataTypes.WORKFLOW_RULE].childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (metadata[MetadataTypes.WORKFLOW_RULE].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_RULE].childs[key].childs))) {
                        workflow.childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(metadata[MetadataTypes.WORKFLOW_RULE].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_RULE].childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (metadata[MetadataTypes.WORKFLOW_TASK] && metadata[MetadataTypes.WORKFLOW_TASK].childs) {
                Object.keys(metadata[MetadataTypes.WORKFLOW_TASK].childs).forEach(function (key) {
                    let existingWorkflows = Object.keys(workflow.childs);
                    if (!existingWorkflows.includes(key) && (metadata[MetadataTypes.WORKFLOW_TASK].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_TASK].childs[key].childs))) {
                        metadata[MetadataTypes.WORKFLOW_TASK].childs[key] = MetadataFactory.createMetadataObject(key, true);
                        addWorkflow = true;
                    } else if(metadata[MetadataTypes.WORKFLOW_TASK].childs[key].checked || MetadataUtils.isAnyChecked(metadata[MetadataTypes.WORKFLOW_TASK].childs[key].childs)){ 
                        workflow.childs[key].checked = true;
                    }
                });
            }
            if (addWorkflow)
                metadata[MetadataTypes.WORKFLOW] = workflow;
        }
        Object.keys(metadata).forEach(function (key) {
            let typesBlock = PackageGenerator.makeTypesBlock(metadata[key], metadata[key].childs, forRetrieve);
            if(typesBlock)
                packageContent.push(typesBlock);
        });
        packageContent.push('\t' + VERSION_TAG_START + version + VERSION_TAG_END);
        packageContent.push(PACKAGE_TAG_END);
        return packageContent.join('\n');
    }

    static makeTypesBlock(metadataType, childs, forRetrieve) {
        let typesBlockContent = [];
        let folders;
        let addBlock = false;
        if (!childs || Object.keys(childs).length === 0)
            return '';
        if (metadataType.name === MetadataTypes.EMAIL_TEMPLATE || metadataType.name === MetadataTypes.REPORTS || metadataType.name === MetadataTypes.DOCUMENT || metadataType.name === MetadataTypes.DASHBOARD) {
            folders = this.getFolders(childs);
        }
        typesBlockContent.push('\t' + TYPES_TAG_START);
        if (folders && folders.length > 0) {
            for (const folder of folders) {
                typesBlockContent.push('\t\t' + MEMBERS_TAG_START + folder + MEMBERS_TAG_END);
            }
        }
        if (!forRetrieve && metadataType.checked && !forRetrieve && metadataType.name !== MetadataTypes.WORKFLOW_ALERT && metadataType.name !== MetadataTypes.WORKFLOW_FIELD_UPDATE && metadataType.name !== MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH && metadataType.name !== MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE && metadataType.name !== MetadataTypes.WORKFLOW_RULE && metadataType.name !== MetadataTypes.WORKFLOW_TASK) {
            typesBlockContent.push('\t\t' + MEMBERS_TAG_START + '*' + MEMBERS_TAG_END);
            addBlock = true;
        } else if (!forRetrieve && (metadataType.name === MetadataTypes.CUSTOM_LABELS || metadataType.name === MetadataTypes.CUSTOM_LABEL) && MetadataUtils.isAnyChecked(childs)) {
            typesBlockContent.push('\t\t' + MEMBERS_TAG_START + '*' + MEMBERS_TAG_END);
            addBlock = true;
        } else if ((!forRetrieve && metadataType.name !== MetadataTypes.WORKFLOW_ALERT && metadataType.name !== MetadataTypes.WORKFLOW_FIELD_UPDATE && metadataType.name !== MetadataTypes.WORKFLOW_KNOWLEDGE_PUBLISH && metadataType.name !== MetadataTypes.WORKFLOW_OUTBOUND_MESSAGE && metadataType.name !== MetadataTypes.WORKFLOW_RULE && metadataType.name !== MetadataTypes.WORKFLOW_TASK) || forRetrieve){
            Object.keys(childs).forEach(function (key) {
                let mtObject = childs[key];
                if (mtObject.childs && Object.keys(mtObject.childs).length > 0) {
                    Object.keys(mtObject.childs).forEach(function (key) {
                        let mtItem = mtObject.childs[key];
                        let separator;
                        if (metadataType.name === MetadataTypes.EMAIL_TEMPLATE || metadataType.name === MetadataTypes.DOCUMENT || metadataType.name === MetadataTypes.REPORTS || metadataType.name === MetadataTypes.DASHBOARD) {
                            separator = '/';
                        } else if (metadataType.name === MetadataTypes.LAYOUT || metadataType.name === MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS || metadataType.name === MetadataTypes.FLOWS) {
                            separator = '-';
                        } else {
                            separator = '.';
                        }
                        if (mtItem.checked) {
                            typesBlockContent.push('\t\t' + MEMBERS_TAG_START + mtObject.name + separator + mtItem.name + MEMBERS_TAG_END);
                            addBlock = true;
                        }
                    });
                } else if (mtObject.checked) {
                    typesBlockContent.push('\t\t' + MEMBERS_TAG_START + mtObject.name + MEMBERS_TAG_END);
                    addBlock = true;
                }
            });
        }
        typesBlockContent.push('\t\t' + NAME_TAG_START + metadataType.name + NAME_TAG_END);
        typesBlockContent.push('\t' + TYPES_TAG_END);
        if (addBlock) {
            return typesBlockContent.join('\n');
        }
        else
            return undefined;
    }

    static getFolders(childs) {
        let folders = [];
        Object.keys(childs).forEach(function (key) {
            if (childs[key].name.indexOf('/') != -1 && childs[key].name.indexOf('unfiled$public') == -1) {
                let folderName = childs[key].name.substring(0, childs[key].name.indexOf('/'));
                if (!folders.includes(folderName))
                    folders.push(folderName);
            }
        });
        return folders;
    }
}
module.exports = PackageGenerator;