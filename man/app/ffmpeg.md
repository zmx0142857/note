# ffmpeg

https://itsfoss.com/ffmpeg/

https://eyehere.net/2019/the-complete-guide-for-using-ffmpeg-in-linux/

## info

    $ ffmpeg -i video.mp4 -hide_banner # show file info
    $ ffmpeg -formats # show supported formats

## convert

    $ ffmpeg -i video.mp4 output.avi # convert video
    $ ffmpeg -i audio.wav output1.ogg output2.mp3 # convert audio

    $ ffmpeg -i video.avi -qscale 0 output.mp4 # keep quality

    # -c:v = coder video
    # -c:a = coder audio
    # copy = same as input file
    $ ffmpeg -i video.mp4 -c:v copy -c:a libvorbis output.avi

## video and audio

extract audio

    # -vn = video nope
    # -ab / -b:a = audio bitrate
    # -f = format
    # -ac = audio channels
    # -ar = audio sample ratio
    $ ffmpeg -i video.mp4 -vn [-ab 128k] audio.mp3
    $ ffmpeg -i video.mov -vn [-ar 44100] [-ac 2] [-b:a 128k] [-f mp3] audio.mp3

extract video

    # -an = audio nope
    $ ffmpeg -i video.mp4 -an output.mp4

extract picture (screenshot)

    # -r = rate (fps, frames per second, default=25)
    # -f = format (image2 sequence)
    $ ffmpeg -i video.mp4 -r 1 -f image2 image-%3d.png

video + audio

    $ ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a aac output.mp4
    $ ffmpeg -i video.m4s -i audio.m4s -c:v copy -c:a aac -strict experimental output.mp4 # version < 4

adjust volume

`-af` means audio filter

    $ ffmpeg -i input.mp3 -af "volume=-3dB" output.mp3

## scale

    # -s = scale
    $ ffmpeg -i input.mov -s 1024x576 output.mp4
    $ ffmpeg -i video.h264 -s 640x480 -c:a output.mov
    $ ffmpeg -i video.mp4 -aspect 4:3 output.mp4

## split

将视频切分成每段 1800 秒 (即 30 分钟)

    $ ffmpeg -i input.mp4 -f segment -segment_time 1800 -vcodec copy -map 0 out%d.mp4

截取视频片段

    $ ffmpeg -i input.mp4 -ss 00:00:00 -to 00:00:30 -c copy output.mp4
