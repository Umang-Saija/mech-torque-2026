const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

const mobileFix = `
/* ==========================================================================
   MOBILE HERO MODEL & HUD POSITIONING OVERLAP REPAIR (<= 768px ONLY)
   - Zero change to desktop (>= 769px)
   ========================================================================== */
@media (max-width: 768px) {
    /* 1. Float .rail dots cleanly above fixed mobile dock with zero cutoff */
    .rail {
        position: absolute !important;
        top: auto !important;
        bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
        left: 14px !important;
        right: 14px !important;
        width: auto !important;
        transform: none !important;
        flex-direction: row !important;
        gap: 3px !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 5px 10px !important;
        height: 26px !important;
        box-sizing: border-box !important;
        background: rgba(255, 255, 255, 0.94) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1.5px solid rgba(14, 165, 233, 0.25) !important;
        border-radius: 999px !important;
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12) !important;
        z-index: 92 !important;
        display: flex !important;
    }
    .rail li {
        flex: 1 !important;
        justify-content: center !important;
        display: flex !important;
    }
    .rail-node {
        width: auto !important;
        justify-content: center !important;
        display: flex !important;
    }
    .rail-pip {
        width: 6px !important;
        height: 6px !important;
        background: #94a3b8 !important;
    }
    .rail li.now .rail-pip {
        width: 8px !important;
        height: 8px !important;
        background: #0284c7 !important;
        box-shadow: 0 0 8px rgba(2, 132, 199, 0.6) !important;
    }

    /* 2. Anchor .copy cleanly above .rail with ample clearance */
    .copy {
        position: absolute !important;
        left: 14px !important;
        right: 14px !important;
        bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
        width: auto !important;
        max-width: none !important;
        pointer-events: none !important;
        z-index: 85 !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    .copy * {
        pointer-events: auto;
    }

    /* 3. Compact typography for stage headings, tags & descriptions */
    .copy h1,
    .copy h2,
    .copy.is-hero h1 {
        font-size: clamp(20px, 5.2vw, 24px) !important;
        line-height: 1.15 !important;
        letter-spacing: -0.015em !important;
        margin: 0 0 4px 0 !important;
        color: #0f172a !important;
        font-weight: 750 !important;
    }

    .copy p,
    .copy.is-hero p {
        font-size: 13px !important;
        line-height: 1.35 !important;
        color: #475569 !important;
        margin: 0 0 6px 0 !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
    }

    .copy .tag,
    .copy.is-hero .tag {
        font-size: 10px !important;
        line-height: 1 !important;
        padding: 3.5px 8px !important;
        margin: 0 0 5px 0 !important;
        border-radius: 4px !important;
    }

    /* 4. Compact luxury specs card on mobile */
    #specs, .specs {
        margin: 6px 0 !important;
        padding: 8px 12px !important;
        border-radius: 10px !important;
        row-gap: 3px !important;
        column-gap: 10px !important;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1) !important;
    }
    #specs dt, .specs dt {
        font-size: 10px !important;
        padding: 3px 6px 3px 0 !important;
        letter-spacing: 0.05em !important;
    }
    #specs dd, .specs dd {
        font-size: 12.5px !important;
        padding: 3px 0 3px 6px !important;
    }

    /* 5. Mobile hero actions bar & jump button */
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
    }
    .hero-mobile-jump {
        margin: 0 !important;
        padding: 5px 10px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        border-radius: 999px !important;
    }

    /* 6. Mobile 3D preset dock */
    .mobile-3d-presets {
        margin-top: 6px !important;
        padding: 4px 6px !important;
        gap: 4px !important;
    }
    .preset-pill {
        padding: 4.5px 8px !important;
        font-size: 10.5px !important;
    }

    /* 7. Callout tooltip on mobile */
    .callout-label {
        font-size: 10.5px !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
        white-space: nowrap !important;
    }
}
`;

css += mobileFix;
fs.writeFileSync('styles.css', css, 'utf8');
console.log('styles.css updated with mobile fix');
