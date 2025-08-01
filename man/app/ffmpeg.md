# ffmpeg

- https://itsfoss.com/ffmpeg/
- https://eyehere.net/2019/the-complete-guide-for-using-ffmpeg-in-linux/

## info

    $ ffmpeg -i video.mp4 -hide_banner # show file info
    $ ffmpeg -formats # show supported formats
    $ ffmpeg -hwaccels # 查看硬件加速选项

## convert

    $ ffmpeg -i video.mp4 output.avi # convert video
    $ ffmpeg -i audio.wav output1.ogg output2.mp3 # convert audio
    $ ffmpeg -i video.avi -qscale 0 output.mp4 # keep quality
    $ ffmpeg -i video.mp4 -c:v copy -c:a libvorbis output.avi

- `-c:v`: coder video
- `-c:a`: coder audio
- `-copy`: same as input file

## compress

    $ ffmpeg -i input.mp4 output.mp4 # 最简单: 使用默认编码
    $ ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 output.mp4

- `-crf`: 0 无损压缩, 18 高质量, 23 标准, 28 小体积
- `-preset`: 预设值, 可选 `ultrafast`, `superfast`, `medium`, `slow`, `veryslow`

## video and audio

extract audio

    $ ffmpeg -i video.mp4 -vn [-ab 128k] audio.mp3
    $ ffmpeg -i video.mov -vn [-ar 44100] [-ac 2] [-b:a 128k] [-f mp3] audio.mp3

- `-vn`: video nope
- `-ab / -b:a`: audio bitrate
- `-f`: format
- `-ac`: audio channels
- `-ar`: audio sample ratio

extract video

    $ ffmpeg -i video.mp4 -an output.mp4

- `-an`: audio nope

extract picture (screenshot)

    $ ffmpeg -i video.mp4 -r 1 -f image2 image-%3d.png

- `-r`: rate (fps, frames per second, default=25)
- `-f`: format (image2 sequence)

video + audio

    $ ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a aac output.mp4
    $ ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a aac -strict experimental output.mp4 # version < 4

adjust volume

    $ ffmpeg -i input.mp3 -af "volume=-3dB" output.mp3

- `-af`: audio filter

## scale

    $ ffmpeg -i input.mov -s 1024x576 output.mp4
    $ ffmpeg -i video.h264 -s 640x480 -c:a output.mov
    $ ffmpeg -i video.mp4 -aspect 4:3 output.mp4

- `-s`: scale

## split

将视频切分成每段 1800 秒 (即 30 分钟)

    $ ffmpeg -i input.mp4 -f segment -segment_time 1800 -vcodec copy -map 0 out%d.mp4

截取视频片段

    $ ffmpeg -i input.mp4 -ss 00:00:00 -to 00:00:30 -c copy output.mp4
