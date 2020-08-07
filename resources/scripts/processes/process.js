const childProcess = require('child_process');
const Logger = require('../utils/logger');
const ProcessEvent = require('./processEvent');


class Process {

    constructor(command, args, options, cancellationToken) {
        this.command = command || '';
        this.args = args || [];
        this.options = options || {};
        this.cancellationToken = cancellationToken || undefined;
    }

    run(callback) {
        Logger.log('run command: ' + this.command + ' ' + this.args.join(' '));
        let thisCancelToken = this.cancellationToken;
        if (thisCancelToken) {
            thisCancelToken.onCancellationRequested(() => {
                this.process.kill();
                if (callback)
                    callback.call(this, ProcessEvent.KILLED);
            });
        }
        this.process = childProcess.spawn(this.command, this.args, this.options);
        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', (data) => {
            let dataStr = data.toString();
            Logger.log(dataStr);
            if (thisCancelToken && thisCancelToken.isCancellationRequested)
                this.process.kill();
            if (callback)
                callback.call(this, ProcessEvent.STD_OUT, data);
        });
        this.process.stderr.on('data', (data) => {
            let dataStr = data.toString();
            Logger.error(dataStr);
            if (thisCancelToken && thisCancelToken.isCancellationRequested)
                this.process.kill();
            if (callback)
                callback.call(this, ProcessEvent.ERR_OUT, data);
        });
        this.process.on('error', (data) => {
            Logger.error('ERROR: ' + data);
            if (thisCancelToken && thisCancelToken.isCancellationRequested)
                this.process.kill();
            if (callback)
                callback.call(this, ProcessEvent.ERROR, data);
        });
        this.process.on('close', (code) => {
            Logger.log(`child process exited with code ${code}`);
            if (this.process.killed) {
                Logger.log(this.command + ' KILLED');
                if (callback)
                    callback.call(this, ProcessEvent.KILLED);
            } else {
                if (callback)
                    callback.call(this, ProcessEvent.END, code);
            }

        });
    }

    kill() {
        if (this.process)
            this.process.kill();
    }

}
module.exports = Process;