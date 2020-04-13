class Node {

    constructor(id, name, startToken) {
        this.nodeId = id;
        this.name = name;
        this.startToken = startToken;
        this.endToken = undefined;
        this.parentNodeId = undefined;
        this.masterNodeId = undefined;
        this.childs = [];
        this.deep = 0;
    };

    getLastNodeId() { 
        if (this.childs.length > 0)
            return this.childs[this.childs.length - 1].getId();
        return undefined;
    }

    setEndToken(endtoken) { 
        this.endToken = endtoken;
    }

    setParentNodeId(parentNodeId) { 
        this.parentNodeId = parentNodeId;
    }

    getParentNodeId() { 
        return this.parentNodeId;
    }

    setMasterNodeId(masterNodeId) { 
        this.masterNodeId = masterNodeId;
    }

    addChild(childId) { 
        this.childs.push(childId);
    }

    getName() {
        return this.name;
    }

    setName(name) { 
        this.name = name;
    }

    setId(nodeId) { 
        this.nodeId = nodeId;
    }

    getId() { 
        return this.nodeId;
    }

    setDeep(deep) { 
        this.deep = deep;
    }

    getDeep() { 
        return this.deep;
    }
}
module.exports = Node;