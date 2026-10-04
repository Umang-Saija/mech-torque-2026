#!/usr/bin/env bash
# Live-action version: builds the 3D "base" picture with gaps (black) where the
# real-people stock footage goes. The stock clips, the transparent text/UI
# overlays (overlay-open.mov, overlay-resolve.mov) and final-audio-mix.wav are
# then layered in Descript (stock footage can't be downloaded to this machine).
#
# Frame map at 24 fps (1260 frames, 52.5 s):
#   0    - 366   stock: night struggle + phone call     (overlay-open.mov on top)
#   366  - 792   3D: blueprint, scan, assembly, data plate, handwheel (from the story master)
#   792  - 1086  3D: install + one-hand turn, product only (plate-9x16-a/b/c)
#   1086 - 1142  stock: relief / celebration              (overlay-resolve.mov on top)
#   1142 - 1260  3D: end card (from the story master)
set -euo pipefail
cd "$(dirname "$0")/out"
ffmpeg -loglevel error -y \
  -i story-picture-9x16.mp4 -i plate-9x16-a.mp4 -i plate-9x16-b.mp4 -i plate-9x16-c.mp4 \
  -f lavfi -i "color=c=black:s=1080x1920:r=24:d=15.25" -f lavfi -i "color=c=black:s=1080x1920:r=24:d=2.3333333" \
  -filter_complex "\
[0:v]trim=start_frame=366:end_frame=792,setpts=PTS-STARTPTS[m1];\
[0:v]trim=start_frame=1142:end_frame=1260,setpts=PTS-STARTPTS[m2];\
[1:v][2:v][3:v]concat=n=3:v=1[pl];\
[4:v]format=yuv420p[b1];[5:v]format=yuv420p[b2];\
[b1][m1][pl][b2][m2]concat=n=5:v=1,fps=24,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset slow -crf 16 -an -movflags +faststart live-base-9x16.mp4
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 live-base-9x16.mp4
