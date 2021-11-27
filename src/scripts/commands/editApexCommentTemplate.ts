import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { Paths } from '../core/paths';
const { FileChecker, FileWriter, FileReader } = require('@aurahelper/core').FileSystem;
const window = vscode.window;

export function run() {
    try {
        const templatePath = Paths.getApexCommentUserTemplate();
        if (!FileChecker.isExists(templatePath)) {
            FileWriter.createFileSync(templatePath, JSON.parse(FileReader.readFileSync(Paths.getApexCommentBaseTemplate())));
        }
        window.showTextDocument(Paths.toURI(templatePath));
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
};