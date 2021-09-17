const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const { ApexParser } = require('@ah/languages').Apex;
const Paths = require('../core/paths');
const { FileWriter, PathUtils } = require('@ah/core').FileSystem;

class ApexCodeWatcher {

    static startWatching() {
        registerApexClassesWatcher();
        registerApexTriggersWatcher();
    }

}
module.exports = ApexCodeWatcher;

function registerApexClassesWatcher() {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.cls");
    classWatcher.onDidChange(async function (uri) {
        ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode) {
            applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
            analizeNodeErrors(apexNode);
        });
    });
    classWatcher.onDidCreate(async function (uri) {
        ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode) {
            applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
            analizeNodeErrors(apexNode);
        });
    });
    classWatcher.onDidDelete(async function (uri) {
        const fileName = PathUtils.getBasename(uri.fsPath);
        const className = fileName.substring(0, fileName.indexOf('.'));
        FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
        delete applicationContext.parserData.userClassesData[className.toLowerCase()];
    });
}

function registerApexTriggersWatcher() {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.trigger");
    classWatcher.onDidChange(async function (uri) {
        ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode) {
            applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
            analizeNodeErrors(apexNode);
        });
    });
    classWatcher.onDidCreate(async function (uri) {
        ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode) {
            applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
            analizeNodeErrors(apexNode);
        });
    });
    classWatcher.onDidDelete(async function (uri) {
        const fileName = PathUtils.getBasename(uri.fsPath);
        const className = fileName.substring(0, fileName.indexOf('.'));
        FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
        delete applicationContext.parserData.userClassesData[className.toLowerCase()];
    });
}

function analizeNodeErrors(apexNode) {

}