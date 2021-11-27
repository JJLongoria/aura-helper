const DEBUG = true;
const { Utils } = require('@aurahelper/core').CoreUtils;

export class Logger {
    static log(textOrParamName: string | any, paramValue: any) {
        if (DEBUG) {
            if (Utils.isNull(paramValue)) {
                console.log(textOrParamName);
            } else {
                console.log('## ' + textOrParamName + ": " + paramValue);
            }
        }
    }

    static logJSON(textOrParamName: string | any, paramValue: any) {
        if (DEBUG) {
            if (Utils.isNull(paramValue)) {
                console.log(JSON.stringify(textOrParamName, null, 2));
            } else {
                console.log('## ' + textOrParamName + ": \n" + JSON.stringify(paramValue, null, 2));
            }
        }
    }

    static error(text: string | any) {
        if (DEBUG) {
            console.error(text);
        }
    }
}