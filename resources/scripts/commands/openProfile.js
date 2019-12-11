const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const metadataUtils = require('../metadataUtils');
const AuraParser = languages.AuraParser;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const ViewColumn = vscode.ViewColumn;
const window = vscode.window;
const ProfileUtils = metadataUtils.ProfileUtils;
const MtUtils = metadataUtils.Utils;

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
        let profileName = Paths.getBasename(filePath).replace('.profile-meta.xml', '');
        const panel = window.createWebviewPanel('Profile', 'Profile: ' + profileName, ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = getProfilePage();
        setTimeout(() => {
            let storageMetadata = MtUtils.getMetadataFromFileSystem();
            let root = readProfile(filePath);
            if (root.Profile) {
                let profile = ProfileUtils.createProfile(root.Profile);
                profile = ProfileUtils.mergeProfileWithLocalData(profile, storageMetadata);
                panel.webview.postMessage({ name: profileName, profile: profile });
            } else {
                panel.webview.postMessage({ name: profileName });
            }
        }, 1500);

        panel.webview.onDidReceiveMessage(
            message => {
                if (message.command == 'cancel') {
                    panel.dispose();
                } else {
                    let xmlContent = ProfileUtils.toXML(message.profile, message.command == 'compressAndSave');
                    FileWriter.createFileSync(filePath, xmlContent);
                    panel.dispose();
                }
            },
            undefined,
            []
        );
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function getProfilePage() {
    return FileReader.readFileSync(Paths.getProfilePage());
}

function readProfile(filePath) {
    return AuraParser.parseXML(FileReader.readFileSync(filePath));
}