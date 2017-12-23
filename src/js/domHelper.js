/**
 * Returns HTML with colored parenthesis
 */
function colorParens(inputString, redexIndex){
    var result = "";
    var parens = 0;
    for(var x=0; x<inputString.length; x++){
        
        var curr = inputString[x];
        
        //var currGroupIndex = parseInt(groupIndex[x]);
        var styles = "";
        if(curr == '(')parens++;
            if(curr == ')' || curr == '('){
                styles += "color:"+color[parens%(color.length)]+";";
            }
        if(curr == ')')parens--  

        if (!isNaN(parseInt(redexIndex[x], 10))) {
            // Is a number
            var currRedex = parseInt(redexIndex[x]);
            // styles += "border-bottom: solid 1px "+color[currRedex%(color.length)]+"; padding-bottom: "+(currRedex*10)+"px;";
        }

        result += "<span style=\""+styles+"\">"+curr+"</span>"
    }
    result = "<div>"+result+"</div>";
    // result += redexLines(inputString, redexIndex);
    return result;
}

function redexLines(inputString, redexIndex){
    var i = 0;
    var found = false;
    var lines = "";
    while(++i){
        var result = "";
        found = false;
        for(var x = 0; x<inputString.length;x++){
            if(!isNaN(parseInt(redexIndex[x])) && parseInt(redexIndex[x]) >=  i){
                result += "<span style=\"color:transparent; border-bottom: solid 2px "+color[i%(color.length)]+"; padding-bottom: "+(i*10)+"px;\">"+inputString[x]+"</span>"
                found = true;
            }else{
                result += "<span style=\"color:transparent;\">"+inputString[x]+"</span>";
            }
        }
        if(found == false){
            break;
        }
        result = "<div id=\"line"+i+"\">"+result+"</div>";
        lines += result;
    }
    return lines;
}