/**
 * MECH TORQUE — Automated Promo Video Creator
 * 
 * Uses Puppeteer to capture cinematic frames of the website with WebGL 3D Model enabled,
 * then stitches them into an MP4 video with professional voiceover and audio using ffmpeg.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const FRAMES_DIR = path.join(__dirname, 'promo-frames');
const OUTPUT_VIDEO = path.join(__dirname, 'mech-torque-promo.mp4');
const AUDIO_FILE = path.join(__dirname, 'voiceover.wav');
const FPS = 24;
const WIDTH = 1920;
const HEIGHT = 1080;

// Cinematic ease-in-out
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Promise-based delay
const wait = ms => new Promise(r => setTimeout(r, ms));

// Ensure voiceover exists
function ensureVoiceover() {
    if (fs.existsSync(AUDIO_FILE)) {
        console.log('🎙️ Voiceover audio ready:', AUDIO_FILE);
        return;
    }
    console.log('🎙️ Generating voiceover narration...');
    try {
        require('./build-voiceover');
    } catch (e) {
        console.warn('Voiceover generation skipped:', e.message);
    }
}

async function captureFrames() {
    // Clean and create frames directory
    if (fs.existsSync(FRAMES_DIR)) {
        fs.rmSync(FRAMES_DIR, { recursive: true });
    }
    fs.mkdirSync(FRAMES_DIR, { recursive: true });

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const profileDir = path.join(__dirname, '.promo-chrome-profile');

    console.log('🎬 Launching REAL Google Chrome with direct GPU hardware acceleration...');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
        defaultViewport: { width: WIDTH, height: HEIGHT },
        args: [
            `--user-data-dir=${profileDir}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-infobars',
            '--enable-webgl',
            '--ignore-gpu-blocklist',
            '--enable-gpu-rasterization',
            `--window-size=${WIDTH},${HEIGHT}`
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });

    console.log('🌐 Loading website...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Verify WebGL and 3D canvas
    await wait(3000);
    const glCheck = await page.evaluate(() => {
        const glCanvas = document.getElementById('gl');
        const hasGL = !document.documentElement.classList.contains('no-gl');
        return {
            canvasExists: !!glCanvas,
            webglActive: hasGL,
            canvasDimensions: glCanvas ? `${glCanvas.width}x${glCanvas.height}` : 'N/A'
        };
    });
    console.log('🎮 3D WebGL Status:', glCheck);

    let frameNum = 0;

    // Helper: capture a single frame
    async function captureFrame() {
        const filename = path.join(FRAMES_DIR, `frame_${String(frameNum).padStart(6, '0')}.jpg`);
        await page.screenshot({ path: filename, type: 'jpeg', quality: 92 });
        frameNum++;
    }

    // Helper: capture multiple frames for a hold (duration in seconds)
    async function holdShot(seconds) {
        const frames = Math.round(seconds * FPS);
        for (let i = 0; i < frames; i++) {
            await captureFrame();
        }
    }

    // Helper: smooth scroll and capture frames
    async function cinematicScroll(targetY, durationSeconds) {
        const startY = await page.evaluate(() => window.scrollY);
        const frames = Math.round(durationSeconds * FPS);
        const distance = targetY - startY;

        for (let i = 0; i <= frames; i++) {
            const progress = i / frames;
            const eased = easeInOutCubic(progress);
            const currentY = startY + distance * eased;
            await page.evaluate((y) => window.scrollTo(0, y), currentY);
            await wait(30); // Let 3D model inertia and animations render smoothly
            await captureFrame();
        }
    }

    // Helper: get element position
    async function getElementTop(selector) {
        return await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el ? el.offsetTop : 0;
        }, selector);
    }

    // Get hero track height for scroll calculations
    const heroHeight = await page.evaluate(() => {
        const track = document.getElementById('track');
        return track ? track.offsetHeight : 8000;
    });

    // ═══════════════════════════════════════════
    //  ACT 1 — HERO LANDING (4 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 1: Hero Landing (3D Exploded View)');
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(800);
    await holdShot(4);

    // ═══════════════════════════════════════════
    //  ACT 2 — 3D ASSEMBLY STAGES (~24 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 2: 3D Assembly Stages');

    // Stage 1-2: Housing & Shaft
    await cinematicScroll(heroHeight * 0.08, 2);
    await holdShot(1.5);

    // Stage 3: Worm Gear
    await cinematicScroll(heroHeight * 0.15, 2);
    await holdShot(1.5);

    // Stage 4-5: Cover & Gaskets
    await cinematicScroll(heroHeight * 0.25, 2.5);
    await holdShot(2);

    // Stage 6-7: Internal Bearings
    await cinematicScroll(heroHeight * 0.38, 2.5);
    await holdShot(2);

    // Stage 8 — Handwheel (key moment)
    await cinematicScroll(heroHeight * 0.50, 2.5);
    await holdShot(2.5);

    // Stage 9 — Valve & Flange
    await cinematicScroll(heroHeight * 0.65, 2.5);
    await holdShot(2);

    // Stage 10-11 — Quarter turn operation
    await cinematicScroll(heroHeight * 0.82, 2.5);
    await holdShot(2);

    // Complete assembled gearbox
    await cinematicScroll(heroHeight * 0.97, 2.5);
    await holdShot(2.5);

    // ═══════════════════════════════════════════
    //  ACT 3 — ENGINEERING FOUNDRY (~8 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 3: Engineering Foundry');
    const foundryTop = await getElementTop('#foundry');
    if (foundryTop > 0) {
        await cinematicScroll(foundryTop, 3);
        await holdShot(2.5);
        await cinematicScroll(foundryTop + 800, 2.5);
        await holdShot(2);
    }

    // ═══════════════════════════════════════════
    //  ACT 4 — CAD BLUEPRINT (~8 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 4: CAD Blueprint');
    const blueprintTop = await getElementTop('#blueprint');
    if (blueprintTop > 0) {
        await cinematicScroll(blueprintTop, 3);
        await holdShot(3);
        await cinematicScroll(blueprintTop + 600, 2);
        await holdShot(2);
    }

    // ═══════════════════════════════════════════
    //  ACT 5 — MODELS CATALOGUE (~6 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 5: Models Catalogue');
    const modelsTop = await getElementTop('#models');
    if (modelsTop > 0) {
        await cinematicScroll(modelsTop, 3);
        await holdShot(3);
    }

    // ═══════════════════════════════════════════
    //  ACT 6 — CONTACT & FOOTER (~8 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 6: Contact & Footer');
    const contactTop = await getElementTop('#contact');
    if (contactTop > 0) {
        await cinematicScroll(contactTop, 3);
        await holdShot(2);
    }

    const maxScroll = await page.evaluate(() => 
        document.documentElement.scrollHeight - window.innerHeight
    );
    await cinematicScroll(maxScroll, 3);
    await holdShot(3);

    // ═══════════════════════════════════════════
    //  ACT 7 — HERO RETURN (~5 seconds)
    // ═══════════════════════════════════════════
    console.log('🎬 Act 7: Return to Hero');
    await cinematicScroll(0, 3.5);
    await holdShot(3);

    console.log(`✅ Captured ${frameNum} frames total`);
    await browser.close();
    return frameNum;
}

async function stitchVideo(totalFrames) {
    console.log('🎥 Stitching frames and audio into video...');

    const expectedDuration = totalFrames / FPS;

    return new Promise((resolve, reject) => {
        const cmd = ffmpeg()
            .input(path.join(FRAMES_DIR, 'frame_%06d.jpg'))
            .inputFPS(FPS);

        const hasAudio = fs.existsSync(AUDIO_FILE);
        if (hasAudio) {
            console.log('🔊 Adding voiceover audio stream...');
            cmd.input(AUDIO_FILE)
               .audioCodec('aac')
               .audioBitrate('192k');
        }

        cmd.videoCodec('libx264')
            .outputOptions([
                '-pix_fmt yuv420p',     // Maximum player & platform compatibility
                '-crf 18',              // Visually lossless high quality
                '-preset medium',       // Balanced encoding
                '-movflags +faststart', // Web streaming optimized
                `-vf scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2`
            ])
            .fps(FPS)
            .output(OUTPUT_VIDEO)
            .on('start', (commandLine) => console.log('ffmpeg command:', commandLine))
            .on('progress', (p) => {
                if (p.percent) process.stdout.write(`\r  Encoding: ${Math.round(p.percent)}%`);
            })
            .on('end', () => {
                console.log('\n✅ Video created successfully!');
                console.log(`📁 Output: ${OUTPUT_VIDEO}`);

                const stats = fs.statSync(OUTPUT_VIDEO);
                const mb = (stats.size / (1024 * 1024)).toFixed(1);
                console.log(`📊 File size: ${mb} MB`);

                resolve();
            })
            .on('error', (err) => {
                console.error('❌ ffmpeg error:', err.message);
                reject(err);
            })
            .run();
    });
}

async function cleanupFrames() {
    console.log('🧹 Cleaning up frames directory...');
    if (fs.existsSync(FRAMES_DIR)) {
        fs.rmSync(FRAMES_DIR, { recursive: true });
    }
    console.log('✅ Temporary frames removed');
}

// ── MAIN ──
(async () => {
    try {
        console.log('═══════════════════════════════════════════');
        console.log('  MECH TORQUE — Promo Video Generator');
        console.log('═══════════════════════════════════════════');
        console.log(`  Resolution: ${WIDTH}×${HEIGHT}`);
        console.log(`  FPS: ${FPS}`);
        console.log(`  Output: ${OUTPUT_VIDEO}`);
        console.log('═══════════════════════════════════════════\n');

        ensureVoiceover();
        const totalFrames = await captureFrames();
        const expectedDuration = (totalFrames / FPS).toFixed(1);
        console.log(`\n📐 Video duration: ${expectedDuration}s (${totalFrames} frames @ ${FPS}fps)\n`);

        await stitchVideo(totalFrames);
        await cleanupFrames();

        console.log('\n═══════════════════════════════════════════');
        console.log('  🎬 DONE! Your promo video is ready:');
        console.log(`  ${OUTPUT_VIDEO}`);
        console.log('═══════════════════════════════════════════');
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
})();
