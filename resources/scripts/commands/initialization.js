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
    }, 250);
}