const vscode = require('vscode');
var channel;

const CHANNEL_NAME = 'Aura Helper';

class OutputChannel {

    static createChannel() {
        if (!channel)
            channel = vscode.window.createOutputChannel(CHANNEL_NAME);
    }

    static output(text, show) {
        OutputChannel.createChannel();
        channel.append(text);
        if (show)
            channel.show(show);
    }

    static outputLine(text, show) {
        OutputChannel.createChannel();
        channel.appendLine(text);
        if (show)
            channel.show(show);
    }

}
module.exports = OutputChannel;