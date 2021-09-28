const vscode = require('vscode');
const applicationContext = require('./applicationContext');
const { PathUtils } = require('@aurahelper/core').FileSystem;

class Paths {

    static getProjectFolder() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath);
    }

    static getProjectMetadataFolder() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath + '/force-app/main/default');
    }

    static getTemporalFolder() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/temp');
    }

    static getApexCommentUserTemplate() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/userTemplates/apexComment.template.json');
    }

    static getApexCommentBaseTemplate() {
        return Paths.getResourcesPath() + '/templates/apexComment.template.json';
    }

    static getApexJavaBaseTemplate() {
        return Paths.getResourcesPath() + '/templates/apexCommentJava.template.json';
    }

    static getOldApexCommentUserTemplate() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/userTemplates/apexComment.json');
    }

    static getAuraDocUserTemplate() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/userTemplates/auraDocumentation.json');
    }

    static getAuraDocBaseTemplate() {
        return Paths.getResourcesPath() + '/templates/auraDocumentation.json';
    }

    static getOldAuraDocUserTemplate() {
        return Paths.getResourcesPath() + '/userTemplates/auraDocumentation.json';
    }

    static getUserTemplatesFolder() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/userTemplates');
    }

    static getAHIgnoreFile() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath + '/.ahignore.json');
    }

    static getCompiledClassesFolder() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/classesInfo');
    }

    static getMetadataIndexFolder() {
        return PathUtils.getAbsolutePath(applicationContext.context.storagePath + '/metadata');
    }

    static getSFDXStandardSObjectsFolder() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath + '/.sfdx/tools/sobjects/standardObjects');
    }

    static getSFDXCustomSObjectsFolder() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath + '/.sfdx/tools/sobjects/standardObjects');
    }

    static getPackageFolder() {
        return vscode.workspace.workspaceFolders[0].uri.fsPath + '/metadata/package';
    }

    static getManifestPath() {
        return PathUtils.getAbsolutePath(vscode.workspace.workspaceFolders[0].uri.fsPath + '/manifest');
    }

    static getImagesPath() {
        return Paths.getResourcesPath() + '/images';
    }

    static getAuraSnippetsPath() {
        return Paths.getResourcesPath() + '/snippets/auraSnippets.json';
    }

    static getJSSnippetsPath() {
        return Paths.getResourcesPath() + '/snippets/jsSnippets.json';
    }

    static getSLDSSnippetsPath() {
        return Paths.getResourcesPath() + '/snippets/sldsSnippets.json';
    }

    static getLWCSnippetsPath() {
        return Paths.getResourcesPath() + '/snippets/lwcSnippets.json';
    }

    static getAssetsPath() {
        return Paths.getResourcesPath() + '/assets';
    }

    static getResourcesPath() {
        return PathUtils.getAbsolutePath(applicationContext.context.asAbsolutePath("./resources"));
    }

    static getAuraBundleHelperPath(path) {
        return PathUtils.getAbsolutePath(path.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('Renderer.js', '').replace('Controller.js', '') + 'Helper.js');
    }

    static getAuraBundleControllerPath(path) {
        return PathUtils.getAbsolutePath(path.replace('.cmp', '').replace('.auradoc', '').replace('.svg', '').replace('.css', '').replace('.design', '').replace('.app', '').replace('Renderer.js', '').replace('Helper.js', '') + 'Controller.js');
    }

    static toURI(path) {
        return vscode.Uri.file(PathUtils.getAbsolutePath(path));
    }
}
module.exports = Paths;


/*
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
        return vscode.Uri.file(StrUtils.replace(filePath, '\\', '/'));
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
module.exports = Paths;
*/