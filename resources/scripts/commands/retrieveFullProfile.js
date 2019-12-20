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
    let isPermissionSets = false;
    try {
        if (uriOrNames && uriOrNames.fsPath) {
            filePath = uriOrNames.fsPath;
            if (FileChecker.isProfile(filePath) || FileChecker.isPermissionSet(filePath)) {
                showOptions = false;
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
                isPermissionSets = FileChecker.isPermissionSet(filePath)
            } else if (FileChecker.isProfileFolder(filePath) || FileChecker.isPermissionSetFolder(filePath)) {
                let files = FileReader.readDirSync(filePath);
                for (const file of files) {
                    profileNames.push(file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
                }
                showOptions = false;
                isPermissionSets = FileChecker.isPermissionSetFolder(filePath);
            } else {
                wrongFile = true;
            }
        } else if (window.activeTextEditor) {
            filePath = window.activeTextEditor.document.uri.fsPath;
            editorOppened = true;
            if (FileChecker.isProfile(filePath) || FileChecker.isPermissionSet(filePath))
                profileNames.push(Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
            isPermissionSets = FileChecker.isPermissionSet(filePath)
        }
        if (!wrongFile) {
            if (showOptions) {
                let options = [];
                if (isPermissionSets) {
                    if (editorOppened && profileNames.length > 0) {
                        options.push("Current Permission set");
                    }
                    options.push("Single Local Permission Set");
                    options.push("Single Permission Set from Org");
                    options.push("All Local Permission Sets");
                    options.push("All Permission Sets from Org");
                } else {
                    if (editorOppened && profileNames.length > 0) {
                        options.push("Current Profile");
                    }
                    options.push("Single Local Profile");
                    options.push("Single Profile from Org");
                    options.push("All Local Profiles");
                    options.push("All Profiles from Org");
                }
                window.showQuickPick(options, { placeHolder: "Select an Options for Retrieve" }).then((selected) => retrieveProfiles(profileNames, selected, isPermissionSets));
            } else {
                retrieveProfiles(profileNames, 'Selected', isPermissionSets)
            }
        } else {
            window.showErrorMessage('The selected file is not a Profile or Permission set File or Folder');
        }
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function retrieveProfiles(profileNames, selectedProfile, isPermissionSets) {
    if (selectedProfile === 'Single Local Profile' || selectedProfile === 'Single Local Permission Set') {
        let options = [];
        let files;
        if (isPermissionSets)
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/permissionsets');
        else
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            options.push(file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', ''));
        }
        let placeHolder = (isPermissionSets) ? 'Select one Permission Set for Retrieve' : 'Select one Profile for Retrieve';
        window.showQuickPick(options, { placeHolder: placeHolder }).then((selected) => retrieve([selected], isPermissionSets));
    } else if (selectedProfile === 'Single Profile from Org' || selectedProfile === 'Single Permission Set from Org') {
        let options = [];
        window.withProgress({
            location: ProgressLocation.Notification,
            title: (isPermissionSets) ? "Loading Permission Sets from Org" : "Loading Profiles from Org",
            cancellable: false
        }, (progress, token) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    options = listProfilesFromOrg(isPermissionSets, token);
                    resolve();
                    let placeHolder = (isPermissionSets) ? 'Select one Permission Set for Retrieve' : 'Select one Profile for Retrieve';
                    window.showQuickPick(options, { placeHolder: placeHolder }).then((selected) => retrieve([selected], isPermissionSets));
                }, 100);
            });
        });
    } else if (selectedProfile === 'All Local Profiles' || selectedProfile === 'All Local Permission Sets') {
        let files;
        if (isPermissionSets)
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/permissionsets');
        else
            files = FileReader.readDirSync(Paths.getMetadataRootFolder() + '/profiles');
        for (const file of files) {
            let profileName = file.replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', '');
            if (!profileNames.includes(profileName))
                profileNames.push(profileName);
        }
        retrieve(profileNames, isPermissionSets)
    } else if (selectedProfile === 'All Profiles from Org' || selectedProfile === 'All Permission Sets from Org') {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: (isPermissionSets) ? "Loading Permission Sets from Org" : "Loading Profiles from Org",
            cancellable: false
        }, (progress, token) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    profileNames = listProfilesFromOrg(isPermissionSets, token);
                    resolve();
                    if (profileNames) {
                        retrieve(profileNames, isPermissionSets);
                    }
                }, 100);
            });
        });
    } else if(selectedProfile === 'Selected'){
        retrieve(profileNames, isPermissionSets)
    }
}

function listProfilesFromOrg(isPermissionSets, token) {
    let profileNames = [];
    let user = Config.getAuthUsername();
    let stdOut;
    let abort = false;
    if (isPermissionSets)
        stdOut = Processes.Process.describeMetadata(user, 'PermissionSet');
    else
        stdOut = Processes.Process.describeMetadata(user, 'Profile');
    token.onCancellationRequested(() => {
        abort = true;
    });
    if (!abort) {
        if (stdOut) {
            let data = JSON.parse(stdOut.toString());
            let result = (Array.isArray(data.result)) ? data.result : [data.result];
            for (const profile of result) {
                profileNames.push(profile.fullName);
            }
        }
        return profileNames;
    } else {
        return undefined;
    }
}

function retrieve(profileNames, isPermissionSets) {
    window.showQuickPick(['Yes', 'No'], { placeHolder: "Do you want to save compressed?" }).then((selected) => {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: (isPermissionSets) ? "Retrieving Permission Sets from Org" : "Retrieving Profiles from Org",
            cancellable: true
        }, (progress, token) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    Processes.refreshFullProfile.run(profileNames, isPermissionSets, selected !== 'No', function () {
                        resolve();
                        window.showInformationMessage((isPermissionSets) ? "Permission Retrieved Succesfully" : "Profiles Retrieved Succesfully");
                    }, token);
                }, 100);
            });
        });
    });
}