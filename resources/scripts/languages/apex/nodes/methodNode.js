const DefinitionNode = require('./definitionNode');

class MethodNode extends DefinitionNode{ 

    constructor(id, name, startToken) { 
        super(id, name, startToken);
        this.override = undefined;
        this.testMethod = undefined;
        this.webservice = undefined;
        this.params = [];
        this.return = undefined;
    }
    
    setReturn(returnType) { 
        this.return = returnType;
    }

    getReturn() { 
        return this.return;
    }

    addParam(param) { 
        this.params.push(param);
    }

    setTestMethod(testMethod) { 
        this.testMethod = testMethod;
    }

    getTestMethod() { 
        return this.testMethod;
    }

    setOverride(isOverride) { 
        this.override = isOverride;
    }

    getOverride() { 
        return this.override;
    }

    setWebService(webservice) { 
        this.webservice = webservice;
    }

    getWebService() { 
        return this.webservice;
    }
}
module.exports = MethodNode;