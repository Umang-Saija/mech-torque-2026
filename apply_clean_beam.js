const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const targetSvg = /<svg id="calloutSvg"[\s\S]*?<\/svg>/;
const cleanBeamSvg = `<svg id="calloutSvg" class="callout-svg" aria-hidden="true">
                <defs>
                    <radialGradient id="beamGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.9" />
                        <stop offset="45%" stop-color="#0284c7" stop-opacity="0.5" />
                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
                    </radialGradient>
                </defs>
                <line id="calloutLine" x1="0" y1="0" x2="0" y2="0" />
                <circle id="calloutHalo" cx="0" cy="0" r="22" fill="url(#beamGlow)" />
                <circle id="calloutRing" cx="0" cy="0" r="10" />
                <circle id="calloutDot" cx="0" cy="0" r="4.5" />
            </svg>`;

html = html.replace(targetSvg, cleanBeamSvg);
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with clean color beam highlighter SVG');

// 2. Update model3d.js
let js = fs.readFileSync('model3d.js', 'utf8');

// Update element selectors
js = js.replace(
    /const calloutSvg = \$\('calloutSvg'\)[\s\S]*?calloutTag = \$\('calloutTag'\);/,
    "const calloutSvg = $('calloutSvg'), calloutLine = $('calloutLine'), calloutDot = $('calloutDot'), calloutHalo = $('calloutHalo'), calloutRing = $('calloutRing'), calloutLabel = $('calloutLabel'), calloutTag = $('calloutTag');"
);

// Update updateCallout function
const targetCalloutFn = /function updateCallout\(idx\) \{[\s\S]*?calloutTag\.textContent = st\.tag \|\| st\.h;\s*\}\s*\}/;

const cleanCalloutFn = `function updateCallout(idx) {
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
                calloutLabel.classList.toggle('on', onScreen && cw > 768);
                if (!onScreen) return;

                if (calloutDot) { calloutDot.setAttribute('cx', x); calloutDot.setAttribute('cy', y); }
                if (calloutHalo) { calloutHalo.setAttribute('cx', x); calloutHalo.setAttribute('cy', y); }
                if (calloutRing) { calloutRing.setAttribute('cx', x); calloutRing.setAttribute('cy', y); }

                if (cw > 768) {
                    // Desktop: Clean thin technical leader line connecting label to the highlighter beam
                    const goLeft = x > cw * .55;
                    const off = 118;
                    const margin = 96;
                    const lx = clamp(x + (goLeft ? -off : off), margin, cw - margin);
                    const ly = clamp(y - 86, 30, ch - 120);
                    calloutLine.setAttribute('x1', lx);
                    calloutLine.setAttribute('y1', ly);
                    calloutLine.setAttribute('x2', x);
                    calloutLine.setAttribute('y2', y);
                    calloutLabel.style.left = lx + 'px'; calloutLabel.style.top = ly + 'px';
                    calloutTag.textContent = st.tag || st.h;
                }
            }`;

js = js.replace(targetCalloutFn, cleanCalloutFn);
fs.writeFileSync('model3d.js', js, 'utf8');
console.log('model3d.js updated with color beam coordinates');

// 3. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');

// Replace callout styling in styles.css
const targetCalloutCSS = /#calloutLine\s*\{[\s\S]*?animation:\s*ping\s*1\.6s[\s\S]*?infinite\s*0\.5s\s*!important;\s*\}/;

const cleanCalloutCSS = `#calloutLine {
            stroke: #0284c7 !important;
            stroke-width: 1.5px !important;
            stroke-dasharray: 4 2 !important;
            opacity: 0.75 !important;
            filter: drop-shadow(0 1px 3px rgba(2, 132, 199, 0.4)) !important;
        }

        #calloutHalo {
            pointer-events: none !important;
            transform-origin: center !important;
            transform-box: fill-box !important;
            filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.6)) !important;
            animation: beamPulse 2.4s ease-in-out infinite alternate !important;
        }

        #calloutRing {
            fill: none !important;
            stroke: #00f0ff !important;
            stroke-width: 1.6px !important;
            opacity: 0.85 !important;
            transform-origin: center !important;
            transform-box: fill-box !important;
            animation: ringPing 2s cubic-bezier(0, 0.2, 0.8, 1) infinite !important;
        }

        #calloutDot {
            fill: #ffffff !important;
            stroke: #0284c7 !important;
            stroke-width: 2.2px !important;
            filter: drop-shadow(0 0 6px #00f0ff) !important;
        }

        @keyframes beamPulse {
            0% { transform: scale(0.85); opacity: 0.55; }
            100% { transform: scale(1.25); opacity: 0.95; }
        }

        @keyframes ringPing {
            0% { transform: scale(0.6); opacity: 0.9; }
            80% { transform: scale(1.9); opacity: 0; }
            100% { transform: scale(1.9); opacity: 0; }
        }`;

css = css.replace(targetCalloutCSS, cleanCalloutCSS);
fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated with clean color beam highlighter styles');
