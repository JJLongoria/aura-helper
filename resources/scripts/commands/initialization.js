const fileSystem = require('../fileSystem');
const FileChecker = fileSystem.FileChecker;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const FileWriter= fileSystem.FileWriter;

const applicationContext = require('../main/applicationContext');

exports.run = function(context) {
    console.log('Aura Helper Extension is now active');
    console.log('Aura Helper Init files');
    applicationContext.context = context;
    init(context, function () {
        console.log('Aura Helper files initialized');
    });
}

async function init(context, callback) {
    setTimeout(() => {
        applicationContext.componentsDetail = JSON.parse(FileReader.readFileSync(Paths.getBaseComponentsDetailPath()));
        let loadedSnippets = loadSnippets();
        applicationContext.auraSnippets = loadedSnippets.auraSnippets;
        applicationContext.jsSnippets = loadedSnippets.jsSnippets;
        applicationContext.sldsSnippets = loadedSnippets.sldsSnippets;
        if (!FileChecker.isExists(context.storagePath))
            FileWriter.createFolderSync(context.storagePath);
        if (!FileChecker.isExists(Paths.getUserTemplatesPath()))
            FileWriter.createFolderSync(Paths.getUserTemplatesPath());
        if (!FileChecker.isExists(Paths.getAuraDocumentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getAuraDocumentTemplatePath(), Paths.getAuraDocumentUserTemplatePath());
        if (!FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getApexCommentTemplatePath(), Paths.getApexCommentUserTemplatePath());
        if (!FileChecker.isExists(Paths.getMetadataIndexPath()))
            FileWriter.createFolderSync(Paths.getMetadataIndexPath());
        if (FileChecker.isExists(Paths.getOldApexCommentTemplatePath()) && !FileChecker.isExists(Paths.getApexCommentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getOldApexCommentTemplatePath(), Paths.getApexCommentUserTemplatePath());
        if (FileChecker.isExists(Paths.getOldAuraDocumentUserTemplatePath()) && !FileChecker.isExists(Paths.getAuraDocumentUserTemplatePath()))
            FileWriter.copyFileSync(Paths.getOldAuraDocumentUserTemplatePath(), Paths.getAuraDocumentUserTemplatePath());
        if (callback)
            callback.call(this);
    }, 50);
}

function loadSnippets() {
    let auraSnippets = JSON.parse(FileReader.readFileSync(Paths.getAuraSnippetsPath()));
    let jsSnippets = JSON.parse(FileReader.readFileSync(Paths.getJSSnippetsPath()));
    let sldsSnippets = JSON.parse(FileReader.readFileSync(Paths.getSLDSSnippetsPath()));
    let auraActivations = {};
    let jsActivations = {};
    let sldsActivations = {};
    Object.keys(auraSnippets).forEach(function (key) {
        let obj = auraSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!auraActivations[activation])
                auraActivations[activation] = [];
            auraActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!auraActivations[activation])
                auraActivations[activation] = [];
            auraActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    Object.keys(jsSnippets).forEach(function (key) {
        let obj = jsSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!jsActivations[activation])
                jsActivations[activation] = [];
            jsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!jsActivations[activation])
                jsActivations[activation] = [];
            jsActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    Object.keys(sldsSnippets).forEach(function (key) {
        let obj = sldsSnippets[key];
        let activation;
        if (obj && obj.prefix && "string" === typeof obj.prefix) {
            activation = obj.prefix.split(".")[0];
            if (!sldsActivations[activation])
                sldsActivations[activation] = [];
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix,
                body: obj.body,
                description: obj.description,
                alt: undefined
            });
        } else {
            activation = obj.prefix[0].split(".")[0];
            if (!sldsActivations[activation])
                sldsActivations[activation] = [];
            sldsActivations[activation].push({
                name: key,
                prefix: obj.prefix[0],
                body: obj.body,
                description: obj.description,
                alt: obj.prefix[1]
            });
        }
    });
    return {
        auraSnippets: auraActivations,
        jsSnippets: jsActivations,
        sldsSnippets: sldsActivations
    }
}