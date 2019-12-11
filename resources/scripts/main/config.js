const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;


function getConfig(){
    return vscode.workspace.getConfiguration('aurahelper');
}

function getAuthOrg() { 
    return JSON.parse(FileReader.readFileSync(Paths.getSFDXFolderPath() + '/sfdx-config.json')).defaultusername;
}

function getOrgVersion() { 
    return JSON.parse(FileReader.readFileSync(vscode.workspace.rootPath + '/sfdx-project.json')).sourceApiVersion;
}

module.exports = {
    getConfig,
    getAuthOrg,
    getOrgVersion
}