const FlowStructureNode = require('./flowStructureNode');

class FinallyNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.guard = undefined;
    }
}
module.exports = FinallyNode;