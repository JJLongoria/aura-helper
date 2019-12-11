const process = require('child_process');
const logger = require('../main/logger');
const MetadataUtils = require('../metadataUtils');
const Config = require('../main/config');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const Metadata = MetadataUtils.Metadata;
const PackageGenerator = MetadataUtils.PackageGenerator;


const PACKAGE_FILE_NAME = "package.xml";

const metadataForGetPermissions = [
    "CustomApplication",
    "ApexClass",
    "ApexPage",
    "CustomMetadata",
    "CustomObject",
    "CustomField",
    "CustomPermission",
    "CustomTab",
    "Flow",
    "Layout",
    "RecordType",
];

exports.run = function (profileNames, callback) {
    let user = Config.getAuthOrg();
    let metadata = [];
    for (const metadataForGetPermission of metadataForGetPermissions) {
        let stdOut = process.execSync('sfdx force:mdapi:listmetadata --json -m ' + metadataForGetPermission + ' -u ' + user, { maxBuffer: 1024 * 500000 });
        if (stdOut) {
            let data = JSON.parse(stdOut.toString());
            if (data.status === 0) {
                let dataList = [];
                if (Array.isArray(data.result))
                    dataList = data.result
                else
                    dataList.push(data.result);
                let metadataType = Metadata.createMetadataType(metadataForGetPermission, true);
                let objects = {};
                for (const obj of dataList) {
                    let separator;
                    if (metadataForGetPermission === Metadata.EMAIL_TEMPLATE || metadataForGetPermission === Metadata.DOCUMENT || metadataForGetPermission === Metadata.REPORTS || metadataForGetPermission === Metadata.DASHBOARD) {
                        separator = '/';
                    } else if (metadataForGetPermission === Metadata.LAYOUT || metadataForGetPermission === Metadata.CUSTOM_OBJECT_TRANSLATIONS || metadataForGetPermission === Metadata.FLOWS) {
                        separator = '-';
                    } else {
                        separator = '.';
                    }
                    let name;
                    let item;
                    if (obj.fullName.indexOf(separator) != -1) {
                        name = obj.fullName.substring(0, obj.fullName.indexOf(separator));
                        item = obj.fullName.substring(obj.fullName.indexOf(separator) + 1);
                    } else {
                        name = obj.fullName;
                    }
                    if (!objects[name])
                        objects[name] = Metadata.createMetadataObject(name, true);
                    if (item)
                        objects[name].childs.push(Metadata.createMetadataItem(item, true));
                }
                Object.keys(objects).forEach(function (key) {
                    metadataType.childs.push(objects[key]);
                });
                metadata.push(metadataType);
            }
        }
    }
    let profileMetadata = Metadata.createMetadataType('Profile', true);
    for (const profile of profileNames) {
        profileMetadata.childs.push(Metadata.createMetadataObject(profile, true));
    }
    metadata.push(profileMetadata);
    if (metadata.length > 0) {
        let packageContent = PackageGenerator.createPackage(metadata, Config.getOrgVersion());
        let packageFolder = Paths.getPackageFolder();
        let packageFile = packageFolder + '\\' + PACKAGE_FILE_NAME;
        if (FileChecker.isExists(packageFolder))
            FileWriter.delete(packageFolder);
        FileWriter.createFolderSync(packageFolder);
        FileWriter.createFileSync(packageFile, packageContent);
        let stdOut = process.execSync('sfdx force:mdapi:retrieve --json -s -r "' + packageFolder + '" -k "' + packageFile + '" -u ' + user, { maxBuffer: 1024 * 500000 });
        if (stdOut) {
            let data = JSON.parse(stdOut.toString());
            if (data.status === 0) {
                FileWriter.unzip(packageFolder + '\\unpackaged.zip', packageFolder, function (fd) {
                    let profiles = FileReader.readDirSync(packageFolder + '\\profiles');
                    if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '\\profiles'))
                        FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '\\profiles');
                    for (const profile of profiles) {
                        FileWriter.copyFileSync(packageFolder + '\\profiles\\' + profile, Paths.getMetadataRootFolder() + '\\profiles\\' + profile + '-meta.xml');
                    }
                    if (callback)
                        callback.call(this);
                });
            }
        }
    }
}