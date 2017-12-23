# lambda-calculus-evaluator
Evaluator tool for lambda calculus expressions. Can be used with evaluation strategies such as normal order evaluation, call by value and call by name.


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
Predefined expressions are 
- Any natural number between 1 to 20.
- mult: (Lm.Ln. m ((Lm. Ln. Ls. Lz.m s (n s z)) n) 0)
- plus: (Lm.Ln.Ls.Lz.m s (n s z))
- succ: (Ln.Ls.Lz.s (n s z))
- true: (Lx.Ly.x)
- false: (Lx.Ly.y)
- and: (Lb.Lc.b c (Lx.Ly.y))
- or: (Lb.Lc.b (Lx.Ly.x) c)
- pair: (Lf.Ls.Lb.b f s)
- first: (Lp.p (Lx.Ly.x))
- second: (Lp.p (Lx.Ly.y))
If you use these keywords as expression, they will be expanded to their respective lambda form.

