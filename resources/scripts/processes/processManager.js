const Process = require('./process');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;
const ProcessEvent = require('./processEvent');

const BUFFER_SIZE = 1024 * 500000;

class ProcessManager {

    static listAuthOurgs(callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:auth:list', '--json'], { maxBuffer: BUFFER_SIZE });
        process.run(callback);
        return process;
    }

    // Method for replace listMetadata()
    static listMetadataTypes(user, cancelToken) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:describemetadata', '--json', '-u', user], { maxBuffer: BUFFER_SIZE }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static listMetadata(user, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:describemetadata', '--json', '-u', user], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static describeSchemaMetadata(user, metadataType, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:schema:sobject:describe', '--json', '-u', user, '-s', metadataType], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static mdApiDescribeMetadata(user, metadata, folderName, cancelToken) {
        let process;
        if (folderName)
            process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:listmetadata', '--json', '-u', user, '-m', metadata, '--folder', folderName], { maxBuffer: BUFFER_SIZE }, cancelToken);
        else
            process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:listmetadata', '--json', '-u', user, '-m', metadata], { maxBuffer: BUFFER_SIZE }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static describeMetadata(user, metadata, folderName, cancelToken, callback) {
        let process;
        if (folderName)
            process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:listmetadata', '--json', '-u', user, '-m', metadata, '--folder', folderName], { maxBuffer: BUFFER_SIZE }, cancelToken);
        else
            process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:listmetadata', '--json', '-u', user, '-m', metadata], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static retrieve(user, packageFolder, packageFile, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:retrieve', '--json', '-u', user, '-s', '-r', '' + packageFolder + '', '-k', '' + packageFile + ''], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static retrieveSFDX(user, packageFile, projectFolder, cancelToken) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:source:retrieve', '--json', '-u', user, '-x', '' + packageFile + ''], { maxBuffer: BUFFER_SIZE, cwd: projectFolder }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
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

    static query(user, query, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:data:soql:query', '--json', '-u', user, '-q', query], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static queryToolingAPI(user, query, cancelToken, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:data:soql:query', '--json', '-u', user, '-q', query, '-t'], { maxBuffer: BUFFER_SIZE }, cancelToken);
        process.run(callback);
        return process;
    }

    static gitLog(callback) {
        let process = new Process('cmd', ['/c', 'git', 'log', '--pretty=medium'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        process.run(callback);
        return process;
    }

    static gitGetBranches(callback) {
        let process = new Process('cmd', ['/c', 'git', 'branch', '-a'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        process.run(callback);
        return process;
    }

    static gitDiffSource(source, callback) {
        let process = new Process('cmd', ['/c', 'git', 'diff', source], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        process.run(callback);
        return process;
    }

    static gitDiff(source, target, callback) {
        let process = new Process('cmd', ['/c', 'git', 'diff', source, target], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        process.run(callback);
        return process;
    }

    static gitFetch(callback) {
        let process = new Process('cmd', ['/c', 'git', 'fetch'], { maxBuffer: BUFFER_SIZE, cwd: Paths.getWorkspaceFolder() });
        process.run(callback);
        return process;
    }

    static convertToSFDX(packageFolder, packageFile, targetFolder, callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:mdapi:convert', '-r', '' + packageFolder + '', '--manifest', '' + packageFile + '', '-d', '' + targetFolder + ''], { maxBuffer: BUFFER_SIZE });
        process.run(callback);
        return process;
    }

    static createSFDXProject(projectName, projectFolder, cancelToken) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:project:create', '-n', projectName, '-d', '' + projectFolder + '', '--manifest', '--template', 'empty'], { maxBuffer: BUFFER_SIZE }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

    static setDefaultOrg(orgAlias, cwd, cancelToken) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:config:set', '--json', 'defaultusername=' + orgAlias], { maxBuffer: BUFFER_SIZE, cwd: cwd }, cancelToken);
        return new Promise(function (resolve) {
            runProcess(process).then(function (stdOut) {
                resolve({ stdOut: stdOut, stdErr: undefined });
            }).catch(function (stdErr) {
                resolve({ stdOut: undefined, stdErr: stdErr });
            });
        });
    }

}
module.exports = ProcessManager;

function runProcess(process) {
    let stdOut = [];
    let stdErr = [];
    return new Promise(function (resolve, rejected) {
        process.run(function (event, data) {
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
