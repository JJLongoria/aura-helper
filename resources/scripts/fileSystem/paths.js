

const vscode = require('vscode');
const applicationContext = require('../main/applicationContext');
const path = require('path');
class Paths {
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
    static getHelpPath() {
        return applicationContext.context.asAbsolutePath("./resources/help/index.html");
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
    static getMetadataIndexPath() {
        return applicationContext.context.storagePath + "\\" + "metadata";
    }
    static getStoredOrgsPath() {
        return applicationContext.context.storagePath + "\\" + "activeOrgs.json";
    }
    static getBasename(filePath) {
        return path.basename(filePath);
    }
    static getFolderPath(filePath) {
        return path.dirname(filePath);
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
}
exports.Paths = Paths;