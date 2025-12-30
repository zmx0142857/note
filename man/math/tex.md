# LaTeX

## install

> windows 下推荐安装 miktex, 它会在需要时为你安装 LaTeX 宏包.
> 另一个有名的 LaTeX 发行版是 texlive, 功能虽全, 体积臃肿.

    $ scoop install miktex

## quick start

`demo.tex`
```tex
\documentclass{standalone}
\usepackage{ctex}
\begin{document}
\LaTeX 测试 ing...
\end{document}
```

    $ xelatex demo.tex
