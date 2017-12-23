
function isValue(exp){
    if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        return isValue(exp.exp);
    }
    return !exp.redex;
}

function isRedex(exp){
    if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        return this.isValue(exp.exp);
    }
    return exp.redex;
}



function toChurchNumber(num){
    var result = "Ls.Lz.";
    var body = "z";
    while(num-- > 0){
        if(body == 'z')body = "s "+body+"";
        else body = "s ("+body+")";
        
    }
    return "("+result+body+")"
}


function expandExpression(exp){
    var newExp = JSON.parse(JSON.stringify(exp));
    replaceReservedExpressions(newExp);
    return newExp;
}

function getReservedExpressionString(val){
    val = val.toLowerCase();
    if(!isNaN(parseInt(val))){  //Is a number
        var val = parseInt(val);
        if(val >= 0 && val <= 20){  //Replace
            return toChurchNumber(val);
        }
         
    }
    else if(reserved[val]){
        return reserved[val];
    }  
    return val;
}



function replaceReservedExpressions(exp){
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            replaceReservedExpressions(exp.body.exp);
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            replaceReservedExpressions(exp.exp1);
            replaceReservedExpressions(exp.exp2);
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            if(exp.type == EXPRESSION_TYPE.VARIABLE){
                var expanded = getReservedExpressionString(exp.exp);
                if(expanded != exp.exp){    //Replace
                    var newExp = Exp(expanded);
                    for(var key in exp){
                        delete exp[key];
                    }
                    for(var key in newExp){
                        exp[key] = newExp[key];
                    }
                }
            }
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            replaceReservedExpressions(exp.exp);
        }

    
    
}

BaseEvaluator = function(evaluateInternal){
    function evaluate(exp){
        var container = {type: EXPRESSION_TYPE.PARENTHESIS, exp:exp};
        evaluateInternal(container);
        refreshText(container.exp);
        unsetRedexLevels(container.exp);
        setRedexLevels(container.exp, 0);
        var result = {redexIndex: container.exp.text};
        setRedexIndexes(container.exp, 0 , result);
        console.log(container.exp.text)
        return container.exp;
    }
    return {
        isValue:isValue,
        evaluate:evaluate
    }
}

NormalOrderEvaluator = BaseEvaluator(function(exp){
    var result = null;
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            result = arguments.callee(exp.body.exp); if(result)exp.body.exp = result;
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            if(isRedex(exp)){
                var reduced = reduce(exp);
                if(JSON.stringify(reduced) != JSON.stringify(exp)){ //It is reduced
                    return reduced;
                }
                else{   
                    var result = arguments.callee(exp.exp2);
                    if(result)exp.exp2 = result;
                    return;
                }    
            }
            else{
                var oldString = JSON.stringify(exp.exp1);
                result = arguments.callee(exp.exp1); if(result)exp.exp1 = result;

                if(oldString == JSON.stringify(exp.exp1)){  //If one is not reduced
                    result = arguments.callee(exp.exp2); if(result)exp.exp2 = result;
                } //Because only one reduction in each step
                
        
                 
            }
            var expText = (exp.exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp.exp1.text+") "+exp.exp2.text):exp.exp1.text+" "+exp.exp2.text;
            exp.text = expText;
            
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            //
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            var expString = JSON.stringify(exp.exp);
            result = arguments.callee(exp.exp); if(result)exp.exp = result;
            exp.text = "("+exp.exp.text+")";
            if(expString != JSON.stringify(result)){
                return result;
            }
        }
});


CallByValueEvaluator = BaseEvaluator(function(exp){
        var result = null;
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            //Can not reduce inside abstractions for call by value
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            if(isRedex(exp)){
                if(isValue(exp.exp2)){
                    
                    var reduced = reduce(exp);
                    if(JSON.stringify(reduced) != JSON.stringify(exp)){ //It is reduced
                        return reduced;
                    };
                }
                else{   //If not a value
                    var result = arguments.callee(exp.exp2);
                    if(result)exp.exp2 = result;
                    return;
                }
                
                
            }
            else{   
                var oldString = JSON.stringify(exp.exp2);
                result = arguments.callee(exp.exp2); if(result)exp.exp2 = result;

                if(oldString == JSON.stringify(exp.exp2)){
                    result = arguments.callee(exp.exp1); if(result)exp.exp1 = result;
                } //Because only one reduction in each step
                    
                    

            }
            
            
            var expText = (exp.exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp.exp1.text+") "+exp.exp2.text):exp.exp1.text+" "+exp.exp2.text;
            exp.text = expText;
            
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            //
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            var expString = JSON.stringify(exp.exp);
            result = arguments.callee(exp.exp); if(result)exp.exp = result;
            exp.text = "("+exp.exp.text+")";
            if(expString != JSON.stringify(result)){
                return result;
            }
            
        }
});


CallByNameEvaluator = BaseEvaluator(function(exp){
        var result = null;
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            //No reduction inside abstractions
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            if(isRedex(exp)){
                var reduced = reduce(exp);
                if(JSON.stringify(reduced) != JSON.stringify(exp)){ //It is reduced
                    return reduced;
                }
                else{   
                    var result = arguments.callee(exp.exp2);
                    if(result)exp.exp2 = result;
                    return;
                }    
            }
            else{
                var oldString = JSON.stringify(exp.exp1);
                result = arguments.callee(exp.exp1); if(result)exp.exp1 = result;

                if(oldString == JSON.stringify(exp.exp1)){  //If one is not reduced
                    result = arguments.callee(exp.exp2); if(result)exp.exp2 = result;
                } //Because only one reduction in each step
                
        
                 
            }
            var expText = (exp.exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp.exp1.text+") "+exp.exp2.text):exp.exp1.text+" "+exp.exp2.text;
            exp.text = expText;
            
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            //
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            var expString = JSON.stringify(exp.exp);
            result = arguments.callee(exp.exp); if(result)exp.exp = result;
            exp.text = "("+exp.exp.text+")";
            if(expString != JSON.stringify(result)){
                return result;
            }
        }
});

