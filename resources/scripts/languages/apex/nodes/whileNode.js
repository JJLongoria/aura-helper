const FlowStructureNode = require('./flowStructureNode');

class WhileNode extends FlowStructureNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = WhileNode;