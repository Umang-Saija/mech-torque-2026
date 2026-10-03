const fs = require('fs');

// 1. Update model3d.js
let js = fs.readFileSync('model3d.js', 'utf8');

const targetPattern = /function updateCallout\(idx\) \{[\s\S]*?calloutTag\.textContent = st\.tag \|\| st\.h;\s*\}/;

const replacement = `function updateCallout(idx) {
                const st = idx < 0 ? null : STAGES[idx];
                if (!st || !st.obj || reduceMotion) {
                    calloutSvg.classList.remove('on'); calloutLabel.classList.remove('on');
                    return;
                }
                st.obj.getWorldPosition(projVec);
                projVec.project(camera);
                if (projVec.z > 1 || projVec.z < -1) { calloutSvg.classList.remove('on'); calloutLabel.classList.remove('on'); return; }
                const x = (projVec.x * .5 + .5) * cw, y = (1 - (projVec.y * .5 + .5)) * ch;
                const onScreen = x > -40 && x < cw + 40 && y > -40 && y < ch + 40;
                calloutSvg.classList.toggle('on', onScreen);
                calloutLabel.classList.toggle('on', onScreen);
                if (!onScreen) return;

                calloutDot.setAttribute('cx', x); calloutDot.setAttribute('cy', y);
                calloutRing.setAttribute('cx', x); calloutRing.setAttribute('cy', y);

                if (cw <= 768) {
                    // Mobile: Sleek CAD pointer arrow pointing directly to the active component
                    const angle = x > cw * .5 ? (3 * Math.PI / 4) : (Math.PI / 4);
                    const arrowLen = 38;
                    const lx = x + Math.cos(angle) * arrowLen;
                    const ly = y - Math.sin(angle) * arrowLen;
                    calloutLine.setAttribute('x1', lx);
                    calloutLine.setAttribute('y1', ly);
                    calloutLine.setAttribute('x2', x);
                    calloutLine.setAttribute('y2', y);
                } else {
                    // Desktop: Unchanged full callout with floating label card
                    const goLeft = x > cw * .55;
                    const off = cw < 560 ? 74 : 118;
                    const margin = cw < 560 ? 66 : 96;
                    const lx = clamp(x + (goLeft ? -off : off), margin, cw - margin);
                    const ly = clamp(y - (cw < 560 ? 66 : 86), 30, ch - (cw < 560 ? 92 : 120));
                    calloutLine.setAttribute('x1', lx);
                    calloutLine.setAttribute('y1', ly);
                    calloutLine.setAttribute('x2', x);
                    calloutLine.setAttribute('y2', y);
                    calloutLabel.style.left = lx + 'px'; calloutLabel.style.top = ly + 'px';
                    calloutTag.textContent = st.tag || st.h;
                }
            }`;

if (!targetPattern.test(js)) {
    console.error('Target updateCallout pattern not found');
    process.exit(1);
}

js = js.replace(targetPattern, replacement);
fs.writeFileSync('model3d.js', js, 'utf8');
console.log('model3d.js updateCallout updated successfully!');

// 2. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');

// Replace the hiding of #calloutSvg on mobile
css = css.replace(/#calloutSvg,\s*#calloutLabel\s*\{\s*display:\s*none\s*!important;\s*\}/g, `
    #calloutSvg, .callout-svg {
        display: block !important;
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 80 !important;
    }
    #calloutLabel, .callout-label {
        display: none !important;
    }
`);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css calloutSvg rules updated successfully!');
