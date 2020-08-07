const Logger = require('../utils/logger');
const Process = require('./process');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const ProcessEvent = require('./processEvent');
var Config = require('../core/config');
const Output = require('../output');
const OutputChannel = Output.OutputChannel;

const BUFFER_SIZE = 1024 * 500000;
let process;
class ProcessManager {

    static killProcess() {
        if (process)
            process.kill();
    }

    static getAuthOrgs() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('sfdx');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'sfdx';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('force:auth:list');
        commandArgs.push('--json');
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static describeSchemaMetadata(user, metadataType, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('sfdx');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'sfdx';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('force:schema:sobject:describe');
        commandArgs.push('--json');
        commandArgs.push('-u');
        commandArgs.push(user);
        commandArgs.push('-s');
        commandArgs.push(metadataType);
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static destructiveChanges(user, destructiveFolder, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('sfdx');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'sfdx';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('force:mdapi:deploy');
        commandArgs.push('--json');
        commandArgs.push('-u');
        commandArgs.push(user);
        commandArgs.push('-d');
        commandArgs.push('' + destructiveFolder + '');
        commandArgs.push('-w');
        commandArgs.push('-1');
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static deployReport(user, jobId, cancelToken, callback) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('sfdx');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'sfdx';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('force:mdapi:deploy:report');
        commandArgs.push('--json');
        commandArgs.push('-u');
        commandArgs.push(user);
        commandArgs.push('-i');
        commandArgs.push(jobId);
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static cancelDeploy(user, jobId, cancelToken, callback) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('sfdx');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'sfdx';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('mdapi:deploy:cancel');
        commandArgs.push('--json');
        commandArgs.push('-u');
        commandArgs.push(user);
        commandArgs.push('-i');
        commandArgs.push(jobId);
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static gitLog() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('git');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'git';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('log');
        commandArgs.push('--pretty=medium');
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static gitGetBranches() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('git');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'git';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('branch');
        commandArgs.push('-a');
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static gitFetch() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('git');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'git';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('fetch');
        let process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperCompressFolder(folder, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:local:compress');
        commandArgs.push('--json');
        commandArgs.push('-d');
        commandArgs.push('' + folder + '');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperCompressFile(file, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:local:compress');
        commandArgs.push('-f');
        commandArgs.push('' + file + '');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperOrgCompare(output, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:org:compare');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperOrgCompareBetween(options, output, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:org:compare:between');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.source) {
            commandArgs.push('-s');
            commandArgs.push(options.source);
        }
        if (options.target) {
            commandArgs.push('-t');
            commandArgs.push(options.target);
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperDescribeMetadata(options, output, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        if (options.fromOrg)
            commandArgs.push('metadata:org:describe');
        else
            commandArgs.push('metadata:local:describe');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.types) {
            commandArgs.push('-t');
            commandArgs.push(options.types.join(','));
        } else {
            commandArgs.push('-a');
        }
        if (options.orgNamespace)
            commandArgs.push('-o');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperRetriveAllSpecials(options, output, cancelToken) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        if (options.fromOrg)
            commandArgs.push('metadata:org:retrieve:special');
        else
            commandArgs.push('metadata:local:retrieve:special');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.orgNamespace)
            commandArgs.push('-o');
        if (options.compress)
            commandArgs.push('-c');
        if (options.includeOrg)
            commandArgs.push('-i');
        if (options.types) {
            commandArgs.push('-t');
            commandArgs.push(options.types.join(','));
        } else
            commandArgs.push('-a');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperRepairDependencies(options, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:local:repair');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.onlyCheck)
            commandArgs.push('-o');
        if (options.compress)
            commandArgs.push('-c');
        if (options.types) {
            commandArgs.push('-t');
            commandArgs.push(options.types.join(','));
        } else
            commandArgs.push('-a');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperLoadPermissions(options, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:org:permissions');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.version) {
            commandArgs.push('-v');
            commandArgs.push(options.version);
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperPackageGenerator(options, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:local:package:create');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.version) {
            commandArgs.push('-v');
            commandArgs.push(options.version);
        }
        if (options.outputPath) {
            commandArgs.push('-o');
            commandArgs.push(options.outputPath);
        }
        if (options.createType) {
            commandArgs.push('-c');
            commandArgs.push(options.createType);
        }
        if (options.createFrom) {
            commandArgs.push('-f');
            commandArgs.push(options.createFrom);
        }
        if (options.deleteOrder) {
            commandArgs.push('-d');
            commandArgs.push(options.deleteOrder);
        }
        if (options.source) {
            commandArgs.push('-s');
            commandArgs.push(options.source);
        }
        if (options.target) {
            commandArgs.push('-t');
            commandArgs.push(options.target);
        }
        if (options.useIgnore) {
            commandArgs.push('-u');
            commandArgs.push(options.useIgnore);
        }
        if (options.ignoreFile) {
            commandArgs.push('-i');
            commandArgs.push(options.ignoreFile);
        }
        if (options.raw) {
            commandArgs.push('-r');
        }
        if (options.explicit) {
            commandArgs.push('-e');
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperIgnore(options, output) {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('metadata:local:ignore');
        commandArgs.push('-p');
        commandArgs.push('plaintext');
        if (options.types) {
            commandArgs.push('-t');
            commandArgs.push(options.types);
        }
        if (options.ignoreFile) {
            commandArgs.push('-i');
            commandArgs.push(options.ignoreFile);
        }
        if (options.compress) {
            commandArgs.push('-c');
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static isAuraHelperInstalled() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, false).then(function (stdOut) {
                resolve(true);
            }).catch(function (stdErr) {
                resolve(false);
            });
        });
    }

    static auraHelperVersion() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('version');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE });
        return new Promise(function (resolve) {
            runProcess(process, false).then(function (stdOut) {
                resolve(stdOut);
            }).catch(function (stdErr) {
                resolve(stdErr);
            });
        });
    }

    static updateAuraHelper() {
        Config = require('../core/config');
        let command;
        let commandArgs = [];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('aura-helper');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'aura-helper';
        } else {
            throw new Error('Operative System Not Supported');
        }
        commandArgs.push('update');
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE });
        return new Promise(function (resolve) {
            runProcess(process, false).then(function (stdOut) {
                resolve(stdOut);
            }).catch(function (stdErr) {
                ProcessManager.updateAuraHelperNPM().then((childStdOut) => {
                    resolve(childStdOut);
                }).catch((childStdErr) => {
                    resolve(childStdErr);
                });
            });
        });
    }

    static updateAuraHelperNPM() {
        Config = require('../core/config');
        let command;
        let commandArgs = ['update', '-g', 'aura-helper-cli'];
        if (Config.isWindows()) {
            command = 'cmd';
            commandArgs.push('/c');
            commandArgs.push('npm');
        } else if (Config.isLinux() || Config.isMac()) {
            command = 'npm';
        } else {
            throw new Error('Operative System Not Supported');
        }
        process = new Process(command, commandArgs, { maxBuffer: BUFFER_SIZE });
        return new Promise(function (resolve) {
            runProcess(process, false).then(function (stdOut) {
                resolve(stdOut);
            }).catch(function (stdErr) {
                resolve(stdErr);
            });
        });
    }
}
module.exports = ProcessManager;

function getResponse(out) {
    if (out) {
        return out.substring(out.indexOf('{'));
    }
    return out;
}

function runProcess(process, output) {
    let stdOut = '';
    let stdErr = '';
    return new Promise(function (resolve, rejected) {
        process.run(function (event, data) {
            if (output && data && data.length > 0)
                OutputChannel.output(data.toString());
            switch (event) {
                case ProcessEvent.STD_OUT:
                    stdOut += data;
                    break;
                case ProcessEvent.ERR_OUT:
                    stdErr += data;
                    break;
                case ProcessEvent.KILLED:
                    resolve();
                    break;
                case ProcessEvent.END:
                    if (stdErr.length > 0) {
                        rejected(stdErr);
                    } else {
                        resolve(stdOut);
                    }
                    break;
                default:
                    break;
            }
        });
    });
}
