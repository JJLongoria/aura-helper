const https = require('https');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const ApexParser = languages.ApexParser;

const applicationContext = require('../main/applicationContext');

exports.run = function (context) {
    console.log('Aura Helper Extension is now active');
    console.log('Aura Helper Init files');
    applicationContext.context = context;
    init(context, function () {
        console.log('Aura Helper files initialized');
    });
}

async function init(context, callback) {
    setTimeout(() => {
        applicationContext.componentsDetail = JSON.parse(FileReader.readFileSync(Paths.getBaseComponentsDetailPath()));
        let loadedSnippets = loadSnippets();
        applicationContext.auraSnippets = loadedSnippets.auraSnippets;
        applicationContext.jsSnippets = loadedSnippets.jsSnippets;
        applicationContext.sldsSnippets = loadedSnippets.sldsSnippets;
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
        if (callback)
            callback.call(this);
    }, 50);
}

function saveSystemClass(name, ns, isInterface, link, context) {
    let content = FileReader.readFileSync(context.asAbsolutePath('./resources/tmp.txt'));
    let lines = content.split('\n');
    let isOnMethod;
    let isOnDesc;
    let isOnParams;
    let isOnReturn;
    let isOnSignature;
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
    let paramDesc;
    let onConstructors;
    let onProperties;
    let onMethods;
    let isEnum = false;
    let onEnum;
    for (const line of lines) {
        if(line.indexOf('<h2 class="helpHead2">Enum Values</h2>') !== -1 || line.indexOf('Type Field Value</th>') !== -1){
            onEnum = true;
            isEnum = true;
        } else if(onEnum && line.indexOf('<samp class="codeph apex_code">') !== -1){
            enumValues.push(line.replace(new RegExp('<[^>]+>', 'g'), "").trim());
        } else if(onEnum && line.indexOf('</tbody>') !== -1){
            onEnum = false;
        } else if (line.indexOf('</a>' + name + ' Constructors</span></h2>') !== -1) {
            onConstructors = true;
            onProperties = false;
            onMethods = false;
        }
        if (line.indexOf('</a>' + name + ' Properties</span></h2>') !== -1 || line.indexOf('</a>Dynamic ' + name + ' Properties</span></h2>') !== -1) {
            if (methodName) {
                isOnParams = false;
                if(onProperties){
                    properties.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                else if(onMethods){
                    methods.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
                        datatype: returnType.trim(),
                    });
                } else if(onConstructors){
                    constructors.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
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
        }
        if (line.indexOf('</a>' + name + ' Methods</span></h2>') !== -1) {
            if (methodName) {
                isOnParams = false;
                if(onProperties){
                    properties.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
                        datatype: returnType.trim(),
                    });
                }
                else if(onMethods){
                    methods.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
                        datatype: returnType.trim(),
                    });
                } else if(onConstructors){
                    constructors.push({
                        name: methodName.trim(),
                        signature: methodSignature.trim(),
                        description: description.trim(),
                        methodParams: methodParams,
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
        if (line.indexOf('<div class="shortdesc">') !== -1 && !classDesc) {
            classDesc = line.replace(new RegExp('<[^>]+>', 'g'), "").trim();
        }
        if (onConstructors || onMethods || onProperties) {
            if (line.indexOf('<div class="topic reference nested2"') !== -1) {
                isOnMethod = true;
                isOnReturn = false;
                if (methodName) {
                    isOnParams = false;
                    if(onProperties){
                        properties.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    else if(onMethods){
                        methods.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
                            datatype: returnType.trim(),
                        });
                    } else if(onConstructors){
                        constructors.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
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
                } else if (line.indexOf('Return Value') !== -1 && !isOnReturn) {
                    isOnReturn = true;
                } else if (line.indexOf('<p class="p">Type: ') !== -1 && isOnReturn) {
                    returnType = line.replace(new RegExp('<[^>]+>', 'g'), "").replace(new RegExp('Type:', 'g'), "").trim();
                    returnType = returnType.replace(new RegExp('&lt;', 'g'), '<').replace(new RegExp('&gt;', 'g'), '>').trim();
                    isOnMethod = false;
                    if(onProperties){
                        properties.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
                            datatype: returnType.trim(),
                        });
                    }
                    else if(onMethods){
                        methods.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
                            datatype: returnType.trim(),
                        });
                    } else if(onConstructors){
                        constructors.push({
                            name: methodName.trim(),
                            signature: methodSignature.trim(),
                            description: description.trim(),
                            methodParams: methodParams,
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
                        methodParams.push({
                            name: paramName.trim(),
                            datatype: paramType.trim()
                        });
                        isOnReturn = false;
                    }
                }
            }
        }
    }
    let fileStructure = {
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
        constuctors: constructors,
        methods: methods,
        description: classDesc.trim(),
        docLink: link
    }
    if(!FileChecker.isExists(context.asAbsolutePath("./resources/assets/apex/classes/" + ns.toLowerCase())))
        FileWriter.createFolderSync(context.asAbsolutePath("./resources/assets/apex/classes/" + ns.toLowerCase()));
    FileWriter.createFileSync(context.asAbsolutePath("./resources/assets/apex/classes/" + ns.toLowerCase()) + '/' + name + '.json', JSON.stringify(fileStructure, null, 2));
}

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