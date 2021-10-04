const vscode = require('vscode');
const Config = require('../core/config');
const Connection = require('@aurahelper/connector');
const applicationContext = require('../core/applicationContext');
const Paths = require('../core/paths');
const OutputChannel = require('../output/outputChannnel');
const { FileWriter, PathUtils } = require('@aurahelper/core').FileSystem;

class ProjectFilesWatcher {

    static startWatching() {
        registerSFDXConfigFileWatcher();
    }

}
module.exports = ProjectFilesWatcher;

function registerSFDXConfigFileWatcher() {
    const projectConfigWatcher = vscode.workspace.createFileSystemWatcher("**/sfdx-config.json");
    projectConfigWatcher.onDidChange(async function (uri) {
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