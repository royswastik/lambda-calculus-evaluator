/*
 * Copyright (C) Swastik Roy, 2018
 */

EXPRESSION_TYPE = {
    APPLICATION: "application",
    ABSTRACTION: "abstraction",
    VARIABLE: "variable",
    PARENTHESIS: "parenthesis"
}

LAMBDA = "L";

var Exp = function(expString){
    expString = expString.trim();
    function getExpType(){
        if(expString[0] == '(' && expString[expString.length-1] == ')'){    //This is wrong, it can be different groups
            var parenEncountered = 0;
            for(var x = 0; x < expString.length; x++){
                if(expString[x] == '(')parenEncountered++;
                
                if(expString[x] == ')')parenEncountered--;
                if(parenEncountered == 0 && x != expString.length - 1){
                    return EXPRESSION_TYPE.APPLICATION;
                }
            }
            
            return EXPRESSION_TYPE.PARENTHESIS;
        }
        else if(expString[0] == LAMBDA){
            return EXPRESSION_TYPE.ABSTRACTION;
        }
        else if(expString.split(' ').length > 1){
            return EXPRESSION_TYPE.APPLICATION;
        }
        else{
            return EXPRESSION_TYPE.VARIABLE;
        }
        
    }
    
    var type = getExpType(expString);
    
    var result = {};
    if(type == EXPRESSION_TYPE.ABSTRACTION){
        result= Parser.parseAbstraction(expString);
    }else if(type == EXPRESSION_TYPE.APPLICATION){
        result = Parser.parseApplication(expString);
    }else if(type == EXPRESSION_TYPE.VARIABLE){
        result = Parser.parseVariable(expString);
    }
    else if(type == EXPRESSION_TYPE.PARENTHESIS){
        result = Parser.parseParenthesis(expString);
    }
    result["type"] = type;
    return result;
}

var reserved = {
    "mult": "(Lm.Ln. m ((Lm. Ln. Ls. Lz.m s (n s z)) n) "+toChurchNumber(0)+")",
    "plus": "(Lm.Ln.Ls.Lz.m s (n s z))",
    "succ": "(Ln.Ls.Lz.s (n s z))",
    "true": "(Lx.Ly.x)",
    "false": "(Lx.Ly.y)",
    "and": "(Lb.Lc.b c (Lx.Ly.y))",
    "or": "(Lb.Lc.b (Lx.Ly.x) c)",
    "pair": "(Lf.Ls.Lb.b f s)",
    "first": "(Lp.p (Lx.Ly.x))",
    "second": "(Lp.p (Lx.Ly.y))"
}
