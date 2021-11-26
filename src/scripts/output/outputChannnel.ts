import * as vscode from 'vscode';
let channel: vscode.OutputChannel;

const CHANNEL_NAME = 'Aura Helper';

export class OutputChannel {

    static createChannel(): void {
        if (!channel) {
            channel = vscode.window.createOutputChannel(CHANNEL_NAME);
        }
    }

    static output(text: string, show?: boolean): void {
        OutputChannel.createChannel();
        channel.append(text);
        if (show) {
            channel.show(show);
        }
    }

    static outputLine(text: string, show?: boolean): void {
        OutputChannel.createChannel();
        channel.appendLine(text);
        if (show) {
            channel.show(show);
        }
    }

}