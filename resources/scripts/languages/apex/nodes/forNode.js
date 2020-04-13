const FlowStructureNode = require('./flowStructureNode');

class ForNode extends FlowStructureNode { 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = ForNode;