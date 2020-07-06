const logger = require('../utils/logger');
const snippetUtils = require('../utils/snippetUtils');
const languages = require('../languages');
const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const JavaScriptParser = languages.JavaScriptParser;

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

exports.run = function(uri) {
    try {
        var path;
        if (!uri) {
            var editor = window.activeTextEditor;
            if (!editor)
                return;
            path = window.activeTextEditor.document.uri.fsPath;
        }
        else if (uri) {
            path = uri.fsPath;
        } else {
            return;
        }
        if (FileChecker.isAuraComponent(path) || FileChecker.isAuraComponentFolder(path)) {
            if (FileChecker.isAuraComponent(path))
                path = Paths.getFolderPath(path);
            let filesOnDir = FileReader.readDirSync(path);
            var filesForCreate = getNotExistsAuraFiles(filesOnDir);
            window.showQuickPick(filesForCreate, { placeHolder: "Select an Aura File for Create" }).then((selected) =>
                onSelectedFile(path, selected)
            );
        }
        else {
            NotificationManager.showError('The selected file is not an Aura Component File or Folder');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}

function onSelectedFile(path, selected){
    if (selected) {
        createAuraFile(path, selected, onFileCreated);
    }
}

function onFileCreated(fileCreated, error){
    if(fileCreated){
        window.showTextDocument(Paths.asUri(fileCreated));
    } else{
        NotificationManager.showError('An error ocurred while creating file. Error: \n' + error);
    }
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

function createAuraFile(folderPath, selected, callback) {
	var fileForCreate;
	var content;
	var fileType = getAuraFileTypeFromName(selected);
	if (fileType)
		fileForCreate = Paths.getBasename(folderPath) + fileType;
	if (fileForCreate) {
		fileForCreate = folderPath + '/' + fileForCreate;
		if (fileForCreate.indexOf('.auradoc') !== -1) {
			createNewAuraDocumentation(fileForCreate, callback);
		} else if (fileForCreate.indexOf('.css') !== -1) {
			content = snippetUtils.getCSSFileSnippet();
			FileWriter.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('.design') !== -1) {
			content = snippetUtils.getDesignFileSnippet();
			FileWriter.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('.svg') !== -1) {
			content = snippetUtils.getSVGFileSnippet();
			FileWriter.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Controller.js') !== -1) {
			content = snippetUtils.getControllerHelperFileSnippet('controllerMethod');
			FileWriter.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Helper.js') !== -1) {
			content = snippetUtils.getControllerHelperFileSnippet('helperMethod');
			FileWriter.createFile(fileForCreate, content, callback);
		} else if (fileForCreate.indexOf('Renderer.js') !== -1) {
			content = snippetUtils.getRendererFileSnippet();
			FileWriter.createFile(fileForCreate, content, callback);
		}
	}
}

function createNewAuraDocumentation(fileForCreate, callback){
    let helperPath = Paths.getBundleHelperPath(fileForCreate);
    let controllerPath = Paths.getBundleControllerPath(fileForCreate);
    let templatePath = Paths.getAuraDocumentUserTemplatePath();
    let helper;
    let controller;
    if (FileChecker.isExists(helperPath)) {
        helper = JavaScriptParser.parse(FileReader.readFileSync(helperPath));
    }
    if (FileChecker.isExists(controllerPath)) {
        controller = JavaScriptParser.parse(FileReader.readFileSync(controllerPath));
    }
    if (FileChecker.isExists(templatePath)) {
        let templateContent = FileReader.readFileSync(templatePath);
        var snippet = snippetUtils.getAuraDocumentationSnippet(controller, helper, templateContent);
        FileWriter.createFile(fileForCreate, snippet, callback);
    }
    else {
        NotificationManager.showError("Aura Documentation Template does not exists. Run Edit Aura Documentation command for create it");
    }
}