# python 虚拟环境解决方案

## pip

```sh
$ pip config set global.cache-dir /d/app/py/pip-cache # 缓存管理
$ pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple # 清华镜像
```

## ipython

创建配置文件: `ipython profile create [name]`

`~/.ipython/profile_default/ipython_config.py`
```
c.InteractiveShellApp.exec_lines = [
    'from sympy import *' # 启动时自动执行
]
```

## venv

python 自带的虚拟环境解决方案. 只有 create, activate, deactivate 等简单功能, 无法更换 python 版本

```
$ python -m venv myenv # 在当前目录下新建一个目录 myenv, 并在其中建立虚拟环境
$ source myenv/Scripts/activate # 启用虚拟环境
(myenv) $ pip list # 列出虚拟环境下的包
(myenv) $ pip install # 把包安装到虚拟环境中
(myenv) $ deactivate # 退出虚拟环境
```

## conda

推荐 [miniconda](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-latest-Windows-x86_64.exe), 它比 anaconda 小得多:

conda 在 git bash 下似乎不能正常使用, 下面介绍 cmd 的用法:

- 将 `conda.bat` 所在目录加到 PATH 中
- 编辑 `~/.condarc`:
  ```
  envs_dirs:
    - D:\app\conda-env
  ```
- 新建环境变量 `WORKON_HOME`, 值为 `D:\app\conda-env`, 目的是让 vscode 能检测到虚拟环境

environments

    cmd> conda info -e                          # 查看环境, 也可以用 conda list environments
    cmd> conda info                             # 当前环境详情
    cmd> conda create --name py312 python=3.12  # 创建
    cmd> conda create --name copy --clone py312 # 拷贝
    cmd> conda remove --name py312 --all        # 删除
    cmd> conda activate py312                   # 进入
    (py312) cmd> conda deactivate               # 离开

packages

    (py312) cmd> conda list <package>           # 查找本地包
    (py312) cmd> conda search <package>         # 查找在线包
    (py312) cmd> conda install <package>
    (py312) cmd> conda update <package>
    (py312) cmd> conda remove <package>

mirrors

    cmd> conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
    cmd> conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
    cmd> conda config --set show_channel_urls yes

## 更多方案

- pdm: 为 python 的依赖管理提供类似 nodejs npm 的体验
- mamba
- poetry

