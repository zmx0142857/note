const symbols = {
  And: Symbol('And'),
  Or: Symbol('Or'),
  Fn: Symbol('Fn'),
  Nat: Symbol('Nat'),
  Eq: Symbol('Eq')
}

class Type {
  constructor (name = 'A') {
    if (typeof name === 'symbol') {
      this.sym = name
    } else {
      this.sym = Symbol(name)
    }
  }
  equals (other) {
    return this.sym === other.sym
  }
  toString () {
    return this.sym.description
  }
  item () {
    return new Item(this)
  }
}

class Item {
  constructor (type, name = '') {
    this.type = type
    this.name = name
  }
  toString () {
    if (this.name) return `${this.name}: ${this.type}`
    return `Item(${this.type.toString()})`
  }
}

class And extends Type {
  constructor (left, right) {
    super(symbols.And)
    this.left = left
    this.right = right
  }
  equals (other) {
    if (this.sym !== other.sym) return false
    return this.left.equals(other.left) && this.right.equals(other.right)
  }
  toString () {
    return `(${this.left} & ${this.right})`
  }
  item () {
    return new AndItem(this.left, this.right)
  }
}

class AndItem extends Item {
  constructor (A, B) {
    super(new And(A, B))
    this.left = A.item()
    this.right = B.item()
  }
  static cons (left, right) {
    const item = new And(left.type, right.type).item()
    item.left = left
    item.right = right
    return item
  }
}

class Or extends Type {
  constructor (left, right) {
    super(symbols.Or)
    this.left = left
    this.right = right
  }
  equals (other) {
    if (this.sym !== other.sym) return false
    return this.left.equals(other.left) && this.right.equals(other.right)
  }
  toString () {
    return `(${this.left} | ${this.right})`
  }
  item () {
    return new OrItem(this.left, this.right)
  }
}

class OrItem extends Item {
  constructor (A, B) {
    super(new Or(A, B))
  }
  static cons (left, right) {
    if (!(left instanceof Item) && !(right instanceof Item)) {
      throw new Error('OrItem: one of left or right must be Item')
    }
    if (left instanceof Item) left = left.type
    if (right instanceof Item) right = right.type
    return new Or(left, right).item()
  }
}

class Fn extends Type {
  constructor (left, right) {
    super(symbols.Fn)
    this.left = left
    this.right = right
  }
  equals (other) {
    if (this.sym !== other.sym) return false
    return this.left.equals(other.left) && this.right.equals(other.right)
  }
  toString () {
    return `(${this.left} -> ${this.right})`
  }
  item () {
    return new FnItem(this.left, this.right)
  }
}

class FnItem extends Item {
  constructor (A, B) {
    super(new Fn(A, B))
  }
  static cons (A, f) {
    const a = A.item()
    const b = f(a)
    if (b.type === False) return new Item(new Not(A))
    return new FnItem(A, b.type)
  }
  apply (a) {
    if (!a.type.equals(this.type.left)) {
      throw new Error(`FnItem.apply: type mismatch: ${a.type}, ${this.type.left}`)
    }
    return this.type.right.item()
  }
}

const False = new Type('false')

class Not extends Fn {
  constructor (A) {
    super(A, False)
  }
  toString () {
    return `Not(${this.left})`
  }
}

class Eq extends Type {
  constructor (left, right) {
    super(symbols.Eq)
    if (!left.type.equals(right.type)) {
      throw new Error('Eq: types must be equal')
    }
    this.type = left.type
    this.left = left
    this.right = right
  }
  equals (other) {
    if (this.sym !== other.sym) return false
    return this.left === other.left && this.right === other.right
  }
  toString () {
    return `(${this.left} = ${this.right})`
  }
  item () {
    return new EqItem(this.left, this.right)
  }
}

class EqItem extends Item {
  constructor (left, right) {
    super(new Eq(left, right))
    this.left = left
    this.right = right
  }
  static rfl (expr) {
    return new EqItem(expr, expr)
  }
  symm () {
    return new EqItem(this.right, this.left)
  }
  rw (item) {
    if (!item instanceof EqItem) {
      throw new Error('EqItem.rw: item must be EqItem')
    }
    if (this.left === item.left) {
      return new EqItem(item.right, this.right)
    } else if (this.right === item.left) {
      return new EqItem(this.left, item.right)
    } else {
      throw new Error('EqItem.rw: failed to match')
    }
  }
}

// class Any extends Type {
//   constructor ({ type, predicate, name = 'x' }) {
//     this.type = type
//     this.x = type.item()
//     this.x.name = name
//     this.statement = predicate(this.x)
//   }
//   toString () {
//     return `∀${this.name}. ${this.statement}`
//   }
// }

// class Exist extends Type {
//   constructor ({ type, predicate, name = 'x' }) {
//     this.type = type
//     this.x = type.item()
//     this.x.name = name
//     this.statement = predicate(this.x)
//   }
//   toString () {
//     return `∃${this.name}. ${this.statement}`
//   }
// }

class Nat extends Type {
  constructor () {
    super(symbols.Nat)
  }
  static zero // overwritten
  static add_zero (n) {
    if (!(n.type instanceof Nat)) {
      throw new Error('Nat.add_zero: n must be Nat')
    }
    return new EqItem(n, new NatAdd(n, Nat.zero))
  }
  static add_succ (m, n) {
    if (!(m.type instanceof Nat) || !(n.type instanceof Nat)) {
      throw new Error('Nat.add_succ: m and n must be Nat')
    }
    return new EqItem(new NatAdd(m, new NatSucc(n)), new NatSucc(new NatAdd(m, n)))
  }
}

class NatItem extends Item {
  constructor (name) {
    super(new Nat(), name)
  }
  succ () {
    return new NatSucc(this)
  }
  add (other) {
    return new NatAdd(this, other)
  }
  induction (zero_case, succ_case) {
    // TODO
  }
}
Nat.zero = new NatItem('0')

class NatSucc extends NatItem {
  constructor (prev) {
    super()
    this.prev = prev
  }
  toString () {
    return `Nat.succ(${this.prev})`
  }
}

class NatAdd extends NatItem {
  constructor (left, right) {
    super()
    this.left = left
    this.right = right
  }
  toString () {
    return `(${this.left} + ${this.right})`
  }
}

const proof = (A, a) => {
  if (a === 'sorry') {
    console.warn(`sorry: ${A}`)
    return true
  }
  console.log(`proof: ${a.type}`)
  return A.equals(a.type)
}

// A -> (A -> B) -> B
const test1 = () => {
  const A = new Type('A')
  const B = new Type('B')
  const a = new Item(A, 'a')
  const f = new FnItem(A, B)
  f.name = 'f'
  console.log([a, f].join(', '))
  return proof(B, f.apply(a))
}

// A -> Not Not A
const test2 = () => {
  const A = new Type('A')
  return proof(new Fn(A, new Not(new Not(A))),
    FnItem.cons(A, a => FnItem.cons(new Not(A), na => na.apply(a)))
  )
}

// A -> B -> A & B
const test3 = () => {
  const A = new Type('A')
  const B = new Type('B')
  return proof(new Fn(A, new Fn(B, new And(A, B))),
    FnItem.cons(A, a => FnItem.cons(B, b => AndItem.cons(a, b)))
  )
}

// A -> A | B
const test4 = () => {
  const A = new Type('A')
  const B = new Type('B')
  return proof(new Fn(A, new Or(A, B)),
    FnItem.cons(A, a => OrItem.cons(a, B))
  )
}

// a = b & b = c -> a = c
const test5 = () => {
  const A = new Type('A')
  const a = new Item(A, 'a')
  const b = new Item(A, 'b')
  const c = new Item(A, 'c')
  const H = new And(new Eq(a, b), new Eq(b, c))
  return proof(new Fn(H, new Eq(a, c)),
    FnItem.cons(H, h => h.left.rw(h.right))
  )
}

// 0 + a = a
// 证: induction a with a h
// zero_case: 0 + 0 = 0
// succ_case:
//   h: 0 + a = a
//   goal: 0 + succ(a) = succ(a)
//   rw add_succ: succ(0 + a) = succ(a)
//   rw h: succ(a) = succ(a)
//   rfl
const test6 = () => {
  const a = new NatItem('a')
  const { zero } = Nat
  return proof(new Eq(new NatAdd(zero, a), a),
    'sorry'
    // TODO
    // a.induction(
    //   Nat.add_zero(zero),
    //   (a, h) => new EqItem.rfl(a)
    // )
  )
}

console.log(test6())
