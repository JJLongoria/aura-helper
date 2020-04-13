const FlowStructureNode = require('./flowStructureNode');

class RunAsNode extends FlowStructureNode {

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.guard = undefined;
    }

    setGuard(guard) { 
        this.guard = guard;
    }

}
module.exports = RunAsNode;