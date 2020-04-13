const FlowStructureNode = require('./flowStructureNode');

class IfNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
    }
}
module.exports = IfNode;