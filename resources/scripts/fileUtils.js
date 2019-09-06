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

function basename(filePath){
    return path.basename(filePath);
}

function isFileExists(filePath){
    return fs.existsSync(filePath);
}

function getAuraDocumentTemplatePath(context) {
	return context.asAbsolutePath("./resources/templates/auraDocumentation.json");
}

function getApexCommentTemplatePath(context) {
	return context.asAbsolutePath("./resources/templates/apexComment.json");
}

function getHelpPath(context){
    return context.asAbsolutePath("./resources/help/index.html");
}

function getDocumentObject(filePath, callback) {
    vscode.workspace.openTextDocument(filePath).then((document) => {
        logger.log("Document Opened (" + filePath + ")");
        callback.call(this, document);
    });
}

function getFileContent(filePath){
    return fs.readFileSync(filePath, 'utf8');
}

function getDocumentText(document) {
    var text = "";
    for (var i = 0; i < document.lineCount; i++) {
        text += document.lineAt(i).text + "\n";
    }
    return text;
}

function getFileNamesFromFolder(folderPath, callback) {
    logger.log("folderPath", folderPath);
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
    return filePath.endsWith('/force-app/main/default/aura') != -1;
}

function getAuraFileTypeFromName(name){
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

function getHelp(context, callback){
    let help = "";
    getDocumentObject(getHelpPath(context), function(helpIndex){
        help = getDocumentText(helpIndex);
        if(callback)
            callback.call(this, help);
    });
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
    getFileContent
}