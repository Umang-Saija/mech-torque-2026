const fs = require('fs');

let content = fs.readFileSync('model3d.js', 'utf8');

const targetPattern = /if \(asp < 1\.35\) \{[\s\S]*?else \{[\s\S]*?camera\.setViewOffset\(cw, ch, 0, ch \* yShift, cw, ch\);[\s\S]*?\}/;

const replacement = `if (asp < 1.35) {
                    const mobileFactor = p < 0.55 ? 1.35 : 1.18;
                    dist *= Math.min(3.0, (1.35 / asp) * mobileFactor);
                }
                const [tx, ty, tz] = c.t;
                camera.position.set(tx + dist * Math.sin(az) * Math.cos(el), ty + dist * Math.sin(el), tz + dist * Math.cos(az) * Math.cos(el));
                camera.lookAt(tx, ty, tz);
                const sh = ease(clamp(p / .47));
                if (asp > 1.15) camera.setViewOffset(cw, ch, -cw * lerp(.17, .13, sh), 0, cw, ch);
                else {
                    const yShift = p < 0.55 ? 0.27 : 0.24;
                    camera.setViewOffset(cw, ch, 0, ch * yShift, cw, ch);
                }`;

if (!targetPattern.test(content)) {
    console.error('Target pattern not found in model3d.js');
    process.exit(1);
}

content = content.replace(targetPattern, replacement);
fs.writeFileSync('model3d.js', content, 'utf8');
console.log('model3d.js successfully updated!');
