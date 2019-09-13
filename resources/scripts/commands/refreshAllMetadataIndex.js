const processes = require('../processes');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const window = vscode.window;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter= fileSystem.FileWriter;

exports.run = function() {
    try {
        window.showInformationMessage('Refresh metadata index can will take several minutes. Do you want to continue?', 'Cancel', 'Ok').then((selected) => onButtonClick(selected));
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function onButtonClick(selected) {
    if (selected === 'Ok') {
        let activeOrgs;
        let activeOrgsPath = Paths.getStoredOrgsPath();
        if (!FileChecker.isExists(activeOrgsPath))
            FileWriter.createFileSync(activeOrgsPath, "[\n\n]");
        activeOrgs = JSON.parse(FileReader.readFileSync(activeOrgsPath));
        if (activeOrgs.length > 0) {
            selectOrganizationForRefresh(activeOrgs, activeOrgsPath, function (username) {
                processes.refreshObjectMetadataIndex.run(username, selected, onFinishRefresh);
            });
        }
        else {
            addNewOrgForm(function (org) {
                let added = addNewOrg(org, activeOrgs, activeOrgsPath);
                if (added) {
                    processes.refreshObjectMetadataIndex.run(org.username, onFinishRefresh);
                }
            });
        }
    }
}

function selectOrganizationForRefresh(activeOrgs, activeOrgsPath, callback) {
    let options = [];
    for (const org of activeOrgs) {
        options.push(org.name + " (" + org.username + ")");
    }
    options.push("Add new organization");
    window.showQuickPick(options).then((selected) => {
        if (selected === 'Add new organization') {
            addNewOrgForm(function (org) {
                let added = addNewOrg(org.username, activeOrgs, activeOrgsPath);
                if (added) {
                    if (callback)
                        callback.call(this, org.username);
                }
            });
        } else {
            let username = selected.substring(selected.indexOf("(") + 1, selected.indexOf(")"));
            if (callback)
                callback.call(this, username);
        }
    });
}

function onFinishRefresh(result) {
    if (result.successData) {
        window.showInformationMessage(result.successData.message + ". Total: " + result.successData.data.processed);
    } else {
        window.showErrorMessage(result.errorData.message + ". Error: " + result.errorData.data);
    }
}

function addNewOrg(org, activeOrgs, activeOrgsPath) {
    let duplicateUsername = false;
    let duplicateName = false;
    for (const activeOrg of activeOrgs) {
        if (activeOrgs.name === org.name && !duplicateName)
            duplicateName = true;
        if (activeOrg.username === org.username && !duplicateUsername)
            duplicateUsername = true;
    }
    if (duplicateUsername || duplicateName) {
        let message = "Error when adding new org for refresh metadata:";
        if (duplicateName)
            message += "\nOrg Name alredy exists";
        if (duplicateUsername)
            message += "\nOrg Username alredy exists";
        window.showErrorMessage(message);
    } else {
        activeOrgs.push(org);
        FileWriter.createFileSync(activeOrgsPath, JSON.stringify(activeOrgs, null, 2));
    }
    return !duplicateUsername && !duplicateName;
}

function addNewOrgForm(callback) {
    window.showInputBox({ placeHolder: "Type your salesforce sfdx authorized org username on SFDX" }).then(username => {
        if (username) {
            window.showInputBox({ placeHolder: "Type the Name or Alias for your org" }).then(orgName => {
                if (orgName) {
                    if (callback)
                        callback.call(this, { name: orgName, username: username });
                }
            });
        }
    });
}