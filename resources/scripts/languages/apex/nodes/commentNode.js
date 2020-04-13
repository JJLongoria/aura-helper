const Node = require('./node');

class CommentNode extends Node{ 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.content = [];
        this.block = false;
    }

    setBlock(isBlock) { 
        this.block = isBlock;
    }

    addToken(token) { 
        this.content.push(token);
    }   

}
module.exports = CommentNode;