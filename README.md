# lambda-calculus-evaluator
Evaluator tool for lambda calculus expressions. Can be used with evaluation strategies such as normal order evaluation, call by value and call by name.


**How to use**

###How to write Lambda(λ) in input? 

Use captial letter 'L' to denote Lambda. Eg. "(Lx.x) x" for "(λx.x) x"


###How to write applications?

For application "T1 T2", there must be a white space between T1 and T2.

Eg. it must be "(Lx.x) (Lx.x)", not "(Lx.x)(Lx.x)"


###How to group expressions?

You can group expressesions with parenthesis. Please do no use curly braces or square brackets


###When does the evualator throw error?

If the parenthesis are not matched. Also, numbers greater than 20 can not be converted to church numeral for now.


###What are reserved expressions?
Reserved expressions are mult, succ, true, false, any natural number between 1 to 20. 
If you use these keywords as expression, they will be expanded to their lambda form.

