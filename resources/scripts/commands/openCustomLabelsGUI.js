const vscode = require('vscode');
const Logger = require('../main/logger');
const Config = require('../main/config');
const GUIEngine = require('../guiEngine');
const fileSystem = require('../fileSystem');
const languages = require('../languages');
const metadata = require('../metadata');
const Process = require('../processes').Process;
const Window = vscode.window;
const Engine = GUIEngine.Engine;
const Routing = GUIEngine.Routing;
const FileReader = fileSystem.FileReader;
const Paths = fileSystem.Paths;
const AuraParser = languages.AuraParser;
const FileChecker = fileSystem.FileChecker;
const CustomLabelsUtils = metadata.CustomLabelsUtils;
const FileWriter = fileSystem.FileWriter;
const MetadataFactory = metadata.Factory;
const PackageGenerator = metadata.PackageGenerator;
const ProgressLocation = vscode.ProgressLocation;

let view;
let CustomLabels;
let filePath;
exports.run = function (fileUri) {
    try {
        /*if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = Window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }*/
        if (!filePath)
            filePath = Paths.getMetadataRootFolder() + '/labels/CustomLabels.labels-meta.xml'
        if (FileChecker.isExists(filePath)) {
            let customLabelsRoot = AuraParser.parseXML(FileReader.readFileSync(filePath));
            CustomLabels = customLabelsRoot.CustomLabels;
            let viewOptions = Engine.getViewOptions();
            viewOptions.title = '{!label.custom_labels}';
            viewOptions.showActionBar = true;
            viewOptions.actions.push(Engine.createButtonAction('newCustomLabelBtn', '{!label.new_custom_label}', ["w3-btn w3-border w3-border-green save"], "onClickNewLabel()"));
            viewOptions.actions.push(Engine.createButtonAction('cancelBtn', '{!label.cancel}', ["w3-btn w3-border w3-border-red cancel"], "cancel()"));
            view = Engine.createView(Routing.CustomLabels, viewOptions);
            view.render(function (resolve) {
                let labels = [];
                if (Array.isArray(CustomLabels.labels))
                    labels = CustomLabels.labels;
                else
                    labels.push(CustomLabels.labels);
                resolve(labels);
            });
            view.onReceiveMessage(function (message) {
                if (message.command === 'delete')
                    deleteLabel(message.labels, message.index);
                else if (message.command === 'cancel')
                    view.close();
                else if (message.command === 'new')
                    newLabel(message.labels, message.label);
                else if (message.command === 'edit')
                    editLabel(message.labels, message.label);
            });
        } else {
            Window.showErrorMessage('Custom Labels file not found in your local project. Retrieve them if you want to use this tool');
        }
    } catch (error) {
        Window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function deleteLabel(labels, index) {
    let labelToDelete = labels[index];
    Window.showQuickPick(['Yes', 'No'], {
        placeHolder: "Delete " + labelToDelete.fullName + " label. Are you sure?"
    }).then(selected => {
        if (selected === 'Yes') {
            let metadataTypes = {
                "CustomLabel": MetadataFactory.createMetadataType("CustomLabel", true)
            };
            metadataTypes["CustomLabel"].childs[labelToDelete.fullName] = MetadataFactory.createMetadataObject(labelToDelete.fullName, true);
            let version = Config.getOrgVersion();
            let user = Config.getAuthUsername();
            let packageContent = PackageGenerator.createPackage({}, version, true);
            let destructivePackageContent = PackageGenerator.createPackage(metadataTypes, version, true);
            let folder = Paths.getDestructivePackageFolder();
            if (FileChecker.isExists(folder))
                FileWriter.delete(folder);
            FileWriter.createFolderSync(folder);
            FileWriter.createFileSync(folder + '/package.xml', packageContent);
            FileWriter.createFileSync(folder + '/destructiveChanges.xml', destructivePackageContent);
            Window.withProgress({
                location: ProgressLocation.Notification,
                title: "Deleting Custom Label from Org",
                cancellable: true
            }, (progress, token) => {
                return new Promise(promiseResolve => {
                    setTimeout(() => {
                        try {
                            Process.destructiveChanges(user, folder);
                            labels.splice(index, 1);
                            CustomLabels.labels = labels;
                            FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(CustomLabels), true));
                            view.postMessage({ command: "deleted", model: CustomLabels.labels });
                            Window.showInformationMessage("Label " + labelToDelete.fullName + " deleted succesfully");
                        } catch (error) {
                            Window.showErrorMessage("An error ocurred while deleting Custom Label: " + error);
                        }
                        promiseResolve();
                    }, 100);
                });
            });
        }
    });
}

function newLabel(labels, newLabel) {
    let exists = false;
    for (const existingLabel of labels) {
        if (existingLabel.fullName === newLabel.fullName) {
            exists = true;
            break;
        }
    }
    if (exists)
        Window.showErrorMessage("Can't create two labels with the same Name");
    else {
        labels.push(newLabel);
        CustomLabels.labels = labels;
        FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(CustomLabels), true));
        view.postMessage({ command: "created", model: CustomLabels.labels });
        Window.showInformationMessage("Label " + newLabel.fullName + " created succesfully");
    }
}

function editLabel(labels, editLabel) {
    let index = 0;
    let labelIndex = 0;
    for (const label of labels) {
        if (editLabel.fullName === label.fullName)
            labelIndex = index;
        index++;
    }
    labels[labelIndex] = editLabel;
    CustomLabels.labels = labels;
    FileWriter.createFileSync(filePath, CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(CustomLabels), true));
    view.postMessage({ command: "edited", model: CustomLabels.labels });
    Window.showInformationMessage("Label " + editLabel.fullName + " edited succesfully");
}