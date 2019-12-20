const Process = require('./process');
const logger = require('../main/logger');
const Metadata = require('../metadata');
const Config = require('../main/config');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;
const FileReader = fileSystem.FileReader;
const FileChecker = fileSystem.FileChecker;
const MetadataTypes = Metadata.MetadataTypes;
const PackageGenerator = Metadata.PackageGenerator;
const MetadataFactory = Metadata.Factory;
const AuraParser = languages.AuraParser;
const profileUtils = Metadata.ProfileUtils;


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

exports.run = function (profileNames, isPermissionSets, compress, callback, token) {
    let user = Config.getAuthUsername();
    let metadata = {};
    let abort = false;
    for (const metadataForGetPermission of metadataForGetPermissions) {
        if (token) {
            token.onCancellationRequested(() => {
                abort = true;
            });
        }
        if (!abort) {
            let stdOut = Process.describeMetadata(user, metadataForGetPermission);
            if (token) {
                token.onCancellationRequested(() => {
                    abort = true;
                });
            }
            if (!abort) {
                if (stdOut) {
                    let data = JSON.parse(stdOut.toString());
                    if (data.status === 0) {
                        let dataList = [];
                        if (Array.isArray(data.result))
                            dataList = data.result
                        else
                            dataList.push(data.result);
                        let metadataType = MetadataFactory.createMetadataType(metadataForGetPermission, true);
                        let objects = {};
                        for (const obj of dataList) {
                            let separator;
                            if (metadataForGetPermission === MetadataTypes.EMAIL_TEMPLATE || metadataForGetPermission === MetadataTypes.DOCUMENT || metadataForGetPermission === MetadataTypes.REPORTS || metadataForGetPermission === MetadataTypes.DASHBOARD) {
                                separator = '/';
                            } else if (metadataForGetPermission === MetadataTypes.LAYOUT || metadataForGetPermission === MetadataTypes.CUSTOM_OBJECT_TRANSLATIONS || metadataForGetPermission === MetadataTypes.FLOWS) {
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
                                objects[name] = MetadataFactory.createMetadataObject(name, true);
                            if (item)
                                objects[name].childs[item] = MetadataFactory.createMetadataItem(item, true);
                        }
                        Object.keys(objects).forEach(function (key) {
                            metadataType.childs[key] = objects[key];
                        });
                        metadata[metadataType.name] = metadataType;
                    }
                }
            }
        }
    }
    let profileMetadata;
    if (isPermissionSets)
        profileMetadata = MetadataFactory.createMetadataType('PermissionSet', true);
    else
        profileMetadata = MetadataFactory.createMetadataType('Profile', true);
    for (const profile of profileNames) {
        profileMetadata.childs.push(MetadataFactory.createMetadataObject(profile, true));
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
        let stdOut = Process.retrieve(user, packageFolder, packageFile);
        if (stdOut) {
            let data = JSON.parse(stdOut.toString());
            if (data.status === 0) {
                FileWriter.unzip(packageFolder + '\\unpackaged.zip', packageFolder, function (fd) {
                    if (isPermissionSets) {
                        let profiles = FileReader.readDirSync(packageFolder + '\\permissionsets');
                        if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '\\permissionsets'))
                            FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '\\permissionsets');
                        for (const profile of profiles) {
                            let targetFile = Paths.getMetadataRootFolder() + '\\permissionsets\\' + profile + '-meta.xml';
                            let sourceFile = packageFolder + '\\permissionsets\\' + profile;
                            if (compress) {
                                let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                                let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                                if (profileRaw) {
                                    let profile = profileUtils.createProfile(profileRaw, isPermissionSets);
                                    FileWriter.createFileSync(sourceFile, profileUtils.toXML(profile, true));
                                }
                            }
                            FileWriter.copyFileSync(sourceFile, targetFile);
                        }
                    } else {
                        let profiles = FileReader.readDirSync(packageFolder + '\\profiles');
                        if (!FileChecker.isExists(Paths.getMetadataRootFolder() + '\\profiles'))
                            FileWriter.createFolderSync(Paths.getMetadataRootFolder() + '\\profiles');
                        for (const profile of profiles) {
                            let targetFile = Paths.getMetadataRootFolder() + '\\profiles\\' + profile + '-meta.xml';
                            let sourceFile = packageFolder + '\\profiles\\' + profile;
                            if (compress) {
                                let root = AuraParser.parseXML(FileReader.readFileSync(sourceFile));
                                let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
                                if (profileRaw) {
                                    let profile = profileUtils.createProfile(profileRaw, isPermissionSets);
                                    FileWriter.createFileSync(sourceFile, profileUtils.toXML(profile, true));
                                }
                            }
                            FileWriter.copyFileSync(sourceFile, targetFile);
                        }
                    }
                    if (callback)
                        callback.call(this);
                });
            }
        }
    }
}