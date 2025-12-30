# Lean4

- [Lean Game Server](https://adam.math.hhu.de/#/): 寓教于乐
- [Mathematics in Lean](https://leanprover-community.github.io/mathematics_in_lean/): 教程电子书
- [Theorem Proving in Lean4](https://leanprover.github.io/theorem_proving_in_lean4/): 一个更严肃的教程

## Install

### 如果网络环境允许...

安装 vscode 的 lean 插件. 在右上角点击 ∀ -> Documentation... 打开 Welcome 页面, 根据指引安装 lean.

### 否则手动安装...

[安装教程](https://zhuanlan.zhihu.com/p/681926036)

1. 下载包管理器 [elan](https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh),
   运行 `elan-init.sh`, 然后选择 Cancel 退出, 这时终端下 `elan` 命令已经可用.
1. 打开 [mathlib4](https://github.com/leanprover-community/mathlib4), 查看 `lean-toolchain` 文件中记录的 lean4 具体版本, 例如 `leanprover/lean4:v4.13.0-rc3`.
1. 下载对应版本的 [lean4](https://github.com/leanprover/lean4/releases), 解压到自己喜欢的地方, 比如 `/d/app/lean4/lean-4.13.0-rc3-windows`. 然后软链接到 elan 的目录下面:
   ```sh
   $ elan toolchain link leanprover/lean4:v4.13.0-rc3 /d/app/lean4/lean-4.13.0-rc3-windows
   $ ls .elan/toolchains/
   leanprover--lean4---v4.13.0-rc3
   $ elan default leanprover/lean4:v4.13.0-rc3
   info: default toolchain set to 'leanprover/lean4:v4.13.0-rc3'
   ```
1. 现在终端下应该有 `lean` 和 `lake` 命令可用. lake 是 lean 的项目管理器.
1. 安装 mathlib. 执行以下命令, 在当前目录下新建一个名为 `lean4-demo` 的项目:
   ```sh
   $ lake +leanprover-community/mathlib4:lean-toolchain new lean4-demo math
   $ cd lean4-demo
   $ lake exe cache get # 安装 mathlib, 请耐心等待...
   $ lake build # 检验项目是否配置正确
   ```
1. 在 vscode 中安装 lean4 插件. 现在可以打开项目了!

### Trouble Shooting

1. 执行 `lake exe cache get` 时出现 `external command 'curl' exited with code 35`
   > 这是一个网络问题, 在解析依赖地址时出现错误. 可以改写 `lakefile.toml`, 指明依赖的地址:
   > ```toml
   > [[require]]
   > name = "mathlib"
   > scope = "leanprover-community"
   > git = "https://github.com/leanprover-community/mathlib4"
   > rev = "master"
   > ```

2. github 连不上时: 下面的方法**不能**解决问题:
   ```
   -- require mathlib from git "https://github.com/leanprover-community/mathlib4"@"master"
   require mathlib from "../lean4-demo/.lake/packages/mathlib"
   ```

3. `import MathLib.Tactics` 安装 proofwidgets 时报错找不到 npm-cli.js: 这是由于脚本 npm.cmd 的路径写错. 打开 `npm.cmd`, 把它改成绝对路径, 然后 Restart File
   ```
   SET "NPM_CLI_JS=D:\app\nodejs\node_modules\npm\bin\npm-cli.js"
   ::SET "NPM_CLI_JS=%~dp0\node_modules\npm\bin\npm-cli.js"
   ::FOR /F "delims=" %%F IN ('CALL "%NODE_EXE%" "%NPM_CLI_JS%" prefix -g') DO (
   ::  SET "NPM_PREFIX_NPM_CLI_JS=%%F\node_modules\npm\bin\npm-cli.js"
   ::)
   ```

## Learn

### symbols

|symbol|type|
|------|----|
| ← | \l |
| ≫ | \gg |
| ∀ | \all |
| ∃ | \ex |
| ¬ | \not |

### tactics

- `rfl`: reflexivity of equality. 用于证明形如 `X = X` 的命题.
- `exact h`: 当目标和已知条件 `h` 完全相同时使用.
- `rw [h]`: rewrite. 用于变量代换.
  - 例如 `h: y = x` 时, `rw [h]` 把目标中的 `y` 替换为 `x`.
  - `rw [←h]` 则把 `x` 替换为 `y`.
  - `rw [h1, h2]` 先后进行两个代换.
  - `repeat rw [h]` 可以一次性完成所有代换.
  - `rw [add_zero x]`: 显式指定命题 `P(x)` 中的变量 `x`.
  - `nth_rewrite 3 [h]`: 仅替换目标中的第 3 个变量.
  - `rw [zero_add] at h`: 对条件 `h` 进行替换.
- `induction n with d hd`: 对 n 使用数学归纳法; 在归纳步骤, 对于数字 d 假设命题 hd 成立.
- `apply`: 应用定理
  - `apply h2 at h1`: 对 `h1: A` 应用定理 `A \to B`, `h1` 转化为 `B`.
  - `apply h`: 对目标`B` 应用定理 `A \to B`.目标将转化为 `A`.
  - `a \ne b`: 这是 `a = b \to False` 的简写, 因此可以用于 `apply`.
- `intro h`: 将目标从 `h \to g` 转换为 `g`, 并新增一个已知条件 `h`.
  - `intro ⟨p,q⟩`: 当目标形如 `P \and Q \to R` 时, 同时获得两个已知条件, 并把目标转换为 `R`.
  - `intro p q`: 是 `intro p` 然后 `intro q` 的缩写.
- `symm`: 将目标从 `x = y` 变成 `y = x`, `x \ne y` 变成 `y \ne x`.
  - `symm at h`: 对条件 `h` 作上述转化.
- `cases'`: 分类讨论.
  - 如果你不需要 `induction n with d hd` 里面的归纳假设 `hd`, 就可以用 `cases' n with d`.
  - 如果你有一个条件 `h: False`, 使用 `cases' h` 将立即完成证明 (虚真论断).
  - 对条件 `h:∃ x, P(x)` 应用 `cases' h with d hd` 将得到 `x` 和 `P(x)`. 这相当于 `obtain \<d, hd\> := h`.
  - 对条件 `A \or B` 应用 `cases' h with h1 h2` 将得到两个目标, 这两个目标都要证明.
- `trivial`: 如果目标是 `True`, 直接使用 `trivial` 完成证明.
- `contrapose! h`: 反证法, 把 `h` 换成目标的否定, 目标换成 `h` 的否定. 相当于 `intro h1` 然后 `apply h`.
- `use x`: 把结论 `∃ x, P(x)` 化为 `P(x)`.
- `constructor`: 当目标是 `A \and B` 时, 将目标分解为两个.
- `left`, `right`: 当目标是 `A \or B` 时, 选择一个来证明. 相当于 `apply Or.inl` 和 `apply Or.inr`.
- `have`: 用于提出一个命题并证明.
- `push_neg`: 用于把 `\not` 向右移动
  - `\not \not P` 变成 `P`
  - `\not(P \or Q)` 变成 `\not P \and \not Q`
  - 更多...
- `ext x; constructor`: 用来证明集合相等. 相当于 `apply Subset.antisymm; intro x`
- `by_cases h: x \in A`: 分类讨论, 分别在 `x \in A` 和 `x \notin A` 的条件下证明目标.

#### 万金油

- `simp`: 用于证明等式
- `decide MyAlgorithm`: 使用算法 `MyAlgorithm` 来解决形如 `a = b` 或 `a \ne b` 的目标. 算法名称是可省略的.
- `tauto`: 逻辑万金油. 比如目标是 `True` 时, `tauto` 会完成证明. 条件中有 `False` 时, 它也会完成证明.
- `ring`: 用于证明多项式等式
- `linarith`: 更为强大的等式证明器
- `ext`: 外延定义万金油

## examples

### 加法交换律

旧语法 (在 natural number game 中)
```lean
theorem add_comm (a b : \N): a + b = b + a := by
  induction b with d hd
  {
    rw [add_zero, zero_add]
    rfl
  }
  {
    rw [add_succ, succ_add, hd]
    rfl
  }
```
可以将 `theorem add_comm` 换成 `example`, 这时不需要定理的名字.

新语法 (在 vscode 中)
```lean
theorem add_comm (a b : Nat): a + b = b + a := by
  induction b
  case zero =>
    rw [Nat.add_zero, Nat.zero_add]
  case succ b h =>
    rw [Nat.add_succ, Nat.succ_add, h]
```

### 自动化简

```lean
example (a b c d e f g h : Nat) : (d + f) + (h + (a + c)) + (g + e + b) = a + b + c + d + e + f + g + h := by
  simp only [Nat.add_assoc, Nat.add_comm, Nat.add_left_comm]

-- 创建一个自定义 tactic
macro "simp_add" : tactic => `(tactic|(
  simp only [add_assoc, add_left_comm, add_comm]))
```

### cases 新语法

```lean
example (x y : Nat) (h : x = 37 ∨ y = 42) : y = 42 ∨ x = 37 := by
  cases h
  case inl h =>
    right
    exact h
  case inr h =>
    left
    exact h
```

### 证明全序 (natural number game)

```lean
theorem le_total (x y : Nat) : x ≤ y ∨ y ≤ x := by
induction y with d hd
{
  right
  exact zero_le x
}
{
  cases hd with h1 h2
  {
    left
    cases h1 with a
    use succ a
    rw [add_succ, h]
    rfl
  }
  {
    cases h2 with a
    cases a with b
    {
      rw [add_zero] at h
      left
      rw [h]
      use 1
      rw [succ_eq_add_one]
      rfl
    }
    {
      right
      rw [h, add_succ]
      use b
      rw [succ_add]
      rfl
    }
  }
}
```

### 不使用 exact, have 和 rw 完成下面的证明

这是人做的题吗
```lean
example (P Q R S : Prop) (h1 : R ↔ S) (h2 : ¬((P → Q ∨ ¬S) ∧ (S ∨ P → ¬Q) → (S → Q)) ↔ P ∧ Q ∧ ¬S)
: ¬((P → Q ∨ ¬R) ∧ (R ∨ P → ¬Q) → (R → Q)) ↔ P ∧ Q ∧ ¬R
:= by
  constructor
  {
    intro a
    apply (fun h3: ¬((P → Q ∨ ¬R) ∧ (R ∨ P → ¬Q) → (R → Q)) => ⟨
      (h2.mp
        fun h4: ((P → Q ∨ ¬S) ∧ (S ∨ P → ¬Q) → (S → Q)) ↦ h3 (fun ⟨hl₅,hr₅⟩ l ↦ h4 ⟨
          λa ↦ or_elim
            (hl₅ a)
            or_inl
            (or_inr ∘ imp_trans h1.mpr),
          λ_ ↦ hr₅ (or_inl l)
        ⟩ (h1.mp l))
      ).left,
      (h2.mp
        fun h4: ((P → Q ∨ ¬S) ∧ (S ∨ P → ¬Q) → (S → Q)) ↦ h3 (fun ⟨hl₅,hr₅⟩ l ↦ h4 ⟨
          λa ↦ or_elim
            (hl₅ a)
            or_inl
            (or_inr ∘ imp_trans h1.mpr),
          λ_ ↦ hr₅ (or_inl l)
        ⟩ (h1.mp l))
      ).right.left,
      (h2.mp
        fun h4: ((P → Q ∨ ¬S) ∧ (S ∨ P → ¬Q) → (S → Q)) ↦ h3 (fun ⟨hl₅,hr₅⟩ l ↦ h4 ⟨
          λa ↦ or_elim
            (hl₅ a)
            or_inl
            (or_inr ∘ imp_trans h1.mpr),
          λ_ ↦ hr₅ (or_inl l)
        ⟩ (h1.mp l))
      ).right.right ∘ h1.mp
    ⟩)
    assumption
  }
  {
    intro a
    apply (fun v: (P ∧ Q ∧ ¬R) => false_elim (
      h2.mpr
        ⟨v.left, v.right.left, v.right.right ∘ h1.mpr⟩
        λ_ _ ↦ v.right.left
    ))
    assumption
  }
```

### 函数

```lean
fun <name>: <Prop> => <expr>
λ <name> : <Prop> ↦ <expr>
```

左结合性:
```lean
a b c
等价于 (a b) c

a <| b c
等价于 a (b c)
```

然而函数类型是右结合的:
```lean
P \to Q \to R
等价于 P \to (Q \to R)
```

下面两种写法等价:
```lean
fun a => fun b => c
fun a b => c
```

双重否定的证明
```lean
example (A: Props): A \to \not \not A := by
  exact fun na: \not A => false_elim (na a)
```

一些集合论习题
```lean
example (F G : Set (Set U)) (h1 : ⋃₀ (F ∩ Gᶜ) ⊆ (⋃₀ F) ∩ (⋃₀ G)ᶜ) : (⋃₀ F) ∩ (⋃₀ G) ⊆ ⋃₀ (F ∩ G) := by

intro x ⟨h2,h3⟩
cases' h2 with s hs
cases' h3 with t ht
by_cases h: s ∈ G
{
  have h4: s ∈ F ∩ G := ⟨hs.left, h⟩
  use s
  constructor
  exact h4
  exact hs.right
}
{
  by_contra hn
  rw [mem_sUnion] at hn
  push_neg at hn
  have h4 : s∈ F ∩ Gᶜ := ⟨hs.left,h⟩
  have h5 : x∈ ⋃₀ (F ∩ Gᶜ)
  {
    use s
    exact ⟨h4,hs.right⟩
  }
  have ⟨h6,h7⟩ := h1 h5
  rw [mem_compl_iff, mem_sUnion] at h7
  push_neg at h7
  exact h7 t ht.left ht.right
}

example (F G : Set (Set U)) : (⋃₀ F) ∩ (⋂₀ G)ᶜ ⊆ ⋃₀ {s | ∃ u ∈ F, ∃ v ∈ G, s = u ∩ vᶜ} := by

intro x ⟨h1,h2⟩
rw [mem_sUnion]
cases' h1 with u hu
rw [mem_compl_iff, mem_sInter] at h2
push_neg at h2
cases' h2 with v hv
use u ∩ vᶜ
constructor
{
  rw [mem_setOf]
  use u
  constructor
  exact hu.left
  use v
  constructor
  exact hv.left
  rfl
}
{
  exact ⟨hu.right,hv.right⟩
}
```

## ts 实现简易证明助手

```ts
// ts 证明助手
type Fn<P, Q> = (arg: P) => Q
type _Fns<A extends any[], result extends any> =
  A extends [infer first, ...infer rest] ? Fn<first, _Fns<rest, result>> : result
type Fns<A extends any> = A extends [...infer rest, infer last] ? _Fns<rest, last> : never
type Not<P> = Fn<P, never>
type And<P, Q> = [P, Q]
type Or<P, Q> = P | Q

// P → Q → (P → Q)
type Prop0<P, Q> = Fns<[P, Q, Fn<P, Q>]>
const proof0: Prop0<"P", "Q"> = f => x => (f => x)

// (P → Q) → (Q → R) → (P → R)
type Prop1<P, Q, R> = Fns<[Fn<P, Q>, Fn<Q, R>, Fn<P, R>]>
const proof1: Prop1<"P", "Q", "R"> = f => g => x => g(f(x))

// P → ¬¬P
type Prop2<P> = Fn<P, Not<Not<P>>>
const proof2: Prop2<"P"> = p => np => np(p)

// P → Q → P∧Q
type Prop3<P, Q> = Fns<[P, Q, And<P, Q>]>
const proof3: Prop3<"P", "Q"> = p => q => [p, q]

// 自然数
type Nat = "Nat"
const noop: any = () => noop
const zero: Nat = noop
const succ: Fn<Nat, Nat> = noop
const one = succ(zero)
// pattern match?
```

```js
// js 证明助手
const symbols = {
  sym: Symbol('sym'),
  type: Symbol('type'),
  and: Symbol('and'),
  or: Symbol('or'),
  fn: Symbol('fn'),
  left: Symbol('left'),
  right: Symbol('right'),
}

const Type = name => Symbol(name)
Type.equals = (A, B) => {
  if (A === B) return true
  if (A[symbols.sym] !== B[symbols.sym]) return false
  switch (A[symbols.sym]) {
    case symbols.and:
    case symbols.or:
      return (Type.equals(A[symbols.left], B[symbols.left]) && Type.equals(A[symbols.right], B[symbols.right])) || (Type.equals(A[symbols.left], B[symbols.right]) && Type.equals(A[symbols.right], B[symbols.left]))
    case symbols.fn:
      return Type.equals(A[symbols.left], B[symbols.left]) && Type.equals(A[symbols.right], B[symbols.right])
  }
  return false
}

const Item = (A) => ({
  [symbols.type]: A,
})

const And = (A, B) => ({
  [symbols.sym]: symbols.and,
  [symbols.left]: A,
  [symbols.right]: B,
})
And.cons = (a, b) => ({
  [symbols.type]: And(a[symbols.type], b[symbols.type]),
  [symbols.left]: a,
  [symbols.right]: b,
})
And.left = a => {
  console.assert(a[symbols.type][symbols.sym] === symbols.and)
  return Item(a[symbols.type][symbols.left])
}
And.right = a => {
  console.assert(a[symbols.type][symbols.sym] === symbols.and)
  return Item(a[symbols.type][symbols.right])
}

const Or = (A, B) => ({
  [symbols.sym]: symbols.or,
  [symbols.left]: A,
  [symbols.right]: B,
})
Or.inl = (a, B) => Item(Or(a[symbols.type], B))
Or.inr = (A, b) => Item(Or(A, b[symbols.type]))

const Fn = (A, B) => ({
  [symbols.sym]: symbols.fn,
  [symbols.left]: A,
  [symbols.right]: B,
})
Fn.cons = (A, f) => {
  const a = Item(A)
  const b = f(a)
  return Item(Fn(A, b[symbols.type]))
}
Fn.apply = (f, a) => {
  console.assert(f[symbols.type][symbols.sym] === symbols.fn)
  if (!Type.equals(f[symbols.type][symbols.left], a[symbols.type])) {
    throw new Error('Fn.apply: invalid type', f[symbols.type], a[symbols.type])
  }
  return Item(f[symbols.type][symbols.right])
}

const False = Symbol('false')
const Not = A => Fn(A, False)

const proof = (A, a) => {
  console.log('proof', a[symbols.type])
  return Type.equals(A, a[symbols.type])
}

// -------------------------

const test1 = () => {
  const A = Type('A')
  const B = Type('B')
  const a = Item(A)
  const f = Item(Fn(A, B))
  const res = proof(B,
    Fn.apply(f, a)
  )
  console.log('test1', res)
}

// A -> Not Not A
// A -> ((A -> False) -> False)
const test2 = () => {
  const A = Type('A')
  const res = proof(Fn(A, Not(Not(A))),
    Fn.cons(A, a => Fn.cons(Not(A), na => Fn.apply(na, a)))
  )
  console.log('test2', res)
}

test2()
```
