import * as vscode from 'vscode';
import { NotificationManager } from '../output';
import { Paths } from '../core/paths';
const { FileChecker, FileWriter, FileReader } = require('@aurahelper/core').FileSystem;
const window = vscode.window;

export function run(): void {
    try {
        const templatePath = Paths.getAuraDocUserTemplate();
        if (!FileChecker.isExists(templatePath)) {
            FileWriter.createFileSync(templatePath, JSON.parse(FileReader.readFileSync(Paths.getAuraDocBaseTemplate())));
        }
        window.showTextDocument(Paths.toURI(templatePath));
    }
    catch (error) {
        NotificationManager.showCommandError(error);
    }
};