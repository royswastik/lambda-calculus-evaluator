# lambda-calculus-evaluator
Evaluator tool for lambda calculus expressions. Can be used with evaluation strategies such as normal order evaluation, call by value and call by name.

Demo: [http://swastikroy.me/lambda-calculus-evaluator/](http://swastikroy.me/lambda-calculus-evaluator/)

***What is Lambda Calculus?***
> Lambda calculus (also written as λ-calculus) is a formal system in mathematical logic for expressing computation based on function abstraction and application using variable binding and substitution. It is a universal model of computation that can be used to simulate any Turing machine and was first introduced by mathematician Alonzo Church in the 1930s as part of his research of the foundations of mathematics. - Wikipedia([Source](https://en.wikipedia.org/wiki/Lambda_calculus))


**How to use**

***How to write Lambda(λ) in input? ***

Use captial letter 'L' to denote Lambda. Eg. "(Lx.x) x" for "(λx.x) x"


***How to write applications?***

For application "T1 T2", there must be a white space between T1 and T2.

Eg. it must be "(Lx.x) (Lx.x)", not "(Lx.x)(Lx.x)"


***How to group expressions?***

You can group expressesions with parenthesis. Please do no use curly braces or square brackets


***When does the evualator throw error?***

If the parenthesis are not matched. Also, numbers greater than 20 can not be converted to church numeral for now.


***What are predefined expressions in the compiler?***
Predefined expressions are λ
- Any natural number between 1 to 20.
- mult: (λm.λn. m ((λm. λn. λs. λz.m s (n s z)) n) 0)
- plus: (λm.λn.λs.λz.m s (n s z))
- succ: (λn.λs.λz.s (n s z))
- true: (λx.λy.x)
- false: (λx.λy.y)
- and: (λb.λc.b c (λx.λy.y))
- or: (λb.λc.b (λx.λy.x) c)
- pair: (λf.λs.λb.b f s)
- first: (λp.p (λx.λy.x))
- second: (λp.p (λx.λy.y))
If you use these keywords as expression, they will be expanded to their respective lambda form.

