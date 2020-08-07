const https = require('https');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Metadata = require('../metadata');
const ProcessManager = require('../processes/processManager');
const Output = require('../output');
const applicationContext = require('../core/applicationContext');
const Config = require('../core/config');
const StrUtils = require('../utils/strUtils');
const NotificationManager = Output.NotificationMananger;
const OutputChannel = Output.OutputChannel;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const ApexParser = languages.ApexParser;

exports.run = function (context) {
    // Register File Watcher
    var classWatcher = vscode.workspace.createFileSystemWatcher("**/*.cls");
    classWatcher.onDidChange(async function (uri) {
        ApexParser.compileClass(uri.fsPath, Paths.getCompiledClassesPath()).then(function (apexClass) {
            applicationContext.userClasses[apexClass.name.toLowerCase()] = apexClass;
        });
    });
    classWatcher.onDidCreate(async function (uri) {
        ApexParser.compileClass(uri.fsPath, Paths.getCompiledClassesPath()).then(function (apexClass) {
            applicationContext.userClasses[apexClass.name.toLowerCase()] = apexClass;
        });
    });
    classWatcher.onDidDelete(async function (uri) {
        let fileName = Paths.getBasename(uri.fsPath);
        let className = fileName.substring(0, fileName.indexOf('.'));
        FileWriter.delete(Paths.getCompiledClassesPath() + '/' + className + '.json');
        delete applicationContext.userClasses[className.toLowerCase()];
    });
    applicationContext.context = context;
    OutputChannel.output('Aura Helper Extension is now active\n');
    OutputChannel.output('Start loading init files\n');
    init(context).then(function () { });
}

async function init(context) {
    return new Promise(async function (resolve) {
        applicationContext.componentsDetail = JSON.parse(FileReader.readFileSync(Paths.getBaseComponentsDetailPath()));
        OutputChannel.output('Loading Snippets\n');
        let loadedSnippets = loadSnippets();
        OutputChannel.output('Snippets Loaded\n');
        applicationContext.auraSnippets = loadedSnippets.auraSnippets;
        applicationContext.jsSnippets = loadedSnippets.jsSnippets;
        applicationContext.sldsSnippets = loadedSnippets.sldsSnippets;
        OutputChannel.output('Prepare Environment\n');
        if (!FileChecker.isExists(context.storagePath))
            FileWriter.createFolderSync(context.storagePath);
        if (!FileChecker.isExists(Paths.getUserTemplatesPath()))
            FileWriter.createFolderSync(Paths.getUserTemplatesPath());
        if (!FileChecker.isExists(Paths.getAuraDocumentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getAuraDocumentTemplatePath(), Paths.getAuraDocumentUserTemplatePath());
        if (!FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getApexCommentTemplatePath(), Paths.getApexCommentUserTemplatePath());
        if (!FileChecker.isExists(Paths.getMetadataIndexPath()))
            FileWriter.createFolderSync(Paths.getMetadataIndexPath());
        if (FileChecker.isExists(Paths.getOldApexCommentTemplatePath()) && !FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getOldApexCommentTemplatePath(), Paths.getApexCommentUserTemplatePath());
        if (FileChecker.isExists(Paths.getOldAuraDocumentUserTemplatePath()) && !FileChecker.isExists(Paths.getAuraDocumentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getOldAuraDocumentUserTemplatePath(), Paths.getAuraDocumentUserTemplatePath());
        OutputChannel.output('Environment Prepared\n');
        applicationContext.allNamespaces = getNamespacesMetadataFile();
        applicationContext.namespacesMetadata = getNamespacesData();
        OutputChannel.output('Getting Org Data\n');
        let username = await Config.getAuthUsername();
        let serverInstance = await Config.getServerInstance(username);
        applicationContext.orgAvailableVersions = await Config.getOrgAvailableVersions(serverInstance);
        OutputChannel.output('Checking Aura Helper CLI\n');
        let isAuraHelperInstalled = await ProcessManager.isAuraHelperInstalled();
        if (!isAuraHelperInstalled) {
            NotificationManager.showWarning("Aura Helper CLI is not installed and some features are not availables. Please go to https://github.com/JJLongoria/aura-helper-CLI or https://www.npmjs.com/package/aura-helper-cli and follow the instructions to install");
        } else {
            checkAuraHelperVersion();
        }
        OutputChannel.output('Refreshing Apex Classes Definitions\n');
        NotificationManager.showStatusBar('$(sync~spin) Refreshing Apex Classes Definitions...');
        await ApexParser.compileAllApexClasses();
        OutputChannel.output('Refreshing Apex Classes Defintions Finished\n');
        applicationContext.userClasses = getClassesFromCompiledClasses();
        NotificationManager.hideStatusBar();
        if (Config.getConfig().metadata.refreshSObjectDefinitionsOnStart)
            refreshSObjectsIndex();
        else
            applicationContext.sObjects = getSObjects(false);
        resolve();
    });
}

function refreshSObjectsIndex() {
    return new Promise(function (resolve) {
        OutputChannel.output('Refreshing SObject Defintions\n');
        NotificationManager.showStatusBar('$(sync~spin) Refreshing SObjects Definitions...');
        Metadata.Connection.refreshSObjectsIndex().then(function () {
            applicationContext.sObjects = getSObjects(false);
            OutputChannel.output('Refreshing SObject Defintions Finished\n');
            NotificationManager.hideStatusBar();
            resolve();
        });
    });
}

function checkAuraHelperVersion() {
    return new Promise((resolve) => {
        try {
            ProcessManager.auraHelperVersion().then((stdOut) => {
                const splits = stdOut.split(':');
                const versionSplits = StrUtils.replace(splits[1].trim(), 'v', '').split('.');
                const requiredVersionSplits = applicationContext.MIN_AH_CLI_VERSION.split('.')
                const majorVersion = parseInt(versionSplits[0]);
                const minorVersion = parseInt(versionSplits[1]);
                const patchVersion = parseInt(versionSplits[2]);
                const requiredMajorVersion = parseInt(requiredVersionSplits[0]);
                const requiredMinorVersion = parseInt(requiredVersionSplits[1]);
                const requiredPatchVersion = parseInt(requiredVersionSplits[2]);
                if(majorVersion < requiredMajorVersion)
                    showDialogsForAuraHelperCLI();
                else if(majorVersion == requiredMajorVersion && minorVersion < requiredMinorVersion)
                    showDialogsForAuraHelperCLI();
                else if(majorVersion === requiredMajorVersion && minorVersion === requiredMinorVersion && patchVersion < requiredPatchVersion)
                    showDialogsForAuraHelperCLI();
            }).catch((sdtErr) => {
                showDialogsForAuraHelperCLI();
            });
        } catch (error) {
            resolve();
        }
    });
}

function showDialogsForAuraHelperCLI() {
    NotificationManager.showWarning('Old Aura Helper CLI Version Installed. For a correct work of Aura Helper Extension, you must update the client. Press Ok for update now or Cancel for update later', () => {
        NotificationManager.showStatusBar('$(sync~spin) Updating Aura Helper CLI...');
        ProcessManager.updateAuraHelper().then(() => {
            NotificationManager.hideStatusBar();
            NotificationManager.showInfo('Aura Helper CLI Updated. Enjoy it!');
        }).catch((stdErr) => {
            NotificationManager.hideStatusBar();
            NotificationManager.showError('An Error ocurred while updating Aura Helper CLI. You can update manually with command "aura-helper update" or "npm update -g aura-helper-cli"');
        });
    }, () => {
        NotificationManager.showInfo("You may experience errors with the Aura Helper until you update the Aura Helper CLI.");
    });
}

function getClassesFromCompiledClasses() {
    let classes = {};
    if (FileChecker.isExists(Paths.getCompiledClassesPath())) {
        let files = FileReader.readDirSync(Paths.getCompiledClassesPath());
        for (const file of files) {
            let objName = file.substring(0, file.indexOf('.'));
            classes[objName.toLowerCase()] = JSON.parse(FileReader.readFileSync(Paths.getCompiledClassesPath() + '/' + file));
        }
    }
    return classes;
}

function getNamespacesMetadataFile() {
    let nsMetadataPath = Paths.getSystemClassesPath() + '/namespacesMetadata.json';
    return JSON.parse(FileReader.readFileSync(nsMetadataPath));
}

function getSObjects(fromSFDX) {
    let sObjects = {};
    if (fromSFDX) {
        let customObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/customObjects';
        let standardObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/standardObjects';
        let customObjectsFiles = FileReader.readDirSync(customObjectsFolder);
        if (customObjectsFiles && customObjectsFiles.length > 0) {
            for (const fileName of customObjectsFiles) {
                let objName = fileName.substring(0, fileName.indexOf('.'));
                sObjects[objName.toLowerCase()] = objName;
            }
        }
        let standardObjectFiles = FileReader.readDirSync(standardObjectsFolder);
        if (standardObjectFiles && standardObjectFiles.length > 0) {
            for (const fileName of standardObjectFiles) {
                let objName = fileName.substring(0, fileName.indexOf('.'));
                sObjects[objName.toLowerCase()] = objName;
            }
        }
    } else {
        let metadataPath = Paths.getMetadataIndexPath();
        let files = FileReader.readDirSync(metadataPath);
        if (files && files.length > 0) {
            for (const fileName of files) {
                let obj = JSON.parse(FileReader.readFileSync(metadataPath + '/' + fileName));
                sObjects[obj.name.toLowerCase()] = obj;
            }
        } else {
            let customObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/customObjects';
            let standardObjectsFolder = Paths.getSFDXFolderPath() + '/tools/sobjects/standardObjects';
            let customObjectsFiles = FileReader.readDirSync(customObjectsFolder);
            if (customObjectsFiles && customObjectsFiles.length > 0) {
                for (const fileName of customObjectsFiles) {
                    let objName = fileName.substring(0, fileName.indexOf('.'));
                    sObjects[objName.toLowerCase()] = objName;
                }
            }
            let standardObjectFiles = FileReader.readDirSync(standardObjectsFolder);
            if (standardObjectFiles && standardObjectFiles.length > 0) {
                for (const fileName of standardObjectFiles) {
                    let objName = fileName.substring(0, fileName.indexOf('.'));
                    sObjects[objName.toLowerCase()] = objName;
                }
            }
        }
    }

    return sObjects;
}

function getNamespacesData() {
    let namespaceMetadata = {};
    Object.keys(applicationContext.allNamespaces).forEach(function (key) {
        let nsData = getNamespaceClasses(key);
        namespaceMetadata[key.toLowerCase()] = nsData;
    });
    return namespaceMetadata;
}

function getNamespaceClasses(namespace) {
    const nsMetadataPath = Paths.getSystemClassesPath() + '/' + namespace;
    const files = FileReader.readDirSync(nsMetadataPath);
    const data = {};
    for (const file of files) {
        if (file.indexOf('namespaceMetadata') !== -1)
            continue;
        let cls = JSON.parse(FileReader.readFileSync(nsMetadataPath + '/' + file))
        data[cls.name.toLowerCase()] = cls;
    }
    return data;
}
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

function loadSnippets() {
    let auraSnippets = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
    let jsSnippets = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
    let sldsSnippets = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));
    let auraActivations = {};
    let jsActivations = {};
    let sldsActivations = {};
    Object.keys(auraSnippets).forEach(function (key) {
        let obj = auraSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!auraActivations[activation])
                auraActivations[activation] = [];
            auraActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!auraActivations[activation])
                auraActivations[activation] = [];
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
            if (!jsActivations[activation])
                jsActivations[activation] = [];
            jsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!jsActivations[activation])
                jsActivations[activation] = [];
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
            if (!sldsActivations[activation])
                sldsActivations[activation] = [];
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!sldsActivations[activation])
                sldsActivations[activation] = [];
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    return {
        auraSnippets: auraActivations,
        jsSnippets: jsActivations,
        sldsSnippets: sldsActivations
    }
}