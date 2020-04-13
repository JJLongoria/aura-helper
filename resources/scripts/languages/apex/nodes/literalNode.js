const Node = require('./node');

class LiteralNode extends Node { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.value = undefined;
    }

    setValue(value) { 
        this.value = value;
    }

}
module.exports = LiteralNode;