const vscode = require('vscode');
const { FileChecker, FileWriter, FileReader } = require('@ah/core').FileSystem;
const NotificationManager = require('../output/notificationManager');
const window = vscode.window;
const Paths = require('../core/paths');

exports.run = function () {
    try {
        const templatePath = Paths.getApexCommentUserTemplate();
        if (!FileChecker.isExists(templatePath))
            FileWriter.createFileSync(templatePath, JSON.parse(FileReader.readFileSync(Paths.getApexCommentBaseTemplate())));
        window.showTextDocument(Paths.toURI(templatePath));
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
}