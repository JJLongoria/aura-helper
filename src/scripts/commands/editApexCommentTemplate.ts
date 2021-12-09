import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { Paths } from '../core/paths';
import { FileChecker, FileReader, FileWriter } from '@aurahelper/core';
const window = vscode.window;

export function run(): void {
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