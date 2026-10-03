const fs = require('fs');

// 1. Update model3d.js
let js = fs.readFileSync('model3d.js', 'utf8');

// Update element selectors
js = js.replace(
    "const calloutSvg = $('calloutSvg'), calloutLine = $('calloutLine'), calloutDot = $('calloutDot'), calloutRing = $('calloutRing'), calloutLabel = $('calloutLabel'), calloutTag = $('calloutTag');",
    "const calloutSvg = $('calloutSvg'), calloutLine = $('calloutLine'), calloutDot = $('calloutDot'), calloutDotCore = $('calloutDotCore'), calloutRing = $('calloutRing'), calloutRing2 = $('calloutRing2'), calloutLabel = $('calloutLabel'), calloutTag = $('calloutTag');"
);

// Update coordinate setting & arrow length
const targetCoordBlock = /calloutDot\.setAttribute\('cx', x\);[\s\S]*?calloutLine\.setAttribute\('y2', y\);/;
const replacementCoordBlock = `if (calloutDot) { calloutDot.setAttribute('cx', x); calloutDot.setAttribute('cy', y); }
                if (calloutDotCore) { calloutDotCore.setAttribute('cx', x); calloutDotCore.setAttribute('cy', y); }
                if (calloutRing) { calloutRing.setAttribute('cx', x); calloutRing.setAttribute('cy', y); }
                if (calloutRing2) { calloutRing2.setAttribute('cx', x); calloutRing2.setAttribute('cy', y); }

                if (cw <= 768) {
                    // Mobile: Bold High-Visibility Laser Chevron Arrow (54px long, high contrast angle)
                    const angle = x > cw * .5 ? (3 * Math.PI / 4) : (Math.PI / 4);
                    const arrowLen = 54;
                    const lx = x + Math.cos(angle) * arrowLen;
                    const ly = y - Math.sin(angle) * arrowLen;
                    calloutLine.setAttribute('x1', lx);
                    calloutLine.setAttribute('y1', ly);
                    calloutLine.setAttribute('x2', x);
                    calloutLine.setAttribute('y2', y);
                }`;

js = js.replace(targetCoordBlock, replacementCoordBlock);
fs.writeFileSync('model3d.js', js, 'utf8');
console.log('model3d.js updated with laser arrow elements!');

// 2. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');

const targetCalloutCSS = /#calloutLine\s*\{[\s\S]*?animation:\s*ping\s*1\.8s\s*ease-out\s*infinite;\s*\}/;
const replacementCalloutCSS = `#calloutLine {
            stroke: url(#laserGrad) !important;
            stroke-width: 4.2px !important;
            stroke-linecap: round !important;
            filter: drop-shadow(0 2px 8px rgba(255, 59, 0, 0.8)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6)) !important;
        }

        #calloutDot {
            fill: #ff3b00 !important;
            stroke: #ffffff !important;
            stroke-width: 2.5px !important;
            filter: drop-shadow(0 2px 8px rgba(255, 59, 0, 0.9)) !important;
        }

        #calloutDotCore {
            fill: #ffffff !important;
            filter: drop-shadow(0 0 3px #ffffff) !important;
        }

        #calloutRing {
            fill: none !important;
            stroke: #ff3b00 !important;
            stroke-width: 2.2px !important;
            opacity: 0 !important;
            transform-origin: center !important;
            transform-box: fill-box !important;
            animation: ping 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite !important;
        }

        #calloutRing2 {
            fill: none !important;
            stroke: #ffaa00 !important;
            stroke-width: 1.8px !important;
            opacity: 0 !important;
            transform-origin: center !important;
            transform-box: fill-box !important;
            animation: ping 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.5s !important;
        }`;

if (!targetCalloutCSS.test(css)) {
    console.error('Target callout CSS not found in styles.css');
    process.exit(1);
}

css = css.replace(targetCalloutCSS, replacementCalloutCSS);
fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated with high-voltage laser styling!');
