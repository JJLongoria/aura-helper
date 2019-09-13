const DEBUG = true;

function log(textOrParamName, paramValue){
    if(DEBUG){
        if(paramValue === undefined)
            console.log(textOrParamName);
        else
            console.log('## ' + textOrParamName + ": " + paramValue);
    }
}

function logJSON(textOrParamName, paramValue){
    if(DEBUG){
        if(paramValue === undefined)
            console.log(JSON.stringify(textOrParamName, null, 2));
        else
            console.log('## ' + textOrParamName + ": \n" + JSON.stringify(paramValue, null, 2));
    }
}

function error(text){
    if(DEBUG)
        console.error(text);
}

module.exports = {
    log,
    logJSON,
    error
}