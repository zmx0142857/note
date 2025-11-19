# pdf 工具集

https://sspai.com/prime/story/cli-utils-for-pdf-manipulations

## 页面截取

    $ pdfseparate -f 10 -l 20 input.pdf out/%03d.pdf
    $ cd out && pdfunite *.pdf out.pdf

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

## edge pdf 查看器

- 中文标注不显示的问题: 将 `edge://flags/#edge-new-pdf-viewer` 设为 enabled 即可解决
