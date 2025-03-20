# 数据分析

## numpy

矩阵/张量运算.

- [From Python to Numpy](https://www.labri.fr/perso/nrougier/from-python-to-numpy/)
- [100 Numpy Exercises](https://github.com/rougier/numpy-100)

### 基础

创建
```py
np.array([[1, 2, 3], [4, 5, 6]])
np.arange(1, 7).reshape(2, 3)       # 同上
np.linspace(1, 6, 6).reshape(2, 3)  # 同上, 但类型是 float
np.zeros((2, 3))                    # 全 0
np.ones((2, 3))                     # 全 1
np.eye(4)                           # 单位阵
np.random.random((2, 3))            # 随机
np.random.choice([0, 1], size=(3,3), p=[0.5,0.5]) # 随机 3 阶 01 矩阵
```

信息
```py
a.dtype    # 元素类型
a.ndim     # 维数
a.size     # 元素总数
a.shape    # 每个维度的元素数
a.itemsize # 每个元素的字节数
a.strides  # a.strides[i] 表示第 i 个维度下标增加 1 时, 在内存中应该前进几个字节
```

广播
```py
np.sin, np.cos, np.exp, np.log...
```

聚合
```py
a.sum(axis=0) # 列和
a.min(axis=1)
a.cumsum(axis=1) # cumulative sum 不改变数组形状, 相当于 itertools.accumulate
```

矩阵
```py
a.T # 转置
a @ b, a.dot(b), np.matmul(a, b) # 乘法
```

切片
```py
a[(1,2)]                    # 取出元素
a[::] = 0                   # 清零
a[1:-1, 1:-1] = 0           # 指定区域清零
a.view(np.int8)[...] = 0    # 快速清零
a[::-1]                     # 反转
a[(3 < a) & (a < 8)] *= -1  # 条件查询
```

其它
```py
a.nonzero()[0]      # 找到非零元的下标
np.pad(a, pad_width=1, mode='constant', constant_values=0) # 加边
np.fill_diagonal(a, np.arange(1, 5)) # 填充对角线
np.unravel_index(99,(6,7,8)) # 找到第 100 个元素在 (6,7,8) 数组中的下标
np.tile([[0, 1], [1, 0]], (4, 4)) # 平移填充
np.intersect1d(a, b) # 求交集
```

## pandas

表格处理, 常用于 csv 文件.

- https://zh.d2l.ai/chapter_preliminaries/pandas.html

### 案例

以下面的文件为例:

`data/house_tiny.csv`
```csv
NumRooms,Alley,Price
NA,Pave,127500
2,NA,106000
4,NA,178100
NA,NA,140000
```

`main.py`
```py
import pandas as pd

data = pd.read_csv('./data/house_tiny.csv')         # 读取文件
inputs, ouputs = data.iloc[:, 0:2], data.iloc[:, 2] # inputs 是表格的前两列, outputs 是最后一列
inputs = pd.get_dummies(inputs, dummy_na=True)      # 将非数值列 Alley 转化为两个 0-1 列
inputs = inputs.fillna(inputs.mean())               # 用均值填充缺失值
inputs = input.drop(columns=['Alley_nan'])          # 删除列
print(inputs)
```

最终输出:
```text
   NumRooms  Alley_Pave
0       3.0        True
1       2.0       False
2       4.0       False
3       3.0       False
```

### 数据导出

```py
data.to_numpy(dtype=float) # 转换为 numpy 矩阵
data.values # 这也是一个 numpy 矩阵, 但 dtype=object
```

## matplotlib

图表/可视化

- 在 windows 运行下面的程序前, 确保在安装 python 时已经勾选 tcl/tk, 否则会出现报错
  `no module named 'tkinter'`
- 在 linux 上遇到图形不能显示, 可能是缺少底层的图形库, 试试 `sudo apt install python-tk`
  或 `pip install PyQt5`

`plot_demo.py`
```py
import numpy as np
import matplotlib.pyplot as plt
import math

# 选择底层图形库
# import matplotlib
# matplotlib.use('TkAgg')

def plot(x, y, format=('-', 'm--', 'g-.'), legend=(), title='', xlabel='x', ylabel='y', grid=True):
    if not isinstance(x, list):
        x = [x] * len(y)
    for x, y, fmt in zip(x, y, format):
        plt.plot(x, y, fmt)
    plt.title(title, fontsize=14)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    if legend:
        plt.legend(legend)
    plt.grid(visible=grid)
    plt.show()

# 绘制函数图像
x = np.arange(0, 3, 0.1)
plot(
    x,
    y=[3 * x**2 - 4 * x, 2*x-3],
    title='derivatives',
    xlabel='x',
    ylabel='f(x)',
    legend=('f(x)', 'tangent (x=1)'),
)

# 正态密度函数
def normal(x, mu, sigma):
    return np.exp(-0.5 / sigma**2 * (x - mu)**2) / math.sqrt(2 * math.pi * sigma**2)

x = np.arange(-7, 7, 0.01)
params = [(0, 1), (0, 2), (3, 1)]
plot(
    x,
    y=[normal(x, mu, sigma) for mu, sigma in params],
    xlabel='x',
    ylabel='p(x)',
    legend=[f'mean {mu}, std {sigma}' for mu, sigma in params],
)
```

`roll_dice.py`
```py
%matplotlib inline
import torch
from torch.distributions import multinomial
import matplotlib.pyplot as plt
import numpy as np
import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

fair_probs = torch.ones([6]) / 6 # 相当于 torch.ones(6) / 6
sample_count = 10
result = multinomial.Multinomial(sample_count, fair_probs).sample((500,)) # 使用多项分布模拟掷骰子
cum_result = result.cumsum(dim=0)
estimates = cum_result / cum_result.sum(dim=1, keepdim=True)
print(result.shape, cum_result.shape, estimates.shape) # 都是 torch.Size([500, 6])
plt.clf()
for i in range(6):
    plt.plot(estimates[:, i].numpy(), label=f'P(die={i+1})')
plt.axhline(y=0.167, color='black', linestyle='dashed')
plt.gca().set_xlabel('Groups of experiments')
plt.gca().set_ylabel('Estimated probability')
plt.legend()
plt.show()
```

## Trouble shooting

- matplotlib 和 torch 同时引入时, 画图可能报错 lib 重复引入, 解决方法是设置环境变量:
  ```py
  import os
  os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
  ```
