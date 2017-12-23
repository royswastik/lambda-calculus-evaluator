BindingUtil = (function(){
    function getFreeVariables(exp){
        var freeVariables = {};
        fetchFreeVariables(exp, {}, freeVariables);
        return freeVariables;
    }

    function fetchFreeVariables(exp, bindings, freeVariables){
        var bindings2 = JSON.parse(JSON.stringify(bindings));
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            bindings2[exp.argument] = true;
            fetchFreeVariables(exp.body.exp, bindings2, freeVariables);
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            fetchFreeVariables(exp.exp1, bindings2, freeVariables);
            fetchFreeVariables(exp.exp2, bindings2, freeVariables);
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            if(!bindings[exp.exp])
                freeVariables[exp.exp] = true;
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            fetchFreeVariables(exp.exp, bindings2, freeVariables);
        }
    }
    return {
        getFreeVariables: getFreeVariables
    };
})();