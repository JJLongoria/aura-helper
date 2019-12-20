const vscode = require('vscode');
const Logger = require('../main/logger');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Config = require('../main/config');
const Metadata = require('../metadata');
const AuraParser = languages.AuraParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const ViewColumn = vscode.ViewColumn;
const window = vscode.window;
const MetadataConnection = Metadata.Connection;
const MetadataFactory = Metadata.Factory;
const MetadataUtils = Metadata.Utils;
const PackageGenerator = Metadata.PackageGenerator;
const ProgressLocation = vscode.ProgressLocation;

let panel;
let downloadedMetadata;

exports.run = function () {
    try {
        panel = window.createWebviewPanel('PackageGenerator', 'Package Generator', ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = getPackageGeneratorPage();
        setTimeout(() => {
            panel.webview.postMessage({ command: "open" });
        }, 1500);
        
        panel.webview.onDidReceiveMessage(
            message => {
                onReceiveMessage(message);
            },
            undefined,
            []
        );
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function getPackageGeneratorPage() {
    return FileReader.readFileSync(Paths.getPackageGeneratorPage());
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
            panel.webview.postMessage({ command: "metadataLoaded", metadata: {} });
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
                        panel.webview.postMessage({ command: "metadataLoaded", metadata: downloadedMetadata });
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
    panel.webview.postMessage({ command: "metadataLoaded", metadata: metadata });
}

function createPackage(metadata, createFor, saveOn) {
    let version = Config.getOrgVersion();
    let packageContent = PackageGenerator.createPackage(metadata, version, createFor === 'forRetrieve');
    try { 
        if (saveOn === 'saveOnProject') {
            let packagePath = Paths.getManifestPath() + '/package.xml';
            FileWriter.createFileSync(packagePath, packageContent);
            panel.dispose();
            window.showInformationMessage("Package created succesfully");
        } else { 
            window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: "Save Package",
            }).then(function (uri) {
                if (uri && uri.length > 0) {
                    let packagePath = uri[0].fsPath + '/package.xml';
                    FileWriter.createFileSync(packagePath, packageContent);
                    panel.dispose();
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
        filters: {
            'Package': ['xml']
        }
    }).then(function (uri) {
        if (uri && uri.length > 0) {
            try {
                let packageXML = AuraParser.parseXML(FileReader.readFileSync(uri[0].fsPath));
                if (packageXML.Package) {
                    let packageProcessed = PackageGenerator.createPackageFromXMLPackage(packageXML);
                    panel.webview.postMessage({ command: "selectFromPackageOk", package: packageProcessed });
                } else {
                    panel.webview.postMessage({ command: "selectFromPackageError" });
                    window.showErrorMessage("Please, select a correct package file");
                }
            } catch (error) {
                panel.webview.postMessage({ command: "selectFromPackageError" });
                window.showErrorMessage("Please, select a correct package file");
            }
        }
    });
}
