const Node = require('./node');

class ExpresionNode extends Node { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.onParens = false;
    }

    setOnParens(onParens) { 
        this.onParens = onParens;
    }

    isOnParens() { 
        return this.onParens;
    }
}
module.exports = ExpresionNode;