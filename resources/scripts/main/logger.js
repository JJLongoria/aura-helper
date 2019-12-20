const appContext = require('./applicationContext');
const DEBUG = false;

class Logger {
    static log(textOrParamName, paramValue) {
        if (DEBUG) {
            if (paramValue === undefined)
                console.log(textOrParamName);
            else
                console.log('## ' + textOrParamName + ": " + paramValue);
        }
    }

    static logJSON(textOrParamName, paramValue) {
        if (DEBUG) {
            if (paramValue === undefined)
                console.log(JSON.stringify(textOrParamName, null, 2));
            else
                console.log('## ' + textOrParamName + ": \n" + JSON.stringify(paramValue, null, 2));
        }
    }

    static output(output) {
        appContext.outputChannel.appendLine(output);
    }

    static error(text) {
        if (DEBUG)
            console.error(text);
    }
}
module.exports = Logger;