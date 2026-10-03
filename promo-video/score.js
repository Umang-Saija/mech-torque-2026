/**
 * Original score + sound design for "The Quarter Turn", synthesised from
 * scratch (no samples, no licensing). Every cue is read from timeline.js so
 * clanks, hits and ratchet ticks land on the exact frames they belong to.
 *
 *   node score.js            -> out/score.wav (48 kHz, stereo, 24-bit-ish float -> 16-bit)
 */
const fs = require('fs');
const path = require('path');
const TL = require('./timeline.js');

const SR = 48000, DUR = TL.DURATION + 1.5, N = Math.ceil(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);       // dry
const RL = new Float32Array(N), RR = new Float32Array(N);     // reverb send
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const noise = () => rnd() * 2 - 1;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function put(i, l, r, send = 0) {
    if (i < 0 || i >= N) return;
    L[i] += l; R[i] += r; RL[i] += l * send; RR[i] += r * send;
}
function biquad(type, f, q = .707) {
    let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const set = (f) => {
        const w = 2 * Math.PI * Math.min(f, SR * .45) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
        let B0, B1, B2; const A0 = 1 + al;
        if (type === 'lp') { B0 = (1 - c) / 2; B1 = 1 - c; B2 = (1 - c) / 2; }
        else if (type === 'hp') { B0 = (1 + c) / 2; B1 = -(1 + c); B2 = (1 + c) / 2; }
        else { B0 = al; B1 = 0; B2 = -al; }
        b0 = B0 / A0; b1 = B1 / A0; b2 = B2 / A0; a1 = -2 * c / A0; a2 = (1 - al) / A0;
    };
    set(f);
    const run = x => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
    run.set = set; return run;
}

/* ---------------- instruments ---------------- */
function kick(t, g = .9, f0 = 150, f1 = 42, dec = .38) {
    const i0 = Math.round(t * SR), n = SR * 1.2; let ph = 0;
    for (let k = 0; k < n; k++) {
        const s = k / SR, f = f1 + (f0 - f1) * Math.exp(-s * 28);
        ph += 2 * Math.PI * f / SR;
        const v = Math.tanh(1.6 * Math.sin(ph)) * Math.exp(-s / dec) * g;
        put(i0 + k, v, v, .05);
    }
}
function impact(t, g = 1) {
    kick(t, 1.1 * g, 110, 28, 1.1);
    const i0 = Math.round(t * SR), lp = biquad('lp', 1800), lp2 = biquad('lp', 1800);
    for (let k = 0; k < SR * 1.6; k++) {
        const s = k / SR, e = Math.exp(-s * 6) * g * .55;
        lp.set(300 + 3000 * Math.exp(-s * 5)); lp2.set(300 + 3000 * Math.exp(-s * 5));
        put(i0 + k, lp(noise()) * e, lp2(noise()) * e, .5);
    }
    metal(t, 92, .55 * g, 2.2);
    metal(t + .004, 61, .35 * g, 2.6);
}
function metal(t, f, g = .4, dec = .9, pan = 0) {
    const parts = [[1, 1], [2.76, .6], [5.40, .35], [8.93, .22], [13.34, .12], [1.51, .3]];
    const i0 = Math.round(t * SR), n = Math.round(SR * dec * 3);
    for (let k = 0; k < n; k++) {
        const s = k / SR; let v = 0;
        parts.forEach(([r, a], j) => { v += a * Math.sin(2 * Math.PI * f * r * s + j) * Math.exp(-s * (1.6 + r * .9) / dec); });
        v *= g * (1 - Math.exp(-s * 2000));
        put(i0 + k, v * (1 - pan) * .7, v * (1 + pan) * .7, .45);
    }
}
function clank(t, f, g = .5, pan = 0) {
    metal(t, f, g, .55, pan);
    kick(t, .5, 120, 50, .16);
    const i0 = Math.round(t * SR), bp = biquad('bp', 2600, 1.4);
    for (let k = 0; k < SR * .08; k++) { const v = bp(noise()) * Math.exp(-k / SR * 60) * g * 1.4; put(i0 + k, v * (1 - pan), v * (1 + pan), .3); }
}
function tick(t, g = .25, f = 3200, pan = 0) {
    const i0 = Math.round(t * SR), bp = biquad('bp', f, 3);
    for (let k = 0; k < SR * .03; k++) { const v = bp(noise()) * Math.exp(-k / SR * 260) * g * 3; put(i0 + k, v * (1 - pan), v * (1 + pan), .12); }
}
function hat(t, g = .08) {
    const i0 = Math.round(t * SR), hp = biquad('hp', 7000), hp2 = biquad('hp', 7000);
    for (let k = 0; k < SR * .06; k++) { const e = Math.exp(-k / SR * 70) * g; put(i0 + k, hp(noise()) * e, hp2(noise()) * e, .1); }
}
function whoosh(t0, t1, g = .35, f0 = 300, f1 = 4000, pan0 = -.6, pan1 = .6) {
    const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR), bl = biquad('bp', f0, 1.2), br = biquad('bp', f0, 1.2);
    for (let k = 0; k < n; k++) {
        const u = k / n, f = f0 * Math.pow(f1 / f0, u), e = Math.pow(Math.sin(Math.PI * u), 2) * g;
        if (k % 32 === 0) { bl.set(f); br.set(f * 1.04); }
        const p = pan0 + (pan1 - pan0) * u;
        put(i0 + k, bl(noise()) * e * (1 - p) * 1.6, br(noise()) * e * (1 + p) * 1.6, .35);
    }
}
function riser(t0, t1, g = .3, m0 = 50, m1 = 74) {
    const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR), hp = biquad('hp', 400), hp2 = biquad('hp', 400);
    let ph = 0;
    for (let k = 0; k < n; k++) {
        const u = k / n, e = Math.pow(u, 2.2) * g;
        if (k % 64 === 0) { hp.set(400 + 6000 * u); hp2.set(420 + 6000 * u); }
        ph += 2 * Math.PI * mtof(m0 + (m1 - m0) * u * u) / SR;
        const tone = (Math.sin(ph) + .4 * Math.sin(ph * 2.01)) * .25;
        put(i0 + k, (hp(noise()) * .8 + tone) * e, (hp2(noise()) * .8 + tone) * e, .4);
    }
}
function pluck(t, m, g = .2, pan = 0, dec = .5) {
    const i0 = Math.round(t * SR), f = mtof(m);
    for (let k = 0; k < SR * dec * 4; k++) {
        const s = k / SR, v = (Math.sin(2 * Math.PI * f * s) + .3 * Math.sin(4 * Math.PI * f * s) + .12 * Math.sin(6 * Math.PI * f * s)) * Math.exp(-s / dec) * (1 - Math.exp(-s * 900)) * g;
        put(i0 + k, v * (1 - pan), v * (1 + pan), .5);
    }
}
function shing(t, g = .3) {
    const i0 = Math.round(t * SR), n = SR * 1.6, b1 = biquad('bp', 6000, 4), b2 = biquad('bp', 6000, 4);
    for (let k = 0; k < n; k++) {
        const u = k / n; if (k % 32 === 0) { b1.set(3000 + 9000 * u); b2.set(3200 + 9000 * u); }
        const e = Math.sin(Math.PI * u) ** 3 * g * 2;
        put(i0 + k, b1(noise()) * e * (1.2 - u), b2(noise()) * e * (.2 + u), .6);
    }
}

/* ---------------- music bed ---------------- */
const BEAT = 60 / 100;                     // 100 bpm; part locks land every 3 beats
const GRID0 = TL.partLocks[0];             // beat grid anchored on the first lock
const CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]; // Dm  Bb  F  C
function intensity(t) {
    const keys = [[0, .25], [2.8, .45], [4, .35], [8, .45], [10.6, .75], [11, .7], [23.4, .85], [24, .4], [27, .45], [30.2, .75], [31, .6], [35.4, 1], [35.7, .18], [38, .2], [38.4, .8], [43, .75], [44.9, .65], [47.6, 0], [49.5, 0]];
    for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) { const u = (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]); return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * ease(clamp(u)); }
    return 0;
}
function chordAt(t) {
    if (t < GRID0 - BEAT * 3) return CHORDS[0];
    const bar = Math.floor((t - (GRID0 - BEAT * 3)) / (BEAT * 4));
    if (t > TL.range[0] - .1 && t < TL.end[0]) return CHORDS[[1, 2, 3, 0][(((Math.floor((t - TL.range[0]) / (BEAT * 4))) % 4) + 4) % 4]];
    if (t >= TL.end[0]) return CHORDS[0];
    return CHORDS[((bar % 4) + 4) % 4];
}
(function pad() {
    const lpL = biquad('lp', 800, .8), lpR = biquad('lp', 800, .8);
    const ph = new Float64Array(16);
    let cur = chordAt(0).map(mtof);
    for (let k = 0; k < N; k++) {
        const t = k / SR, I = intensity(t);
        if (k % 256 === 0) {
            const tgt = chordAt(t).map(mtof);
            cur = cur.map((f, i) => f + (tgt[i] - f) * .06);
            lpL.set(250 + 2600 * I * I); lpR.set(260 + 2600 * I * I);
        }
        let l = 0, r = 0;
        cur.forEach((f, i) => {
            for (let d = 0; d < 2; d++) {
                const j = i * 2 + d, det = d ? 1.004 : .996;
                ph[j] += 2 * Math.PI * f * det / SR;
                const s = Math.sin(ph[j]) + .5 * Math.sin(2 * ph[j]) + .33 * Math.sin(3 * ph[j]) + .2 * Math.sin(4 * ph[j]);
                if (d) r += s; else l += s;
            }
        });
        const lfo = .85 + .15 * Math.sin(2 * Math.PI * t * .23);
        const g = .028 * (.35 + I) * lfo * clamp(t / 1.5);
        const vl = lpL(l) * g, vr = lpR(r) * g;
        L[k] += vl; R[k] += vr; RL[k] += vl * .6; RR[k] += vr * .6;
    }
})();
(function sub() {
    let ph = 0;
    for (let k = 0; k < N; k++) {
        const t = k / SR, f = mtof(chordAt(t)[0] - 12);
        ph += 2 * Math.PI * f / SR;
        const v = Math.sin(ph) * .09 * intensity(t) * clamp(t / 2);
        L[k] += v; R[k] += v;
    }
})();
function pulseSection(a, b, withHat = true) {
    for (let t = GRID0 + Math.ceil((a - GRID0) / BEAT) * BEAT; t < b; t += BEAT) {
        kick(t, .55);
        if (withHat) { hat(t + BEAT / 2, .07); hat(t + BEAT * .75, .035); }
        const bassM = chordAt(t)[0] - 12;
        pluck(t, bassM, .09, 0, .18);
    }
}

/* ---------------- cue sheet ---------------- */
// S1 hook: a tick for every 2.5 degrees the needle passes, then the hit
for (let a = 2.5; a <= 90; a += 2.5) {
    // invert the picture's ease(prog(t,.5,2.9))*90 to find when the needle crosses a
    let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (ease(m) * 90 < a) lo = m; else hi = m; }
    tick(.5 + lo * 2.4, a % 15 === 0 ? .32 : .16, a % 15 === 0 ? 2400 : 3600, -.3 + .6 * a / 90);
}
riser(1.3, 2.85, .22, 45, 69);
impact(2.85, .9);
pluck(2.85, 74, .12, 0, 1.5); pluck(2.85, 81, .07, .3, 1.8);
whoosh(TL.wipe1[0] - .1, TL.wipe1[1] + .1, .45, 200, 5000, -.8, .8);

// S2 blueprint: sparse high plucks, like a pen on paper
[4.6, 5.2, 5.8, 6.7, 7.3, 7.9].forEach((t, i) => pluck(t, [74, 77, 81, 79, 77, 72][i], .06, i % 2 ? .5 : -.5, .8));
// S3 scan
riser(TL.scan[0], TL.scan[1], .32, 38, 62);
whoosh(TL.scan[0] + .4, TL.scan[1], .25, 4000, 600, .4, -.4);
impact(TL.scan[1], .55);

// S4 assembly: a fly-in whoosh per part, a clank on every lock, pulse underneath
TL.partTimes.forEach((ti, i) => {
    whoosh(ti, ti + TL.partMove + .05, .22, 250, 2600, i % 2 ? .7 : -.7, 0);
    clank(TL.partLocks[i], [380, 520, 300, 460, 340, 610, 700][i], .45, (i % 2 ? .25 : -.25));
});
// bolts, stop bolts and nuts get their own small threads of ticks
for (let k = 0; k < 4; k++) tick(TL.partTimes[4] + .55 + k * .07, .2, 2800);
for (let k = 0; k < 6; k++) tick(TL.partTimes[5] + .45 + k * .06, .18, 3400);
pulseSection(TL.assembly[0] + .2, TL.nameplate[0] - .05);

// S5 nameplate: breakdown + glint
clank(TL.nameplate[0] + .8, 820, .25);
shing(25.0, .28);

// S6 mount
whoosh(TL.wheelIn[0], TL.wheelIn[1], .35, 200, 3000, -.8, .2);
for (let k = 0; k < 8; k++) tick(TL.wheelIn[1] - .35 + k * .045, .14, 2600);
riser(TL.tilt[0], TL.tilt[1], .3, 40, 64);
whoosh(TL.tilt[0], TL.tilt[1], .3, 1500, 200, .5, -.2);
impact(TL.tilt[1], 1.05);

// S7 the turn: ratchet ticks follow the wheel (5.5 turns for 90 degrees, 16 ticks a turn)
{
    const [a, b] = TL.open, turnsTotal = 22 / 4, ticks = Math.round(turnsTotal * 16);
    for (let n = 1; n <= ticks; n++) {
        const target = n / ticks; let lo = 0, hi = 1;
        for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (ease(m) < target) lo = m; else hi = m; }
        tick(a + lo * (b - a), .13 + .06 * (n % 4 === 0), n % 4 === 0 ? 2200 : 3000, Math.sin(n * .7) * .3);
    }
    riser(a, b, .26, 45, 69);
    impact(b, .8);
    pluck(b, 74, .14, -.2, 2.2); pluck(b + .02, 78, .1, .2, 2.2); pluck(b + .04, 81, .09, 0, 2.4);
}
// "Let go." silence, then "It holds." a single low knock
kick(36.35, .7, 90, 35, .6); metal(36.35, 140, .2, 1.4);

// S8 range
whoosh(TL.wipe2[0] - .1, TL.wipe2[1] + .1, .45, 5000, 200, .8, -.8);
pulseSection(38.4, TL.end[0] - .1);
for (let i = 0; i < 6; i++) pluck(39.3 + i * .22, [62, 65, 69, 72, 74, 77][i], .1, -.5 + i * .2, .6);

// S9 end: the mark turns, one last hit, long tail
riser(43.2, 44.9, .2, 50, 74);
impact(44.9, .85);
pluck(44.9, 62, .1, 0, 3); pluck(44.92, 69, .08, -.3, 3); pluck(44.94, 74, .07, .3, 3);
metal(45.9, 1200, .06, 2);

/* ---------------- reverb (Schroeder/Freeverb style) ---------------- */
function reverb(inp, combs, aps, fb = .84, damp = .25) {
    const out = new Float32Array(N);
    combs.forEach(d => {
        const buf = new Float32Array(d); let i = 0, lp = 0;
        for (let k = 0; k < N; k++) { const y = buf[i]; lp = y * (1 - damp) + lp * damp; buf[i] = inp[k] + lp * fb; out[k] += y / combs.length; if (++i >= d) i = 0; }
    });
    aps.forEach(d => {
        const buf = new Float32Array(d); let i = 0;
        for (let k = 0; k < N; k++) { const b = buf[i], y = -out[k] + b; buf[i] = out[k] + b * .5; out[k] = y; if (++i >= d) i = 0; }
    });
    return out;
}
const s = SR / 44100;
const wl = reverb(RL, [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(d => Math.round(d * s * 1.3)), [556, 441, 341, 225].map(d => Math.round(d * s)));
const wr = reverb(RR, [1139, 1211, 1300, 1379, 1445, 1514, 1580, 1640].map(d => Math.round(d * s * 1.3)), [579, 464, 364, 248].map(d => Math.round(d * s)));

/* ---------------- master: mix, soft clip, fade, write ---------------- */
const pcm = Buffer.alloc(N * 4);
let peak = 0;
const mixL = new Float32Array(N), mixR = new Float32Array(N);
for (let k = 0; k < N; k++) {
    const fade = clamp((DUR - k / SR) / 1.2);
    mixL[k] = Math.tanh((L[k] + wl[k] * .55) * 1.3) * fade;
    mixR[k] = Math.tanh((R[k] + wr[k] * .55) * 1.3) * fade;
    peak = Math.max(peak, Math.abs(mixL[k]), Math.abs(mixR[k]));
}
const norm = .89 / peak;
for (let k = 0; k < N; k++) {
    pcm.writeInt16LE(Math.round(mixL[k] * norm * 32767), k * 4);
    pcm.writeInt16LE(Math.round(mixR[k] * norm * 32767), k * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(SR, 24);
hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out', 'score.wav'), Buffer.concat([hdr, pcm]));
console.log('score written: out/score.wav', DUR.toFixed(1) + 's');
