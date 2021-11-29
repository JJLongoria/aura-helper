import * as vscode from 'vscode';
import { applicationContext } from '../core/applicationContext';
import { Paths } from "../core/paths";
import { Config } from "../core/config";
import { OutputChannel } from "../output/outputChannnel";
const Connection = require('@aurahelper/connector');

export class ProjectFilesWatcher {

    static startWatching(): void {
        registerSFDXConfigFileWatcher();
    }

}

function registerSFDXConfigFileWatcher(): void {
    const projectConfigWatcher = vscode.workspace.createFileSystemWatcher("**/sfdx-config.json");
    projectConfigWatcher.onDidChange(async function () {
        const username = Config.getOrgAlias();
        if (username) {
            const connection = new Connection(username, Config.getAPIVersion(), Paths.getProjectFolder(), Config.getNamespace());
            connection.setMultiThread();
            OutputChannel.outputLine('Getting Org data...');
            setTimeout(async () => {
                try {
                    applicationContext.sfData.username = await connection.getAuthUsername();
                    applicationContext.sfData.serverInstance = await connection.getServerInstance();
                    const orgRecord = await connection.query('Select Id, NamespacePrefix from Organization');
                    if (orgRecord && orgRecord.length > 0) {
                        applicationContext.sfData.namespace = orgRecord[0].NamespacePrefix;
                    }
                } catch (error) {

                }
            }, 50);
        }
    });
}