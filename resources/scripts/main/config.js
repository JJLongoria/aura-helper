const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;


function getConfig() {
    return vscode.workspace.getConfiguration('aurahelper');
}

function getAuthUsername() {
    return new Promise(function (resolve) {
        let defaultUsername = JSON.parse(FileReader.readFileSync(Paths.getSFDXFolderPath() + '/sfdx-config.json')).defaultusername;
        let buffer = [];
        let bufferError = [];
        ProcessManager.listAuthOurgs(function (event, data) {
            switch (event) {
                case ProcessEvent.STD_OUT:
                    buffer = buffer.concat(data);
                    break;
                case ProcessEvent.END:
                    let listOrgsResult = JSON.parse(buffer.toString());
                    let username;
                    if (listOrgsResult.status === 0) {
                        for (const org of listOrgsResult.result) {
                            if (defaultUsername.indexOf('@') !== -1) {
                                if (org.username.toLowerCase().trim() === defaultUsername.toLowerCase().trim())
                                    username = org.username;
                            } else {
                                if (org.alias.toLowerCase().trim() === defaultUsername.toLowerCase().trim())
                                    username = org.username;
                            }
                            if (!username && (org.username.toLowerCase().trim() === defaultUsername.toLowerCase().trim() || org.alias.toLowerCase().trim() === defaultUsername.toLowerCase().trim()))
                                username = org.username;
                        }
                    }
                    resolve(username);
                    break;
                default:
                    break;
            }
        });
    });
}

function getOrgVersion() {
    if (getConfig().useCustomAPIVersion) { 
        return (getConfig().CustomAPIVersion).toString() + '.0';
    }
    return JSON.parse(FileReader.readFileSync(Paths.getWorkspaceFolder() + '/sfdx-project.json')).sourceApiVersion;
}

function getOrgNamespace(authUser) {
    return JSON.parse(FileReader.readFileSync(Paths.getWorkspaceFolder() + '/.sfdx/orgs/' + authUser + '/metadata/metadataTypes.json')).result.organizationNamespace;
}

module.exports = {
    getConfig,
    getAuthUsername,
    getOrgVersion,
    getOrgNamespace
}