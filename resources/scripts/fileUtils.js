const vscode = require('vscode');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

const AURA_FILE_TYPES = [
    { type: '.auradoc', name: "Aura Documentation File" },
    { type: '.cmp', name: "Aura Component File" },
    { type: '.css', name: "Aura CSS Style File" },
    { type: '.design', name: "Aura Design File" },
    { type: '.svg', name: "Aura SVG File" },
    { type: 'Controller.js', name: "Aura Controller File" },
    { type: 'Helper.js', name: "Aura Helper File" },
    { type: 'Renderer.js', name: "Aura Renderer File" }
];

function basename(filePath) {
    return path.basename(filePath);
}

function isFileExists(filePath) {
    return fs.existsSync(filePath);
}

function createFolder(folderPath) {
    fs.mkdirSync(folderPath);
}

function copyFile(sourcePath, targetPath) {
    fs.copyFileSync(sourcePath, targetPath);
}

function getUserTemplatesPath(context) {
    return context.asAbsolutePath("./resources/userTemplates");
}

function getAuraDocumentTemplatePath(context) {
    return context.asAbsolutePath("./resources/templates/auraDocumentation.json");
}

function getApexCommentTemplatePath(context) {
    return context.asAbsolutePath("./resources/templates/apexComment.json");
}

function getAuraDocumentUserTemplatePath(context) {
    return context.asAbsolutePath("./resources/userTemplates/auraDocumentation.json");
}

function getApexCommentUserTemplatePath(context) {
    return context.asAbsolutePath("./resources/userTemplates/apexComment.json");
}

function getHelpPath(context) {
    return context.asAbsolutePath("./resources/help/index.html");
}

function getAuraSnippetsPath(context) {
    return context.asAbsolutePath("./resources/snippets/auraSnippets.json");
}

function getJSSnippetsPath(context) {
    return context.asAbsolutePath("./resources/snippets/jsSnippets.json");
}

function getDocumentObject(filePath, callback) {
    vscode.workspace.openTextDocument(filePath).then((document) => {
        logger.log("Document Opened (" + filePath + ")");
        callback.call(this, document);
    });
}

function getFileContent(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function getDocumentText(document) {
    var text = "";
    for (var i = 0; i < document.lineCount; i++) {
        text += document.lineAt(i).text + "\n";
    }
    return text;
}

function getFilesFromFolderSync(folderPath){
    return fs.readdirSync(folderPath);
}

function getFileNamesFromFolder(folderPath, callback) {
    var fileNames = [];
    vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath)).then(function (filesPath) {
        for (const file of filesPath) {
            logger.logJSON('file', file);
            if (file[1] == 1) {
                fileNames.push(file[0]);
            }
        }
        callback.call(this, fileNames);
    });
}

function getNotExistsAuraFiles(existingFileNames) {
    logger.log('existingFileNames', existingFileNames);
    var notExistsFiles = [];
    for (const auraFile of AURA_FILE_TYPES) {
        var exists = false;
        for (const existingFile of existingFileNames) {
            if (existingFile.indexOf(auraFile.type) !== -1) {
                exists = true;
            }
        }
        if (!exists)
            notExistsFiles.push(auraFile.name);
    }
    return notExistsFiles;
}

function createFile(filePath, content, callback) {
    fs.writeFile(filePath, content, function (error) {
        logger.log(error)
        if (!error)
            callback.call(this, filePath);
        else
            callback.call(this, null);
    })
}

function getFileFolderPath(filePath) {
    return path.dirname(filePath);
}

function isAuraDocFile(filePath) {
    return filePath.indexOf('.auradoc') != -1;
}

function isApexClassFile(filePath) {
    return filePath.indexOf('.cls') != -1;
}

function isJavascriptFile(filePath) {
    return filePath.indexOf('.js') != -1;
}

function isAuraComponentFile(filePath) {
    return filePath.indexOf('.cmp') != -1;
}

function isAuraComponentFolder(filePath) {
    return filePath.indexOf('/aura/') !== -1 || filePath.indexOf('\\aura\\') !== -1;
}


function getAuraFileTypeFromName(name) {
    let fileType = '';
    for (const auraFile of AURA_FILE_TYPES) {
        logger.logJSON('auraFile', auraFile);
        if (auraFile.name === name) {
            fileType = auraFile.type;
            break;
        }
    }
    return fileType;
}

function getHelp(context, callback) {
    let help = "";
    getDocumentObject(getHelpPath(context), function (helpIndex) {
        help = getDocumentText(helpIndex);
        let auraNS = {};
        let jsNS = {};
        let auraSnippets = JSON.parse(getFileContent(getAuraSnippetsPath(context)));
        let jsSnippets = JSON.parse(getFileContent(getJSSnippetsPath(context)));
        Object.keys(auraSnippets).forEach(function (key) {
            let snippet = auraSnippets[key];
            if (auraNS[getSnippetNS(snippet)] === undefined)
                auraNS[getSnippetNS(snippet)] = [];
            auraNS[getSnippetNS(snippet)].push({ snippetName: key, snippet: snippet });
        });
        Object.keys(jsSnippets).forEach(function (key) {
            let snippet = jsSnippets[key];
            if (jsNS[getSnippetNS(snippet)] === undefined)
                jsNS[getSnippetNS(snippet)] = [];
            jsNS[getSnippetNS(snippet)].push({ snippetName: key, snippet: snippet });
        });
        let snippetMenuContent = [
            "<a href=\"#auraSnippetsCollection\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey\" onclick=\"openCloseAccordion('auraSnippets')\">Component Snippets</a>",
            "\t\t\t\t\t<div id=\"auraSnippets\" class=\"w3-hide w3-margin-left\">"
        ];
        let snippetSectionContent = [
            "<p>Aura Helper provides to you to muchs code snippets for make your work easy. The following list are the total snippets of Aura Helper</p>",
            "\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"auraSnippetsCollection\">",
            "\t\t\t\t\t\t\t\t<h4><b>Component Snippets</b></h4>"
        ];
        Object.keys(auraNS).forEach(function (key) {
            let snippets = auraNS[key];
            snippetMenuContent.push("\t\t\t\t\t\t<a href=\"#aura_" + key + "\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey\" onclick=\"openCloseAccordion('aura_" + key + "_snippets')\">" + getNamespaceName(key) + " Snippets</a>");
            snippetMenuContent.push("\t\t\t\t\t\t\t<div id=\"aura_" + key + "_snippets\" class=\"w3-hide w3-margin-left\">");

            snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"aura_" + key + "\">");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>" + getNamespaceName(key) + " Snippets</b></h4>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t<div class=\"w3-container\">");
            for (const snippet of snippets) {
                //logger.logJSON('snippet', snippet);
                snippetMenuContent.push("\t\t\t\t\t\t\t\t<a href=\"#" + snippet.snippet.prefix + "\" class=\"w3-bar-item w3-button\">" + snippet.snippetName + "</a>");

                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t<div class=\"w3-container darkGrey w3-margin-left\" id=\"" + snippet.snippet.prefix + "\">");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<h5>" + snippet.snippetName + "</h5>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>" + snippet.snippet.description + "<p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>- Code Completion: <code>" + snippet.snippet.prefix + "</code><p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p><b>Body:</b><p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<pre>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t<code class=\"darkGrey codeColor\">");
                for (let bodyLine of snippet.snippet.body) {
                    let line = bodyLine.replace(new RegExp(/</, 'g'), "&lt;").replace(new RegExp(/</, 'g'), "&gt;").replace(new RegExp(/\\/, 'g'), "").replace(new RegExp(/!/, 'g'), "").replace(new RegExp(/{/, 'g'), "").replace(new RegExp(/}/, 'g'), "").replace(new RegExp(/\$/, 'g'), "").replace(new RegExp(/[0-9]:/, 'g'), "");
                    snippetSectionContent.push(line);
                }
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t</code>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t</pre>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t</div>");
            }
            snippetMenuContent.push("\t\t\t\t\t\t\t</div>");

            snippetSectionContent.push("\t\t\t\t\t\t\t\t</div>");
            snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        });
        snippetMenuContent.push("\t\t\t\t\t</div>");
        snippetMenuContent.push("\t\t\t\t<a href=\"#JSSnippetsCollection\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey\" onclick=\"openCloseAccordion('jsSnippets')\">JavaScript Snippets</a>");
        snippetMenuContent.push("\t\t\t\t\t<div id=\"jsSnippets\" class=\"w3-hide w3-margin-left\">");

        snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"JSSnippetsCollection\">");
        snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>JavaScript Snippets</b></h4>");
        Object.keys(jsNS).forEach(function (key) {
            let snippets = jsNS[key];
            snippetMenuContent.push("\t\t\t\t\t\t<a href=\"#js_" + key + "\" class=\"w3-bar-item w3-button w3-border-bottom darkGrey\" onclick=\"openCloseAccordion('js_" + key + "_snippets')\">" + getNamespaceName(key) + " Snippets</a>");
            snippetMenuContent.push("\t\t\t\t\t\t\t<div id=\"js_" + key + "_snippets\" class=\"w3-hide w3-margin-left\">");

            snippetSectionContent.push("\t\t\t\t\t\t\t<div class=\"w3-container\" id=\"js_" + key + "\">");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t<h4><b>" + getNamespaceName(key) + " Snippets</b></h4>");
            snippetSectionContent.push("\t\t\t\t\t\t\t\t<div class=\"w3-container\">");
            for (const snippet of snippets) {
                snippetMenuContent.push("\t\t\t\t\t\t\t\t<a href=\"#" + snippet.snippet.prefix + "\" class=\"w3-bar-item w3-button\">" + snippet.snippetName + "</a>");

                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t<div class=\"w3-container darkGrey w3-margin-left\" id=\"" + snippet.snippet.prefix + "\">");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<h5>" + snippet.snippetName + "</h5>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>" + snippet.snippet.description + "<p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p>- Code Completion: <code>" + snippet.snippet.prefix + "</code><p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<p><b>Body:</b><p>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t<pre>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t<code class=\"darkGrey codeColor\">");
                let func = false;
                let lineNumber = 0;
                for (let bodyLine of snippet.snippet.body) {
                    let line = bodyLine.replace(new RegExp(/</, 'g'), "&lt;").replace(new RegExp(/</, 'g'), "&gt;").replace(new RegExp(/\\/, 'g'), "").replace(new RegExp(/!/, 'g'), "").replace(new RegExp(/{/, 'g'), "").replace(new RegExp(/}/, 'g'), "").replace(new RegExp(/\$/, 'g'), "").replace(new RegExp(/[0-9]:/, 'g'), "").replace(new RegExp(/[0-9]/, 'g'), "");
                    if(line.indexOf('function') !== -1){
                        line = line.replace(')', '){');
                        func = true;
                    }
                    else if(line.indexOf(',') !== -1 && func && lineNumber === snippet.snippet.body.length - 1)
                        line = line.replace(',', '},');
                    snippetSectionContent.push(line);
                    lineNumber++;
                }
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t\t</code>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t\t</pre>");
                snippetSectionContent.push("\t\t\t\t\t\t\t\t\t</div>");
            }
            snippetMenuContent.push("\t\t\t\t\t\t\t</div>");

            snippetSectionContent.push("\t\t\t\t\t\t\t\t</div>");
            snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        });
        snippetMenuContent.push("\t\t\t\t\t</div>");
        snippetSectionContent.push("\t\t\t\t\t\t\t</div>");
        help = help.replace('{!snippetsCollectionMenu}', snippetMenuContent.join('\n'));
        help = help.replace('{!snippetsCollection}', snippetSectionContent.join('\n'));
        if (callback)
            callback.call(this, help);
    });
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
    return ns;
}

module.exports = {
    isAuraDocFile,
    isApexClassFile,
    isJavascriptFile,
    isAuraComponentFile,
    isAuraComponentFolder,
    getFileFolderPath,
    getDocumentObject,
    getDocumentText,
    getFileNamesFromFolder,
    getNotExistsAuraFiles,
    createFile,
    getAuraDocumentTemplatePath,
    isFileExists,
    basename,
    getAuraFileTypeFromName,
    getHelp,
    getApexCommentTemplatePath,
    getFileContent,
    getAuraDocumentUserTemplatePath,
    getApexCommentUserTemplatePath,
    getUserTemplatesPath,
    createFolder,
    copyFile,
    getJSSnippetsPath,
    getAuraSnippetsPath,
    getHelpPath,
    getFilesFromFolderSync
}