/**
 * Tiny offline synth shared by score.js (product cut) and story-score.js (story film).
 * Everything is generated from oscillators and noise: no samples, nothing to license.
 */
const fs = require('fs');
const path = require('path');

module.exports = function createSynth(DUR) {
    const SR = 48000, N = Math.ceil(SR * DUR);
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


    function master(name) {
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
        fs.writeFileSync(path.join(__dirname, 'out', name), Buffer.concat([hdr, pcm]));
        console.log('score written: out/' + name, DUR.toFixed(1) + 's');
    }
    return { SR, N, L, R, RL, RR, put, biquad, noise, rnd, clamp, ease, mtof, kick, impact, metal, clank, tick, hat, whoosh, riser, pluck, shing, master };
};
