#!/bin/zsh
# Cut + speed-ramp source footage into 1080x2340 H.264 segments for Remotion.
SRC="${0:A:h}/../../flosspost Zantal Demo.mp4"
OUT="${0:A:h}/../public/seg"
cut() { # name start end outDuration
  local speed=$(( ($3 - $2) / $4 ))
  ffmpeg -v error -y -ss $2 -t $(( $3 - $2 )) -i "$SRC" -an \
    -vf "setpts=(PTS-STARTPTS)/$speed,fps=30,scale=1080:2340:flags=lanczos,format=yuv420p" \
    -t $4 -c:v libx264 -preset medium -crf 17 "$OUT/$1.mp4" && echo "$1 ${speed}x"
}
cut s2   0.0   5.0  5.0
cut s3   5.0  35.0  6.5
cut s4  35.0  49.0  7.3
cut s5  49.0  66.0 13.7
cut s6  66.0  71.0  2.5
cut s7a 71.0  73.6  2.6
cut s7c 89.2  91.6  2.4
cut s9  95.8 101.5  9.0
# rewind: 66s of the chat played backwards in ~1.1s
ffmpeg -v error -y -ss 4 -t 66 -i "$SRC" -an -vf "setpts=(PTS-STARTPTS)/60,fps=30,reverse,scale=1080:2340,format=yuv420p" -c:v libx264 -crf 20 "$OUT/rewind.mp4" && echo rewind
