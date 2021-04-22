interface KeyNode<T> {
  key: T
}

// 双向链表结点
interface ListNode<T> extends KeyNode<T> {
  prev: ListNode<T>
  next: ListNode<T>
  // TODO: 能否将静态方法 nil 加入接口?
}

// 带哨兵的双向循环链表
interface List<T> extends Iterable<ListNode<T>> {
  head: ListNode<T>

  empty (): boolean
  insertAfter (dest: ListNode<T>, node: ListNode<T>): void
  delete (node: ListNode<T>): void
  search (key: T): ListNode<T>
}

class LinkedListNode<T> implements ListNode<T> {
  key: T
  prev: ListNode<T>
  next: ListNode<T>

  constructor (key?: T, prev?: ListNode<T>, next?: ListNode<T>) {
    this.key = key as T
    this.prev = prev || LinkedListNode.nil
    this.next = next || LinkedListNode.nil
  }

  static readonly nil: ListNode<any> = {} as ListNode<any>
}

class LinkedList<T> implements List<T> {
  head: ListNode<T>

  constructor (arr?: T[]) {
    // 建立空表
    this.head = new LinkedListNode<T>()
    this.head.prev = this.head.next = this.head
    // 用数组初始化
    if (arr) {
      arr.forEach(key => {
        const node: ListNode<T> = new LinkedListNode<T>(key)
        this.insertAfter(this.head.prev, node)
      })
    }
  }

  *[Symbol.iterator] (): Iterator<ListNode<T>, any, undefined> {
    let x: ListNode<T> = this.head.next
    while (x !== this.head) {
      yield x
      x = x.next
    }
  }

  toString (): string {
    const buf: T[] = [...this].map(x => x.key)
    return `${this.constructor.name} [${buf.join(', ')}]`
  }

  empty (): boolean {
    return this.head.next === this.head
  }

  insertAfter (dest: ListNode<T>, node: ListNode<T>): void {
    node.next = dest.next
    dest.next.prev = node
    node.prev = dest
    dest.next = node
  }

  delete (node: ListNode<T>): void {
    node.next.prev = node.prev
    node.prev.next = node.next
  }

  search(key: T): ListNode<T> {
    let node = this.head.next
    while (node !== this.head && node.key !== key) {
      node = node.next
    }
    return node
  }
}

function testLinkedList () {
  const l1: List<number> = new LinkedList<number>()
  console.log(l1.toString(), l1.empty())
  const l2: List<number> = new LinkedList<number>([1, 1, 4, 5, 1, 4])
  console.log(l2.toString(), l2.empty())
  while (!l2.empty()) {
    l2.delete(l2.head.next)
    console.log(l2.toString())
  }
}

testLinkedList()
