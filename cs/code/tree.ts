interface KeyNode<T> {
  key: T
}

interface ParentTreeNode<T> extends KeyNode<T> {
  parent?: ParentTreeNode<T>
}

interface BinaryTreeNode<T> extends KeyNode<T> {
  left?: BinaryTreeNode<T>
  right?: BinaryTreeNode<T>
  children: BinaryTreeNode<T>[]
}

type BinaryTreeNodeConstructor<T> = { new (key: T): BinaryTreeNode<T> }

class TreeNode<T> implements ParentTreeNode<T>, BinaryTreeNode<T> {
  key: T
  parent?: TreeNode<T>
  children: TreeNode<T>[] = []

  constructor (key: T) {
    this.key = key
  }

  get left (): TreeNode<T> | undefined {
    return this.children[0]
  }

  get right (): TreeNode<T> | undefined {
    return this.children[1]
  }

  set left (node: TreeNode<T> | undefined) {
    node && (this.children[0] = node)
  }

  set right (node: TreeNode<T> | undefined) {
    node && (this.children[1] = node)
  }
}

// 二叉树
// TODO: 传入泛型 nodeType, 在构造方法中调用 new nodeType()
class BinaryTree<T> {
  root?: BinaryTreeNode<T>

  // arr 是完全二叉树的数组表示, 空结点用 undefined 表示
  constructor (arr?: Array<T | undefined>, nodeType: BinaryTreeNodeConstructor<T> = TreeNode) {
    if (arr && arr[0] !== undefined) {
      const nodes: Array<BinaryTreeNode<T> | undefined> = arr.map(n =>
        n !== undefined ? new nodeType(n) : undefined
      )
      this.root = nodes[0]
      for (let i = 0; (i << 1) + 1 < arr.length; ++i) {
        const node = nodes[i]
        if (node !== undefined) {
          node.left = nodes[(i << 1) + 1]
          node.right = nodes[(i << 1) + 2]
        }
      }
    }
  }

  static *preOrder<T> (root?: BinaryTreeNode<T>): Generator<BinaryTreeNode<T>, any, undefined> {
    if (root) {
      yield root
      yield *this.preOrder(root.left)
      yield *this.preOrder(root.right)
    }
  }

  static *inOrder<T> (root?: BinaryTreeNode<T>): Generator<BinaryTreeNode<T>, any, undefined> {
    if (root) {
      yield *this.inOrder(root.left)
      yield root
      yield *this.inOrder(root.right)
    }
  }

  static *postOrder<T> (root?: BinaryTreeNode<T>): Generator<BinaryTreeNode<T>, any, undefined> {
    if (root) {
      yield *this.postOrder(root.left)
      yield *this.postOrder(root.right)
      yield root
    }
  }

  static *levelOrder<T> (root?: BinaryTreeNode<T>): Generator<BinaryTreeNode<T>, any, undefined> {
    const queue: BinaryTreeNode<T>[] = []
    root && queue.push(root)
    while (queue.length) {
      root = queue.shift() as BinaryTreeNode<T>
      yield root
      root.left && queue.push(root.left)
      root.right && queue.push(root.right)
    }
  }

  // 完全二叉树遍历, 空结点用 undefined 填充
  static *completeOrder<T> (root?: BinaryTreeNode<T>): Generator<BinaryTreeNode<T> | undefined, any, undefined> {
    const queue: Array<BinaryTreeNode<T> | undefined> = []
    root && queue.push(root)
    let notNullCount = 1
    while (queue.length && notNullCount) {
      root = queue.shift()
      yield root
      root && --notNullCount
      if (root) {
        queue.push(root.left)
        queue.push(root.right)
        root.left && ++notNullCount
        root.right && ++notNullCount
      } else {
        queue.push(undefined)
        queue.push(undefined)
      }
    }
  }

  toString (): string {
    const buf: Array<T | undefined> = [...BinaryTree.completeOrder(this.root)].map(x => x && x.key)
    return `${this.constructor.name} [${buf.join(', ')}]`
  }

  // right === true 时, 把 node 插入为 parent 的右子结点, 否则作为左子结点
  // parent === undefined 时, node 作为根结点
  transplant (parent?: BinaryTreeNode<T>, node?: BinaryTreeNode<T>, right: boolean = false) {
    if (parent) {
      if (right) {
        parent.right = node
      } else {
        parent.left = node
      }
    } else {
      this.root = node
    }
  }
}

// 二叉搜索树
class BSTree<T> extends BinaryTree<T> {
  search (key: T) {
    let parent = BSTree.getParent(this.root, key)
    if (!parent) return undefined
    return key < parent.key ? parent.left : parent.right
  }

  // 在以 root 为根的子树中, 寻找适合插入/删除 key 的父结点
  private static getParent<T> (root: BinaryTreeNode<T> | undefined, key: T) {
    let parent = undefined
    while (root && root.key !== key) {
      parent = root
      root = key < root.key ? root.left : root.right
    }
    return parent
  }

  // 在以 root 为根的子树中, 寻找最大/最小值的父结点
  private static minmax<T> (root: BinaryTreeNode<T> | undefined, index: number) {
    let parent = undefined
    while (root && root.children[index]) {
      parent = root
      root = root.children[index]
    }
    return parent
  }

  max (): BinaryTreeNode<T> | undefined {
    const parent = BSTree.minmax(this.root, 1)
    return parent && parent.right
  }

  min (): BinaryTreeNode<T> | undefined {
    const parent = BSTree.minmax(this.root, 0)
    return parent && parent.left
  }

  insert (node: BinaryTreeNode<T>) {
    const parent = BSTree.getParent(this.root, node.key)
    this.transplant(parent, node, parent && parent.key < node.key)
  }

  delete (node: BinaryTreeNode<T>) {
    const parent = BSTree.getParent(this.root, node.key)
    const lr = parent && parent.right === node
    if (!node.left) {
      this.transplant(parent, node.right, lr)
    } else if (!node.right) {
      this.transplant(parent, node.left, lr)
    } else { // 左右子结点均非空, 用后继补位
      const p = BSTree.minmax(node.right, 0) // parent of successor
      let successor
      if (p) { // node.right 不是 node 的后继
        successor = p.left as BinaryTreeNode<T>
        this.transplant(p, successor.right, true)
        successor.right = node.right
      } else { // node.right 是 node 的后继
        successor = node.right
      }
      this.transplant(parent, successor, lr)
      successor.left = node.left
    }
  }
}

type RBColor = 'r' | 'b'

class RBTreeNode<T> extends TreeNode<T> {
  color: RBColor = 'b'
}

// 红黑树
class RBTree<T> {
  // nil 是根的父结点, 也是所有叶结点
  readonly nil: RBTreeNode<T> = { color: 'b' } as RBTreeNode<T>
  root?: RBTreeNode<T>

  // right === true 时, 把 node 插入为 parent 的右子结点, 否则作为左子结点
  private transplant (parent: RBTreeNode<T>, node: RBTreeNode<T>, right: boolean = false) {
    node.parent = parent
    if (parent !== this.nil) {
      if (right) {
        parent.right = node
      } else {
        parent.left = node
      }
    } else {
      this.root = node
    }
  }

  // 以边 x -- y 为轴旋转
  rotate (x: RBTreeNode<T>, index: number) {
    let y = x.children[1-index] as RBTreeNode<T>
    this.transplant(x, y.children[index] as RBTreeNode<T>, index === 0)
    let parent = x.parent as RBTreeNode<T>
    this.transplant(parent, y, x === parent.right)
    this.transplant(y, x, index === 1)
  }
}

function testBinaryTree() {
  /*
         0
       /   \
      1     2
     / \   /
    3   4 5
       / \
      6   7
  */
  // new 的时候, 泛型 <number> 可以省略
  const nodes = [0, 1, 2, 3, 4, 5, 6, 7].map(n => new TreeNode(n))
  const t = new BinaryTree()
  t.root = nodes[0]
  nodes[0].left = nodes[1]
  nodes[0].right = nodes[2]
  nodes[1].left = nodes[3]
  nodes[1].right = nodes[4]
  nodes[2].left = nodes[5]
  nodes[4].left = nodes[6]
  nodes[4].right = nodes[7]
  console.log(t.toString()) // BinaryTree [0, 1, 2, 3, 4, 5, , , , 6, 7]

  const t1 = new BinaryTree([0, 1, 2, 3, 4, 5, , , , 6, 7])
  console.log(t1.toString())
}

function testBSTree() {
  const t = new BSTree([12, 5, 18, 2, 9, 15, 19, , , , , , 17])
  console.log([...BSTree.inOrder(t.root)].map(n => n.key))
  console.log(t.min()?.key, t.max()?.key)
  t.insert(new TreeNode(13))
  console.log(t.toString())
  let node = t.search(18)
  console.log(node?.key)
  if (node) t.delete(node)
  console.log(t.toString())
  if (node = t.search(19)) t.delete(node)
  console.log(t.toString())
}

function testRBTree() {
  const t = new RBTree()
}

//testBinaryTree()
//testBSTree()
testRBTree()
