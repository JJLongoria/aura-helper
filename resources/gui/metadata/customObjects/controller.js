let objects = {};

// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener('message', event => {
    let eventData = event.data;
    switch (eventData.command) {
        case 'open':
            objects = eventData.model;
            // @ts-ignore
            showContent();
            break;
        default:
            break;
    }
});