const vscode = require('vscode');
const Logger = require('../main/logger');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Config = require('../main/config');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
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
let process;


exports.run = function () {
    try {
        let viewOptions = Engine.getViewOptions();
        viewOptions.title = '{!label.package_generator}';
        viewOptions.actions.push(Engine.createButtonAction('createForRetriveBtn', '{!label.create_package}', ["w3-btn", "save"], "createPackage()"));
        viewOptions.actions.push(Engine.createButtonAction('createFullPackageBtn', '{!label.create_full_package}', ["w3-btn", "altSave"], "createFullPackage()"));
        viewOptions.actions.push(Engine.createButtonAction('createDestructivePackageBtn', '{!label.create_destructive_package}', ["w3-btn", "warningBtn"], "createDestructive()"));
        viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.close}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
        view = Engine.createView(Routing.PackageGenerator, viewOptions);
        view.render(function (resolve) {
            resolve();
        });
        view.onReceiveMessage(onReceiveMessage);
        view.onClose(function () {
            MetadataConnection.abort();
            if (process)
                process.kill();
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
            createPackage(message.metadata, message.createFor, message.saveOn);
            break;
        case 'createDestructive':
            createDestructive(message.metadata.metadataForDelete);
            break;
        case 'createFullPackage':
            createFullPackage(message.metadata.metadataForDeploy, message.metadata.metadataForDelete);
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
            let user = await Config.getAuthUsername();
            let orgNamespace = Config.getOrgNamespace(user);
            Logger.output("Loading Metadata From Auth Org.");
            let metadata = await MetadataConnection.getAllMetadataFromOrg(user, orgNamespace, selectedOptionToDownload === 'All', progress, cancelToken);
            downloadedMetadata = metadata;
            view.postMessage({ command: "metadataLoaded", metadata: downloadedMetadata });
            Logger.output("Metadata Loaded Succesfully");
            resolve();
        });
    });
}

async function loadFromFileSystem() {
    Logger.output("Loading Metadata from the project in File System");
    let user = await Config.getAuthUsername();
    MetadataConnection.getMetadataObjectsListFromOrg(user, false, undefined, undefined, function (metadataObjects) {
        let metadata = {};
        if (metadataObjects) {
            let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
            metadata = MetadataFactory.getMetadataObjectsFromFileSystem(folderMetadataMap);
            Logger.output("Metadata Loaded Succesfully");
        }
        view.postMessage({ command: "metadataLoaded", metadata: metadata });
    });
}

function createPackage(metadata, createFor, saveOn) {
    let version = Config.getOrgVersion();
    let packageContent = PackageGenerator.createPackage(metadata.metadataForDeploy, version, createFor === 'forRetrieve');
    try {
        if (saveOn === 'saveOnProject') {
            let packagePath = Paths.getManifestPath() + '/package.xml';
            FileWriter.createFileSync(packagePath, packageContent);
            view.postMessage({ command: 'packageCreated' });
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
                    view.postMessage({ command: 'packageCreated' });
                }
            });
        }
    } catch (error) {
        view.postMessage({ command: 'packageError', data: { error: error } });
    }
}

function createDestructive(metadata) {
    window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder",
    }).then(function (uri) {
        if (uri && uri.length > 0) {
            let folder = uri[0].fsPath;
            let version = Config.getOrgVersion();
            let destructivePackageContent = PackageGenerator.createPackage(metadata, version, true);
            FileWriter.createFileSync(folder + '/destructiveChanges.xml', destructivePackageContent);
            view.postMessage({ command: 'destructivePackageCreated' });
        }
    });
}

function createFullPackage(metadataForDeploy, metadataForDelete) {
    window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select Folder",
    }).then(function (uri) {
        if (uri && uri.length > 0) {
            let folder = uri[0].fsPath;
            let version = Config.getOrgVersion();
            let packageContent = PackageGenerator.createPackage(metadataForDeploy, version, false);
            let destructivePackageContent = PackageGenerator.createPackage(metadataForDelete, version, true);
            FileWriter.createFileSync(folder + '/package.xml', packageContent);
            FileWriter.createFileSync(folder + '/destructiveChanges.xml', destructivePackageContent);
            view.postMessage({ command: 'fullPackageCreated' });
        }
    });
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
                }
            } catch (error) {
                view.postMessage({ command: "selectFromPackageError" });
            }
        }
    });
}

function getGitData() {
    getCommits(function (commits) {
        getBranches(function (branches) {
            view.postMessage({ command: "gitData", data: { commits: commits, branches: branches } });
        });
    });
}

async function selectFromGit(source, data) {
    let user = await Config.getAuthUsername();
    MetadataConnection.getMetadataObjectsListFromOrg(user, false, undefined, undefined, function (metadataObjects) {
        if (metadataObjects) {
            let firstElement;
            let secondElement;
            let folderMetadataMap = MetadataUtils.createFolderMetadataMap(metadataObjects);
            if (source === 'twoLastCommits') {
                getCommits(function (commits) {
                    firstElement = commits[commits.length - 2].pointer;
                    secondElement = commits[commits.length - 1].pointer;
                    if (firstElement || secondElement) {
                        getDiffs(firstElement, secondElement, function (diffs) {
                            let metadata = MetadataFactory.getMetadataFromGitDiffs(diffs, folderMetadataMap);
                            data.metadata.metadataForDeploy = MetadataUtils.combineMetadata(data.metadata.metadataForDeploy, metadata.metadataForDeploy);
                            data.metadata.metadataForDelete = MetadataUtils.combineMetadata(data.metadata.metadataForDelete, metadata.metadataForDelete);
                            view.postMessage({ command: "metadataSelectedFromGit", metadata: data.metadata });
                        });
                    }
                });
            } else {
                if (source === 'specificCommits') {
                    firstElement = data.firstCommit.pointer;
                    secondElement = data.secondCommit.pointer;
                } else if (source === 'otherBranch') {
                    firstElement = data.branch;
                } else if (source === 'twoBranches') {
                    firstElement = data.firstBranch;
                    secondElement = data.secondBranch;
                }
                if (firstElement || secondElement) {
                    getDiffs(firstElement, secondElement, function (diffs) {
                        let metadata = MetadataFactory.getMetadataFromGitDiffs(diffs, folderMetadataMap);
                        data.metadata.metadataForDeploy = MetadataUtils.combineMetadata(data.metadata.metadataForDeploy, metadata.metadataForDeploy);
                        data.metadata.metadataForDelete = MetadataUtils.combineMetadata(data.metadata.metadataForDelete, metadata.metadataForDelete);
                        view.postMessage({ command: "metadataSelectedFromGit", metadata: data.metadata });
                    });
                }
            }
        }
    });
}

function getDiffs(source, target, callback) {
    let buffer = [];
    let bufferError = [];
    if (target)
        process = ProcessManager.gitDiff(source, target, function (event, data) {
            switch (event) {
                case ProcessEvent.STD_OUT:
                    buffer = buffer.concat(data);
                    break;
                case ProcessEvent.ERROR:
                case ProcessEvent.ERR_OUT:
                    bufferError = bufferError.concat(data);
                    break;
                case ProcessEvent.END:
                    if (callback)
                        callback.call(this, processDiffOut(buffer.toString()));
                    break;
                default:
                    break;
            }
        });
    else
        process = ProcessManager.gitDiffSource(source, function (event, data) {
            switch (event) {
                case ProcessEvent.STD_OUT:
                    buffer = buffer.concat(data);
                    break;
                case ProcessEvent.ERROR:
                case ProcessEvent.ERR_OUT:
                    bufferError = bufferError.concat(data);
                    break;
                case ProcessEvent.END:
                    if (callback)
                        callback.call(this, processDiffOut(buffer.toString()));
                    break;
                default:
                    break;
            }
        });
}

function processDiffOut(stdOut) {
    let lines = stdOut.split('\n');
    let diffs = [];
    let diff;
    let startChanges = false;
    for (const diffLine of lines) {
        let words = diffLine.split(' ');
        if (diffLine.startsWith('diff --git')) {
            startChanges = false;
            if (diff && diff.path.indexOf('force-app') !== -1)
                diffs.push(diff);
            diff = {
                path: words[2].substring(2),
                mode: 'edit file',
                removeChanges: [],
                addChanges: []
            };
        } else if (diffLine.startsWith('new file mode')) {
            diff.mode = 'new file';
        } else if (diffLine.startsWith('deleted file mode')) {
            diff.mode = 'deleted file';
        } else if (!startChanges && diffLine.startsWith('+++')) {
            startChanges = true;
        } else if (startChanges) {
            if (diffLine.startsWith('-'))
                diff.removeChanges.push(diffLine.substring(1));
            else if (diffLine.startsWith('+'))
                diff.addChanges.push(diffLine.substring(1));
        }
    }
    if (diff && diff.path.indexOf('force-app') !== -1)
        diffs.push(diff);
    Logger.logJSON('diffs', diffs);
    return diffs;
}

function getBranches(callback) {
    let branches = [];
    let buffer = [];
    process = ProcessManager.gitGetBranches(function (event, data) {
        switch (event) {
            case ProcessEvent.STD_OUT:
                buffer = buffer.concat(data);
                break;
            case ProcessEvent.END:
                for (const logLine of buffer.toString().split('\n')) {
                    let branch = logLine.trim();
                    if (branch.length > 0)
                        branches.push(branch);
                }
                if (callback)
                    callback.call(this, branches);
                break;
            default:
                break;
        }
    });
}

function fetch() {
    process = ProcessManager.gitFetch(function (event, data) {
        switch (event) {
            case ProcessEvent.END:
                getCommits(function (commits) {
                    getBranches(function (branches) {
                        view.postMessage({ command: "gitData", data: { commits: commits, branches: branches } });
                    });
                });
                break;
            default:
                break;
        }
    });
}

function getCommits(callback) {
    let buffer = [];
    process = ProcessManager.gitLog(function (event, data) {
        switch (event) {
            case ProcessEvent.STD_OUT:
                buffer = buffer.concat(data);
                break;
            case ProcessEvent.END:
                let commit;
                let commits = [];
                for (const logLine of buffer.toString().split('\n')) {
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
                if (callback)
                    callback.call(this, commits);
                break;
            default:
                break;
        }
    });
}

