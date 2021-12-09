import * as vscode from 'vscode';
import { applicationContext } from '../core/applicationContext';
import { Paths } from "../core/paths";
import { Apex } from '@aurahelper/languages';
import { FileWriter, PathUtils, FileChecker } from '@aurahelper/core';
const ApexParser = Apex.ApexParser;

export class ApexCodeWatcher {

    static startWatching(): void {
        registerApexClassesWatcher();
        registerApexTriggersWatcher();
    }

}

function registerApexClassesWatcher(): void {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.cls");
    classWatcher.onDidChange(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                if (applicationContext.parserData.userClassesData) {
                    applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                }
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            if (applicationContext.parserData.userClassesData) {
                delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            }
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidCreate(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                if (applicationContext.parserData.userClassesData) {
                    applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                }
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            if (applicationContext.parserData.userClassesData) {
                delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            }
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
        if (applicationContext.parserData.userClassesData) {
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
        }
    });
}

function registerApexTriggersWatcher(): void {
    const classWatcher = vscode.workspace.createFileSystemWatcher("**/*.trigger");
    classWatcher.onDidChange(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                if (applicationContext.parserData.userClassesData) {
                    applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                }
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            if (applicationContext.parserData.userClassesData) {
                delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            }
            if (FileChecker.isExists(Paths.getCompiledClassesFolder() + '/' + className + '.json')) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + className + '.json');
            }
        }
    });
    classWatcher.onDidCreate(async function (uri) {
        if (FileChecker.isExists(uri.fsPath)) {
            ApexParser.saveClassData(uri.fsPath, Paths.getCompiledClassesFolder(), applicationContext.parserData).then(function (apexNode: any) {
                if (applicationContext.parserData.userClassesData) {
                    applicationContext.parserData.userClassesData[apexNode.name.toLowerCase()] = apexNode;
                }
                analizeNodeErrors(apexNode);
            });
        } else {
            const fileName = PathUtils.getBasename(uri.fsPath);
            const className = fileName.substring(0, fileName.indexOf('.'));
            if (applicationContext.parserData.userClassesData) {
                delete applicationContext.parserData.userClassesData[className.toLowerCase()];
            }
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
        if (applicationContext.parserData.userClassesData) {
            delete applicationContext.parserData.userClassesData[className.toLowerCase()];
        }
    });
}

function analizeNodeErrors(_apexNode: any): void {

}