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

Parser = (function(){

    function parseApplication(expString){
        var expString = parenthesizeAbstractions(expString);
        var expSequence = [];
        var expSymbol = "";
        var pendingParenthesisCount = 0;
        var lastExpEndIndex= -1;   
        for(var x =  expString.length - 1; x >= 0; x--){
            expSymbol = expString[x]+expSymbol;
            if(expString[x] == ')'){
                pendingParenthesisCount++;
            }

            if(pendingParenthesisCount == 0 && expString[x] == ' ' && expString[x+1] != '('){
                if(lastExpEndIndex == -1){
                    lastExpEndIndex = x;
                }
                else{   //This means more than two expressions in sequence
                    break;
                }
            }

            if(expString[x] == '('){
                pendingParenthesisCount--;
                if(pendingParenthesisCount == 0){   //A parenthesisSymbol End
                    if(lastExpEndIndex  != -1){ //More than two expressions in sequence
                        break;
                    }
                    else{
                        lastExpEndIndex = x;
                    }
                    
                }
            }
            
        }
        var exp1 = Exp(expString.substring(0,lastExpEndIndex).trim());
        var exp2 = Exp(expString.substring(lastExpEndIndex, expString.length).trim());

        //Parenthesize applications
        var expText = (exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp1.text+") "+exp2.text):exp1.text+" "+exp2.text;
        
        return {
            exp1: exp1,
            exp2: exp2,
            text: expText

        }
    }

    function parseAbstraction(expString){
        var argument = "";
        var dotIndex = -1;
        for(var x = 1; x< expString.length; x++){
            if(expString[x] == "."){
                dotIndex = x;
                break;
            }
            argument += expString[x];
        }
        var bodyString = expString.substring(dotIndex+1, expString.length);
        var bodyExp = Exp(bodyString.trim())

        //Parenthesize abstraction body
        var bodyText = (bodyExp.type == EXPRESSION_TYPE.PARENTHESIS
                || bodyExp.type == EXPRESSION_TYPE.VARIABLE)?bodyExp.text: "("+bodyExp.text+")";
        return {
            argument: argument.trim(),
            body: {
                text: bodyExp.text,
                exp: bodyExp
            },
            text: LAMBDA+argument+"."+bodyText
        }
    }

    function parseParenthesis(expString){
        expString = expString.trim();
        expString = expString.substring(1, expString.length-1).trim();
        var exp = Exp(expString.trim())
        return {
            text: "("+exp.text+")",
            exp: exp
        }
    }

    function parseVariable(expString) {
        return {
            text: expString.trim(),
            exp: expString.trim()
        }
    }
    return {
        parseAbstraction: parseAbstraction,
        parseApplication: parseApplication,
        parseParenthesis: parseParenthesis,
        parseVariable: parseVariable
    };
})();


/**
 * Main function
 */
function parse_expression(inputString){
    var exp = Exp(inputString);
    return exp;
}
/**
 * Parenthesize abstractions
 * Recursively put parenthesis around abstractions
 * Algo - Do not put parenthesis inside groups, that is done recursively calling inner group expressions
 */
function parenthesizeAbstractions(expString){
    if(expString[0] == LAMBDA){
        return expString;
    }
    var result = "";
    var pendingParenCount = 0 ;
    var groupStartIndex = -1;
    var outerLambdaCount = 0;
    for(var x = 0 ; x<expString.length; x++){
        var curr = expString[x];

        if(groupStartIndex == -1){  //Not inside group
            
            if(curr == LAMBDA){
                result += '(';
                outerLambdaCount++;
            }
            result += curr;
            

        }

        if(curr == '('){
            if(pendingParenCount == 0){
                groupStartIndex = x;
            }
            pendingParenCount++;
        }
        if(curr == ')'){
            pendingParenCount--;
            if(pendingParenCount == 0){
                result += parenthesizeAbstractions(expString.substring(groupStartIndex+1, x))+curr;
                groupStartIndex = -1;
            }
        }
    }
    while(outerLambdaCount--){
        result += ')';
    }
    return result;
}



/**
 * Returns object with text and color codes for parenthesis and redexes
 * {
 *      text: "",
 *      groupIndex: "12121221"   1,2,.. corresponds to groupIndex, if there is a group inside group it is 1
 *      redexIndex: "01111122211100112211"     where i represents ith level redex.Eg. If there is a redex inside one redex, it is 2
 * }
 */
function setRedexLevels(exp, redexIndex){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        setRedexLevels(exp.body.exp, redexIndex);
    }
    else if(exp.type == EXPRESSION_TYPE.APPLICATION){
        var newLevel = redexIndex;
        if(ifAbstraction(exp.exp1)){    //Then it is redex
            exp["redex"] = redexIndex+1;
            newLevel = redexIndex+1;
        }
        setRedexLevels(exp.exp1, newLevel);
        setRedexLevels(exp.exp2, newLevel);
    }
    else if(exp.type == EXPRESSION_TYPE.VARIABLE){
        //
    }
    else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        setRedexLevels(exp.exp,redexIndex);
    }
}

function unsetRedexLevels(exp){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        unsetRedexLevels(exp.body.exp);
    }
    else if(exp.type == EXPRESSION_TYPE.APPLICATION){
        if(exp.redex){    //Then it is redex
            delete exp["redex"];
        }
        unsetRedexLevels(exp.exp1);
        unsetRedexLevels(exp.exp2);
    }
    else if(exp.type == EXPRESSION_TYPE.VARIABLE){
        //
    }
    else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        unsetRedexLevels(exp.exp);
    }
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function setRedexIndexes(exp, startIndex, result){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        setRedexIndexes(exp.body.exp, startIndex+(exp.text.length-exp.body.text.length-1), result);
    }
    else if(exp.type == EXPRESSION_TYPE.APPLICATION){
        if(exp.redex){    //Then it is redex
            for(var x = startIndex; x < startIndex+exp.text.length; x++){
                result.redexIndex = setCharAt(result.redexIndex,x,exp.redex);           
            }
        }
        var parenLen = (exp.text.length - exp.exp1.text.length-exp.exp2.text.length);
        if(parenLen > 1){
            setRedexIndexes(exp.exp1, startIndex+1, result);
            setRedexIndexes(exp.exp2, startIndex+(exp.text.length-exp.exp2.text.length), result);
        }
        else{
            setRedexIndexes(exp.exp1, startIndex, result);
            setRedexIndexes(exp.exp2, startIndex+(exp.text.length-exp.exp2.text.length), result);
        }
        
    }
    else if(exp.type == EXPRESSION_TYPE.VARIABLE){
        //
    }
    else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        setRedexIndexes(exp.exp,startIndex+1, result);
    }
}



/**
 * If exp is abstraction or abstraction inside parenthesis
 */
function ifAbstraction(exp){
    if(exp.type != EXPRESSION_TYPE.PARENTHESIS){
        return (exp.type == EXPRESSION_TYPE.ABSTRACTION);
    }
    else{
        return (exp.type == EXPRESSION_TYPE.ABSTRACTION) || ifAbstraction(exp.exp);
    }
}


function refreshText(exp){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
            //Can not reduce inside abstractions for call by value
            refreshText(exp.body.exp);
            var bodyText = (exp.body.exp.type == EXPRESSION_TYPE.PARENTHESIS 
                    || exp.body.exp.type == EXPRESSION_TYPE.VARIABLE)?exp.body.exp.text: "("+exp.body.exp.text+")";
            exp.text = LAMBDA+exp.argument+"."+bodyText;
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
            refreshText(exp.exp1);
            refreshText(exp.exp2);
            var expText = (exp.exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp.exp1.text+") "+exp.exp2.text):exp.exp1.text+" "+exp.exp2.text;
            exp.text = expText;
            
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            //
            exp.text = exp.exp;
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            refreshText(exp.exp);
            exp.text = (exp.exp.type == EXPRESSION_TYPE.PARENTHESIS)?exp.exp.text:"("+exp.exp.text+")";
        }
}


/**
 * In Call By Value, Redex can not be reduced, if argument is not a value. Also redexes inside abstractions can not be reduced.
 */


/**
 * Returns reduced expression
 */
function reduce(redex){
    var redexCopy = JSON.stringify(redex);
    var redexClone = JSON.parse(redexCopy);
    var freeVariables = BindingUtil.getFreeVariables(redexClone.exp2);
    var abstraction = getAbstraction(redexClone.exp1);
    var abstractionBodyString = JSON.stringify(abstraction.body.exp);
    alphaRename(freeVariables, abstraction.argument, abstraction.body.exp);   //Capture Avoiding
    var container = {type: EXPRESSION_TYPE.PARENTHESIS, exp:abstraction.body.exp};
    replaceOccurances(abstraction.argument, redexClone.exp2, container);
    if(container.exp.type == EXPRESSION_TYPE.APPLICATION && container.exp.type != EXPRESSION_TYPE.PARENTHESIS){  //If reduced

        container["text"] = "("+container.exp.text+")"
        return container;
    }
    return container.exp;
}

function getAbstraction(exp){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        return exp;
    }
    else{
        return getAbstraction(exp.exp);
    }
}

/**
 * Replaces all occurances of argument in abstraction body with exp2
 * exp - Abstraction body is passed as exp
 */
function replaceOccurances(argument, exp2, exp){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        if(exp.argument != argument){
            if(replaceOccurances(argument, exp2, exp.body.exp)) exp.body.exp = exp2;
            //Parenthesize abstraction body
            var bodyText = (exp.body.exp.type == EXPRESSION_TYPE.PARENTHESIS 
                    || exp.body.exp.type == EXPRESSION_TYPE.VARIABLE)?exp.body.exp.text: "("+exp.body.exp.text+")";
            exp.text = LAMBDA+exp.argument+"."+bodyText;
        }
    }
    else if(exp.type == EXPRESSION_TYPE.APPLICATION){
        
        if(replaceOccurances(argument, exp2, exp.exp1)) exp.exp1 = exp2;

        if(replaceOccurances(argument, exp2, exp.exp2)) exp.exp2 = exp2;
        //Parenthesize applications
        var expText = (exp.exp1.type == EXPRESSION_TYPE.APPLICATION)?("("+exp.exp1.text+") "+exp.exp2.text):exp.exp1.text+" "+exp.exp2.text;
        exp.text = expText;
        
    }
    else if(exp.type == EXPRESSION_TYPE.VARIABLE){
        if(exp.exp == argument){
            return true;
        }
    }
    else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        if(replaceOccurances(argument, exp2, exp.exp)) exp.exp = exp2;
        exp.text = "("+exp.exp.text+")";
    }
    return false;
}


/**
 * Checks if any of the free variables in exp2 of redex is being captured in exp1
 * exp - Abstraction body is passed as exp
 */
function alphaRename(freeVariables, argument, exp){
        if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
           //Check any free variable is getting captured in this or not
           var abstractionArgument = exp.argument;
            //Check if the abstraction contains main argument, if yes only then a capture is possible
            
            if(abstractionArgument != argument){    //Else binding will be of this abstraction argument
                var abstractionFreeVariables = BindingUtil.getFreeVariables(exp.body.exp);
                if(abstractionFreeVariables[argument]){ //Check if this abstraction contains occurence of main argument
                    if(freeVariables[abstractionArgument]){    //Atleast one free variable will be captured whose name is equal to abstraction argument
                        //Getting captured here, rename
                        var newName = getNewName(abstractionArgument, freeVariables, abstractionFreeVariables);
                        renameOccurances(abstractionArgument, newName, exp.body.exp);   //TODO check if this works
                        exp.argument = newName;
                    }
                }
            }
            alphaRename(freeVariables, argument, exp.body.exp);
            
        }
        else if(exp.type == EXPRESSION_TYPE.APPLICATION){
           alphaRename(freeVariables, argument, exp.exp1);
           alphaRename(freeVariables, argument, exp.exp2);
        }
        else if(exp.type == EXPRESSION_TYPE.VARIABLE){
            
        }
        else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
            alphaRename(freeVariables, argument, exp.exp);
        }
}

/**
 * Replaces all occurances of oldName with newName in exp
 */
function renameOccurances(oldName, newName, exp){
    if(exp.type == EXPRESSION_TYPE.ABSTRACTION){
        if(exp.argument != oldName){
            renameOccurances(oldName, newName, exp.body.exp);
        }
    }
    else if(exp.type == EXPRESSION_TYPE.APPLICATION){
        renameOccurances(oldName, newName, exp.exp1);
        renameOccurances(oldName, newName, exp.exp2);
    }
    else if(exp.type == EXPRESSION_TYPE.VARIABLE){
        if(exp.exp == oldName){
            exp.exp = newName;
            exp.text = newName;
        }
    }
    else if(exp.type == EXPRESSION_TYPE.PARENTHESIS){
        renameOccurances(oldName, newName, exp.exp);
    }
}

/**
 * Returns a new name for a variable, it should not be one of capturableSet element as it would again capture the variable
 */
function getNewName(toBeReplaced, capturableSet, abstractionFreeVariables){
    var count = 1;
    var newName = toBeReplaced+count;
    while(capturableSet[newName] || abstractionFreeVariables[newName]){
        newName = toBeReplaced+count;
        count++;
    }
    return newName;
}
