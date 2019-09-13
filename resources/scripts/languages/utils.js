class Utils{
    static getWhitespaces(number){
        let whitespace = '';
        for (let index = 0; index < number; index++) {
            whitespace += ' ';
        }
        return whitespace;
    }
    
    static getNextToken(tokens, index) {
        if (index + 1 < tokens.length)
            return tokens[index + 1];
    }
    
    static getLastToken(tokens, index) {
        if (index - 1 >= 0)
            return tokens[index - 1];
    }
}
exports.Utils = Utils;