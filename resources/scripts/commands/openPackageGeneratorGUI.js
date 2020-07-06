const Config = require('../core/config');
const MetadataSelectorInput = require('../inputs/metadataSelector');
const InputFactory = require('../inputs/factory');
const NotificationManager = require('../output/notificationManager');
const AppContext = require('../core/applicationContext');
const XMLParser = languages.XMLParser;
const FileChecker = fileSystem.FileChecker;
let downloadedMetadata = {};
        if (Config.getConfig().graphicUserInterface.enableAdvanceGUI && AppContext.isAdvanceGUIAvailable) {
            openAdvanceGUI();
        } else {
            openStandardGUI();
        }
        NotificationManager.showCommandError(error);
async function openAdvanceGUI() {
    let viewOptions = Engine.getViewOptions();
    viewOptions.title = '{!label.package_generator}';
    viewOptions.actions.push(Engine.createButtonAction('createForRetriveBtn', '{!label.create_package}', ["w3-btn", "save"], "createPackage()"));
    viewOptions.actions.push(Engine.createButtonAction('createFullPackageBtn', '{!label.create_full_package}', ["w3-btn", "altSave"], "createFullPackage()"));
    viewOptions.actions.push(Engine.createButtonAction('createDestructivePackageBtn', '{!label.create_destructive_package}', ["w3-btn", "warningBtn"], "createDestructive()"));
    viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.close}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
    view = Engine.createView(Routing.PackageGenerator, viewOptions);
    view.render({}, {});
    view.onReceiveMessage(onReceiveMessage);
    view.onClose(function () {
        ProcessManager.killProcess();
    });
}

async function openStandardGUI() {
    let from = await InputFactory.createPackageSourcesSelector();
    if (!from)
        return;
    let orgNamespace = 'Yes';
    if (from === 'From Org')
        orgNamespace = await InputFactory.createIncludeOrgNamespaceSelector();
    if (!orgNamespace)
        return;
    let createFor = await InputFactory.createPackageOptionSelector();
    if (!createFor)
        return;
    let deleteOrder = 'After Deploy';
    if (createFor === 'For Delete')
        deleteOrder = await InputFactory.createPackageDeleteOrderSelector();
    if (!deleteOrder)
        return;
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Loading Metadata " + from,
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async resolve => {
            let types;
            if (from === 'From Org') {
                types = await getOrgMetadataForStandardGUI(false, cancelToken);
            } else {
                types = await getLocalMetadataForStandardGUI(cancelToken);
            }
            let input = new MetadataSelectorInput('Select Metadata Types', types);
            input.onAccept(async metadata => {
                let explicit = 'Yes';
                if (createFor === 'For Deploy or Retrieve')
                    explicit = await InputFactory.createPackageExplicitSelector();
                if (!explicit)
                    return;
                let saveOn = await InputFactory.createPackageSaveOnSelector();
                if (!saveOn)
                    return;
                if (createFor === 'For Deploy or Retrieve') {
                    createPackage(metadata, explicit === 'Yes', saveOn === 'Manifest folder', undefined, false);
                } else {
                    let order = (deleteOrder === 'After Deploy') ? 'after' : 'before';
                    createDestructive(metadata, saveOn === 'Manifest folder', order, false);
                }
            });
            input.show();
            resolve();
        });
    });

}

function getLocalMetadataForStandardGUI(cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false }, true, cancelToken);
        if (!out) {
            NotificationManager.showInfo('Operation Cancelled by User');
            resolve();
        } else if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                resolve(response.result.data);
            } else {
                NotificationManager.showCommandError(response.error.message);
                resolve();
            }
        } else {
            NotificationManager.showCommandError(out.stdErr);
            resolve();
        }
    });
}

function getOrgMetadataForStandardGUI(orgNamespace, cancelToken) {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: true, orgNamespace: orgNamespace }, true, cancelToken);
        if (!out) {
            NotificationManager.showInfo('Operation Cancelled by User');
            resolve();
        } else if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                resolve(response.result.data);
            } else {
                NotificationManager.showCommandError(response.error.message);
                resolve();
            }
        } else {
            NotificationManager.showCommandError(out.stdErr);
            resolve();
        }
    });
}

            createPackage(message.metadata.metadataForDeploy, message.createFor === 'forRetrieve', message.saveOn === 'saveOnProject', undefined, true);
            createDestructive(message.metadata.metadataForDelete, message.saveOn === 'saveOnProject', message.deleteOrder, undefined, true);
            createFullPackage(message.metadata.metadataForDeploy, message.metadata.metadataForDelete, message.saveOn, message.createFor, message.deleteOrder);
            loadMetadataFromOrgForAdvanceGUI(selectedOptionToDownload);
            loadFromFileSystemForAdvanceGUI();
function loadMetadataFromOrgForAdvanceGUI(selectedOptionToDownload) {
            let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: true, orgNamespace: selectedOptionToDownload !== 'All' }, true, cancelToken);
            if (!out) {
                vscode.window.showWarningMessage('Operation Cancelled by User');
            } else if (out.stdOut) {
                let response = JSON.parse(out.stdOut);
                if (response.status === 0) {
                    downloadedMetadata.metadataForDeploy = JSON.parse(JSON.stringify(response.result.data));
                    downloadedMetadata.metadataForDelete = JSON.parse(JSON.stringify(response.result.data));
                    view.postMessage({ command: "metadataLoaded", metadata: downloadedMetadata });
                } else {
                    NotificationManager.showError(response.error.message);
                }
            } else {
                NotificationManager.showCommandError(out.stdErr);
            }
async function loadFromFileSystemForAdvanceGUI() {
    let out = await ProcessManager.auraHelperDescribeMetadata({ fromOrg: false }, false);
    if (!out) {
        vscode.window.showWarningMessage('Operation Cancelled by User');
    } else if (out.stdOut) {
        let response = JSON.parse(out.stdOut);
        if (response.status === 0) {
            downloadedMetadata.metadataForDeploy = JSON.parse(JSON.stringify(response.result.data));
            downloadedMetadata.metadataForDelete = JSON.parse(JSON.stringify(response.result.data));
            view.postMessage({ command: "metadataLoaded", metadata: downloadedMetadata });
        } else {
            NotificationManager.showError(response.error.message);
    } else {
        NotificationManager.showCommandError(out.stdErr);
    }
function createPackage(metadata, explicit, saveOnManifest, path, fromAdvanceGUI) {
    if (!FileChecker.isExists(Paths.getPackageFolder()))
        FileWriter.createFolderSync(Paths.getPackageFolder());
    let jsonPath = Paths.getPackageFolder() + '/package.json';
    if (FileChecker.isExists(jsonPath))
        FileWriter.delete(jsonPath);
    FileWriter.createFile(jsonPath, JSON.stringify(metadata, null, 2), async function () {
        try {
            let packagePath = path;
            if (!path) {
                if (saveOnManifest) {
                    packagePath = Paths.getManifestPath();
                } else {
                    let uri = await window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: "Save Package",
                    });
                    if (uri && uri.length > 0) {
                        packagePath = uri[0].fsPath;
                    }
            }
            if (packagePath) {
                let options = {
                    outputPath: packagePath,
                    createFrom: 'json',
                    createType: 'package',
                    version: version,
                    source: jsonPath,
                    explicit: explicit
                };
                let out = await ProcessManager.auraHelperPackageGenerator(options, true);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            if (fromAdvanceGUI)
                                view.postMessage({ command: 'packageCreated' });
                            else
                                NotificationManager.showInfo('package.xml file created successfully');
                        } else {
                            if (fromAdvanceGUI)
                                view.postMessage({ command: 'packageError', data: { error: response.error.message } });
                            else
                                NotificationManager.showError(response.error.message);
                        }
                    } else {
                        if (fromAdvanceGUI)
                            view.postMessage({ command: 'packageError', data: { error: out.stdErr } });
                        else
                            NotificationManager.showError(out.stdErr);
                    }
                }
                FileWriter.delete(jsonPath);
            }
        } catch (error) {
            if (fromAdvanceGUI)
                view.postMessage({ command: 'packageError', data: { error: error } });
            else
                NotificationManager.showError(error.message);
    });
function createDestructive(metadata, saveOnManifest, deleteOrder, path, fromAdvanceGUI) {
    let version = Config.getOrgVersion();
    if (!FileChecker.isExists(Paths.getPackageFolder()))
        FileWriter.createFolderSync(Paths.getPackageFolder());
    let jsonPath = Paths.getPackageFolder() + '/destructive.json';
    if (FileChecker.isExists(jsonPath))
        FileWriter.delete(jsonPath);
    FileWriter.createFile(jsonPath, JSON.stringify(metadata, null, 2), async function () {
        try {
            let packagePath = path;
            if (!path) {
                if (saveOnManifest) {
                    packagePath = Paths.getManifestPath();
                } else {
                    let uri = await window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: "Save Package",
                    });
                    if (uri && uri.length > 0) {
                        packagePath = uri[0].fsPath;
                    }
                }
            }
            if (packagePath) {
                let options = {
                    outputPath: packagePath,
                    createFrom: 'json',
                    createType: 'destructive',
                    version: version,
                    source: jsonPath,
                    deleteOrder: deleteOrder,
                    explicit: true
                };
                let out = await ProcessManager.auraHelperPackageGenerator(options, true);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            if (fromAdvanceGUI)
                                view.postMessage({ command: 'destructivePackageCreated' });
                            else
                                NotificationManager.showInfo('Destructive file created successfully');
                        } else {
                            if (fromAdvanceGUI)
                                view.postMessage({ command: 'packageError', data: { error: response.error.message } });
                            else
                                NotificationManager.showError(response.error.message);
                        }
                    } else {
                        if (fromAdvanceGUI)
                            view.postMessage({ command: 'packageError', data: { error: out.stdErr } });
                        else
                            NotificationManager.showError(out.stdErr);
                    }
                }
                FileWriter.delete(jsonPath);
            }
        } catch (error) {
            if (fromAdvanceGUI)
                view.postMessage({ command: 'packageError', data: { error: error } });
            else
                NotificationManager.showError(error.message);
async function createFullPackage(metadataForDeploy, metadataForDelete, saveOn, createFor, deleteOrder) {
    let packagePath;
    if (saveOn === 'saveOnProject') {
        packagePath = Paths.getManifestPath();
    } else {
        let uri = await window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Save Package",
        });
            packagePath = uri[0].fsPath;
    }
    if (packagePath) {
        createPackage(metadataForDeploy, createFor === 'forRetrieve', undefined, packagePath, true);
        createDestructive(metadataForDelete, undefined, deleteOrder, packagePath, false);
    }
                let packageXML = XMLParser.parseXML(FileReader.readFileSync(uri[0].fsPath));
                    let packageProcessed = createPackageFromXMLPackage(packageXML);
async function getGitData() {
    let commits = await getCommits();
    let branches = await getBranches();
    view.postMessage({ command: "gitData", data: { commits: commits, branches: branches } });
    let firstElement = 'this';
    let secondElement;
    if (source === 'twoLastCommits') {
        let commits = await getCommits();
        firstElement = commits[commits.length - 2].pointer;
        secondElement = commits[commits.length - 1].pointer;
    } else if (source === 'specificCommits') {
        firstElement = data.firstCommit.pointer;
        secondElement = data.secondCommit.pointer;
    } else if (source === 'otherBranch') {
        secondElement = data.branch;
    } else if (source === 'twoBranches') {
        firstElement = data.firstBranch;
        secondElement = data.secondBranch;
    }
    let options = {
        createFrom: 'git',
        createType: 'both',
        source: firstElement,
        target: secondElement,
        deleteOrder: 'after',
        explicit: true,
        raw: true,
    };
    let out = await ProcessManager.auraHelperPackageGenerator(options, true);
    if (out) {
        if (out.stdOut) {
            let response = JSON.parse(out.stdOut);
            if (response.status === 0) {
                downloadedMetadata.metadataForDeploy = MetadataUtils.combineMetadata(downloadedMetadata.metadataForDeploy, response.result.data.metadataForDeploy);
                downloadedMetadata.metadataForDelete = MetadataUtils.combineMetadata(downloadedMetadata.metadataForDelete, response.result.data.metadataForDelete);
                view.postMessage({ command: "metadataSelectedFromGit", metadata: downloadedMetadata });
                view.postMessage({ command: 'packageError', data: { error: response.error.message } });
        } else {
            view.postMessage({ command: 'packageError', data: { error: out.stdErr.toString() } });
function getBranches() {
    return new Promise(async function (resolve) {
        let branches = [];
        let out = await ProcessManager.gitGetBranches();
        if (out) {
            if (out.stdOut) {
                for (const logLine of out.stdOut.split('\n')) {
                resolve(branches);
            } else {

            }
async function fetch() {
    let out = await ProcessManager.gitFetch();
    if (out) {
        if (out.stdOut) {
            getGitData();
        } else {

    }
function getCommits() {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.gitLog();
        if (out) {
            if (out.stdOut) {
                for (const logLine of out.stdOut.split('\n')) {
                resolve(commits);
            } else {

            }
function createPackageFromXMLPackage(pkg) {
    let result;
    if (pkg.Package) {
        result = {
            version: pkg.Package.version,
        };
        let types = [];
        if (Array.isArray(pkg.Package.types)) {
            types = pkg.Package.types;
        } else {
            types.push(pkg.Package.types);
        }
        for (const type of types) {
            if (!result[type.name]) {
                result[type.name] = [];
            }
            let members = [];
            if (Array.isArray(type.members)) {
                members = type.members;
            } else {
                members.push(type.members);
            }
            for (const member of members) {
                result[type.name].push(member);
            }
        }
    }
    return result;
}