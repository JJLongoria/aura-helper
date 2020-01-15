const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Process = require('../processes').Process;
const Config = require('../main/config');
const Metadata = require('../metadata');
const Logger = require('../main/logger');
const GUIEngine = require('../guiEngine');
const MetadataUtils = Metadata.Utils;
const MetadataConnection = Metadata.Connection;
const PackageGenerator = Metadata.PackageGenerator;
const window = vscode.window;
const MetadataTypes = Metadata.MetadataTypes;
const MetadataFactory = Metadata.Factory;
const ProgressLocation = vscode.ProgressLocation;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const Paths = fileSystem.Paths;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;

let view;
exports.run = function () {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Matching Org Metadata with your local metadata \n (Only affects metadata types that you have in your local project)",
        cancellable: true
    }, (progress, token) => {

        return new Promise(promiseResolve => {
            setTimeout(() => {
                let user = Config.getAuthUsername();
                let orgNamespace = Config.getOrgNamespace();
                let metadataObjects = MetadataConnection.getMetadataObjectsListFromOrg(user);
                if (metadataObjects) {
                    let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
                    let metadataFromFileSystem = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
                    let metadataFromOrg = MetadataConnection.getMetadataFromOrg(user, metadataObjects, orgNamespace);
                    let metadataToMatch = getMetadataForMatchOrgAndLocal(metadataFromFileSystem, metadataFromOrg);
                    let viewOptions = Engine.getViewOptions();
                    viewOptions.title = 'Match Org Metadata with Local';
                    viewOptions.showActionBar = true;
                    viewOptions.actions.push(Engine.createButtonAction('deleteBtn', '{!label.delete}', ["w3-btn w3-border w3-border-light-green save"], "deleteMetadata()"));
                    viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
                    view = Engine.createView(Routing.MatchOrg, viewOptions);
                    view.render(function (resolve) {
                        resolve(metadataToMatch, undefined);
                        promiseResolve();
                    });
                    view.onReceiveMessage(function (message) {
                        if (message.command === 'cancel')
                            view.close();
                        else if (message.command === 'delete')
                            deleteMetadata(message.model);
                    });
                }

            }, 100);
        });
    });
}

function getMetadataForMatchOrgAndLocal(metadataFromFileSystem, metadataFromOrg) {
    let metadataTypesForCheck = [
        MetadataTypes.APEX_CLASS,
        MetadataTypes.CUSTOM_FIELDS,
        MetadataTypes.CUSTOM_OBJECT,
        MetadataTypes.RECORD_TYPE,
        MetadataTypes.LAYOUT,
        MetadataTypes.FLOWS,
        MetadataTypes.APEX_PAGE,
        MetadataTypes.APEX_TRIGGER,
        MetadataTypes.APEX_COMPONENT,
        MetadataTypes.APPROVAL_PROCESSES
    ];
    let metadataOnOrg = {};
    let metadataOnLocal = [];
    Object.keys(metadataFromFileSystem).forEach(function (key) {
        let metadataTypeFromFileSystem = metadataFromFileSystem[key];
        let metadataTypeFromOrg = metadataFromOrg[key];
        if (metadataTypeFromOrg) {
            Object.keys(metadataTypeFromOrg.childs).forEach(function (childKey) {
                let childFromOrg = metadataTypeFromOrg.childs[childKey];
                let childFromFile = metadataTypeFromFileSystem.childs[childKey];
                let grandChildsFromOrgKeys = (childFromOrg && childFromOrg.childs) ? Object.keys(childFromOrg.childs) : undefined;
                if (grandChildsFromOrgKeys && grandChildsFromOrgKeys.length > 0) {
                    Object.keys(childFromOrg.childs).forEach(function (grandChildKey) {
                        let grandChildFromOrg = childFromOrg.childs[grandChildKey];
                        let grandChildFromFile = (childFromFile && childFromFile.childs) ? childFromFile.childs[grandChildKey] : undefined;
                        if (!grandChildFromFile) {
                            if (!metadataOnOrg[key])
                                metadataOnOrg[key] = MetadataFactory.createMetadataType(key, false);
                            if (!metadataOnOrg[key].childs[childKey])
                                metadataOnOrg[key].childs[childKey] = MetadataFactory.createMetadataObject(childKey, false);
                            metadataOnOrg[key].childs[childKey].childs[grandChildKey] = grandChildFromOrg;
                        }
                    });
                } else {
                    if (!childFromFile) {
                        if (!metadataOnOrg[key])
                            metadataOnOrg[key] = MetadataFactory.createMetadataType(key, false);
                        metadataOnOrg[key].childs[childKey] = childFromOrg;
                    }
                }
            });
        }
    });
    return {
        metadataOnOrg: metadataOnOrg,
        metadataOnLocal: metadataOnLocal
    };
}

function deleteMetadata(metadataToMatch) {
    let metadataOnOrg = metadataToMatch.metadataOnOrg;
    let version = Config.getOrgVersion();
    let user = Config.getAuthUsername();
    let orgNS = Config.getOrgNamespace();
    let packageContent = PackageGenerator.createPackage({}, version, true);
    let destructivePackageContent = PackageGenerator.createPackage(metadataOnOrg, version, true);
    let folder = Paths.getDestructivePackageFolder();
    if (FileChecker.isExists(folder))
        FileWriter.delete(folder);
    FileWriter.createFolderSync(folder);
    FileWriter.createFileSync(folder + '/package.xml', packageContent);
    FileWriter.createFileSync(folder + '/destructiveChanges.xml', destructivePackageContent);
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Deleting Selected Metadata from Org",
        cancellable: true
    }, (progress, token) => {
        return new Promise(promiseResolve => {
            setTimeout(() => {
                try {
                    Process.destructiveChanges(user, folder);
                    view.close();
                    window.showInformationMessage("Metadata Deleted.");
                } catch (error) { 
                    window.showErrorMessage("An error ocurred while deleting metadata: " + error);
                }
                promiseResolve();
            }, 100);
        });
    });
}