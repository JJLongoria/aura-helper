const FlowStructureNode = require('./flowStructureNode');

class DoWhileNode extends FlowStructureNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.while = undefined;
    }

    setWhile(whileFromDo) { 
        this.while = whileFromDo;
    }
}
module.exports = DoWhileNode;