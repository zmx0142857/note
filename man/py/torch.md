# Torch

- 官网: pytorch.org
- google colab: 提供计算资源, 在线运行 notebook
- hugging face
- kaggle
- [常用数据集](https://zhuanlan.zhihu.com/p/377746284)
- [动手学深度学习](https://zh.d2l.ai/)

## Install

    cmd> conda create --name py312 python=3.12 # use miniconda
    cmd> conda activate py312
    (py312) cmd> nvidia-smi # 查看 N 卡型号

在官网选择对应版本, 执行对应的命令, 例如适合我的机器的版本是 (stable 2.5.1, windows, pip, python, cuda 12.1), 对应的命令就是:

    cmd> pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    cmd> pip install scikit-learn # 常用数据集
    cmd> pip install matplotlib # 绘图库
    cmd> pip install ipykernel # jupyter notebook 依赖的库

## 自动微分

https://zh.d2l.ai/chapter_preliminaries/autograd.html

```py
import torch

x = torch.arange(4.0, requires_grad=True)
y = 2 * torch.dot(x, x)
y.backward()    # 使用反向传播计算 y 对 x 的梯度
x.grad          # tensor([ 0.,  4.,  8., 12.])

x.grad.zero_()  # 清除梯度, 以便计算另一个函数的梯度
y = x.sum()
y.backward()
x.grad          # tensor([1., 1., 1., 1.])

x.grad.zero_()
y = x * x           # 逐分量乘法
u = y.detach()
z = u * x           # 计算 z = u * x 关于 x 的偏导数, 但把 u 视为常数
z.sum().backward()  # 逐分量求导, 即每个 z[i] 对 x[i] 的导数
x.grad == u         # tensor([True, True, True, True])

x.grad.zero_()
y.sum().backward()
x.grad == 2 * x     # tensor([True, True, True, True])
```

反向传播不止适用于数学函数, 也适用于一般的 python 函数:
```py
def f(a):
    b = a * 2
    while b.norm() < 1000:
        b = b * 2
    if b.sum() > 0:
        c = b
    else:
        c = 100 * b
    return c

a = torch.randn(size=(), requires_grad=True)
d = f(a)
d.backward()
print(a.grad == d / a) # f 是分段线性函数, 所以有 a.grad == d / a
```
