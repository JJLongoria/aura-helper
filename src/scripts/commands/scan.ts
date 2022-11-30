import { CoreUtils, FileChecker, PathUtils, ProcessFactory, ProcessHandler } from '@aurahelper/core';
import { StrUtils } from '@aurahelper/core/dist/utils';
import * as vscode from 'vscode';
import { Config } from '../core/config';
import { Paths } from '../core/paths';
import { DiagnosticsManager, NotificationManager } from '../output';

interface ScannerResponse {
    status: number;
    result: ScannerFileResult[];
    message?: string;
    warnings?: string[]
}

interface ScannerFileResult {
    engine: string;
    fileName: string;
    violations: ScannerResult[]
}

interface ScannerResult {
    line: string;
    column: string;
    endLine: string;
    endColumn: string;
    severity: number;
    ruleName: string;
    category: string;
    url: string;
    message: string;
    normalizedSeverity?: number;
}

export function run(fileUri: vscode.Uri): void {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = vscode.window.activeTextEditor;
            if (editor){
                filePath = editor.document.uri.fsPath;
            }
        }
        if (filePath) {
            scan(filePath);
        } else {
            NotificationManager.showError('Any file or folder selected or opened on editor to scan');
        }
    } catch (error) {
        NotificationManager.showCommandError(error);
    }
};

function scan(filePath: string) {
    let editor = vscode.window.activeTextEditor;
    if (!FileChecker.isFile(filePath) || (editor && editor.document.uri.fsPath === filePath)) {
        runScanner(filePath, () => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Installing SFDX Scanner',
                cancellable: false
            }, async () => { 
                try {
                    const process = ProcessFactory.installUpdateSFDXScanner();
                    const response = await ProcessHandler.runProcess(process) as ScannerResponse;
                    NotificationManager.showInfo(`SFDX Scanner is now installed. Try to run scan command again`);
                } catch (error) {
                    NotificationManager.showInfo(`SFDX Scanner is now installed. Try to run scan command again`);
                }
                
            });
        });
    } else {
        vscode.window.showTextDocument(Paths.toURI(filePath)).then(() => runScanner(filePath, () => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Installing SFDX Scanner",
                cancellable: false
            }, async () => { 
                const process = ProcessFactory.installUpdateSFDXScanner();
                const response = await ProcessHandler.runProcess(process) as ScannerResponse;
                NotificationManager.showInfo(`SFDX Scanner is now installed. Try to run scan command again`);
            });
        }));
    }
}

function runScanner(filePath: string, installCallback: any){
    vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Analizing File " + filePath,
		cancellable: false
	}, async () => { 
        let pdmRuleSetFile;
        let esLintRuleSetFile;
        if(Config.getConfig().metadata.scanPmdRuleSet){
            try {
                pdmRuleSetFile = PathUtils.getAbsolutePath(Config.getConfig().metadata.scanPmdRuleSet);
                if(!FileChecker.isExists(pdmRuleSetFile)){
                    NotificationManager.showError(`The PDM Rules file ${pdmRuleSetFile} does not exists`);
                }
            } catch (error) {
                NotificationManager.showError(`Wrong path ${pdmRuleSetFile} to the PDM rule set`);
            }
        }
        if(Config.getConfig().metadata.scanEsLintRuleSet){
            try {
                esLintRuleSetFile = PathUtils.getAbsolutePath(Config.getConfig().metadata.scanEsLintRuleSet);
                if(!FileChecker.isExists(esLintRuleSetFile)){
                    NotificationManager.showError(`The PDM Rules file ${esLintRuleSetFile} does not exists`);
                }
            } catch (error) {
                NotificationManager.showError(`Wrong path ${esLintRuleSetFile} to the PDM rule set`);
            }
        }
        try {
            const process = ProcessFactory.runScanner(filePath, Config.getConfig().metadata.scanCategories);
            const response = await ProcessHandler.runProcess(process) as ScannerResponse;   
            if(response.status === 0){
                console.log(response);
                if(response.result.length > 0){
                    let totalProbles = 0;
                    for(const fileProblem of response.result){
                        let diags = [];
                        let path: vscode.Uri | undefined;
                        path = Paths.toURI(fileProblem.fileName);
                        const fileName = PathUtils.getBasename(fileProblem.fileName);
                        for(const problem of fileProblem.violations){
                            const endColumn = problem.line !== problem.endLine ? problem.line + 5: problem.endColumn;
                            const range = new vscode.Range(parseInt(problem.line) - 1, parseInt(problem.column) - 1, parseInt(problem.line) - 1, parseInt(endColumn));
                            const diagnostic = new vscode.Diagnostic(range, `${problem.message}Category: ${problem.category}\nViolation: ${problem.ruleName}: ${problem.url}`, vscode.DiagnosticSeverity.Warning);
                            diagnostic.source = 'SFDX Scanner';
                            diagnostic.code = fileName + '_' + problem.line + ':' + problem.column + '_' + problem.ruleName;
                            /*diagnostic.relatedInformation = [
                                new vscode.DiagnosticRelatedInformation(new vscode.Location(path, range), problem.message)
                            ];*/
                            diags.push(diagnostic);
                        }
                        totalProbles += fileProblem.violations.length;
                        DiagnosticsManager.setDiagnostics("scan", path, diags);
                    }
                    NotificationManager.showWarning(`Found ${totalProbles} problems across ${response.result.length} files. View Problems panel to get more info`);
                } else {
                    NotificationManager.showInfo(`No problems found`);
                }
            } else {
                NotificationManager.showError(`An error ocurred while scaning ${filePath}.\n${response.message}`);
            }
        } catch (error) {
            if(CoreUtils.Utils.isString(error) && StrUtils.containsIgnorecase(error as string, 'scanner:run is not a sfdx command')){
                
                NotificationManager.showConfirmDialog('SFDX Scanner is not installed. Do you want to install now?', async () => {
                    if(installCallback){
                        installCallback();
                    }
                }, () => {
                    NotificationManager.showWarning(`"AuraHelper: Scan" command will not work until install SFDX Scanner`);
                });
            } else {
                NotificationManager.showError(`An error ocurred while scaning ${filePath}.\n${error}`);
            }
        }
    });

}