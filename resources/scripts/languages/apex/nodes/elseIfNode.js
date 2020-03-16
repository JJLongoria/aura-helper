const FlowStructureNode = require('./flowStructureNode');

class ElseIfNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = ElseIfNode;