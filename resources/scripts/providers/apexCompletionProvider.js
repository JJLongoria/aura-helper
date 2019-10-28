const fileSystem = require('../fileSystem');
const logger = require('../main/logger');
const Utils = require('./utils').Utils;
const languages = require('../languages');
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const langUtils = languages.Utils;
const ApexParser = languages.ApexParser;
exports.provider = {
    provideCompletionItems(document, position) {
        let items;
        if (FileChecker.isApexClass(document.uri.fsPath) || FileChecker.isApexTrigger(document.uri.fsPath)) {
            items = provideApexCompletion(document, position);
        }
        return Promise.resolve(items);
    }
}


function provideApexCompletion(document, position) {
    let items;
    const line = document.lineAt(position.line).text;
    if (!line.trim().startsWith('/**')) {
        let activation = Utils.getActivation(document, position);
        let activationTokens = getActivationTokens(activation);
        let queryData = langUtils.getQueryData(document, position);
        let fileStructure = ApexParser.parse(FileReader.readDocument(document), position);
        let classes = Utils.getClassesFromClassFolder(document);
        let systemMetadata = Utils.getNamespaceMetadataFile('System');
        let namespacesMetadata = Utils.getNamespacesMetadataFile();
        let sObjects = Utils.getObjectsFromMetadataIndex();
        if (queryData) {
            items = Utils.getQueryCompletionItems(activationTokens, queryData, position, 'aurahelper.completion.apex');
        } else if (activationTokens.length > 1) {
            items = Utils.getApexCompletionItems(document, position, activationTokens, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        } else {
            items = Utils.getAllAvailableCompletionItems(position, fileStructure, classes, systemMetadata, namespacesMetadata, sObjects);
        }
    }
    return items;
}

function getActivationTokens(activation) {
    let activationTokens = [];
    if (activation.startsWith('this.'))
        activation = activation.replace('this.', '');
    if (activation.indexOf('.') !== -1)
        activationTokens = activation.split('.');
    else if (activation.length > 0)
        activationTokens.push(activation);
    return activationTokens;
}