const vscode = require('vscode');
const Logger = require('../main/logger');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Config = require('../main/config');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const AuraParser = languages.AuraParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const window = vscode.window;
const MetadataConnection = Metadata.Connection;
const MetadataFactory = Metadata.Factory;
const MetadataUtils = Metadata.Utils;
const PackageGenerator = Metadata.PackageGenerator;
const ProgressLocation = vscode.ProgressLocation;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
let downloadedMetadata;



exports.run = function () {
    try {
        let viewOptions = Engine.getViewOptions();
        viewOptions.title = 'Package Generator';
        viewOptions.actions.push(Engine.createButtonAction('createForRetriveBtn', 'Create for Retrieve', ["w3-btn", "w3-border", "w3-border-green", "createPackage"], "createPackage('forRetrieve')"));
        viewOptions.actions.push(Engine.createButtonAction('createForDeployBtn', 'Create For Deploy', ["w3-btn", "w3-border", "w3-border-green", "createPackage"], "createPackage('forDeploy')"));
        view = Engine.createView(Routing.PackageGenerator, viewOptions);
        view.render(function (resolve) {
            resolve();
        });
        view.onReceiveMessage(onReceiveMessage);
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function onReceiveMessage(message) {
    switch (message.command) {
        case 'loadMetadata':
            loadMetadata(message.loadFrom);
            break;
        case 'createPackage':
            createPackage(message.metadata, message.createFor, message.saveOn);
            break;
        case 'notMetadataSelected':
            window.showErrorMessage("Not Metadata Selected for Create Package. Select at leat one element for create the package.");
            break;
        case 'selectFromPackage':
            selectFromPackage();
            break;
        default:
            break;
    }
}

function loadMetadata(loadFrom) {
    switch (loadFrom) {
        case 'fromOrg':
            loadMetadataFromOrg();
            break;
        case 'fromFS':
            loadFromFileSystem();
            break;
        default:
            view.postMessage({ command: "metadataLoaded", metadata: {} });
            break;
    }
}

function loadMetadataFromOrg() {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Loading Metadata from Auth Org (Don't close window until finish)",
        cancellable: false
    }, (progress, token) => {
        return new Promise(resolve => {
            setTimeout(() => {
                let user = Config.getAuthUsername();
                let orgNS = Config.getOrgNamespace();
                let lastIncrement = 0;
                Logger.output("Loading Metadata From Auth Org. Logged User: " + user);
                MetadataConnection.getAllMetadataFromOrg(
                    user,
                    orgNS,
                    function (metadataType, counter, total) {
                        if (total) {
                            if (!downloadedMetadata)
                                downloadedMetadata = {};
                            downloadedMetadata[metadataType.name] = metadataType;
                            let increment = (counter / total) * 100;
                            progress.report({ increment: increment, message: metadataType.name + ' Downloaded' });
                            lastIncrement = increment;
                        } else {
                            progress.report({ increment: lastIncrement, message: ' Download ' + metadataType });
                        }
                    },
                    function (metadata) {
                        downloadedMetadata = metadata;
                        Logger.output("Metadata Loaded");
                        view.postMessage({ command: "metadataLoaded", metadata: downloadedMetadata });
                        Logger.output("Metadata Loaded Succesfully");
                        resolve();
                    }
                );
            }, 100);
        });
    });
}

function loadFromFileSystem() {
    Logger.output("Loading Metadata from the project in File System");
    let user = Config.getAuthUsername();
    let metadataObjects = MetadataConnection.getMetadataObjectsListFromOrg(user);
    let metadata = {};
    if (metadataObjects) {
        let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
        metadata = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
        Logger.output("Metadata Loaded Succesfully");
    }
    view.postMessage({ command: "metadataLoaded", metadata: metadata });
}

function createPackage(metadata, createFor, saveOn) {
    let version = Config.getOrgVersion();
    let packageContent = PackageGenerator.createPackage(metadata, version, createFor === 'forRetrieve');
    try {
        if (saveOn === 'saveOnProject') {
            let packagePath = Paths.getManifestPath() + '/package.xml';
            FileWriter.createFileSync(packagePath, packageContent);
            view.close();
            window.showInformationMessage("Package created succesfully");
        } else {
            window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: "Save Package",
                filters: { 'XML files': ['xml'] }
            }).then(function (uri) {
                if (uri && uri.length > 0) {
                    let packagePath = uri[0].fsPath + '/package.xml';
                    FileWriter.createFileSync(packagePath, packageContent);
                    view.close();
                    window.showInformationMessage("Package created succesfully");
                }
            });
        }
    } catch (error) {
        window.showErrorMessage("An error ocurren while creating package: " + error);
    }
}

function selectFromPackage() {
    window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        canSelectFolders: false,
        openLabel: "Open Package",
        filters: { 'XML files': ['xml'] }
    }).then(function (uri) {
        if (uri && uri.length > 0) {
            try {
                let packageXML = AuraParser.parseXML(FileReader.readFileSync(uri[0].fsPath));
                if (packageXML.Package) {
                    let packageProcessed = PackageGenerator.createPackageFromXMLPackage(packageXML);
                    view.postMessage({ command: "selectFromPackageOk", package: packageProcessed });
                } else {
                    view.postMessage({ command: "selectFromPackageError" });
                    window.showErrorMessage("Please, select a correct package file");
                }
            } catch (error) {
                view.postMessage({ command: "selectFromPackageError" });
                window.showErrorMessage("Please, select a correct package file");
            }
        }
    });
}

