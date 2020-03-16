const vscode = require('vscode');
const Config = require('../main/config');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const AuraParser = languages.AuraParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const Window = vscode.window;
const ProfileUtils = Metadata.ProfileUtils;
const PermissionSetUtils = Metadata.PermissionSetUtils;
const MetadataUtils = Metadata.Utils;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
let isPermissionSet;
exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = Window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        let profileName = Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', '');
        isPermissionSet = FileChecker.isPermissionSet(filePath);
        let storageMetadata = MetadataUtils.getMetadataFromFileSystem();
        let root = readProfile(filePath);
        let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
        let viewOptions = Engine.getViewOptions();
        viewOptions.title = profileName;
        viewOptions.showActionBar = true;
        viewOptions.actions.push(Engine.createButtonAction('saveBtn', '{!label.save}', ["w3-btn w3-border w3-border-green save"], "save()"));
        viewOptions.actions.push(Engine.createButtonAction('saveCompressBtn', '{!label.compress_and_save}', ["w3-btn altSave"], "compressAndSave()"));
        viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
        view = Engine.createView((isPermissionSet) ? Routing.PermissionSet : Routing.Profile, viewOptions);
        view.render(function (resolve) {
            if (profileRaw) {
                if (isPermissionSet) {
                    let permSet = PermissionSetUtils.createPermissionSet(profileRaw);
                    if (Config.getConfig().metadata.mergeLocalDataPermissions)
                        permSet = PermissionSetUtils.mergePermissionSetWithLocalData(permSet, storageMetadata);
                    resolve(permSet, {
                        name: profileName,
                    });
                } else {
                    let profile = ProfileUtils.createProfile(profileRaw);
                    if (Config.getConfig().metadata.mergeLocalDataPermissions)
                        profile = ProfileUtils.mergeProfileWithLocalData(profile, storageMetadata);
                    resolve(profile, {
                        name: profileName,
                    });
                }
            } else {
                resolve(undefined, {
                    name: profileName,
                });
            }

        });
        view.onReceiveMessage(function (message) {
            if (message.command == 'cancel') {
                view.close();
            } else {
                if (isPermissionSet) {
                    let xmlContent = PermissionSetUtils.toXML(message.permSet, message.command == 'compressAndSave');
                    FileWriter.createFileSync(filePath, xmlContent);
                    view.close();
                } else {
                    let xmlContent = ProfileUtils.toXML(message.profile, message.command == 'compressAndSave');
                    FileWriter.createFileSync(filePath, xmlContent);
                    view.close();
                }
            }
        });
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function readProfile(filePath) {
    return AuraParser.parseXML(FileReader.readFileSync(filePath));
}