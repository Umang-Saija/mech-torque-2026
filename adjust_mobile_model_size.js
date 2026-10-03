const fs = require('fs');

// 1. Update model3d.js camera sizing
let js = fs.readFileSync('model3d.js', 'utf8');

const targetPattern = /if \(asp < 1\.35\) \{[\s\S]*?else \{[\s\S]*?camera\.setViewOffset\(cw, ch, 0, ch \* yShift, cw, ch\);[\s\S]*?\}/;

const replacement = `if (asp < 1.35) {
                    // Mobile: Make model large, bold & impressive (not tiny)
                    const isTall = p > 0.55;
                    const mobileFactor = isTall ? 0.76 : 0.70;
                    dist *= Math.min(2.15, (1.35 / asp) * mobileFactor);
                }
                const [tx, ty, tz] = c.t;
                camera.position.set(tx + dist * Math.sin(az) * Math.cos(el), ty + dist * Math.sin(el), tz + dist * Math.cos(az) * Math.cos(el));
                camera.lookAt(tx, ty, tz);
                const sh = ease(clamp(p / .47));
                if (asp > 1.15) camera.setViewOffset(cw, ch, -cw * lerp(.17, .13, sh), 0, cw, ch);
                else {
                    // Position model centered in the upper spotlight zone above the HUD card
                    const yShift = p > 0.55 ? 0.16 : 0.13;
                    camera.setViewOffset(cw, ch, 0, ch * yShift, cw, ch);
                }`;

if (!targetPattern.test(js)) {
    console.error('Target pattern not found in model3d.js');
    process.exit(1);
}

js = js.replace(targetPattern, replacement);
fs.writeFileSync('model3d.js', js, 'utf8');
console.log('model3d.js updated with larger model framing');
