# sympy

## 基础

引入
```py
import * from sympy
from sympy.abc import a, b, c, d
x = S('x')
```

数值运算
```py
(...).evalf() # 等价: float(...) 或 complex(...)
```

有理数运算
```py
from fractions import Fraction as F
F(3,7)+F(1,13)
```

符号运算
```py
expand((x**2-1)**2-8*x**2) # 展开
factor(1-x**2) # 因式分解
apart(1/((t**2+1)*(t**3+1))) # 部分分式
```

化简
```py
refine(sqrt((x - 1)**2), Q.positive(x - 1)) # x - 1
refine(sqrt((x - 1)**2), Q.real(x)) # Abs(x - 1)

x = Symbol('x', real=True) # 定义实数 x. 等价: Symbol('x', domain=S.Reals)
simplify(sqrt(x**2)) # 自动化简为 Abs(x)
```

求函数零点
```py
solve(x**2-x-1, x)

J = Interval.Ropen(0, 2*pi) # 区间 [0, 2⋅π). 等价: And(0 <= x, x < 2*pi).as_set()
solveset(sin(x), x, J) # {0, π}
```

## 特定领域

线性代数
```py
m = Matrix([[1, 1], [0, 1]])
m.det() # 等价: det(m)
m.eigenvals() # 特征值
m.eigenvects() # 特征向量

linsolve([a+b-5, 2*a-3*b], [a, b]) # 线性方程组
```

微积分
```py
summation(1/n**2, (n, 1, oo)) # 求和. 等价: Sum(...).doit()
integrate(exp(-x**2), (x, 0, oo)) # 求积分. 等价: Integral(...).doit()
limit(sin(x)/x, x, 0) # 求极限. 等价: Limit(...).doit()
diff(x**2, x) # 求导. 等价: Derivative(...).doit()
```

数论
```py
primerange(1, 100) # 素数范围
isprime(2017) # 素数判断
nextprime(2017) # 下一个素数
factorint(2077) # 整数分解
gcd(10, 25)
gcd(x**2+2*x+1, x+1)
```

数域
```py
K = QQ.algebraic_field(sqrt(2), sqrt(3)) # 数域 Q(√2,√3) = Q(√2+√3)
K.ext # 生成元 √2+√3
K.orig_ext # 构造 K 时所用的生成元 √2, √3

minpoly(sqrt(2)+sqrt(3), x) # 最小多项式. 等价: minimal_polynomial(...)
minpoly(sqrt(2)+sqrt(3), domain=K)

factor(1+x**2, gaussian=True) # 在高斯数域 Q(i) 上分解
factor(1+x**4, extension=sqrt(2)) # 在 Q(√2) 上分解. 等价: domain='QQ<sqrt(2)>'
factor(x**3+x+1, modulus=3) # 有有限域 F_3 上分解

exp(2*I*pi/3).is_algebraic # 是代数数
```

## 例题

- 已知 `f = x**3 - 3*x - 1` 在有理数域上不可约, `a` 是 `f` 的一个根, `b = 3*a**2 + 7*a + 5`.
试将 `b**-1` 表示成 `a0 + a1 * a + a2 * a**2` 的形式.
```py
a = rootof(x**3 - 3*x - 1, 0) # 多项式的第一个根
K = QQ.algebraic_field(a) # 扩域
res = K.from_sympy(1/(3*a**2 + 7*a + 5))
print(K.to_sympy(res)) # 答案是 (7*a**2 - 26*a + 28)/111, 可以用待定系数手算验证
```

- 在有限域 `F_2` 上, `f = x**1024+x+1`, `g = x**4+x+1`, 判断 `g | f` 是否成立
```py
f = Poly(x**1024+x+1, modulus=2)
g = Poly(x**4+x+1, modulus=2)
f % g # Poly(0, x, modulus=2)
```

- 验证 `(1+√5)/2` 是代数整数
```py
minpoly((1+sqrt(5))/2, x) # x**2 - x - 1, 这是 ℤ 上的首一多项式
```

- `a` 是 `x**3-x**2-2*x-8` 的一个根, 求证 `b = (a**2-a)/2-1` 是代数整数.
```py
f = x**3 - x**2 - 2*x - 8
a = CRootOf(f, 0)
b = (a**2-a)/2-1
minpoly(b, x) # x**3 + x**2 + 2*x - 8, 和 a 的最小多项式很像
```
