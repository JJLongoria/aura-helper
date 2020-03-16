class Token {

    constructor(type, text, line, startIndex) {
        this.type = type;
        this.text = text;
        this.textToLower = this.text.toLowerCase();
        this.line = line;
        this.startIndex = startIndex;
        this.endIndex = startIndex + text.length;
        this.id = type + '_' + line + '.' + startIndex;
        this.aux = false;
        this.parentToken = undefined;
    }

    setParentToken(parentToken) { 
        this.parentToken = parentToken;
    }

    getParentToken() { 
        return this.parentToken;
    }

    setAux(isAux) { 
        this.aux = isAux;
    }

    isAux() { 
        return this.aux;
    }

}
module.exports = Token;