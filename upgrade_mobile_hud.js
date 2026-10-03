const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const luxuryMobileHUD = `
/* ==========================================================================
   MOBILE LUXURY HUD CARD & CLEAN COMPONENT STAGE ARCHITECTURE (<= 768px ONLY)
   - Zero change to desktop (>= 769px)
   ========================================================================== */
@media (max-width: 768px) {
    /* 1. Hide messy floating SVG callout lines on small mobile screens */
    #calloutSvg,
    #calloutLabel {
        display: none !important;
    }

    /* 2. Transform .copy into a sleek engineered frosted HUD card */
    .copy {
        position: absolute !important;
        left: 14px !important;
        right: 14px !important;
        bottom: calc(94px + env(safe-area-inset-bottom, 0px)) !important;
        width: auto !important;
        max-width: calc(100vw - 28px) !important;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.98) 100%) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
        border: 1.5px solid rgba(14, 165, 233, 0.3) !important;
        border-top: 3px solid #0284c7 !important;
        border-radius: 16px !important;
        padding: 12px 14px 10px !important;
        box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(2, 132, 199, 0.08) !important;
        pointer-events: auto !important;
        z-index: 85 !important;
        box-sizing: border-box !important;
        transition: all .25s ease !important;
    }

    /* 3. Component Tag — clean compact pill badge, NO full-width stretched box */
    .copy .tag,
    .copy.is-hero .tag {
        display: none !important;
    }
    .copy.tag-on .tag,
    .copy.is-hero.tag-on .tag {
        display: inline-flex !important;
        align-items: center !important;
        width: fit-content !important;
        max-width: 100% !important;
        background: rgba(2, 132, 199, 0.08) !important;
        color: #0284c7 !important;
        border: 1px solid rgba(2, 132, 199, 0.28) !important;
        border-radius: 5px !important;
        font: 700 10.5px/1 'JetBrains Mono', monospace !important;
        letter-spacing: 0.04em !important;
        padding: 3.5px 8px !important;
        margin: 0 0 5px 0 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
    }

    /* 4. Component Title — bold, crisp, easy to read */
    .copy h1,
    .copy h2,
    .copy.is-hero h1 {
        font-family: var(--font-heading) !important;
        font-size: 19px !important;
        line-height: 1.15 !important;
        letter-spacing: -0.015em !important;
        color: #0f172a !important;
        font-weight: 750 !important;
        margin: 0 0 4px 0 !important;
        word-break: break-word !important;
    }

    /* 5. Component Details Description — high contrast slate, clean line height */
    .copy p,
    .copy.is-hero p {
        font-family: var(--font-sans) !important;
        font-size: 12.5px !important;
        line-height: 1.4 !important;
        color: #475569 !important;
        font-weight: 450 !important;
        margin: 0 0 6px 0 !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
    }

    /* 6. Compact Specs Table on Final Stage */
    #specs, .specs {
        margin: 6px 0 8px !important;
        padding: 6px 10px !important;
        border-radius: 8px !important;
        row-gap: 3px !important;
        column-gap: 8px !important;
        background: rgba(241, 245, 249, 0.8) !important;
        border: 1px solid rgba(14, 165, 233, 0.2) !important;
    }
    #specs dt, .specs dt {
        font-size: 10px !important;
        padding: 2px 6px 2px 0 !important;
        font-weight: 700 !important;
        color: #475569 !important;
    }
    #specs dd, .specs dd {
        font-size: 12px !important;
        padding: 2px 0 2px 6px !important;
        font-weight: 800 !important;
        color: #0f172a !important;
    }

    /* 7. Action Bar & Jump Buttons inside HUD Card */
    .hero-actions-bar {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        gap: 6px !important;
        margin: 4px 0 0 0 !important;
    }
    .hero-actions-bar .cta {
        padding: 6px 12px !important;
        font-size: 11px !important;
        border-radius: 6px !important;
        white-space: nowrap !important;
        margin: 0 !important;
        background: #0284c7 !important;
        color: #ffffff !important;
    }
    .hero-mobile-jump {
        margin: 0 !important;
        padding: 5px 9px !important;
        font-size: 10.5px !important;
        white-space: nowrap !important;
        border-radius: 999px !important;
        background: rgba(2, 132, 199, 0.06) !important;
        border: 1px solid rgba(2, 132, 199, 0.25) !important;
        color: #0284c7 !important;
    }

    /* 8. Preset Pills inside HUD Card */
    .mobile-3d-presets {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 3px !important;
        margin-top: 6px !important;
        padding: 3px 4px !important;
        background: rgba(241, 245, 249, 0.85) !important;
        border: 1px solid rgba(14, 165, 233, 0.2) !important;
        border-radius: 999px !important;
        box-shadow: none !important;
    }
    .preset-pill {
        flex: 1 !important;
        justify-content: center !important;
        padding: 4px 6px !important;
        font-size: 10px !important;
        gap: 3px !important;
    }

    /* 9. Floating Rail Dots Indicator Bar */
    .rail {
        position: absolute !important;
        top: auto !important;
        bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
        left: 14px !important;
        right: 14px !important;
        width: auto !important;
        transform: none !important;
        flex-direction: row !important;
        gap: 2px !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 4px 10px !important;
        height: 24px !important;
        box-sizing: border-box !important;
        background: rgba(255, 255, 255, 0.94) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1.5px solid rgba(14, 165, 233, 0.25) !important;
        border-radius: 999px !important;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1) !important;
        z-index: 92 !important;
        display: flex !important;
    }
    .rail li {
        flex: 1 !important;
        justify-content: center !important;
        display: flex !important;
    }
    .rail-pip {
        width: 5px !important;
        height: 5px !important;
        background: #94a3b8 !important;
    }
    .rail li.now .rail-pip {
        width: 7px !important;
        height: 7px !important;
        background: #0284c7 !important;
        box-shadow: 0 0 6px rgba(2, 132, 199, 0.6) !important;
    }
}
`;

css += luxuryMobileHUD;
fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated with Luxury Mobile HUD Card!');
