const vscode = require('vscode');
const applicationContext = require('../main/applicationContext');
const StrUtils = require('../utils/strUtils');
const path = require('path');
class Paths {
    static getResourcesPath() { 
        return applicationContext.context.asAbsolutePath("./resources");
    }
    static getOldUserTemplatesPath() {
        return applicationContext.context.asAbsolutePath("./resources/userTemplates");
    }
    static getUserTemplatesPath() {
        return applicationContext.context.storagePath + "\\" + "userTemplates";
    }
    static getAuraDocumentTemplatePath() {
        return applicationContext.context.asAbsolutePath("./resources/templates/auraDocumentation.json");
    }
    static getApexCommentTemplatePath() {
        return applicationContext.context.asAbsolutePath("./resources/templates/apexComment.json");
    }
    static getOldApexCommentTemplatePath() {
        return applicationContext.context.asAbsolutePath("./resources/userTemplates/apexComment.json");
    }
    static getAuraDocumentUserTemplatePath() {
        return applicationContext.context.storagePath + "\\" + "userTemplates\\auraDocumentation.json";
    }
    static getOldAuraDocumentUserTemplatePath() {
        return applicationContext.context.asAbsolutePath("./resources/userTemplates/auraDocumentation.json");
    }
    static getApexCommentUserTemplatePath() {
        return applicationContext.context.storagePath + "\\" + "userTemplates\\apexComment.json";
    }
    static getEnglishHelpPath() {
        return applicationContext.context.asAbsolutePath("./resources/gui/help/help_en.html");
    }
    static getSpanishHelpPath() {
        return applicationContext.context.asAbsolutePath("./resources/gui/help/help_es.html");
    }
    static getAuraSnippetsPath() {
        return applicationContext.context.asAbsolutePath("./resources/snippets/auraSnippets.json");
    }
    static getJSSnippetsPath() {
        return applicationContext.context.asAbsolutePath("./resources/snippets/jsSnippets.json");
    }
    static getSLDSSnippetsPath() {
        return applicationContext.context.asAbsolutePath("./resources/snippets/sldsSnippets.json");
    }
    static getBaseComponentsDetailPath() {
        return applicationContext.context.asAbsolutePath("./resources/assets/baseComponentsDetail.json");
    }
    static getProfilePage() { 
        return applicationContext.context.asAbsolutePath("./resources/gui/metadata/profilePage.html");
    }
    static getPackageGeneratorPage() { 
        return applicationContext.context.asAbsolutePath("./resources/gui/metadata/packageGeneratorPage.html");
    }
    static getMetadataIndexPath() {
        return applicationContext.context.storagePath + "\\" + "metadata";
    }
    static getStoredOrgsPath() {
        return applicationContext.context.storagePath + "\\" + "activeOrgs.json";
    }
    static getSystemClassesPath() {
        return applicationContext.context.asAbsolutePath("./resources/assets/apex/classes");
    }
    static getSFDXFolderPath() { 
        return Paths.getWorkspaceFolder() + '/.sfdx';
    }
    static getManifestPath() { 
        return Paths.getWorkspaceFolder() + '/manifest';
    }
    static getWorkspaceFolder() { 
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    static getBasename(filePath) {
        return path.basename(filePath);
    }
    static getFolderPath(filePath) {
        return path.dirname(filePath);
    }
    static getPackageFolder() { 
        return applicationContext.context.storagePath + "\\" + "download\\metadata\\package";
    }
    static getDestructivePackageFolder() { 
        return applicationContext.context.storagePath + "\\" + "download\\metadata\\destructivePackage";
    }
    static getMetadataRootFolder() { 
        return Paths.getWorkspaceFolder() + '/force-app/main/default';
    }
    static getBundleHelperPath(filePath) {
        return filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Renderer.js').replace('.app', 'Controller.js') + 'Helper.js';
    }
    static getBundleControllerPath(filePath) {
        return filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Renderer.js').replace('.app', 'Helper.js') + 'Controller.js';
    }
    static getBundleRendererPath(filePath) {
        return filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Controller.js').replace('.app', 'Helper.js') + 'Renderer.js';
    }
    static asUri(filePath) {
        return vscode.Uri.file(filePath);
    }
    static getImagesPath(){
        return applicationContext.context.asAbsolutePath("./resources/images");
    }
    static getAbsolutePath(path) { 
        return StrUtils.replace(applicationContext.context.asAbsolutePath(path), '\\', '/');
    }
    static getCompiledClassesPath() {
        return applicationContext.context.storagePath + "\\" + "classesInfo";
    }
}
exports.Paths = Paths;