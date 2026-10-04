#!/usr/bin/env bash
# Final live-action cut, 9:16, 52.5 s @ 24 fps.
# Real people: Gemini-generated plates (live/gemini-shots.mp4, 720x1280, 20 s, 7 shots).
# Product: the exact 3D model (story master + product-only plates). The Gemini shot of
# a red handwheel (15-17 s) is NOT used: it is not the MT-30's handwheel.
#
#  story time      source                                  notes
#  0.00 - 2.40     gemini 0.00-2.00  (x1.20 slow)          night plant
#  2.40 - 4.60     gemini 1.90-4.00  (x1.048)              Ravi strains at the bar
#  4.60 - 6.20     gemini 4.10-5.70                        Suresh comes to help
#  6.20 - 11.60    gemini 6.10-11.90 (x0.931)              both push, then defeat; tight crop
#  11.60 - 15.25   gemini 12.05-14.95 (x1.259)             the call; softens behind the call card
#  15.25 - 33.00   story master                            blueprint, scan, assembly, data plate
#  33.00 - 45.25   product plates a/b/c                    install, one hand, 0-90, it holds
#  45.25 - 47.60   gemini 17.00-19.35                      relief / handshake, morning
#  47.60 - 52.50   story master                            end card
# Text, timestamp, call card and letterbox for the live sections come from the transparent
# overlays rendered from story.html (overlay-open.mov, overlay-resolve.mov).
set -euo pipefail
cd "$(dirname "$0")"
G=live/gemini-shots.mp4
O=out
# reframe 720x1280 -> 1080x1920 with a slight push-in (also crops Gemini's corner mark)
FIT="scale=1404:2496:flags=lanczos,crop=1080:1920,unsharp=5:5:0.6,setsar=1,fps=24,format=yuv420p"
TIGHT="crop=576:1024:72:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.7,setsar=1,fps=24,format=yuv420p"
ffmpeg -loglevel error -y \
  -i "$G" -i $O/story-picture-9x16.mp4 -i $O/plate-9x16-a.mp4 -i $O/plate-9x16-b.mp4 -i $O/plate-9x16-c.mp4 \
  -i $O/overlay-open.mov -i $O/overlay-resolve.mov -i $O/final-audio-mix.wav \
  -filter_complex "\
[0:v]split=6[g0][g1][g2][g3][g4][g5];\
[g0]trim=0:2.02,setpts=(PTS-STARTPTS)*1.2,$FIT,trim=end_frame=58[l0];\
[g1]trim=1.9:4.0,setpts=(PTS-STARTPTS)*1.0476,$FIT,trim=end_frame=52[l1];\
[g2]trim=4.1:5.75,setpts=PTS-STARTPTS,$FIT,trim=end_frame=39[l2];\
[g3]trim=6.1:11.9,setpts=(PTS-STARTPTS)*0.931,$TIGHT,trim=end_frame=129[l3a];\
color=c=black:s=1080x1920:r=24:d=6,format=rgba,geq=r=0:g=0:b=0:a='clip((Y-1120)/330\,0\,1)*238'[shade];\
[l3a][shade]overlay=0:0:shortest=1,format=yuv420p[l3];\
[g4]trim=12.03:14.98,setpts=(PTS-STARTPTS)*1.2586,$FIT,trim=end_frame=88,split[c0][c1];\
[c1]gblur=sigma=14,eq=saturation=0.25:brightness=-0.12[cb];\
[c0][cb]blend=all_expr='A*(1-clip((T-1.1)/0.6,0,1))+B*clip((T-1.1)/0.6,0,1)'[l4];\
[g5]trim=17.0:19.35,setpts=PTS-STARTPTS,$FIT,trim=end_frame=56[l6];\
[1:v]split=2[m0][m1];\
[m0]trim=start_frame=366:end_frame=792,setpts=PTS-STARTPTS,format=yuv420p[s1];\
[m1]trim=start_frame=1142:end_frame=1260,setpts=PTS-STARTPTS,format=yuv420p[s3];\
[2:v][3:v][4:v]concat=n=3:v=1,format=yuv420p[s2];\
[l0][l1][l2][l3][l4]concat=n=5:v=1[open];\
[open][5:v]overlay=0:0:format=auto,format=yuv420p[openT];\
[l6][6:v]overlay=0:0:format=auto,format=yuv420p[resT];\
[openT][s1][s2][resT][s3]concat=n=5:v=1,noise=c0s=5:c0f=t+u,vignette=angle=PI/5,format=yuv420p[v]" \
  -map "[v]" -map 7:a -shortest \
  -c:v libx264 -profile:v high -preset slow -crf 18 -maxrate 14M -bufsize 28M \
  -c:a aac -b:a 256k -movflags +faststart $O/MechTorque-Live-9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 $O/MechTorque-Live-9x16.mp4
