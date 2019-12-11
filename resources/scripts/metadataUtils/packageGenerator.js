const vscode = require('vscode');
const Processes = require('../processes');
const process = require('child_process');
const fileSystem = require('../fileSystem');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const window = vscode.window;
const Config = require('../main/config');
const ProgressLocation = vscode.ProgressLocation;
const Metadata = require('./metadata');

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

    static createPackage(metadata, version) {
        let packageContent = [];
        packageContent.push(START_XML_FILE);
        packageContent.push(PACKAGE_TAG_START);
        for (const metadataType of metadata) {
            packageContent.push(this.makeTypesBlock(metadataType.name, metadataType.childs));
        } 
        packageContent.push('\t' + VERSION_TAG_START + version + VERSION_TAG_END);
        packageContent.push(PACKAGE_TAG_END);
        return packageContent.join('\n');
    }

    static makeTypesBlock(metadataType, childs) {
        let typesBlockContent = [];
        let folders;
        if (!childs || childs.length === 0)
            return '';
        if (metadataType === Metadata.EMAIL_TEMPLATE || metadataType === Metadata.REPORTS || metadataType === Metadata.DOCUMENT || metadataType === Metadata.DASHBOARD) {
            folders = this.getFolders(childs);
        }
        typesBlockContent.push('\t' + TYPES_TAG_START);
        if (folders && folders.length > 0) {
            for (const folder of folders) {
                typesBlockContent.push('\t\t' + MEMBERS_TAG_START + folder + MEMBERS_TAG_END);
            }
        }
        for (const mtObject of childs) {
            if (mtObject.childs && mtObject.childs.length > 0) {
                for (const mtItem of mtObject.childs) {
                    let separator;
                    if (metadataType === Metadata.EMAIL_TEMPLATE || metadataType === Metadata.DOCUMENT || metadataType === Metadata.REPORTS || metadataType === Metadata.DASHBOARD) {
                        separator = '/';
                    } else if (metadataType === Metadata.LAYOUT || metadataType === Metadata.CUSTOM_OBJECT_TRANSLATIONS || metadataType === Metadata.FLOWS) {
                        separator = '-';
                    } else {
                        separator = '.';
                    }
                    if(mtItem.checked)
                        typesBlockContent.push('\t\t' + MEMBERS_TAG_START + mtObject.name + separator + mtItem.name + MEMBERS_TAG_END);
                }
            } else if(mtObject.checked){
                typesBlockContent.push('\t\t' + MEMBERS_TAG_START + mtObject.name + MEMBERS_TAG_END);
            }
        }
        typesBlockContent.push('\t\t' + NAME_TAG_START + metadataType + NAME_TAG_END);
        typesBlockContent.push('\t' + TYPES_TAG_END);
        return typesBlockContent.join('\n');
    }

    static getFolders(childs) {
        let folders = [];
        for (const child of childs) {
            folders.push(child.name);
        }
        return folders;
    }
}
module.exports = PackageGenerator;