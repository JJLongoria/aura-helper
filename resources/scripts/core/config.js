const vscode = require('vscode');
const fileSystem = require('../fileSystem');
const ProcessManager = require('../processes').ProcessManager;
const Paths = fileSystem.Paths;
const FileReader = fileSystem.FileReader;
const HTTPConnection = require('./httpConnection');
const AppContext = require('./applicationContext');
const os = require('os');

class Config {

    static getConfig() {
        return vscode.workspace.getConfiguration('aurahelper');
    }

    static getAuthUsername() {
        return new Promise(async function (resolve, reject) {
            let defaultUsername = JSON.parse(FileReader.readFileSync(Paths.getSFDXFolderPath() + '/sfdx-config.json')).defaultusername;
            let out = await ProcessManager.getAuthOrgs();
            if (out) {
                if (out.stdOut) {
                    let listOrgsResult = JSON.parse(out.stdOut);
                    let username;
                    if (listOrgsResult.status === 0) {
                        for (const org of listOrgsResult.result) {
                            if (defaultUsername.indexOf('@') !== -1) {
                                if (org.username && org.username.toLowerCase().trim() === defaultUsername.toLowerCase().trim())
                                    username = org.username;
                            } else {
                                if (org.alias && org.alias.toLowerCase().trim() === defaultUsername.toLowerCase().trim())
                                    username = org.username;
                            }
                            if (!username && ((org.username && org.username.toLowerCase().trim() === defaultUsername.toLowerCase().trim()) || (org.alias && org.alias.toLowerCase().trim() === defaultUsername.toLowerCase().trim())))
                                username = org.username;
                        }
                    }
                    resolve(username);
                } else {
                    reject(out.stdErr);
                }
            } else {
                reject('Unknown Error');
            }
        });
    }

    static getServerInstance(username) {
        return new Promise(async function (resolve, reject) {
            let out = await ProcessManager.getAuthOrgs();
            if (out) {
                if (out.stdOut) {
                    let listOrgsResult = JSON.parse(out.stdOut);
                    if (listOrgsResult.status === 0) {
                        for (const org of listOrgsResult.result) {
                            if (org.username === username) {
                                resolve(org.instanceUrl);
                            }
                        }
                    }
                    resolve(undefined);
                } else {
                    reject(out.stdErr);
                }
            } else {
                reject('Unknown Error');
            }
        });
    }

    static getOrgAvailableVersions(instance) {
        return new Promise(async function (resolve) {
            let data = await HTTPConnection.makeGETRequest(instance + '/services/data');
            resolve(JSON.parse(data));
        });
    }

    static getLastVersion() {
        let lastVersion = (AppContext.orgAvailableVersions && AppContext.orgAvailableVersions.length > 0) ? AppContext.orgAvailableVersions[AppContext.orgAvailableVersions.length - 1].version : undefined;
        return (lastVersion) ? parseInt(lastVersion) : lastVersion;
    }

    static getOrgAlias() {
        return JSON.parse(FileReader.readFileSync(Paths.getSFDXFolderPath() + '/sfdx-config.json')).defaultusername;
    }

    static getOrgVersion() {
        if (Config.getConfig().metadata.useCustomAPIVersion) {
            return (Config.getConfig().metadata.CustomAPIVersion).toString() + '.0';
        }
        return JSON.parse(FileReader.readFileSync(Paths.getWorkspaceFolder() + '/sfdx-project.json')).sourceApiVersion;
    }

    static getOrgNamespace() {
        return JSON.parse(FileReader.readFileSync(Paths.getSFDXFolderPath() + '/sfdx-config.json')).namespace;
    }

    static getAvailableCPUs() {
        let cpus = os.cpus().length;
        if (cpus > 1)
            cpus -= 1;
        return cpus;
    }

    static isLinux() {
        return os.platform() === 'linux';
    }

    static isWindows() {
        return os.platform() === 'win32';
    }

    static isMac() {
        return os.platform() === 'darwin';
    }


}
module.exports = Config;