const FlowStructureNode = require('./flowStructureNode');

class ForeachNode extends FlowStructureNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = ForeachNode;