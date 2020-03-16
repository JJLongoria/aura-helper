const Node = require('./node');

class StatementNode extends Node { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = StatementNode;