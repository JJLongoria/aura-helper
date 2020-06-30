const vscode = require('vscode');
const GUIEngine = require('../guiEngine');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const metadata = require('../metadata');
const NotificationManager = require('../output/notificationManager');
const AppContext = require('../core/applicationContext');
const Window = vscode.window;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const XMLParser = languages.XMLParser;
const FileChecker = fileSystem.FileChecker;
const CustomObjectUtils = metadata.CustomObjectUtils;

let filePath;
let view;

exports.run = function (fileUri) {
    try {
        if (fileUri) {
            filePath = fileUri.fsPath;
        }
        if (!filePath)
            filePath = Paths.getMetadataRootFolder() + '/objects';
        if (FileChecker.isExists(filePath)) {
            let objFolders = FileReader.readDirSync(filePath);
            let objFiles = [];
            for (const folder of objFolders) {
                if (folder.indexOf('.xml') !== -1)
                    objFiles.push({ path: filePath + '/' + folder, objName: folder.substring(0, folder.indexOf('.')) });
                else
                    objFiles.push({ path: filePath + '/' + folder + '/' + folder + '.object-meta.xml', objName: folder });
            }
            let objData = {};
            for (const objFile of objFiles) {
                if (FileChecker.isExists(objFile.path)) {
                    let root = XMLParser.parseXML(FileReader.readFileSync(objFile.path));
                    let sObj = CustomObjectUtils.createCustomObject(root.CustomObject);
                    objData[objFile.objName] = sObj;
                }
            }
            let viewOptions = Engine.getViewOptions();
            viewOptions.title = '{!label.object_manager}';
            viewOptions.showActionBar = true;
            viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
            view = Engine.createView(Routing.CustomObjects, viewOptions);
            view.render(objData, {});
            view.onReceiveMessage(function (message) {
                if (message.command === 'cancel')
                    view.close();
            });
        } else {
            NotificationManager.showError('Objects folder not found in your local project. Retrieve them if you want to use this tool');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
}