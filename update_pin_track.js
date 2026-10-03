const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// 1. Update the mobile #track rule from 260vh to 650vh
css = css.replace(/#track\s*\{\s*height:\s*260vh\s*!important;\s*\}/g, '#track { height: 650vh !important; background: #ede8e0 !important; }');

// 2. Append enhanced mobile #pin and #track rules
const pinFix = `
/* ── Robust Mobile Viewport Pinning & Zero Gap Guarantee (<= 768px) ── */
@media (max-width: 768px) {
    #track {
        height: 650vh !important;
        background: #ede8e0 !important;
    }
    #pin {
        position: sticky !important;
        top: 0 !important;
        height: 100vh !important;
        height: 100dvh !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
        width: 100% !important;
        overflow: hidden !important;
        background-color: #ede8e0 !important;
    }
}
`;

css += pinFix;
fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated with #track 650vh and #pin 100dvh fix!');
