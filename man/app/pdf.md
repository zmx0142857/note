# pdf 工具集

## 实用软件

查看器
- windows: Edge 浏览器、Sumatra
- linux: evince

编辑器
- Adobe Acrobat（付费）
- [pdf 命令行工具合集](https://sspai.com/prime/story/cli-utils-for-pdf-manipulations)
- ⭐[qpdf](https://qpdf.readthedocs.io/en/stable/): c++ 编写. [中文简介](https://cloud.tencent.cn/developer/article/2485712)
- [pdftk](https://linux.die.net/man/1/pdftk)
- pdfjam
- pypdf
- mupdf

JS 库
- ⭐[pdf-lib](https://github.com/Hopding/pdf-lib): 创建、**修改** pdf
- jsPDF: 从头生成 pdf: 社区资源丰富
- pdfmake: 基于声明式语法生成 pdf
- PDF.js: pdf 网页渲染器

## 图片转 pdf

### 小米手机相册

【长按选择照片/Creativity/Create PDF】

### image magick

- windows 用户需要安装 ghostscript (gswin64c.exe)
- 安装 imagemagick, 并启用 pdf 功能:

`/etc/ImageMagick-6/policy.xml`
```xml
<!-- disable ghostscript format types -->
<policy domain="coder" rights="none" pattern="PS" />
<policy domain="coder" rights="none" pattern="EPS" />
<policy domain="coder" rights="none" pattern="PDF" /> <------- Here!!
<policy domain="coder" rights="none" pattern="XPS" />
```

image to pdf

    $ magick *.jpg out.pdf
    $ magick *.jpg +compress out.pdf

pdf to image

    # -scene 1         输出的图片从 1 开始编号 (默认从 0 开始)
    # [0-9]            pdf 页码范围从 0 到 9 (页码也是从 0 开始)
    # -density         此参数必须在读入 pdf 前指定。magick in.pdf -density 300 out.jpg 是无效的。
    #                  density 越大，图片分辨率越高；代价是花费更多时间。
    # -resample        表示最终的分辨率。一般 density 设为 resample 的两倍。
    # -colorspace RGB  使得彩色图片在浏览器中正常显示
    # -alpha remove    防止图片出现黑色背景

    $ magick -scene 1 -density 360 -colorspace RGB in.pdf[0-9] -resample 180 -alpha remove out%03d.jpg

## 其它格式转换

### djvu to pdf

两种方法:

    $ djvups input.djvu | ps2pdf - output.pdf
    $ ddjvu -format=pdf -quality=85 -verbose input.djvu output.pdf

### pdf to eps

    $ pdftops -eps # 文件可能变大

### pdf to svg

    $ pdf2svg file.pdf file.svg

## 目录编辑

[HareInWeed/pdf-toc](https://github.com/HareInWeed/pdf-toc)
```sh
$ pip install pdf-toc # 安装
$ pdf-toc --show-toc toc file.pdf > toc.txt # 导出目录信息
$ pdf-toc -t toc.txt -d new-file.pdf file.pdf # 写入目录, 生成新的 pdf
```

用下面的 shell 脚本简化命令
```sh
function toc() {
  if [ "$1" == "read" ]; then
    pdf-toc --show-toc toc "$2" > toc.txt && echo "output: toc.txt"
  elif [ "$1" == "write" ]; then
    filename="${2%.*}.new.pdf"
    if [ -n "$3" ]; then
      filename="$3"
    fi
    pdf-toc -t toc.txt -d $filename "$2" && echo "output: $filename"
  else
    echo "usage: toc [read/write] file.pdf [output.pdf]"
  fi
}
```

## 其它操作

### 页面截取与合并

    $ pdfseparate -f 10 -l 20 input.pdf out/%03d.pdf
    $ cd out && pdfunite *.pdf out.pdf

用 LaTeX 截取 pdf 文件:
```tex
\documentclass[a4paper]{article}
\usepackage{pdfpages}
\begin{document}
\includepdfmerge{1.pdf,1-3}
\includepdfmerge{2.pdf,5-13}
\end{document}
```

### 去除白边

    $ sudo apt install texlive-extra-utils
    $ pdfcrop --margins "10 20 10 25" input.pdf output.pdf # 左上右下

### 提取插图

    $ sudo apt install poppler-utils
    $ pdfimages -png -f 10 -l 20 input.pdf img_name # get all images of page 10-20

## Trouble Shooting

- edge 浏览器下, pdf 中文标注不显示
  - 将 `edge://flags/#edge-new-pdf-viewer` 设为 enabled
