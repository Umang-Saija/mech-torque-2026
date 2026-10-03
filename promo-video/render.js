/**
 * Renders reel.html frame by frame (deterministic time, not real time) and
 * pipes the frames straight into ffmpeg.
 *
 *   node render.js --w 1080 --h 1920 --out out/frames-9x16.mp4
 *   node render.js --w 1080 --h 1350 --out out/frames-4x5.mp4
 *   node render.js --stills 2,9.5,14,25.8 --w 1080 --h 1920     (preview PNGs)
 *   node render.js --from 30 --to 34 ...                            (a slice)
 *   add --comp story to render story.html (the narrative film) instead of reel.html
 *
 * Needs: Node 18+, Playwright (global install is fine), ffmpeg on PATH.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch (_) { ({ chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'))); }
const args0 = process.argv.slice(2);
const COMP = args0.includes('--comp') ? args0[args0.indexOf('--comp') + 1] : 'reel';
const TL = require(COMP === 'story' ? './story-timeline.js' : './timeline.js');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => { if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]); return a; }, []));
const W = +args.w || 1080, H = +args.h || 1920;
const FPS = +args.fps || TL.FPS;
const from = +args.from || 0, to = args.to != null ? +args.to : TL.DURATION;
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(__dirname, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
});

(async () => {
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;
    const browser = await chromium.launch({
        args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--font-render-hinting=none']
    });
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
    page.on('pageerror', e => console.error('[pageerror]', e.message));
    await page.goto(`http://127.0.0.1:${port}/promo-video/${COMP}.html?w=${W}&h=${H}${args.people === '0' ? '&people=0' : ''}`);
    await page.waitForFunction(() => window.READY || window.READY_ERROR, null, { timeout: 120000 });
    const err = await page.evaluate(() => window.READY_ERROR);
    if (err) throw new Error(err);
    const stage = await page.$('#stage');

    if (args.stills) {
        for (const s of String(args.stills).split(',').map(Number)) {
            await page.evaluate(t => window.renderAt(t), s);
            const f = path.join(OUT_DIR, `${COMP}${args.people === '0' ? '-plate' : ''}-still-${W}x${H}-${s.toFixed(2)}.png`);
            await page.screenshot({ path: f, clip: { x: 0, y: 0, width: W, height: H }, timeout: 180000 });
            console.log('still', f);
        }
    } else {
        const out = path.resolve(args.out || path.join(OUT_DIR, `picture-${W}x${H}.mp4`));
        const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
        const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS);
        const t0 = Date.now();
        for (let n = n0; n < n1; n++) {
            await page.evaluate(t => window.renderAt(t), n / FPS);
            const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H }, timeout: 180000 });
            if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
            if ((n - n0) % 30 === 0) {
                const done = n - n0 + 1, el = (Date.now() - t0) / 1000;
                console.log(`${W}x${H} frame ${n}/${n1} · ${(el / done).toFixed(2)} s/frame · eta ${Math.round(el / done * (n1 - n) / 60)} min`);
            }
        }
        ff.stdin.end();
        await new Promise(r => ff.on('close', r));
        console.log('picture written', out);
    }
    await browser.close();
    server.close();
})().catch(e => { console.error(e); process.exit(1); });
