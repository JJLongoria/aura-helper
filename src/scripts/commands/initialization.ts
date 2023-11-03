import * as os from 'os';
import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { applicationContext } from '../core/applicationContext';
import { NotificationManager, OutputChannel } from '../output';
import { ProjectFilesWatcher } from '../watchers/projectFilesWatcher';
import { ProviderManager } from '../providers/providersManager';
import { ApexCodeWatcher } from '../watchers/apexCodeWatcher';
import { TemplateUtils } from '../utils/templateUtils';
import { Apex, System } from '@aurahelper/languages';
import { ApexClass, ApexEnum, ApexInterface, ApexNodeTypes, ApexTrigger, CoreUtils, FileChecker, FileReader, FileWriter, PathUtils, SObject } from '@aurahelper/core';
import { CLIManager } from '@aurahelper/cli-manager';
import { SFConnector } from '@aurahelper/connector';
import { GitManager } from '@aurahelper/git-manager';
import { MetadataFactory } from '@aurahelper/metadata-factory';
const ApexParser = Apex.ApexParser;
const StrUtils = CoreUtils.StrUtils;
const OSUtils = CoreUtils.OSUtils;
const Sys = System.System;
let cliManager: CLIManager;
let connection: SFConnector;

export function run() {
    const context = applicationContext.context;
    NotificationManager.showStatusBar('$(sync~spin) Loading System Data...');
    OutputChannel.outputLine('Loading System Data');
    OutputChannel.outputLine('Start loading init files');
    init(context);
}

async function init(context: vscode.ExtensionContext): Promise<void> {
    console.time('init');
    const username = Config.getOrgAlias();
    cliManager = new CLIManager(Paths.getProjectFolder(), Config.getAPIVersion(), Config.getNamespace());
    connection = new SFConnector(username, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
    connection.setMultiThread();
    createTemplateFiles(context);
    loadSnippets();
    if (username) {
        await getOrgData();
    }
    await getSystemData();
    await getGitData();
    OutputChannel.outputLine('System Data Loaded');
    await checkAuraHelperCLI();
    NotificationManager.hideStatusBar();
    if (Config.getConfig().metadata.refreshSObjectDefinitionsOnStart) {
        vscode.commands.executeCommand('aurahelper.metadata.refresh.index', true);
    } else {
        ApexCodeWatcher.startWatching();
        ProjectFilesWatcher.startWatching();
        ProviderManager.registerProviders();
    }
    console.timeEnd('init');
}

async function getGitData(): Promise<void> {
    try {
        const gitManager = new GitManager(Paths.getProjectFolder());
        applicationContext.gitData.username = await gitManager.getUserName();
        applicationContext.gitData.email = await gitManager.getUserEmail();
        applicationContext.gitData.authorName = await gitManager.getAuthorName();
        applicationContext.gitData.authorEmail = await gitManager.getAuthorEmail();
        applicationContext.gitData.committerName = await gitManager.getCommitterName();
        applicationContext.gitData.committerEmail = await gitManager.getCommitterEmail();
        const branches = await gitManager.getBranches();
        for (const branch of branches) {
            if (branch.active) {
                applicationContext.gitData.branch = branch.name;
                break;
            }
        }
        return;
    } catch (error) {
        return;
    }
}

async function getSystemData(): Promise<void> {
    OutputChannel.outputLine('Getting Apex Classes and System components data...');
    try {
        applicationContext.componentsDetail = Sys.getAuraComponentDetails();
        applicationContext.parserData.namespaceSummary = Sys.getAllNamespacesSummary();
        applicationContext.parserData.namespacesData = Sys.getAllNamespacesData();
        applicationContext.parserData.namespaces = Sys.getAllNamespaces();
        applicationContext.parserData.sObjectsData = getSObjects();
        applicationContext.parserData.sObjects = Object.keys(applicationContext.parserData.sObjectsData);
        applicationContext.parserData.userClasses = getClassNames(Paths.getProjectMetadataFolder() + '/classes');
        //cleanOldClassesDefinitions();
        //await ApexParser.saveAllClassesData(Paths.getProjectMetadataFolder() + '/classes', Paths.getCompiledClassesFolder(), applicationContext.parserData, true);
        applicationContext.parserData.userClassesData = getClassesFromCompiledClasses();
        applicationContext.parserData.userClasses = Object.keys(applicationContext.parserData.userClassesData || {});
        return;
    } catch (error) {
        return;
    }
}

function checkAuraHelperCLI(): void {
    OutputChannel.outputLine('Checking Aura Helper SFDX Plugin...');
    checkAuraHelperVersion().then(() => {
    }).catch((error) => {
        NotificationManager.showWarning(error.message);
    });
}

async function getOrgData(): Promise<void> {
    OutputChannel.outputLine('Getting Org data...');
    try {
        const authOrg = await connection.getAuthOrg();
        applicationContext.sfData.username = authOrg?.username;
        applicationContext.sfData.serverInstance = authOrg?.instanceUrl;
        const orgRecord = await connection.query<any>('Select Id, NamespacePrefix from Organization');
        if (orgRecord && orgRecord.length > 0) {
            applicationContext.sfData.namespace = orgRecord[0].NamespacePrefix;
        }
    } catch (error) {

    }
}

function createTemplateFiles(context: vscode.ExtensionContext) {
    OutputChannel.outputLine('Prepare environment');
    if (context.storagePath && !FileChecker.isExists(context.storagePath)) {
        FileWriter.createFolderSync(context.storagePath);
    }
    if (!FileChecker.isExists(Paths.getUserTemplatesFolder())) {
        FileWriter.createFolderSync(Paths.getUserTemplatesFolder());
    }
    if (!FileChecker.isExists(Paths.getMetadataIndexFolder())) {
        FileWriter.createFolderSync(Paths.getMetadataIndexFolder());
    }
    if (FileChecker.isExists(Paths.getOldApexCommentUserTemplate()) && !FileChecker.isExists(Paths.getApexCommentUserTemplate())) {
        FileWriter.createFileSync(Paths.getApexCommentUserTemplate(), adaptOldApexTemplateToNewTemplate());
    }
    if (FileChecker.isExists(Paths.getOldAuraDocUserTemplate()) && !FileChecker.isExists(Paths.getAuraDocUserTemplate())) {
        FileWriter.copyFileSync(Paths.getOldAuraDocUserTemplate(), Paths.getAuraDocUserTemplate());
    }
    if (!FileChecker.isExists(Paths.getApexCommentUserTemplate())) {
        FileWriter.copyFileSync(Paths.getApexCommentBaseTemplate(), Paths.getApexCommentUserTemplate());
    }
    if (!FileChecker.isExists(Paths.getAuraDocUserTemplate())) {
        FileWriter.copyFileSync(Paths.getAuraDocBaseTemplate(), Paths.getAuraDocUserTemplate());
    }
    applicationContext.parserData.template = TemplateUtils.getApexCommentTemplate(!Config.getConfig().documentation.useStandardJavaComments);
    OutputChannel.outputLine('Environment prepared');
}

function adaptOldApexTemplateToNewTemplate(): string {
    const newTemplate = JSON.parse(FileReader.readFileSync(Paths.getApexCommentBaseTemplate()));
    const template = JSON.parse(FileReader.readFileSync(Paths.getOldApexCommentUserTemplate()));
    if (template.methodComment) {
        if (template.methodComment.commentBody) {
            newTemplate.comments.method.template = [];
            newTemplate.comments.constructor.template = [];
            for (const line of template.methodComment.commentBody) {
                let lineContent = StrUtils.replace(line, '{!method.params}', '{!tag.param}');
                lineContent = StrUtils.replace(lineContent, '{!method.return}', '{!tag.return}');
                lineContent = StrUtils.replace(lineContent, '{!method.description}', '{!description}');
                newTemplate.comments.method.template.push(lineContent);
                newTemplate.comments.constructor.template.push(lineContent);
            }
        }
    }
    if (template.classComment) {
        if (template.classComment.commentBody) {
            newTemplate.comments.class.template = [];
            for (const line of template.classComment.commentBody) {
                let lineContent = StrUtils.replace(line, '{!class.description}', '{!description}');
                newTemplate.comments.class.template.push(lineContent);
            }
        }
    }
    return JSON.stringify(newTemplate, null, 2);
}

async function checkAuraHelperVersion(): Promise<void> {
    try {
        cliManager.useAuraHelperSF();
        const isAhSFInstalled = await cliManager.isAuraHelperCLIInstalled();
        if (isAhSFInstalled) {
            const version = await cliManager.getAuraHelperCLIVersion();
            const versionSplits = version.split('.');
            const requiredVersionSplits = applicationContext.MIN_AH_SF_VERSION.split('.');
            const majorVersion = parseInt(versionSplits[0]);
            const minorVersion = parseInt(versionSplits[1]);
            const patchVersion = parseInt(versionSplits[2]);
            const requiredMajorVersion = parseInt(requiredVersionSplits[0]);
            const requiredMinorVersion = parseInt(requiredVersionSplits[1]);
            const requiredPatchVersion = parseInt(requiredVersionSplits[2]);
            applicationContext.ahSFPluginInstalled = true;
            if (majorVersion < requiredMajorVersion) {
                showDialogsForAuraHelpeSF();
            } else if (majorVersion === requiredMajorVersion && minorVersion < requiredMinorVersion) {
                showDialogsForAuraHelpeSF();
            } else if (majorVersion === requiredMajorVersion && minorVersion === requiredMinorVersion && patchVersion < requiredPatchVersion) {
                showDialogsForAuraHelpeSF();
            }
        } else {
            cliManager.useAuraHelperSFDX();
            const isAhSFDXInstalled = await cliManager.isAuraHelperCLIInstalled();
            if (isAhSFDXInstalled) {
                const version = await cliManager.getAuraHelperCLIVersion();
                const versionSplits = version.split('.');
                const requiredVersionSplits = applicationContext.MIN_AH_SFDX_VERSION.split('.');
                const majorVersion = parseInt(versionSplits[0]);
                const minorVersion = parseInt(versionSplits[1]);
                const patchVersion = parseInt(versionSplits[2]);
                const requiredMajorVersion = parseInt(requiredVersionSplits[0]);
                const requiredMinorVersion = parseInt(requiredVersionSplits[1]);
                const requiredPatchVersion = parseInt(requiredVersionSplits[2]);
                applicationContext.ahSFDXPluginInstalled = true;
                if (majorVersion < requiredMajorVersion) {
                    showDialogsForAuraHelpeSFDX();
                } else if (majorVersion === requiredMajorVersion && minorVersion < requiredMinorVersion) {
                    showDialogsForAuraHelpeSFDX();
                } else if (majorVersion === requiredMajorVersion && minorVersion === requiredMinorVersion && patchVersion < requiredPatchVersion) {
                    showDialogsForAuraHelpeSFDX();
                }
            } else {
                showDialogsForAuraHelpeSF();
            }
        }
        return;
    } catch (error) {
        showDialogsForAuraHelpeSF();
    }
}

function showDialogsForAuraHelpeSF(): void {
    const message = 'Aura Helper SF Plugin is not installed or has older version. To a correct work of Aura Helper Extension, you must update the Aura Helper SF Plugin. Press Install to update now or Cancel to update later';
    OutputChannel.outputLine(message + '\nTo update Aura Helper SF Manually, execute the next command "sf plugins install aura-helper-sf"', true);
    NotificationManager.showWarning(message, () => {
        NotificationManager.showStatusBar('$(sync~spin) Updating Aura Helper SF...');
        createWhilelistPlugin();
        cliManager.updateAuraHelperCLI().then(() => {
            NotificationManager.hideStatusBar();
            NotificationManager.showInfo('Aura Helper SF Plugin Updated. Enjoy it!');
        }).catch((error) => {
            NotificationManager.hideStatusBar();
            if (StrUtils.contains(error, 'aura-helper-sf... installed')) {
                NotificationManager.showInfo('Aura Helper SF Plugin Updated. Enjoy it!');
            } else {
                const errorMessage = 'An Error ocurred while updating Aura Helper SF. You can update manually with command "sf plugins install aura-helper-sf".';
                OutputChannel.outputLine(message + '\nError: ' + error, true);
                NotificationManager.showError(errorMessage);
            }
        });
    }, () => {
        NotificationManager.showWarning("You may experience errors with Aura Helper until you update Aura Helper SF Plugin.");
    }, 'Install');
}

function showDialogsForAuraHelpeSFDX(): void {
    const message = 'Warning! Aura Helper SFDX Plugin is DEPRECATED. To a correct work of Aura Helper Extension, you must install Aura Helper SF Plugin. ¿Do you want to install now?. Press Install to install now or Cancel to install later';
    OutputChannel.outputLine(message + '\nTo install Aura Helper SF Plugin Manually, execute the next command "sf plugins install aura-helper-sf"', true);
    OutputChannel.outputLine("All Aura Helper SFDX tools are moved to the new Aura Helper SF Plugin.", true);
    OutputChannel.outputLine("At the moment, Aura Helper maintenance compatibility with Aura Helper SFDX, but you must install Aura Helper SF Plugin to maintenance compatibility on future.", true);
    OutputChannel.outputLine("To learn more about Aura Helper SF Plugin, visit https://github.com/JJLongoria/aura-helper-sf.", true);
    NotificationManager.showWarning(message, () => {
        NotificationManager.showStatusBar('$(sync~spin) Updating Aura Helper SF...');
        createWhilelistPlugin();
        cliManager.updateAuraHelperCLI().then(() => {
            NotificationManager.hideStatusBar();
            NotificationManager.showInfo('Aura Helper SF Plugin Updated. Enjoy it!');
        }).catch((error) => {
            NotificationManager.hideStatusBar();
            if (StrUtils.contains(error, 'aura-helper-sf... installed')) {
                NotificationManager.showInfo('Aura Helper SF Plugin Updated. Enjoy it!');
            } else {
                const errorMessage = 'An Error ocurred while updating Aura Helper SF. You can update manually with command "sf plugins install aura-helper-sf".';
                OutputChannel.outputLine(message + '\nError: ' + error, true);
                NotificationManager.showError(errorMessage);
            }
        });
    }, () => {
        NotificationManager.showWarning("You may experience errors with Aura Helper until you update Aura Helper SF Plugin.");
    }, 'Install');
}

function cleanOldClassesDefinitions() {
    let classes = {};
    if (FileChecker.isExists(Paths.getCompiledClassesFolder())) {
        let files = FileReader.readDirSync(Paths.getCompiledClassesFolder());
        for (const file of files) {
            try {
                const apexNode = JSON.parse(FileReader.readFileSync(Paths.getCompiledClassesFolder() + '/' + file));
                if (!Object.keys(apexNode).includes('nodeType')) {
                    FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + file);
                }
            } catch (error) {
                FileWriter.delete(Paths.getCompiledClassesFolder() + '/' + file);
            }
        }
    }
    return classes;
}

function getClassesFromCompiledClasses() {
    const classes: any = {};
    if (FileChecker.isExists(Paths.getCompiledClassesFolder())) {
        const files = FileReader.readDirSync(Paths.getCompiledClassesFolder());
        for (const file of files) {
            const apexNode = JSON.parse(FileReader.readFileSync(Paths.getCompiledClassesFolder() + '/' + file));
            if (apexNode.nodeType === ApexNodeTypes.CLASS) {
                classes[apexNode.name.toLowerCase()] = new ApexClass(apexNode);
            } else if (ApexNodeTypes.INTERFACE) {
                classes[apexNode.name.toLowerCase()] = new ApexInterface(apexNode);
            } else if (ApexNodeTypes.ENUM) {
                classes[apexNode.name.toLowerCase()] = new ApexEnum(apexNode);
            } else if (ApexNodeTypes.TRIGGER) {
                classes[apexNode.name.toLowerCase()] = new ApexTrigger(apexNode);
            }
        }
    }
    return classes;
}

function getSObjects() {
    let sObjects: any = {};
    const sObjectsFolder = Paths.getProjectMetadataFolder() + '/objects';
    const objFolders = FileChecker.isExists(sObjectsFolder) ? FileReader.readDirSync(sObjectsFolder) : [];
    const indexObjFiles = FileChecker.isExists(Paths.getMetadataIndexFolder()) ? FileReader.readDirSync(Paths.getMetadataIndexFolder()) : [];
    const sfdxObjFiles = (FileChecker.isExists(Paths.getSFDXCustomSObjectsFolder()) && FileChecker.isExists(Paths.getSFDXStandardSObjectsFolder())) ? FileReader.readDirSync(Paths.getSFDXCustomSObjectsFolder()).concat(FileReader.readDirSync(Paths.getSFDXStandardSObjectsFolder())) : [];
    try {
        const namespace = Config.getNamespace();
        if (indexObjFiles.length > 0) {
            for (const fileName of indexObjFiles) {
                if (!fileName.endsWith('.json')) {
                    FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                    continue;
                }
                let obj = JSON.parse(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                if (!Object.keys(obj).includes('description')) {
                    FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                    continue;
                } else {
                    if (obj.fields) {
                        let deleted = false;
                        for (const fieldKey of Object.keys(obj.fields)) {
                            const field = obj.fields[fieldKey];
                            if (!Object.keys(field).includes('inlineHelpText')) {
                                FileWriter.delete(FileReader.readFileSync(Paths.getMetadataIndexFolder() + '/' + fileName));
                                deleted = true;
                                break;
                            }
                        }
                        if (deleted) {
                            continue;
                        }
                    }
                }
                const sObj = new SObject(obj);
                sObj.addSystemFields();
                sObj.fixFieldTypes();
                const objKey = sObj.name.toLowerCase();
                sObjects[objKey] = sObj;
            }
            if (objFolders.length > 0) {
                let sObjectsTmp = MetadataFactory.createSObjectsFromFileSystem(sObjectsFolder);
                for (const objKey of Object.keys(sObjectsTmp)) {
                    const sObj = sObjectsTmp[objKey];
                    if (!sObjects[sObj.name.toLowerCase()]) {
                        sObjects[sObj.name.toLowerCase()] = sObj;
                        FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + sObj.name + '.json', JSON.stringify(sObj, null, 2));
                    } else {
                        const objOnIndex = sObjects[sObj.name.toLowerCase()];
                        for (const fieldKey of Object.keys(sObj.fields)) {
                            const field = sObj.fields[fieldKey];
                            if (!objOnIndex.fields[fieldKey]) {
                                sObjects[sObj.name.toLowerCase()].fields[fieldKey] = field;
                            }
                        }
                    }
                }
            }
        } else if (objFolders.length > 0) {
            sObjects = MetadataFactory.createSObjectsFromFileSystem(sObjectsFolder);
            for (const objKey of Object.keys(sObjects)) {
                const sObj = sObjects[objKey];
                sObj.addSystemFields();
                sObj.fixFieldTypes();
                FileWriter.createFileSync(Paths.getMetadataIndexFolder() + '/' + sObj.name + '.json', JSON.stringify(sObj, null, 2));
            }
        } else if (sfdxObjFiles.length > 0) {
            for (const fileName of sfdxObjFiles) {
                const objName = fileName.substring(0, fileName.indexOf('.'));
                const sObj = new SObject(objName);
                sObj.addSystemFields();
                sObj.fixFieldTypes();
                sObjects[objName.toLowerCase()] = sObj;
            }
        }
        if (namespace) {
            for (const objKey of Object.keys(sObjects)) {
                if (StrUtils.contains(objKey, '__')) {
                    const objSplits = objKey.split('__');
                    const nsObjKey = namespace + '__' + objKey;
                    if (sObjects[objKey] && !sObjects[nsObjKey] && objSplits.length < 3) {
                        const obj = sObjects[objKey];
                        delete sObjects[objKey];
                        obj.name = namespace + '__' + obj.name;
                        for (const fieldKey of Object.keys(obj.fields)) {
                            const fieldSplits = fieldKey.split('__');
                            const nsFieldKey = namespace + '__' + fieldKey;
                            if (StrUtils.contains(fieldKey, '__')) {
                                if (obj.fields[fieldKey] && !obj.fields[nsFieldKey] && fieldSplits.length < 3) {
                                    const field = obj.fields[fieldKey];
                                    delete obj.fields[fieldKey];
                                    field.name = namespace + '__' + field.name;
                                    obj.fields[nsFieldKey] = field;
                                }
                            }
                        }
                        sObjects[nsObjKey] = obj;
                    }
                } else {
                    for (const fieldKey of Object.keys(sObjects[objKey].fields)) {
                        const fieldSplits = fieldKey.split('__');
                        const nsFieldKey = namespace + '__' + fieldKey;
                        if (StrUtils.contains(fieldKey, '__')) {
                            if (sObjects[objKey].fields[fieldKey] && !sObjects[objKey].fields[nsFieldKey] && fieldSplits.length < 3) {
                                const field = sObjects[objKey].fields[fieldKey];
                                delete sObjects[objKey].fields[fieldKey];
                                field.name = namespace + '__' + field.name;
                                sObjects[objKey].fields[nsFieldKey] = field;
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    return sObjects;
}

function getClassNames(classesPath: string): string[] {
    const names = [];
    for (const file of FileReader.readDirSync(classesPath, { onlyFiles: true, extensions: ['.cls'] })) {
        names.push(PathUtils.getBasename(file, '.cls'));
    }
    return names;
}

function loadSnippets(): any {
    OutputChannel.outputLine('Loading Snippets');
    const auraSnippets: any = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
    const jsSnippets: any = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
    const sldsSnippets: any = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));
    const lwcSnippets: any = JSON.parse(FileReader.readFileSync(Paths.getLWCSnippetsPath()));
    const auraActivations: any = {};
    const jsActivations: any = {};
    const sldsActivations: any = {};
    const lwcActivations: any = {};
    Object.keys(auraSnippets).forEach(function (key) {
        let obj = auraSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!auraActivations[activation]) {
                auraActivations[activation] = [];
            }
            auraActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!auraActivations[activation]) {
                auraActivations[activation] = [];
            }
            auraActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    Object.keys(jsSnippets).forEach(function (key) {
        let obj = jsSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!jsActivations[activation]) {
                jsActivations[activation] = [];
            }
            jsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!jsActivations[activation]) {
                jsActivations[activation] = [];
            }
            jsActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    Object.keys(sldsSnippets).forEach(function (key) {
        let obj = sldsSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!sldsActivations[activation]) {
                sldsActivations[activation] = [];
            }
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!sldsActivations[activation]) {
                sldsActivations[activation] = [];
            }
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    Object.keys(lwcSnippets).forEach(function (key) {
        let obj = lwcSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!lwcActivations[activation]) {
                lwcActivations[activation] = [];
            }
            lwcActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!lwcActivations[activation]) {
                lwcActivations[activation] = [];
            }
            lwcActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    applicationContext.snippets.aura = auraActivations;
    applicationContext.snippets.javascript = jsActivations;
    applicationContext.snippets.slds = sldsActivations;
    applicationContext.snippets.lwc = lwcActivations;
    /*if (!FileChecker.isExists(Paths.getImagesPath() + '/markdown'))
        FileWriter.createFolderSync(Paths.getImagesPath() + '/markdown');
    FileWriter.createFileSync(Paths.getImagesPath() + '/markdown/aura.md', createSnippetsMarkdown(auraActivations));
    FileWriter.createFileSync(Paths.getImagesPath() + '/markdown/js.md', createSnippetsMarkdown(jsActivations));
    FileWriter.createFileSync(Paths.getImagesPath() + '/markdown/slds.md', createSnippetsMarkdown(sldsActivations));*/
    console.log("Total Snippets: " + (Object.keys(auraSnippets).length + Object.keys(jsSnippets).length + Object.keys(sldsSnippets).length + Object.keys(lwcSnippets).length));
    OutputChannel.outputLine('Snippets Loaded');
}

function createWhilelistPlugin() {
    let folderPath = (OSUtils.isWindows()) ? os.homedir() + '/AppData/Local/sfdx' : os.homedir() + '/.config/sfdx';
    const filePath = folderPath + '/unsignedPluginWhiteList.json';
    if (!FileChecker.isExists(folderPath)) {
        if ((OSUtils.isWindows())) {
            folderPath = os.homedir() + '/.config/sfdx';
        }
    }
    if (FileChecker.isExists(folderPath)) {
        const pulginName = 'aura-helper-sfdx';
        if (!FileChecker.isExists(filePath)) {
            FileWriter.createFileSync(filePath, JSON.stringify([pulginName], null, 4));
        } else {
            let content = JSON.parse(FileReader.readFileSync(filePath)) as string[];
            if (content && !content.includes(pulginName)) {
                content.push(pulginName);
            } else if (!content) {
                content = [pulginName];
            }
            FileWriter.createFileSync(filePath, JSON.stringify(content, null, 4));
        }
    }
}


/*
function createSnippetsMarkdown(snippets) {
    let text = '';
    for (const snippetNS of Object.keys(snippets)) {
        if (snippets[snippetNS] && Array.isArray(snippets[snippetNS])) {
            text += '## [**' + getNamespaceName(snippetNS) + '**](#' + snippetNS + '-snippets)\n\n';
            let index = 0;
            for (const snippet of snippets[snippetNS]) {
                text += '### [**' + snippet.name + '**](#' + snippetNS + '-' + index + ')\n\n';
                text += snippet.description + '\n\n';
                text += '- **Activation**: **`' + snippet.prefix + '`**\n\n';
                if (snippet.alt)
                    text += '- **Alternative Activation**: **`' + snippet.alt + '`**\n\n';
                text += '#### **Snippet**\n\n';
                text += '\t' + snippet.body.join('\n\t') + '\n\n';
                index++;
            }
            text += '\n\n';
        }
    }
    return text;
}

function getSnippetNS(snippet) {
    if (typeof snippet.prefix === "string") {
        let prefixSplit = snippet.prefix.split('.');
        return prefixSplit[0];
    }
    else {
        let prefixSplit = snippet.prefix[0].split('.');
        return prefixSplit[0];
    }
}

function getNamespaceName(ns) {
    if (ns === 'ltn')
        return 'Lightning';
    if (ns === 'aura')
        return 'Aura';
    if (ns === 'ltng')
        return 'Ltng';
    if (ns === 'force')
        return 'Force';
    if (ns === 'forceChatter')
        return 'Force Chatter';
    if (ns === 'forceCommunity')
        return 'Force Community';
    if (ns === 'ltnCommunity')
        return 'Lightning Community';
    if (ns === 'ltnSnapin')
        return 'Lightning Snapin';
    if (ns === 'ui')
        return 'UI';
    if (ns === 'slds')
        return 'SLDS';
    return ns;
}
*/
/*
function repairSystemClasses(context, ns, className) {
    let classPath;
    let nsPath;
    if (className)
        classPath = context.asAbsolutePath("./resources/assets/apex/classes/" + ns + "/" + className + '.json');
    else
        nsPath = context.asAbsolutePath("./resources/assets/apex/classes/" + ns);
    if (classPath && FileChecker.isExists(classPath)) {
        let classStructure = JSON.parse(FileReader.readFileSync(classPath));
        let docLink = classStructure.docLink;
        if (docLink.indexOf('#') !== -1) {
            docLink = docLink.split('#')[0];
        }
        let newLink = docLink
        docLink = docLink.replace('atlas.en-us.apexcode.meta', 'get_document_content') + '/en-us/222.0';
        makeHTTPRequest(docLink, classStructure.isInterface, function (data, isInterface) {
            if (data) {
                let dataJSON = JSON.parse(data);
                let content = dataJSON.content;
                let fileStructure = getClassStructure(content, className, ns, isInterface, newLink);
                if (!FileChecker.isExists(context.asAbsolutePath("./resources/assets/apex/classes/" + ns)))
                    FileWriter.createFolderSync(context.asAbsolutePath("./resources/assets/apex/classes/" + ns));
                FileWriter.createFileSync(context.asAbsolutePath("./resources/assets/apex/classes/" + ns) + '/' + className + '.json', JSON.stringify(fileStructure, null, 2));
            }
        });
    } else if (nsPath && FileChecker.isExists(nsPath)) {
        let classes = FileReader.readDirSync(nsPath);
        for (const fileName of classes) {
            if (fileName !== 'namespaceMetadata.json') {
                let clsPath = context.asAbsolutePath("./resources/assets/apex/classes/" + ns + "/" + fileName);
                let classStructure = JSON.parse(FileReader.readFileSync(clsPath));
                let docLink = classStructure.docLink;
                if (docLink.indexOf('#') !== -1) {
                    docLink = docLink.split('#')[0];
                }
                let newLink = docLink
                docLink = docLink.replace('atlas.en-us.apexcode.meta', 'get_document_content') + '/en-us/222.0';
                makeHTTPRequest(docLink, classStructure.isInterface, function (data, isInterface) {
                    if (data) {
                        let dataJSON = JSON.parse(data);
                        let content = dataJSON.content;
                        let fileStructure = getClassStructure(content, fileName.replace('.json', ''), ns, isInterface, newLink);
                        if (!FileChecker.isExists(context.asAbsolutePath("./resources/assets/apex/classes/" + ns)))
                            FileWriter.createFolderSync(context.asAbsolutePath("./resources/assets/apex/classes/" + ns));
                        FileWriter.createFileSync(clsPath, JSON.stringify(fileStructure, null, 2));
                    }
                });
            }
        }
    }
}

async function makeHTTPRequest(endpoint, isInterface, callback) {
    https.get(endpoint, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            callback.call(this, data, isInterface);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function getClassStructure(content, name, ns, isInterface, link) {
    let isOnMethod;
    let isOnDesc;
    let isOnParams;
    let isOnReturn;
    let isOnSignature;
    let isOnClassDesc;
    let isOnParamDesc;
    let methods = [];
    let constructors = [];
    let properties = [];
    let enumValues = [];
    let methodName = "";
    let methodSignature = "";
    let methodParams = [];
    let description = "";
    let classDesc = "";
    let returnType = 'void';
    let paramName;
    let paramType;
    let paramDesc = "";
    let onConstructors;
    let onProperties;
    let onMethods;
    let isEnum = false;
    let onEnum;
    let lines = content.split('\n');
    let index = 0;
    for (const line of lines) {
        if (line.indexOf('<h2 class="helpHead2">Enum Values</h2>') !== -1 || line.indexOf('Type Field Value</th>') !== -1) {
            onEnum = true;
            isEnum = true;
        } else if (onEnum && line.indexOf('<samp class="codeph apex_code">') !== -1) {
            enumValues.push(line.replace(new RegExp('<[^>]+>', 'g'), "").trim());
        } else if (onEnum && line.indexOf('</tbody>') !== -1) {
            onEnum = false;
        } else if (line.indexOf('</a>' + name + ' Constructors</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Constructors</span></h2>') !== -1) || line.indexOf('</a>' + name + ' Constructor</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Constructor</span></h2>') !== -1)) {
            onConstructors = true;
            onProperties = false;
            onMethods = false;
        } else if (line.indexOf('</a>' + name + ' Properties</span></h2>') !== -1 || line.indexOf('</a>Dynamic ' + name + ' Properties</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Properties</span></h2>') !== -1)) {
            if (methodName) {
                isOnParams = false;
                if (onProperties) {
                    properties.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                else if (onMethods) {
                    methods.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                } else if (onConstructors) {
                    constructors.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                methodName = "";
                methodSignature = "";
                description = "";
                methodParams = [];
            }
            onConstructors = false;
            onProperties = true;
            onMethods = false;
        } else if (line.indexOf('</a>' + name + ' Methods</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Methods</span></h2>') !== -1) || line.indexOf('</a>' + name + ' Method</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Method</span></h2>') !== -1) || line.indexOf('</a>' + name + ' Instance Methods</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Instance Methods</span></h2>') !== -1) || line.indexOf('</a>' + name + ' Instance Method</span></h2>') !== -1 || (index + 1 < lines.length - 1 && (line.trim() + " " + lines[index + 1].trim()).indexOf('</a>' + name + ' Instance Method</span></h2>') !== -1)) {
            if (methodName) {
                isOnParams = false;
                if (onProperties) {
                    properties.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                else if (onMethods) {
                    methods.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                } else if (onConstructors) {
                    constructors.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        params: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                methodName = "";
                methodSignature = "";
                description = "";
                methodParams = [];
            }
            onConstructors = false;
            onProperties = false;
            onMethods = true;
        }
        if (line.indexOf('<div class="shortdesc">') !== -1 && !classDesc && !isOnClassDesc) {
            isOnClassDesc = true;
            classDesc = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            if (line.indexOf('</div>') !== -1)
                isOnClassDesc = false;
        } else if (isOnClassDesc && line.indexOf('</div>') !== -1) {
            classDesc += " " + line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            isOnClassDesc = false;
        } else if (isOnClassDesc) {
            classDesc += " " + line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            if (line.indexOf('</div>') !== -1)
                isOnClassDesc = false;
        }
        if (onConstructors || onMethods || onProperties) {
            if (line.indexOf('<div class="topic reference nested2"') !== -1) {
                isOnMethod = true;
                isOnReturn = false;
                if (methodName) {
                    isOnParams = false;
                    if (onProperties) {
                        properties.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    else if (onMethods) {
                        methods.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    } else if (onConstructors) {
                        constructors.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    methodName = "";
                    methodSignature = "";
                    description = "";
                    methodParams = [];
                }
            } else if (isOnMethod) {
                if (line.indexOf('<!-- --></a><span class="titlecodeph">') !== -1) {
                    returnType = 'void';
                    methodName = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                    methodName = methodName.split("(")[0].trim();
                } else if (line.indexOf('<div class="shortdesc">') !== -1) {
                    isOnReturn = false;
                    isOnParams = false;
                    isOnDesc = true;
                    if (line.indexOf("</div>") !== -1)
                        isOnDesc = false;
                    description = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                    description = description.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                } else if (isOnDesc) {
                    isOnReturn = false;
                    isOnParams = false;
                    if (line.indexOf("</div>") !== -1)
                        isOnDesc = false;
                    description += " " + line.replace(new RegExp('<[^>]+>', 'g'), "").replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                } else if (line.indexOf('<h4 class="helpHead4">Signature</h4>') !== -1) {
                    isOnSignature = true;
                    isOnReturn = false;
                    isOnParams = false;
                } else if (isOnSignature) {
                    methodSignature += ' ' + line.replace(new RegExp('<[^>]+>', 'g'), "").replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                    if (line.indexOf('</p>') !== -1)
                        isOnSignature = false;
                } else if (isOnSignature && line.indexOf('</p>') !== -1) {
                    isOnSignature = false;
                } else if (line.indexOf('<h4 class="helpHead4">Parameters</h4>') !== -1) {
                    isOnParams = true;
                    isOnReturn = false;
                } else if (isOnParams && line.indexOf('</dl>') !== -1) {
                    isOnParams = false;
                    if (paramName && paramName.length) {
                        methodParams.push({
                            name: paramName.trim(),
                            datatype: paramType.trim(),
                            description: paramDesc.trim()
                        });
                    }
                    paramName = "";
                    paramType = "";
                    paramDesc = "";
                } else if (line.indexOf('Return Value') !== -1 && !isOnReturn) {
                    isOnReturn = true;
                } else if (line.indexOf('<p class="p">Type: ') !== -1 && isOnReturn) {
                    returnType = line.replace(new RegExp('<[^>]+>', 'g'), "").replace(new RegExp('Type:', 'g'), "").trim();
                    returnType = returnType.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                    isOnMethod = false;
                    if (onProperties) {
                        properties.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    else if (onMethods) {
                        methods.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    } else if (onConstructors) {
                        constructors.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            params: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    methodSignature = "";
                    description = "";
                    methodName = "";
                    methodParams = [];
                    isOnReturn = false;
                } else if (isOnParams) {
                    if (line.indexOf('<dt class="dt dlterm">') !== -1) {
                        paramName = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                    } else if (line.indexOf('<dd class="dd">Type:') !== -1) {
                        paramType = line.replace(new RegExp('<[^>]+>', 'g'), "").replace(new RegExp('Type:', 'g'), "").trim();
                        paramType = paramType.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                        isOnReturn = false;
                    } else if (line.indexOf('<dd class="dd">') !== -1 && !isOnParamDesc) {
                        isOnParamDesc = true;
                        paramDesc += " " + line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                        if (line.indexOf('</dd>') !== -1)
                            isOnParamDesc = false;
                    } else if (isOnParamDesc) {
                        paramDesc += " " + line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                        if (line.indexOf('</dd>') !== -1)
                            isOnParamDesc = false;
                    } else if (line.indexOf('</dd>') !== -1 && isOnParamDesc) {
                        isOnParamDesc = false;
                        if (paramName && paramName.length) {
                            methodParams.push({
                                name: paramName.trim(),
                                datatype: paramType.trim(),
                                description: paramDesc.trim()
                            });
                        }
                        paramName = "";
                        paramType = "";
                        paramDesc = "";
                    }
                }
            }
        }
        index++;
    }
    return {
        name: name,
        namespace: ns,
        accessModifier: "global",
        definitionModifier: "",
        withSharing: false,
        inheritedSharing: false,
        isEnum: isEnum,
        enumValues: enumValues,
        extendsType: "",
        isInterface: isInterface,
        implements: [],
        classes: {},
        enums: {},
        fields: properties,
        constructors: constructors,
        methods: methods,
        description: classDesc.trim(),
        docLink: link
    }
}

function saveConnectApiClass(className, parent, url) {
    let content = FileReader.readFileSync(Paths.getAbsolutePath('./resources/tmp.txt'));
    let classResult = createClassStructureForConnectApi(content, className, parent, url);
    if (!FileChecker.isExists(Paths.getAbsolutePath("./resources/assets/apex/classes/connectapi")))
        FileWriter.createFolderSync(Paths.getAbsolutePath("./resources/assets/apex/classes/connectapi"));
    FileWriter.createFileSync(Paths.getAbsolutePath("./resources/assets/apex/classes/connectapi") + '/' + className + '.json', JSON.stringify(classResult, null, 2));
}

function saveConnectApiEnums(url) {
    let content = FileReader.readFileSync(Paths.getAbsolutePath('./resources/tmp.txt'));
    let lines = content.split('\n');
    let enumsToCreate = [];
    let enumName;
    let onDesc = false;
    let enumDesc = '';
    let onEnumValue = false;
    let enumLiValue = '';
    let enumValues = [];
    for (const line of lines) {
        if (line.indexOf('data-title="Enum"') !== -1) {
            enumName = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            enumName = enumName.substring(enumName.indexOf('.') + 1);
        } else if (enumName && !onDesc && line.indexOf('data-title="Description"') !== -1) {
            onDesc = true;
            enumDesc = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
        } else if (onDesc && line.indexOf('</ul>') === -1) {
            if (!onEnumValue && line.indexOf('<li class="li">') !== -1) {
                onEnumValue = true;
                enumLiValue += line;
                if (line.indexOf('</li>') !== -1) {
                    onEnumValue = false;
                    let enumValue = enumLiValue.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                    //enumValue = enumValue.replace(new RegExp(/\r\s/, 'g'), " ");
                    if (enumValue.indexOf('—') !== -1)
                        enumValue = enumValue.substring(0, enumValue.indexOf('—'));
                    enumValues.push(enumValue);
                    enumLiValue = '';
                }
            } else if (onEnumValue && line.indexOf('</li>') !== -1) {
                onEnumValue = false;
                enumLiValue += line;
                let enumValue = enumLiValue.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                enumValue = enumValue.replace(new RegExp(/\r\s/, 'g'), " ");
                if (enumValue.indexOf('—') !== -1)
                    enumValue = enumValue.substring(0, enumValue.indexOf('—'));
                enumValues.push(enumValue);
                enumLiValue = '';
            } else if (onEnumValue) {
                enumLiValue += line;
            }
        } else if (onDesc && line.indexOf('</ul>') !== -1) {
            onDesc = false;
            enumsToCreate.push({
                name: enumName,
                description: enumDesc,
                enumValues: enumValues
            });
            enumValues = [];
            enumName = undefined;
            enumDesc = '';
        }
    }
    for (const enumToCreate of enumsToCreate) {
        let enumToFile = {
            name: enumToCreate.name,
            namespace: 'ConnectApi',
            accessModifier: "global",
            definitionModifier: "",
            withSharing: false,
            inheritedSharing: false,
            isEnum: true,
            enumValues: enumToCreate.enumValues,
            extendsType: '',
            isInterface: false,
            implements: [],
            classes: {},
            enums: {},
            fields: [],
            constructors: [],
            methods: [],
            description: enumToCreate.description,
            docLink: url
        };
        FileWriter.createFileSync(Paths.getAbsolutePath("./resources/assets/apex/classes/connectapi") + '/' + enumToCreate.name + '.json', JSON.stringify(enumToFile, null, 2));
    }
}

function createClassStructureForConnectApi(content, className, parent, url) {
    let classDesc = '';
    let onDesc = false;
    let onParamDesc = false;
    let properties = [];
    let lines = content.split('\n');
    let index = 0;
    let onType = false;
    let propertyName;
    let propertyDesc = '';
    let propertyDatatype = '';
    for (const line of lines) {
        if (!onDesc && line.indexOf('<div class="shortdesc">') !== -1) {
            onDesc = true;
            classDesc += line;
        } else if (onDesc && (line.indexOf('<div class="section">') !== -1 || line.indexOf('<div class="data colSort">') !== -1)) {
            onDesc = false;
            classDesc = classDesc.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            classDesc = classDesc.replace(new RegExp(/\r\s/, 'g'), " ");
        } else if (onDesc) {
            classDesc += line;
        } else if (!onParamDesc && (line.indexOf('data-title="Property"') !== -1 || line.indexOf('data-title="Argument"') !== -1 || line.indexOf('data-title="Name"') !== -1 || line.indexOf('data-title="Property Name"') !== -1)) {
            propertyName = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            propertyName = propertyName.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
        } else if (!onType && propertyName && line.indexOf('data-title="Type"') !== -1) {
            onType = true;
            propertyDatatype += line;
            if (line.indexOf('</td>') !== -1) {
                onType = false;
                propertyDatatype = propertyDatatype.replace(new RegExp('<[^>]+>', 'g'), "").trim();
                propertyDatatype = propertyDatatype.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
            }
        } else if (onType && propertyName && line.indexOf('</td>') !== -1) {
            onType = false;
            propertyDatatype += line;
            propertyDatatype = propertyDatatype.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            propertyDatatype = propertyDatatype.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
        } else if (onType) {
            propertyDatatype += line;
        } else if (!onParamDesc && line.indexOf('data-title="Description"') !== -1) {
            onParamDesc = true;
            propertyDesc += line;
        } else if (onParamDesc && (line.indexOf('data-title="Property"') !== -1 || line.indexOf('data-title="Argument"' || line.indexOf('data-title="Name"') !== -1 || line.indexOf('data-title="Property Name"') !== -1) || line.indexOf('data-title="Required or Optional"') !== -1 || line.indexOf(' data-title="Available Version"') !== -1 || line.indexOf(' data-title="version"') !== -1)) {
            onParamDesc = false;
            propertyDesc = propertyDesc.replace(new RegExp('<[^>]+>', 'g'), "").trim();
            propertyDesc = propertyDesc.replace(new RegExp(/\r\s/, 'g'), " ");
            propertyDesc = propertyDesc.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
            //propertyDesc = propertyDesc.substring(0, propertyDesc.indexOf('.') + 1);
            properties.push({
                name: propertyName,
                description: propertyDesc,
                datatype: propertyDatatype,
                signature: 'public ' + propertyDatatype + ' ' + propertyName
            });
            propertyName = undefined;
            propertyDatatype = '';
            propertyDesc = '';
        } else if (onParamDesc) {
            propertyDesc += line;
        }
    }
    return {
        name: className,
        namespace: 'ConnectApi',
        accessModifier: "global",
        definitionModifier: "",
        withSharing: false,
        inheritedSharing: false,
        isEnum: false,
        enumValues: [],
        extendsType: parent,
        isInterface: false,
        implements: [],
        classes: {},
        enums: {},
        fields: properties,
        constructors: [],
        methods: [],
        description: classDesc,
        docLink: url
    }
}

function saveSystemClass(name, ns, isInterface, link, context) {
    let content = FileReader.readFileSync(Paths.getAbsolutePath('./resources/tmp.txt'));
    let fileStructure = getClassStructure(content, name, ns, isInterface, link);
    if (!FileChecker.isExists(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns)))
        FileWriter.createFolderSync(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns));
    FileWriter.createFileSync(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns) + '/' + name + '.json', JSON.stringify(fileStructure, null, 2));
}

function createMetadataNamespaceFiles() {
    let namespaceFolders = FileReader.readDirSync(Paths.getAbsolutePath("./resources/assets/apex/classes/"));
    for (const namespaceFolder of namespaceFolders) {
        if (namespaceFolder === 'namespacesMetadata.json')
            continue;
        createMetadataFileForNamespaces(namespaceFolder);
    }
}

function createMetadataFileForNamespaces(ns) {
    let classesFromNS = FileReader.readDirSync(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns));
    let metadata = {};
    for (const className of classesFromNS) {
        if (className !== 'namespaceMetadata.json') {
            let classData = JSON.parse(FileReader.readFileSync(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns) + '/' + className));
            let name = classData.name.replace('.json', '');
            let classes = Object.keys(classData.classes);
            let enums = Object.keys(classData.enums);
            metadata[name.toLowerCase()] = {
                name: name,
                namespace: classData.namespace,
                isEnum: classData.isEnum,
                isInterface: classData.isInterface,
                enumValues: classData.enumValues,
                description: classData.description,
                docLink: classData.docLink,
                classes: classes,
                enums: enums
            };
        }
    }
    FileWriter.createFileSync(Paths.getAbsolutePath("./resources/assets/apex/classes/" + ns) + '/namespaceMetadata.json', JSON.stringify(metadata, null, 2));
}*/