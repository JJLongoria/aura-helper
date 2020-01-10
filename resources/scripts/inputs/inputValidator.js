exports.integerValidation = function(text) {
    var regex = /^[a-zA-Z]+$/;
    if (regex.test(text))
        return text;
    return null;
}