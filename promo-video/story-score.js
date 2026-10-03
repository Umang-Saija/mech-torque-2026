/**
 * Sound design + score for the story film. Cues come from story-timeline.js.
 *   node story-score.js  ->  out/story-score.wav
 * Night is a cold minor drone with metal groaning under load; the call brings a
 * pulse; the morning install resolves into a warm major key.
 */
const TL = require('./story-timeline.js');
const S = require('./synth.js')(TL.DURATION + 1.5);
const { SR, N, L, R, RL, RR, put, biquad, noise, clamp, ease, mtof, kick, impact, metal, clank, tick, hat, whoosh, riser, pluck, shing } = S;
const prog = (t, a, b) => clamp((t - a) / (b - a));

/* ---------- extra instruments for the plant ---------- */
function ambience() {   // mains hum, room rumble, distant machinery
    const lp = biquad('lp', 180), lp2 = biquad('lp', 190);
    for (let k = 0; k < N; k++) {
        const t = k / SR, studio = t > TL.wipe1[0] + .3 && t < TL.install[0];
        const g = studio ? 0 : (t < TL.install[0] ? 1 : .55) * clamp(t / 1.2) * (1 - prog(t, TL.end[0], TL.end[0] + 1.5));
        if (!g) { lp(0); lp2(0); continue; }
        const hum = (Math.sin(2 * Math.PI * 50 * t) * .5 + Math.sin(2 * Math.PI * 100 * t) * .3 + Math.sin(2 * Math.PI * 150 * t) * .12) * .018;
        const rum = .09;
        put(k, (hum + lp(noise()) * rum) * g, (hum + lp2(noise()) * rum) * g, .15);
    }
    for (let t = .7; t < TL.DURATION; t += 2.35) {
        if (t > TL.wipe1[0] && t < TL.install[0]) continue;
        metal(t, 210 + (t * 37) % 140, .03, 1.6, Math.sin(t) * .8);
    }
}
function groan(t0, t1, g = .4, f0 = 70) {   // steel under torque: a resonant, wavering creak
    const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR);
    const b1 = biquad('bp', 120, 9), b2 = biquad('bp', 240, 7), b3 = biquad('bp', 120, 9);
    let ph = 0;
    for (let k = 0; k < n; k++) {
        const u = k / n, s = t0 + k / SR;
        const f = f0 * (1 + .25 * Math.sin(s * 3.1) + .1 * Math.sin(s * 11.3) + .4 * u);
        if (k % 64 === 0) { b1.set(f * 1.7); b2.set(f * 3.3); b3.set(f * 1.72); }
        ph += 2 * Math.PI * f / SR;
        const env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.1)), .6) * g * (.7 + .3 * Math.sin(s * 23));
        const grit = Math.abs(Math.sin(s * 37)) > .97 ? noise() * .6 : 0;   // stick-slip ticks
        const vL = (b1(noise() + grit) * 3 + b2(noise()) * 1.5 + Math.tanh(Math.sin(ph) * 2) * .25) * env;
        const vR = (b3(noise() + grit) * 3 + b2(noise()) * 1.2 + Math.tanh(Math.sin(ph) * 2) * .25) * env;
        put(i0 + k, vL, vR, .35);
    }
}
function step(t, g = .22) {   // boot on concrete
    kick(t, g * .6, 160, 70, .06);
    const i0 = Math.round(t * SR), bp = biquad('bp', 900, 1.2), bp2 = biquad('bp', 950, 1.2);
    for (let k = 0; k < SR * .09; k++) { const e = Math.exp(-k / SR * 45) * g; put(i0 + k, bp(noise()) * e, bp2(noise()) * e, .25); }
}
function ring(t0, t1) {   // phone ring: two bursts per cycle
    const i0 = Math.round(t0 * SR), n = Math.round((t1 - t0) * SR);
    for (let k = 0; k < n; k++) {
        const s = k / SR, cyc = s % 1.0, on = cyc < .35 || (cyc > .5 && cyc < .85);
        if (!on) continue;
        const v = (Math.sin(2 * Math.PI * 440 * s) + Math.sin(2 * Math.PI * 494 * s)) * (Math.sin(2 * Math.PI * 22 * s) > 0 ? 1 : .35) * .035;
        put(i0 + k, v, v, .3);
    }
}
function tapeStop(t, g = .3) {   // the world freezes
    const i0 = Math.round(t * SR), n = SR * .9; let ph = 0;
    for (let k = 0; k < n; k++) { const u = k / n, f = 220 * Math.pow(.08, u); ph += 2 * Math.PI * f / SR; const v = Math.tanh(Math.sin(ph) * 3) * (1 - u) * g * .4; put(i0 + k, v, v, .5); }
    whoosh(t, t + .8, .3, 3000, 150, .3, -.3);
}

/* ---------- music bed ---------- */
const MIN = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]];   // Dm Bb F C
const MAJ = [[50, 54, 57, 62], [55, 59, 62, 67], [47, 50, 54, 59], [45, 49, 52, 57]];   // D G Bm A
const BEAT = .5, GRID0 = TL.partLocks[0];
function chordAt(t) {
    if (t < TL.connect) return [38, 45, 50, 53];                       // dark open fifth + minor third
    if (t < TL.install[0]) { const b = Math.floor((t - TL.connect) / 2.0); return MIN[((b % 4) + 4) % 4]; }
    if (t < TL.end[0] + .6) { const b = Math.floor((t - TL.install[0]) / 2.4); return MAJ[((b % 4) + 4) % 4]; }
    return MAJ[0];
}
function intensity(t) {
    const keys = [[0, .15], [2, .25], [4.2, .3], [6.2, .35], [9.6, .55], [10.2, .2], [11.6, .1], [13.05, .3], [15, .4], [20, .7], [30.7, .85], [32.8, .9], [33.0, .55], [35.7, .7], [37.2, .5], [43.0, 1], [43.3, .3], [45.2, .6], [46.25, .9], [48, .8], [49.3, .75], [52, 0], [55, 0]];
    for (let i = 0; i < keys.length - 1; i++) if (t <= keys[i + 1][0]) return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * ease(clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])));
    return 0;
}
(function pad() {
    const lpL = biquad('lp', 600, .8), lpR = biquad('lp', 600, .8), ph = new Float64Array(16);
    let cur = chordAt(0).map(mtof);
    for (let k = 0; k < N; k++) {
        const t = k / SR, I = intensity(t);
        if (k % 256 === 0) { const tgt = chordAt(t).map(mtof); cur = cur.map((f, i) => f + (tgt[i] - f) * .05); lpL.set(200 + 2600 * I * I); lpR.set(210 + 2600 * I * I); }
        let l = 0, r = 0;
        cur.forEach((f, i) => { for (let d = 0; d < 2; d++) { const j = i * 2 + d; ph[j] += 2 * Math.PI * f * (d ? 1.004 : .996) / SR; const s = Math.sin(ph[j]) + .5 * Math.sin(2 * ph[j]) + .33 * Math.sin(3 * ph[j]) + .2 * Math.sin(4 * ph[j]); if (d) r += s; else l += s; } });
        const g = .026 * (.35 + I) * (.85 + .15 * Math.sin(2 * Math.PI * t * .21)) * clamp(t / 2);
        const vl = lpL(l) * g, vr = lpR(r) * g;
        L[k] += vl; R[k] += vr; RL[k] += vl * .6; RR[k] += vr * .6;
    }
})();
(function sub() {
    let ph = 0;
    for (let k = 0; k < N; k++) { const t = k / SR; ph += 2 * Math.PI * mtof(chordAt(t)[0] - 12) / SR; const v = Math.sin(ph) * .085 * intensity(t) * clamp(t / 2); L[k] += v; R[k] += v; }
})();
function pulse(a, b, hats = true) {
    for (let t = GRID0 + Math.ceil((a - GRID0) / BEAT) * BEAT; t < b; t += BEAT) {
        kick(t, .5); if (hats) { hat(t + BEAT / 2, .06); hat(t + BEAT * .75, .03); }
        pluck(t, chordAt(t)[0] - 12, .08, 0, .16);
    }
}

/* ---------- cue sheet ---------- */
ambience();
// night piano: a lonely motif
[[.4, 69], [1.1, 65], [1.8, 62], [3.0, 64], [3.6, 65], [5.0, 57], [7.0, 69], [7.7, 65], [8.4, 62], [10.6, 62], [11.2, 57]].forEach(([t, m], i) => pluck(t, m, .07, i % 2 ? .35 : -.35, 1.4));
// ACT I
groan(TL.push1[0] + .1, TL.slip1[0] + .05, .32, 62);
clank(TL.slip1[0], 260, .5, -.3); kick(TL.slip1[0] + .02, .5, 90, 40, .3);
step(TL.slip1[0] + .25, .3); step(TL.slip1[0] + .55, .25);
for (let i = 1; i <= 5; i++) step(TL.walkB[0] + (TL.walkB[1] - TL.walkB[0]) * (i - .5) / 5, .2);
groan(TL.push2[0] + .1, TL.slip2[0] + .05, .45, 55);
riser(TL.push2[0] + 1, TL.slip2[0], .18, 38, 52);
impact(TL.slip2[0], .75); clank(TL.slip2[0] + .01, 190, .55, .2);
step(TL.slip2[0] + .3, .3); step(TL.slip2[0] + .5, .3); step(TL.slip2[0] + .9, .2);
// ACT II: the call
tapeStop(TL.call[0], .35);
ring(TL.ring[0], TL.ring[1]);
pluck(TL.connect, 74, .1, 0, .4); pluck(TL.connect + .12, 81, .08, 0, .5);
riser(TL.connect + .3, TL.wipe1[0] + .2, .2, 50, 74);
whoosh(TL.wipe1[0] - .1, TL.wipe1[1] + .1, .45, 200, 5000, -.8, .8);
// ACT III: engineered
[15.4, 16.0, 16.6, 17.2].forEach((t, i) => pluck(t, [74, 77, 81, 79][i], .06, i % 2 ? .5 : -.5, .8));
riser(TL.scan[0], TL.scan[1], .3, 38, 62); whoosh(TL.scan[0] + .4, TL.scan[1], .22, 4000, 600, .4, -.4);
impact(TL.scan[1], .55);
TL.partTimes.forEach((ti, i) => { whoosh(ti, ti + TL.partMove + .05, .2, 250, 2600, i % 2 ? .7 : -.7, 0); clank(TL.partLocks[i], [380, 520, 300, 460, 340, 610, 700][i], .42, i % 2 ? .25 : -.25); });
for (let k = 0; k < 4; k++) tick(TL.partTimes[4] + .5 + k * .06, .2, 2800);
for (let k = 0; k < 6; k++) tick(TL.partTimes[5] + .4 + k * .05, .18, 3400);
pulse(TL.assembly[0] + .3, TL.nameplate[0] + 1.0);
shing(30.9, .26);
whoosh(TL.wheelIn[0], TL.wheelIn[1], .32, 200, 3000, -.8, .2);
for (let k = 0; k < 6; k++) tick(TL.wheelIn[1] - .25 + k * .045, .14, 2600);
riser(31.6, TL.install[0], .25, 45, 69);
// ACT IV: morning + install
impact(TL.install[0], .7);
pluck(TL.install[0], 62, .1, -.2, 2.5); pluck(TL.install[0] + .03, 66, .08, .2, 2.5); pluck(TL.install[0] + .06, 69, .08, 0, 2.5);
for (let t = TL.drop[0]; t < TL.drop[1] - .2; t += .16) tick(t, .06 + .02 * Math.sin(t * 7), 1900 + 300 * Math.sin(t * 3), Math.sin(t * 2) * .4);   // hoist chain
whoosh(TL.drop[0], TL.drop[1], .22, 1800, 220, .3, -.1);
impact(TL.drop[1], 1.0); clank(TL.drop[1] + .01, 150, .45);
// ACT V: one hand
for (let i = 1; i <= 4; i++) step(TL.walkA[0] + (TL.walkA[1] - TL.walkA[0]) * (i - .5) / 4, .18);
tick(TL.grip[1] - .05, .2, 1800);
{
    const [a, b] = TL.open, ticks = Math.round(22 / 4 * 16);
    for (let n = 1; n <= ticks; n++) {
        const target = n / ticks; let lo = 0, hi = 1;
        for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (ease(m) < target) lo = m; else hi = m; }
        tick(a + lo * (b - a), .12 + .05 * (n % 4 === 0), n % 4 === 0 ? 2200 : 3000, Math.sin(n * .7) * .3);
    }
    riser(a + .5, b, .22, 50, 74);
    impact(b, .7);
    pluck(b, 74, .13, -.2, 2.4); pluck(b + .02, 78, .1, .2, 2.4); pluck(b + .04, 81, .09, 0, 2.6);
}
kick(TL.release[0] + .55, .65, 90, 35, .6); metal(TL.release[0] + .55, 140, .18, 1.4);
pulse(TL.resolve[0] - 1.0, TL.end[0] - .2);
step(TL.release[1] + .85, .16); step(TL.release[1] + 1.35, .16);
// the fist bump
tick(TL.bump, .35, 1400); kick(TL.bump, .35, 200, 90, .08);
pluck(TL.bump, 74, .12, -.2, 1.6); pluck(TL.bump + .03, 78, .1, .2, 1.6); pluck(TL.bump + .06, 81, .1, 0, 1.8); pluck(TL.bump + .09, 86, .06, 0, 2);
// end card
riser(TL.end[0], TL.end[0] + 1.7, .2, 50, 74);
impact(TL.end[0] + 1.7, .85);
pluck(TL.end[0] + 1.7, 62, .1, 0, 3); pluck(TL.end[0] + 1.72, 69, .08, -.3, 3); pluck(TL.end[0] + 1.74, 74, .07, .3, 3);

S.master('story-score.wav');
