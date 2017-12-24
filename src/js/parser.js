/*
 * Copyright (C) Swastik Roy, 2018
 */

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