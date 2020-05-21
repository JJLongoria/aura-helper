const Logger = require('../utils/logger');
const Process = require('./process');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const ProcessEvent = require('./processEvent');
const Config = require('../core/config');

const BUFFER_SIZE = 1024 * 500000;
let process;
class ProcessManager {

    static killProcess() {
        if (process)
            process.kill();
    }

    static listAuthOurgs(callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:auth:list', '--json'], { maxBuffer: BUFFER_SIZE });
        process.run(callback);
        return process;
    }

    static describeSchemaMetadata(user, metadataType, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:schema:sobject:describe', '--json', '-u', user, '-s', metadataType], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static destructiveChanges(user, destructiveFolder, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:deploy', '--json', '-u', user, '-d', '' + destructiveFolder + '', '-w', '-1'], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static deployReport(user, jobId, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:deploy:report', '--json', '-u', user, '-i', jobId], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static cancelDeploy(user, jobId, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'mdapi:deploy:cancel', '--json', '-u', user, '-i', jobId], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static gitLog() {
        let process = new Process('cmd', ['/c', 'git', 'log', '--pretty=medium'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static gitGetBranches() {
        let process = new Process('cmd', ['/c', 'git', 'branch', '-a'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static gitFetch() {
        let process = new Process('cmd', ['/c', 'git', 'fetch'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperCompressFolder(folder, output) {
        process = new Process('cmd', ['/c', 'aura-helper', 'metadata:local:compress', '-d', '' + folder + '', '-p', 'plaintext'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperCompressFile(file, output) {
        process = new Process('cmd', ['/c', 'aura-helper', 'metadata:local:compress', '-f', '' + file + '', '-p', 'plaintext'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperOrgCompare(output, cancelToken) {
        process = new Process('cmd', ['/c', 'aura-helper', 'metadata:org:compare', '-p', 'plaintext'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperDescribeMetadata(options, output, cancelToken) {
        let command;
        if (options.fromOrg)
            command = ['/c', 'aura-helper', 'metadata:org:describe', '-p', 'plaintext'];
        else
            command = ['/c', 'aura-helper', 'metadata:local:describe', '-p', 'plaintext'];
        if (options.types) {
            command.push('-t');
            command.push(options.types.join(','));
        } else {
            command.push('-a');
        }
        if (options.orgNamespace)
            command.push('-o');
        process = new Process('cmd', command, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperRetriveAllSpecials(options, output, cancelToken) {
        let command;
        if (options.fromOrg)
            command = ['/c', 'aura-helper', 'metadata:org:retrieve:special', '-p', 'plaintext'];
        else
            command = ['/c', 'aura-helper', 'metadata:local:retrieve:special', '-p', 'plaintext'];
        if (options.orgNamespace)
            command.push('-o');
        if (options.compress)
            command.push('-c');
        if (options.includeOrg)
            command.push('-i');
        if (options.types) {
            command.push('-t');
            command.push(options.types.join(','));
        } else
            command.push('-a');
        process = new Process('cmd', command, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperRepairDependencies(options, output) {
        let command = ['/c', 'aura-helper', 'metadata:local:repair', '-p', 'plaintext'];
        if (options.onlyCheck)
            command.push('-o');
        if (options.compress)
            command.push('-c');
        if (options.types) {
            command.push('-t');
            command.push(options.types.join(','));
        } else
            command.push('-a');
        process = new Process('cmd', command, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static auraHelperPackageGenerator(options, output) {
        let command = ['/c', 'aura-helper', 'metadata:local:package:create', '-p', 'plaintext'];
        if (options.version) {
            command.push('-v');
            command.push(options.version);
        }
        if (options.outputPath) {
            command.push('-o');
            command.push(options.outputPath);
        }
        if (options.createType) {
            command.push('-c');
            command.push(options.createType);
        }
        if (options.createFrom) {
            command.push('-f');
            command.push(options.createFrom);
        }
        if (options.deleteOrder) {
            command.push('-d');
            command.push(options.deleteOrder);
        }
        if (options.source) {
            command.push('-s');
            command.push(options.source);
        }
        if (options.target) {
            command.push('-t');
            command.push(options.target);
        }
        if (options.useIgnore) {
            command.push('-u');
            command.push(options.useIgnore);
        }
        if (options.ignoreFile) {
            command.push('-i');
            command.push(options.ignoreFile);
        }
        if (options.raw) {
            command.push('-r');
        }
        if (options.explicit) {
            command.push('-e');
        }
        process = new Process('cmd', command, { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        return new Promise(function (resolve) {
            runProcess(process, output).then(function (stdOut) {
                resolve({ stdOut: getResponse(stdOut), stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
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
    let stdOut = [];
    let stdErr = [];
    return new Promise(function (resolve, rejected) {
        process.run(function (event, data) {
            if (output && data && data.length > 0)
                Logger.output(data.toString());
            switch (event) {
                case ProcessEvent.STD_OUT:
                    stdOut = stdOut.concat(data);
                    break;
                case ProcessEvent.ERR_OUT:
                    stdErr = stdErr.concat(data);
                    break;
                case ProcessEvent.KILLED:
                    resolve();
                    break;
                case ProcessEvent.END:
                    if (stdErr.length > 0) {
                        rejected(stdErr.toString());
                    } else {
                        resolve(stdOut.toString());
                    }
                    break;
                default:
                    break;
            }
        });
    });
}
