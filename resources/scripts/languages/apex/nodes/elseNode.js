const FlowStructureNode = require('./flowStructureNode');

class ElseNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = ElseNode;