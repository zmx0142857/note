# 数据分析

## numpy

矩阵/张量运算.

🚧 施工中

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
