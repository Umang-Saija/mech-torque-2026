/**
 * Final finishing pass: picture + score -> social-ready MP4.
 *  - light film grain and a soft vignette (the "graded" look)
 *  - audio loudness-normalised to -14 LUFS / -1 dBTP (Instagram, LinkedIn)
 *  - H.264 High, yuv420p, AAC 48 kHz, faststart
 *
 *   node finish.js story [vo.wav] -> out/MechTorque-Story-9x16.mp4, out/MechTorque-Story-4x5.mp4
 *   node finish.js reel        -> out/MechTorque-Product-9x16.mp4, ...-4x5.mp4
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const comp = process.argv[2] || 'story';
const OUT = path.join(__dirname, 'out');
const audio = path.join(OUT, comp === 'story' ? 'story-score.wav' : 'score.wav');
const pic = f => path.join(OUT, comp === 'story' ? `story-picture-${f}.mp4` : `product-picture-${f}.mp4`);
const voArg = process.argv[3];   // optional: a voice-over wav (default out/story-vo.wav for the story)
const vo = voArg ? path.resolve(voArg) : (comp === 'story' && fs.existsSync(path.join(OUT, 'story-vo.wav')) ? path.join(OUT, 'story-vo.wav') : null);
const VOCHAIN = 'highpass=f=85,lowpass=f=10500,equalizer=f=180:t=q:w=1:g=2.5,equalizer=f=3200:t=q:w=1.2:g=-2.5,deesser=i=0.35,acompressor=threshold=-22dB:ratio=2.5:attack=12:release=220:makeup=2,aecho=0.8:0.55:28|41:0.10|0.07';
const name = f => path.join(OUT, `MechTorque-${comp === 'story' ? 'Story' : 'Product'}-${f}.mp4`);

const only = process.argv[4];   // optional: just one format, e.g. 4x5
for (const f of ['9x16', '4x5'].filter(x => !only || x === only)) {
    // a picture rendered in parallel chunks (story-9x16-a.mp4, -b, -c1 ...) is joined first
    const chunks = fs.readdirSync(OUT).filter(n => n.startsWith(`${comp}-${f}-`) && n.endsWith('.mp4')).sort();
    if (!fs.existsSync(pic(f)) && chunks.length) {
        const list = path.join(OUT, `concat-${f}.txt`);
        fs.writeFileSync(list, chunks.map(n => `file '${path.join(OUT, n)}'`).join('\n') + '\n');
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', pic(f)], { stdio: 'inherit' });
    }
    if (!fs.existsSync(pic(f))) { console.log('skip (no picture yet):', pic(f)); continue; }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', pic(f), '-i', audio,
        ...(vo ? ['-i', vo] : []),
        '-filter_complex', '[0:v]noise=c0s=5:c0f=t+u,vignette=angle=PI/5:mode=forward,format=yuv420p[v];' + (vo
            // narrator: warm EQ, de-ess, gentle compression, a little room; music ducks under the voice
            ? `[2:a]${VOCHAIN},asplit=2[vo][key];[1:a]volume=0.8[mu];[mu][key]sidechaincompress=threshold=0.02:ratio=8:attack=25:release=400[duck];[duck][vo]amix=inputs=2:weights=1 1.15:normalize=0,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[a]`
            : '[1:a]loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[a]'),
        '-map', '[v]', '-map', '[a]', '-shortest',
        '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '17', '-maxrate', '16M', '-bufsize', '32M',
        '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', name(f)], { stdio: 'inherit' });
    console.log('final:', name(f));
}
