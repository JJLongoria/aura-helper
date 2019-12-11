const vscode = require('vscode');
const Processes = require('../processes');
const process = require('child_process');
const fileSystem = require('../fileSystem');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const window = vscode.window;
const Config = require('../main/config');
const ProgressLocation = vscode.ProgressLocation;

exports.run = function (uriOrNames) {
    let profileNames = [];
    let filePath;
    let editorOppened = false;
    let wrongFile = false;
    let showOptions = true;
    try {
        if (uriOrNames && uriOrNames.fsPath) {
            filePath = uriOrNames.fsPath;
            if (FileChecker.isProfile(filePath)) {
                showOptions = false;
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', ''));
            } else if (FileChecker.isProfileFolder(filePath)) {
                let files = FileReader.readDirSync(filePath);
                for (const file of files) {
                    profileNames.push(file.replace('.profile-meta.xml', ''));
                }
                showOptions = false;
            } else {
                wrongFile = true;
            }
        } else if (window.activeTextEditor) {
            filePath = window.activeTextEditor.document.uri.fsPath;
            editorOppened = true;
            if (FileChecker.isProfile(filePath))
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', ''));
        }
        if (!wrongFile) {
            if (showOptions) {
                let options = [];
                if (editorOppened && profileNames.length > 0) {
                    options.push("Current Profile");
                }
                options.push("Single Local Profile");
                options.push("Single Profile from Org");
                options.push("All Local Profiles");
                options.push("All Profiles from Org");
                window.showQuickPick(options, { placeHolder: "Select an Aura File for Create" }).then((selected) => retrieveProfiles(profileNames, selected));
            } else {
                retrieveProfiles(profileNames)
            }
        } else {
            window.showErrorMessage('The selected file is not a Profile File or Folder');
        }
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function retrieveProfiles(profileNames, selectedProfile) {
    if (selectedProfile === 'Single Local Profile') {
        let options = [];
        let files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            options.push(file.replace('.profile-meta.xml', ''));
        }
        window.showQuickPick(options, { placeHolder: "Select one Profile for Retrieve" }).then((selected) => retrieve(selected));
    } else if (selectedProfile === 'Single Profile from Org') {
        let options = [];
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Loading Profiles from Org",
            cancellable: false
        }, (listProgress, listCancel) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    options = listProfilesFromOrg();
                    resolve();
                    window.showQuickPick(options, { placeHolder: "Select one Profile for Retrieve" }).then((selected) => retrieve(selected));
                }, 100);
            });
        });
    } else if (selectedProfile === 'All Local Profiles') {
        let files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            let profileName = file.replace('.profile-meta.xml', '');
            if (!profileNames.includes(profileName))
                profileNames.push(profileName);
        }
        retrieve(profileNames)
    } else if (selectedProfile === 'All Profiles from Org') {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Loading Profiles from Org",
            cancellable: false
        }, (listProgress, listCancel) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    profileNames = listProfilesFromOrg();
                    resolve();
                    retrieve(profileNames)
                }, 100);
            });
        });
    } else {
        retrieve(profileNames)
    }
}

function listProfilesFromOrg() {
    let profileNames = [];
    let user = Config.getAuthOrg();
    let stdOut = process.execSync('sfdx force:mdapi:listmetadata --json -m Profile -u ' + user, { maxBuffer: 1024 * 500000 });
    if (stdOut) {
        let data = JSON.parse(stdOut.toString());
        console.log(data);
        for (const profile of data.result) {
            profileNames.push(profile.fullName);
        }
    }
    return profileNames;
}

function retrieve(profileNames) { 
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Retrieving Profiles from Org",
        cancellable: true
    }, (listProgress, listCancel) => {
        return new Promise(resolve => {
            setTimeout(() => {
                Processes.refreshFullProfile.run(profileNames, function () {
                    resolve();
                    window.showInformationMessage("Profiles Retrieved Succesfully");
                });
            }, 100);
        });
    });
}