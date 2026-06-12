# n 次方根
def root(a, n=2):
    if a < 0:
        raise ValueError(f'root: a={a}')
    x = 1
    while True:
        x = ((n - 1) * x + a // x ** (n - 1)) // n
        if x ** n <= a:
            break
    return x

# 二分查找
def bsearch(arr, x):
    lo = 0
    hi = len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
    return lo

class Sieve:
    def __init__(self):
        self.primes = []     # 已生成的素数列表
        self.limit = 2       # 当前筛到的上限
        self.is_comp = bytearray(2)

    # 素数生成 (Eratosthenes 筛法)
    def run(self, n):
        if n <= self.limit:
            return

        # 扩展 is_comp 数组
        new_is_comp = bytearray(n + 1)
        new_is_comp[:len(self.is_comp)] = self.is_comp
        self.is_comp = new_is_comp

        # 用已知素数标记合数
        for p in self.primes:
            start = self.limit
            start += (p - start % p) % p # 向上取到 p 的倍数
            for i in range(start, n + 1, p):
                self.is_comp[i] = 1

        # 扫描新区间，发现新素数
        for i in range(self.limit, n + 1):
            if self.is_comp[i]:
                continue
            self.primes.append(i)
            for j in range(i * i, n + 1, i):
                self.is_comp[j] = 1

        self.limit = n

    # 返回第 a 个素数
    def get_prime(self, a):
        while a > len(self.primes):
            self.run(max(self.limit * 2, 100))
        return self.primes[a - 1]

sieve = Sieve()

# 筛函数, 计算 ≤ x 且与前 a 个素数互素的整数个数
def varphi(x, a):
    if a == 0 or x == 0:
        return x

    key = (x, a)
    value = varphi.cache.get(key)
    if value is not None:
        return value

    p_a = sieve.get_prime(a) # 第 a 个素数
    if x < p_a:
        varphi.cache[key] = 1
        return 1

    res = varphi(x, a - 1) - varphi(x // p_a, a - 1)
    varphi.cache[key] = res
    return res

varphi.cache = {}

# π(x) = φ(x, a) + a - 1,  a = π(√x)
def pi_legendre(x):
    if x < 2:
        return 0
    a = prime_pi(root(x, 2))
    return varphi(x, a) + a - 1

# π(x) = φ(x, a) + a - 1 - P₂,  a = π(∛x)
# P₂ = Σ (π(x/p) - π(p) + 1) for ∛x < p ≤ √x
def pi_lehmer(x):
    if x < 2:
        return 0
    a = prime_pi(root(x, 3))
    b = prime_pi(root(x, 2))

    # varphi 项
    res = varphi(x, a) + a - 1

    # P₂ 修正项：遍历 ∛x < p ≤ √x 的素数
    for i in range(a + 1, b + 1):
        p = sieve.get_prime(i)
        res -= prime_pi(x // p) - prime_pi(p) + 1

    return res

# 素数计数（小值直接查表，大值用 Lehmer）
def prime_pi(x, method=pi_lehmer):
    if x < 2:
        return 0

    value = prime_pi.cache.get(x)
    if value is not None:
        return value

    if x <= 1_000_000:
        sieve.run(x)
        res = bsearch(sieve.primes, x)
    else:
        res = method(x)

    prime_pi.cache[x] = res
    return res

prime_pi.cache = {}

def test_prime_pi():
    # 4, 25, 168, 1229, 9592, 78498, 664579, 5761455, 50847534
    print([prime_pi(10**n) for n in range(1, 10)])

def test_sieve():
    for x in [100, 1000, 10000, 100000]:
        sieve.run(x)
        print(len(sieve.primes))

if __name__ == '__main__':
    test_prime_pi()
