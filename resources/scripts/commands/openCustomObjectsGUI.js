const vscode = require('vscode');
const Logger = require('../main/logger');
const Config = require('../main/config');
const GUIEngine = require('../guiEngine');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const metadata = require('../metadata');
const ProcessManager = require('../processes').ProcessManager;
const ProcessEvent = require('../processes').ProcessEvent;
const Window = vscode.window;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const AuraParser = languages.AuraParser;
const FileChecker = fileSystem.FileChecker;
const FileWriter = fileSystem.FileWriter;
const MetadataFactory = metadata.Factory;
const PackageGenerator = metadata.PackageGenerator;
const ProgressLocation = vscode.ProgressLocation;
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
                    let root = AuraParser.parseXML(FileReader.readFileSync(objFile.path));
                    let sObj = CustomObjectUtils.createCustomObject(root.CustomObject);
                    objData[objFile.objName] = sObj;
                }
            }
            let viewOptions = Engine.getViewOptions();
            viewOptions.title = '{!label.object_manager}';
            viewOptions.showActionBar = true;
            viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
            view = Engine.createView(Routing.CustomObjects, viewOptions);
            view.render(function (resolve) {
                resolve(objData);
            });
            view.onReceiveMessage(function (message) {
                if (message.command === 'cancel')
                    view.close();
            });
        } else {
            Window.showErrorMessage('Objects folder not found in your local project. Retrieve them if you want to use this tool');
        }
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}