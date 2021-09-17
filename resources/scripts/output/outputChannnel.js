const vscode = require('vscode');
var channel;

const CHANNEL_NAME = 'Aura Helper';

class OutputChannel {

    static createChannel() {
        if (!channel)
            channel = vscode.window.createOutputChannel(CHANNEL_NAME);
    }

    static output(text) {
        OutputChannel.createChannel();
        channel.append(text);
    }

    static outputLine(text) {
        OutputChannel.createChannel();
        channel.appendLine(text);
    }

}
module.exports = OutputChannel;