const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Config = require('../core/config');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const ProcessManager = require('../processes').ProcessManager;
const XMLParser = languages.XMLParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const window = vscode.window;
const MetadataUtils = Metadata.Utils;
const ProgressLocation = vscode.ProgressLocation;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
let downloadedMetadata = {};

exports.run = function () {
    try {
        let viewOptions = Engine.getViewOptions();
        viewOptions.title = '{!label.package_generator}';
        viewOptions.actions.push(Engine.createButtonAction('createForRetriveBtn', '{!label.create_package}', ["w3-btn", "save"], "createPackage()"));
        viewOptions.actions.push(Engine.createButtonAction('createFullPackageBtn', '{!label.create_full_package}', ["w3-btn", "altSave"], "createFullPackage()"));
        viewOptions.actions.push(Engine.createButtonAction('createDestructivePackageBtn', '{!label.create_destructive_package}', ["w3-btn", "warningBtn"], "createDestructive()"));
        viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.close}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
        view = Engine.createView(Routing.PackageGenerator, viewOptions);
        view.render();
        view.onReceiveMessage(onReceiveMessage);
        view.onClose(function () {
            ProcessManager.killProcess();
        });
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function onReceiveMessage(message) {
    switch (message.command) {
        case 'loadMetadata':
            loadMetadata(message.loadFrom, message.selectedOptionToDownload);
            break;
        case 'createPackage':
            createPackage(message.metadata.metadataForDeploy, message.createFor, message.saveOn);
            break;
        case 'createDestructive':
            createDestructive(message.metadata.metadataForDelete, message.saveOn);
            break;
        case 'createFullPackage':
            createFullPackage(message.metadata.metadataForDeploy, message.metadata.metadataForDelete, message.saveOn, message.createFor);
            break;
        case 'selectFromPackage':
            selectFromPackage();
            break;
        case 'selectFromGit':
            selectFromGit(message.source, message.data);
            break;
        case 'getGitData':
            getGitData();
            break;
        case 'fetch':
            fetch();
            break;
        case 'cancel':
            view.close();
            break;
        default:
            break;
    }
}

function loadMetadata(loadFrom, selectedOptionToDownload) {
    switch (loadFrom) {
        case 'fromOrg':
            loadMetadataFromOrg(selectedOptionToDownload);
            break;
        case 'fromFS':
            loadFromFileSystem();
            break;
        default:
            view.postMessage({ command: "metadataLoaded", metadata: {} });
            break;
    }
}

function loadMetadataFromOrg(selectedOptionToDownload) {
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Loading Metadata from Auth Org",
        cancellable: true
    }, (progress, cancelToken) => {
        return new Promise(async resolve => {
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
                    vscode.window.showErrorMessage(response.error.message);
                }
            } else {
                vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
            }
            resolve();
        });
    });
}

async function loadFromFileSystem() {
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
            vscode.window.showErrorMessage(response.error.message);
        }
    } else {
        vscode.window.showErrorMessage('An error ocurred while processing command. Error: \n' + out.stdErr);
    }
}

function createPackage(metadata, createFor, saveOn, path) {
    let version = Config.getOrgVersion();
    if (!FileChecker.isExists(Paths.getPackageFolder()))
        FileWriter.createFolderSync(Paths.getPackageFolder());
    let jsonPath = Paths.getPackageFolder() + '/package.json';
    if (FileChecker.isExists(jsonPath))
        FileWriter.delete(jsonPath);
    FileWriter.createFile(jsonPath, JSON.stringify(metadata, null, 2), async function () {
        try {
            let packagePath = path;
            if (!path) {
                if (saveOn === 'saveOnProject') {
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
                    createType: 'package',
                    version: version,
                    source: jsonPath,
                    explicit: createFor === 'forRetrieve'
                };
                let out = await ProcessManager.auraHelperPackageGenerator(options, true);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            view.postMessage({ command: 'packageCreated' });
                        } else {
                            view.postMessage({ command: 'packageError', data: { error: response.error.message } });
                        }
                    } else {
                        view.postMessage({ command: 'packageError', data: { error: out.stdErr.toString() } });
                    }
                }
                FileWriter.delete(jsonPath);
            }
        } catch (error) {
            view.postMessage({ command: 'packageError', data: { error: error } });
        }
    });
}

function createDestructive(metadata, saveOn, path) {
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
                if (saveOn === 'saveOnProject') {
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
                    deleteOrder: 'after',
                    explicit: true
                };
                let out = await ProcessManager.auraHelperPackageGenerator(options, true);
                if (out) {
                    if (out.stdOut) {
                        let response = JSON.parse(out.stdOut);
                        if (response.status === 0) {
                            view.postMessage({ command: 'destructivePackageCreated' });
                        } else {
                            view.postMessage({ command: 'packageError', data: { error: response.error.message } });
                        }
                    } else {
                        view.postMessage({ command: 'packageError', data: { error: out.stdErr.toString() } });
                    }
                }
                FileWriter.delete(jsonPath);
            }
        } catch (error) {
            view.postMessage({ command: 'packageError', data: { error: error } });
        }
    });
}

async function createFullPackage(metadataForDeploy, metadataForDelete, saveOn, createFor) {
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
        if (uri && uri.length > 0) {
            packagePath = uri[0].fsPath;
        }
    }
    if (packagePath) {
        createPackage(metadataForDeploy, createFor === 'forRetrieve', undefined, packagePath);
        createDestructive(metadataForDelete, undefined, packagePath);
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
                let packageXML = XMLParser.parseXML(FileReader.readFileSync(uri[0].fsPath));
                if (packageXML.Package) {
                    let packageProcessed = createPackageFromXMLPackage(packageXML);
                    view.postMessage({ command: "selectFromPackageOk", package: packageProcessed });
                } else {
                    view.postMessage({ command: "selectFromPackageError" });
                }
            } catch (error) {
                view.postMessage({ command: "selectFromPackageError" });
            }
        }
    });
}

async function getGitData() {
    let commits = await getCommits();
    let branches = await getBranches();
    view.postMessage({ command: "gitData", data: { commits: commits, branches: branches } });
}

async function selectFromGit(source, data) {
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
            console.log(response);
            if (response.status === 0) {
                downloadedMetadata.metadataForDeploy = MetadataUtils.combineMetadata(downloadedMetadata.metadataForDeploy, response.result.data.metadataForDeploy);
                downloadedMetadata.metadataForDelete = MetadataUtils.combineMetadata(downloadedMetadata.metadataForDelete, response.result.data.metadataForDelete);
                view.postMessage({ command: "metadataSelectedFromGit", metadata: downloadedMetadata });
            } else {
                view.postMessage({ command: 'packageError', data: { error: response.error.message } });
            }
        } else {
            view.postMessage({ command: 'packageError', data: { error: out.stdErr.toString() } });
        }
    }
}

function getBranches() {
    return new Promise(async function (resolve) {
        let branches = [];
        let out = await ProcessManager.gitGetBranches();
        if (out) {
            if (out.stdOut) {
                for (const logLine of out.stdOut.split('\n')) {
                    let branch = logLine.trim();
                    if (branch.length > 0)
                        branches.push(branch);
                }
                resolve(branches);
            } else {

            }
        }
    });
}

async function fetch() {
    let out = await ProcessManager.gitFetch();
    if (out) {
        if (out.stdOut) {
            getGitData();
        } else {

        }
    }
}

function getCommits() {
    return new Promise(async function (resolve) {
        let out = await ProcessManager.gitLog();
        if (out) {
            if (out.stdOut) {
                let commit;
                let commits = [];
                for (const logLine of out.stdOut.split('\n')) {
                    if (logLine.startsWith('commit')) {
                        let words = logLine.split(' ');
                        if (commit)
                            commits.push(commit);
                        commit = {
                            pointer: words[1],
                            author: undefined,
                            authorEmail: undefined,
                            date: {
                                dayName: undefined,
                                monthName: undefined,
                                day: undefined,
                                time: undefined,
                                year: undefined,
                                timeoffset: undefined,
                                dateStr: undefined
                            },
                            title: undefined,
                            message: '',
                        };
                    } else if (logLine.startsWith('Author:')) {
                        let words = logLine.split(' ');
                        commit.author = logLine.substring(logLine.indexOf(':') + 1, logLine.indexOf('<')).trim();
                        commit.authorEmail = words[words.length - 1].replace('<', '').replace('>', '');
                    } else if (logLine.startsWith('Date:')) {
                        let words = logLine.split(' ');
                        commit.date.dayName = words[3];
                        commit.date.monthName = words[4];
                        commit.date.day = words[5];
                        commit.date.time = words[6];
                        commit.date.year = words[7];
                        commit.date.timeoffset = words[8];
                        commit.date.dateStr = logLine.substring(logLine.indexOf(':') + 1).trim();
                    } else if (commit && commit.date && !commit.title) {
                        if (logLine.trim().length > 0)
                            commit.title = logLine.trim();
                    } else if (commit && commit.title) {
                        if (logLine.trim().length === 0 && !commit.message)
                            continue;
                        commit.message += logLine.trim() + '\n';
                    }
                }
                if (commit)
                    commits.push(commit);
                commits.sort(function (commitA, commitB) {
                    let dateA = new Date(commitA.date.dateStr);
                    let dateB = new Date(commitB.date.dateStr);
                    return dateA.valueOf() - dateB.valueOf();
                });
                resolve(commits);
            } else {

            }
        }
    });
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
