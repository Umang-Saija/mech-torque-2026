const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetPattern = /<svg id="calloutSvg"[\s\S]*?<\/svg>/;

const replacement = `<svg id="calloutSvg" class="callout-svg" aria-hidden="true">
                <defs>
                    <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ffaa00" />
                        <stop offset="45%" stop-color="#ff3b00" />
                        <stop offset="100%" stop-color="#e11d48" />
                    </linearGradient>
                    <marker id="arrowHead" markerWidth="20" markerHeight="20" refX="16" refY="10" orient="auto">
                        <path d="M2,3 L18,10 L2,17 L6,10 Z" fill="#000000" stroke="#000000" stroke-width="3" stroke-linejoin="round" />
                        <path d="M2,3 L18,10 L2,17 L6,10 Z" fill="url(#laserGrad)" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" />
                    </marker>
                    <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(255, 59, 0, 0.85)" />
                        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.6" />
                    </filter>
                </defs>
                <line id="calloutLine" x1="0" y1="0" x2="0" y2="0" marker-end="url(#arrowHead)" />
                <circle id="calloutRing" cx="0" cy="0" r="14" />
                <circle id="calloutRing2" cx="0" cy="0" r="8" />
                <circle id="calloutDot" cx="0" cy="0" r="6" />
                <circle id="calloutDotCore" cx="0" cy="0" r="3" />
            </svg>`;

if (!targetPattern.test(html)) {
    console.error('Target pattern not found in index.html');
    process.exit(1);
}

html = html.replace(targetPattern, replacement);
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated with bold laser arrowhead & reticle!');
