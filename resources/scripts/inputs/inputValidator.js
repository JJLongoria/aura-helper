const { Validator } = require('@ah/core').CoreUtils;

class InputValidator {

    static isInteger(value) {
        if (Validator.isInteger(value))
            return null;
        return value;
    }

    static patternXMLFieldValidation(value, xmlFieldDefinition) {
        if (xmlFieldDefinition.required && !value)
            return 'The field ' + xmlFieldDefinition.key + ' is required';
        value = xmlFieldDefinition.prepareValue(value);
        if (xmlFieldDefinition.matchPatterns && xmlFieldDefinition.matchPatterns.length > 0 && value) {
            for (const pattern of xmlFieldDefinition.matchPatterns) {
                if (!value.test(pattern)) {
                    return 'The field value ' + value + ' not match the pattern ' + pattern;
                }
            }
        }
        if (xmlFieldDefinition.minLength && xmlFieldDefinition.minLength >= 0 && xmlFieldDefinition.maxLength && xmlFieldDefinition.maxLength >= 0 && value) {
            if (value.length < xmlFieldDefinition.minLength || value.length > xmlFieldDefinition.maxLength)
                return 'Wrong value length. The value length must be between ' + xmlFieldDefinition.minLength + ' and ' + xmlFieldDefinition.maxLength;
        } else if (xmlFieldDefinition.minLength && xmlFieldDefinition.minLength >= 0 && value) {
            if (value.length < xmlFieldDefinition.minLength)
                return 'Wrong value length. The value length must be higher than ' + xmlFieldDefinition.minLength + '. (Remains ' + (xmlFieldDefinition.minLength - value.length) + ' characters)';
        } else if (xmlFieldDefinition.maxLength && xmlFieldDefinition.maxLength >= 0 && value) {
            if (value.length > xmlFieldDefinition.maxLength)
                return 'Wrong value length. The value length must be lower than ' + xmlFieldDefinition.maxLength + '. (' + (xmlFieldDefinition.maxLength - value.length) + ' characters left)';
        }
        return null;
    }

}

module.exports = InputValidator;