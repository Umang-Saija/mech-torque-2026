/**
 * Final finishing pass: picture + score -> social-ready MP4.
 *  - light film grain and a soft vignette (the "graded" look)
 *  - audio loudness-normalised to -14 LUFS / -1 dBTP (Instagram, LinkedIn)
 *  - H.264 High, yuv420p, AAC 48 kHz, faststart
 *
 *   node finish.js story       -> out/MechTorque-Story-9x16.mp4, out/MechTorque-Story-4x5.mp4
 *   node finish.js reel        -> out/MechTorque-Product-9x16.mp4, ...-4x5.mp4
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const comp = process.argv[2] || 'story';
const OUT = path.join(__dirname, 'out');
const audio = path.join(OUT, comp === 'story' ? 'story-score.wav' : 'score.wav');
const pic = f => path.join(OUT, comp === 'story' ? `story-picture-${f}.mp4` : `product-picture-${f}.mp4`);
const name = f => path.join(OUT, `MechTorque-${comp === 'story' ? 'Story' : 'Product'}-${f}.mp4`);

for (const f of ['9x16', '4x5']) {
    if (!fs.existsSync(pic(f))) { console.log('skip (no picture yet):', pic(f)); continue; }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', pic(f), '-i', audio,
        '-filter_complex', '[0:v]noise=c0s=5:c0f=t+u,vignette=angle=PI/5:mode=forward,format=yuv420p[v];[1:a]loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[a]',
        '-map', '[v]', '-map', '[a]', '-shortest',
        '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '17', '-maxrate', '16M', '-bufsize', '32M',
        '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', name(f)], { stdio: 'inherit' });
    console.log('final:', name(f));
}
