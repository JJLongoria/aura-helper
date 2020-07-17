const vscode = require('vscode');
const applicationContext = require('../core/applicationContext');
const StrUtils = require('../utils/strUtils');
const path = require('path');
class Paths {
    static getGUIEnginePath(){
        return StrUtils.replace(applicationContext.context.storagePath + "\\GUIEngine", "\\", '/');
    }
    static getResourcesPath() { 
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources"), "\\", '/');
    }
    static getOldUserTemplatesPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/userTemplates"), '\\', '/');
    }
    static getUserTemplatesPath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "userTemplates", '\\', '/');
    }
    static getAuraDocumentTemplatePath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/templates/auraDocumentation.json"), '\\', '/');
    }
    static getApexCommentTemplatePath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/templates/apexComment.json"), '\\', '/');
    }
    static getOldApexCommentTemplatePath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/userTemplates/apexComment.json"), '\\', '/');
    }
    static getAuraDocumentUserTemplatePath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "userTemplates\\auraDocumentation.json", '\\', '/');
    }
    static getOldAuraDocumentUserTemplatePath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/userTemplates/auraDocumentation.json"), '\\', '/');
    }
    static getApexCommentUserTemplatePath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "userTemplates\\apexComment.json", '\\', '/');
    }
    static getEnglishHelpPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/gui/help/help_en.html"), '\\', '/');
    }
    static getSpanishHelpPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/gui/help/help_es.html"), '\\', '/');
    }
    static getAuraSnippetsPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/snippets/auraSnippets.json"), '\\', '/');
    }
    static getJSSnippetsPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/snippets/jsSnippets.json"), '\\', '/');
    }
    static getSLDSSnippetsPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/snippets/sldsSnippets.json"), '\\', '/');
    }
    static getBaseComponentsDetailPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/assets/baseComponentsDetail.json"), '\\', '/');
    }
    static getProfilePage() { 
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/gui/metadata/profilePage.html"), '\\', '/');
    }
    static getPackageGeneratorPage() { 
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/gui/metadata/packageGeneratorPage.html"), '\\', '/');
    }
    static getMetadataIndexPath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "metadata", '\\', '/');
    }
    static getStoredOrgsPath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "activeOrgs.json", '\\', '/');
    }
    static getSystemClassesPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/assets/apex/classes"), '\\', '/');
    }
    static getAssetsPath() {
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/assets"), '\\', '/');
    }
    static getSFDXFolderPath() { 
        return StrUtils.replace(Paths.getWorkspaceFolder() + '/.sfdx', '\\', '/');
    }
    static getManifestPath() { 
        return StrUtils.replace(Paths.getWorkspaceFolder() + '/manifest', '\\', '/');
    }
    static getWorkspaceFolder() { 
        return StrUtils.replace(vscode.workspace.workspaceFolders[0].uri.fsPath, '\\', '/');
    }
    static getBasename(filePath) {
        return StrUtils.replace(path.basename(filePath), '\\', '/');
    }
    static getFolderPath(filePath) {
        return StrUtils.replace(path.dirname(filePath), '\\', '/');
    }
    static getPackageFolder() { 
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "download\\metadata\\package", '\\', '/');
    }
    static getConvertedProjectFolder() { 
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "download\\metadata\\converted", '\\', '/');
    }
    static getTempProjectFolder() { 
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "download\\metadata\\tempProject", '\\', '/');
    }
    static getDestructivePackageFolder() { 
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "download\\metadata\\destructivePackage", '\\', '/');
    }
    static getMetadataRootFolder() { 
        return StrUtils.replace(Paths.getWorkspaceFolder() + '/force-app/main/default', '\\', '/');
    }
    static getBundleHelperPath(filePath) {
        return StrUtils.replace(filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Renderer.js').replace('.app', 'Controller.js') + 'Helper.js', '\\', '/');
    }
    static getBundleControllerPath(filePath) {
        return StrUtils.replace(filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Renderer.js').replace('.app', 'Helper.js') + 'Controller.js', '\\', '/');
    }
    static getBundleRendererPath(filePath) {
        return StrUtils.replace(filePath.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('.app', 'Controller.js').replace('.app', 'Helper.js') + 'Renderer.js', '\\', '/');
    }
    static asUri(filePath) {
        return StrUtils.replace(vscode.Uri.file(filePath), '\\', '/');
    }
    static getImagesPath(){
        return StrUtils.replace(applicationContext.context.asAbsolutePath("./resources/images"), '\\', '/');
    }
    static getAbsolutePath(path) { 
        return StrUtils.replace(applicationContext.context.asAbsolutePath(path), '\\', '/');
    }
    static getCompiledClassesPath() {
        return StrUtils.replace(applicationContext.context.storagePath + "\\" + "classesInfo", '\\', '/');
    }
}
exports.Paths = Paths;