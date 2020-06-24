const vscode = require('vscode');
var channel;

const CHANNEL_NAME = 'Aura Helper';

class OutputChannel {

    static output(text) {
        if (!channel)
            channel = vscode.window.createOutputChannel(CHANNEL_NAME);
        channel.append(text);
        channel.show(true);
    }

}
module.exports = OutputChannel;