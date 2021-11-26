import * as vscode from 'vscode';
import applicationContext from "../core/applicationContext";
import { Paths } from "../core/paths";
const { ApexParser } = require('@aurahelper/languages').Apex;
const { FileWriter, PathUtils, FileChecker } = require('@aurahelper/core').FileSystem;

export class ApexCodeWatcher {

    static startWatching() {
        registerApexClassesWatcher();
        registerApexTriggersWatcher();
    }

}

function registerApexClassesWatcher() {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.cls");
    classWatcher.onDidChange(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidCreate(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidDelete(async function (uri) {
        const fileName = PathUtils.getBasename(uri.fsPath);
        const className = fileName.substring(0, fileName.indexOf('.'));
        if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
            FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
        }
        delete applicationContext.parserData.userClassesData[className.toLowerCase()];
    });
}

function registerApexTriggersWatcher() {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.trigger");
    classWatcher.onDidChange(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidCreate(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidDelete(async function (uri) {
        const fileName = PathUtils.getBasename(uri.fsPath);
        const className = fileName.substring(0, fileName.indexOf('.'));
        if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
            FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
        }
        delete applicationContext.parserData.userClassesData[className.toLowerCase()];
    });
}

function analizeNodeErrors(_apexNode: any) {

}