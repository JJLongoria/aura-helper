const Process = require('./process');
const fileSystem = require('../fileSystem');
const Paths = fileSystem.Paths;

const BUFFER_SIZE = 1024 * 500000;

class ProcessManager {

    static listAuthOurgs(callback) {
        let process = new Process('cmd', ['/c', 'sfdx', 'force:auth:list', '--json'], { maxBuffer: BUFFER_SIZE });
        process.run(callback);
        return process;
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

}
module.exports = ProcessManager;