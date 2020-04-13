const Node = require('./node');

class FlowStructureNode extends Node {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.oneLineBlock = true;
    }

    setOneLineBlock(oneLineBlock) { 
        this.oneLineBlock = oneLineBlock;
    }

    isOneLineBlock() { 
        return this.oneLineBlock;
    }
}
module.exports = FlowStructureNode;