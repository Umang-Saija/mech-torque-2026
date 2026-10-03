/**
 * MECH TORQUE — Cinematic Auto-Pilot Promotional Walkthrough
 * 
 * HOW TO USE:
 * 1. Open http://localhost:3000 in Chrome/Edge (full screen recommended)
 * 2. Open DevTools (F12) → Console tab
 * 3. Start your screen recorder (OBS, ShareX, Xbox Game Bar Win+G, etc.)
 * 4. Paste the contents of this file into the console and press Enter
 * 5. The website will auto-scroll cinematically for ~90 seconds
 * 6. Stop recording when the "CUT!" message appears in console
 * 
 * TIP: For best results, set browser to 1920x1080 or 1280x720.
 *       Hide DevTools after pasting (press F12 again).
 */

(async function MechTorquePromo() {
    'use strict';

    const wait = ms => new Promise(r => setTimeout(r, ms));

    function smoothScrollTo(targetY, duration = 2000) {
        return new Promise(resolve => {
            const startY = window.scrollY;
            const distance = targetY - startY;
            const startTime = performance.now();
            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                window.scrollTo(0, startY + distance * ease);
                if (progress < 1) requestAnimationFrame(step);
                else resolve();
            }
            requestAnimationFrame(step);
        });
    }

    function hoverElement(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
        el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
    }

    function unhoverElement(el) {
        if (!el) return;
        el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    }

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    console.clear();
    console.log('%c MECH TORQUE — Cinematic Promo Recording',
        'font-size:18px; font-weight:bold; color:#0284c7; background:#f0f9ff; padding:8px 16px; border-radius:6px;');
    console.log('%cStarting in 3 seconds... Hide DevTools now! (F12)',
        'font-size:14px; color:#64748b; padding:4px;');

    await wait(3000);

    // ═══ ACT 1 — HERO LANDING ═══
    console.log('Act 1: Hero Landing');
    window.scrollTo(0, 0);
    await wait(4000);

    // ═══ ACT 2 — 3D GEARBOX ASSEMBLY STAGES ═══
    console.log('Act 2: 3D Assembly Stages');
    const heroTrack = document.getElementById('track');
    const heroHeight = heroTrack ? heroTrack.offsetHeight : 8000;

    await smoothScrollTo(heroHeight * 0.08, 2500);
    await wait(2000);
    await smoothScrollTo(heroHeight * 0.15, 2500);
    await wait(2000);
    await smoothScrollTo(heroHeight * 0.25, 3000);
    await wait(2500);
    await smoothScrollTo(heroHeight * 0.38, 3000);
    await wait(2500);
    await smoothScrollTo(heroHeight * 0.50, 3000);
    await wait(3000);

    // ═══ ACT 3 — RAIL NAVIGATOR HOVER ═══
    console.log('Act 3: Rail Navigator');
    const railItems = document.querySelectorAll('.rail li');
    if (railItems.length > 0) {
        for (let i = 4; i < Math.min(8, railItems.length); i++) {
            hoverElement(railItems[i]);
            await wait(1200);
            unhoverElement(railItems[i]);
            await wait(400);
        }
    }
    await wait(1500);

    await smoothScrollTo(heroHeight * 0.65, 3000);
    await wait(2500);
    await smoothScrollTo(heroHeight * 0.82, 3000);
    await wait(2500);
    await smoothScrollTo(heroHeight * 0.97, 3000);
    await wait(3000);

    // ═══ ACT 4 — ENGINEERING FOUNDRY ═══
    console.log('Act 4: Engineering Foundry');
    const foundry = document.getElementById('foundry');
    if (foundry) {
        await smoothScrollTo(foundry.offsetTop, 3500);
        await wait(3000);
        await smoothScrollTo(foundry.offsetTop + 600, 3000);
        await wait(2500);
        await smoothScrollTo(foundry.offsetTop + 1200, 3000);
        await wait(2000);
    }

    // ═══ ACT 5 — CAD BLUEPRINT ═══
    console.log('Act 5: CAD Blueprint');
    const blueprint = document.getElementById('blueprint');
    if (blueprint) {
        await smoothScrollTo(blueprint.offsetTop, 3500);
        await wait(3500);
        const pins = document.querySelectorAll('.bp-pin');
        if (pins.length > 0) {
            if (pins[0]) { pins[0].click(); await wait(2000); }
            if (pins[2]) { pins[2].click(); await wait(2000); }
            if (pins[4]) { pins[4].click(); await wait(2000); }
        }
        await smoothScrollTo(blueprint.offsetTop + 800, 3000);
        await wait(2000);
    }

    // ═══ ACT 6 — MODELS CATALOGUE ═══
    console.log('Act 6: Models Catalogue');
    const models = document.getElementById('models');
    if (models) {
        await smoothScrollTo(models.offsetTop, 3500);
        await wait(3000);
        const cards = document.querySelectorAll('.model-card, .gearbox-card');
        for (let i = 0; i < Math.min(3, cards.length); i++) {
            hoverElement(cards[i]);
            await wait(1500);
            unhoverElement(cards[i]);
            await wait(500);
        }
        await smoothScrollTo(models.offsetTop + 600, 3000);
        await wait(2000);
    }

    // ═══ ACT 7 — NAVBAR BLOOM ═══
    console.log('Act 7: Navbar Interaction');
    const nav = document.querySelector('.site-nav');
    if (nav) {
        hoverElement(nav);
        await wait(2500);
        const navLinks = document.querySelectorAll('.nav-links a');
        for (let i = 0; i < Math.min(4, navLinks.length); i++) {
            hoverElement(navLinks[i]);
            await wait(800);
        }
        unhoverElement(nav);
        await wait(1000);
    }

    // ═══ ACT 8 — CONTACT & FOOTER ═══
    console.log('Act 8: Contact & Footer');
    const contact = document.getElementById('contact');
    if (contact) {
        await smoothScrollTo(contact.offsetTop, 3500);
        await wait(3000);
    }
    await smoothScrollTo(maxScroll(), 4000);
    await wait(4000);

    // ═══ ACT 9 — HERO RETURN ═══
    console.log('Act 9: Return to Hero');
    await smoothScrollTo(0, 4000);
    await wait(4000);

    console.log('%c CUT! Recording complete. Stop your screen recorder.',
        'font-size:18px; font-weight:bold; color:#10b981; background:#f0fdf4; padding:8px 16px; border-radius:6px;');
    console.log('%cTotal runtime: ~90 seconds',
        'font-size:13px; color:#64748b; padding:4px;');
})();
