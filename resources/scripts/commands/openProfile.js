const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const Metadata = require('../metadata');
const GUIEngine = require('../guiEngine');
const AuraParser = languages.AuraParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const ViewColumn = vscode.ViewColumn;
const window = vscode.window;
const ProfileUtils = Metadata.ProfileUtils;
const MetadataUtils = Metadata.Utils;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;

let view;
exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        let profileName = Paths.getBasename(filePath).replace('.profile-meta.xml', '').replace('.permissionset-meta.xml', '');
        let isPermissionSet = FileChecker.isPermissionSet(filePath);
        let viewOptions = Engine.getViewOptions();
        viewOptions.title = 'Profile: ' + profileName;
        viewOptions.showActionBar = true;
        viewOptions.actions.push(Engine.createButtonAction('saveBtn', 'Save', ["w3-btn w3-border w3-border-green save"], "save()"));
        viewOptions.actions.push(Engine.createButtonAction('saveCompressBtn', 'Compress & Save', ["w3-btn w3-border w3-border-light-green saveCompress"], "compressAndSave()"));
        viewOptions.actions.push(Engine.createButtonAction('cancelBtn', 'Cancel', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
        view = Engine.createView(Routing.Profile, viewOptions);
        view.render(function (resolve) {
            let storageMetadata = MetadataUtils.getMetadataFromFileSystem();
            let root = readProfile(filePath);
            let profileRaw = (root.Profile) ? root.Profile : root.PermissionSet;
            if (profileRaw) {
                let profile = ProfileUtils.createProfile(profileRaw);
                profile = ProfileUtils.mergeProfileWithLocalData(profile, storageMetadata);
                resolve(profile, {
                    name: profileName,
                    isPermissionSet: isPermissionSet
                });
            } else {
                resolve(undefined, {
                    name: profileName,
                    isPermissionSet: isPermissionSet
                });
            }

        });
        view.onReceiveMessage(function (message) {
            if (message.command == 'cancel') {
                view.close();
            } else {
                let xmlContent = ProfileUtils.toXML(message.profile, message.command == 'compressAndSave');
                FileWriter.createFileSync(filePath, xmlContent);
                view.close();
            }
        });
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function readProfile(filePath) {
    return AuraParser.parseXML(FileReader.readFileSync(filePath));
}