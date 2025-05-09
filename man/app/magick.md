# image magick - convert images

## format convert

png to jpg
```bash
$ for f in *.png; do
$   magick $f ${f%.png}.jpg
$ done
```

image to pdf: see [./tex/pdf.md](./tex/pdf.md)

## edit picture

picture info

    $ magick identify in.jpg
    $ magick identify 004.jpeg | cut -d ' ' -f 3 # 获取文件大小

resize

    $ magick -resize 50% in.jpg out.jpg
    $ magick -resize 100x100 in.jpg out.jpg

    # better for pixel art:
    $ magick -scale 800% in.png out.png

rotate

    $ magick -rotate 90 in.jpg out.jpg # 正数是顺时针, 负数是逆时针

add border

    $ magick -border 40x40 -bordercolor '#ffffff' in.jpg out.jpg

add text

    $ magick -fill '#114514' -pointsize 20 -font SimSun -draw 'text 50,20 "114514"' in.jpg out.jpg

black white

    $ magick -monochrome in.jpg out.png
    $ magick -threshold 55% in.jpg out.png
    $ magick -alpha set -channel RGBA -fuzz 30% -fill '#ffffff' -opaque '#aaaaaa' -monochrome in.jpg out.png # better

negate / invert color

    $ magick in.jpg -negate out.jpg

crop

    # crop a mini-picture, width=100, height=80, left=50, top=30
    $ magick -crop 100x80+50+30 in.jpg out.jpg

    # crop grids
    $ magick -crop 100x100 in.jpg out.jpg

    # crop in left/right half
    $ magick in.jpg -crop 50%x100% out.jpg

background

    $ magick in.png -background white -flatten out.jpg # add background
    $ magick in.png -transparent white out.png # transparent background
    $ magick composite -compose atop -geometry +400+300 2.png 7eea99fd16fb92de.jpg out.jpg # overlap

## graphicsmagick

    $ sudo apt install graphicsmagick
    $ gm

