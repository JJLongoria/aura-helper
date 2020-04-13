const FlowStructureNode = require('./flowStructureNode');

class TryNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.guard = undefined;
    }
}
module.exports = TryNode;