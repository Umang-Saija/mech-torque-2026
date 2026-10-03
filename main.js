(() => {
    'use strict';
    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];

    /* =========================================================================
       1. CERTIFIED MATERIALS & DUAL STANDARDS TABLE (Live Search & Category Tabs)
       ========================================================================= */
    const ENRICHED_MATERIALS = [
        { id: '01', name: 'Housing', cat: 'castings', mat: 'Cast Iron', dot: 'dot-ci', astm: 'ASTM A48-83 30A', is: 'IS 210 FG 200', role: 'Monoblock pressure containment envelope' },
        { id: '02', name: 'Top Cover', cat: 'castings', mat: 'Cast Iron', dot: 'dot-ci', astm: 'ASTM A48-83 30A', is: 'IS 210 FG 200', role: 'Weatherproof gasket-sealed upper housing' },
        { id: '03', name: 'Worm Wheel', cat: 'gearing', mat: 'Ductile Iron', dot: 'dot-sgi', astm: 'ASTM A70-50-05', is: 'SGI 500/7', role: 'Heavy 90° valve quadrant reduction gear' },
        { id: '04', name: 'Input Shaft', cat: 'transmission', mat: 'Carbon Steel', dot: 'dot-cs', astm: 'ASTM A576-1045', is: 'IS 45C8', role: 'High-torque drive stem with induction finish' },
        { id: '05', name: 'Worm Gear', cat: 'gearing', mat: 'Carbon Steel', dot: 'dot-cs', astm: 'ASTM A576-1045', is: 'IS 45C8', role: 'Precision ground self-locking thread lead' },
        { id: '06', name: 'Spur Housing', cat: 'castings', mat: 'Cast Iron', dot: 'dot-ci', astm: 'ASTM A48-83 30A', is: 'IS 210 FG 200', role: 'Secondary gear-reduction casing' },
        { id: '07', name: 'Spur Cover', cat: 'castings', mat: 'Cast Iron', dot: 'dot-ci', astm: 'ASTM A48-83 30A', is: 'IS 210 FG 200', role: 'Secondary reduction protective shield' },
        { id: '08', name: 'Spur Pinion', cat: 'gearing', mat: 'Carbon Steel', dot: 'dot-cs', astm: 'ASTM A322-4140', is: 'IS 40CrMo3', role: 'High-ratio alloy steel drive pinion' },
        { id: '09', name: 'Spur Gear', cat: 'gearing', mat: 'Ductile Iron', dot: 'dot-sgi', astm: 'ASTM A70-50-05', is: 'SGI 500/7', role: 'Heavy compound mechanical advantage gear' },
        { id: '10', name: 'Thrust Bearing', cat: 'transmission', mat: 'Chrome Alloy', dot: 'dot-bearing', astm: 'ASTM A295 52100', is: 'ISO 683-17', role: 'Axial reaction thrust load absorber' }
    ];

    const mBody = $('#materialsBody');
    let currentMatCat = 'all';
    let currentMatSearch = '';

    function renderMaterialsTable() {
        if (!mBody) return;
        const filtered = ENRICHED_MATERIALS.filter(item => {
            const matchesCat = currentMatCat === 'all' || item.cat === currentMatCat;
            const q = currentMatSearch.toLowerCase().trim();
            const matchesSearch = !q || 
                item.name.toLowerCase().includes(q) || 
                item.mat.toLowerCase().includes(q) || 
                item.astm.toLowerCase().includes(q) || 
                item.is.toLowerCase().includes(q) || 
                item.role.toLowerCase().includes(q);
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            mBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #64748b; font-family: monospace;">NO COMPONENTS MATCH YOUR SEARCH</td></tr>';
            return;
        }

        mBody.innerHTML = filtered.map(r => `
            <tr>
                <td><span class="comp-num">${r.id}</span></td>
                <td>
                    <div class="comp-name-wrap">
                        <span class="comp-title">${r.name}</span>
                        <span class="comp-func">${r.role}</span>
                    </div>
                </td>
                <td>
                    <span class="mat-type-pill">
                        <span class="mat-type-dot ${r.dot}"></span>
                        ${r.mat}
                    </span>
                </td>
                <td><span class="astm-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>${r.astm}</span></td>
                <td><span class="is-tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${r.is}</span></td>
            </tr>
        `).join('');
    }

    renderMaterialsTable();

    // Materials Category Tabs Interaction
    $$('.mat-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.mat-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMatCat = btn.getAttribute('data-category') || 'all';
            renderMaterialsTable();
        });
    });

    // Materials Live Search Input
    const searchInput = $('#matSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentMatSearch = e.target.value;
            renderMaterialsTable();
        });
    }

    /* =========================================================================
       2. MODELS CATALOG (Pristine Light Theme & Mobile-Optimized Grid)
       ========================================================================= */
    const MODELS = [
        { m: 'MT-20', torque: 250, cat: 'pilot', subtitle: 'Compact Butterfly Valve Operator', pcd: 'F05, F07', bore: 20, wheel: 150 },
        { m: 'MT-25', torque: 500, cat: 'pilot', subtitle: 'Standard Pilot Actuation Operator', pcd: 'F07, F10', bore: 30, wheel: 250 },
        { m: 'MT-30', torque: 700, cat: 'process', subtitle: 'Flagship Process Industrial Unit', pcd: 'F07, F10, F12', bore: 32, wheel: 350, feat: true },
        { m: 'MT-40', torque: 1000, cat: 'process', subtitle: 'High-Torque Plant Service Unit', pcd: 'F10, F12, F14', bore: 45, wheel: 350 },
        { m: 'MT-50', torque: 1500, cat: 'heavy', subtitle: 'Heavy Pipeline Compound Actuator', pcd: 'F10, F12, F14, F16', bore: 50, wheel: 500 },
        { m: 'MT-60', torque: 2000, cat: 'heavy', subtitle: 'Severe Transmission Pipeline Unit', pcd: 'F10, F12, F14, F16', bore: 50, wheel: 500 },
    ];

    const DIMS = [
        ['MT 20', 250, 'F05, F07', 20, 'Ø160', 111, 91, 52.5, 79, 202, 36, 12, 22],
        ['MT 25', 500, 'F07, F10', 30, 'Ø250', 135, 108, 62, 98, 218, 54, 14, 35],
        ['MT 30', 700, 'F07, F10, F12', 32, 'Ø350', 142, 128, 74, 98, 218, 58, 20, 39],
        ['MT 40', 1000, 'F10, F12, F14', 45, 'Ø350', 176, 140, 86, 116, 218, 70, 20, 47],
        ['MT 50', 1500, 'F10, F12, F14, F16', 55, 'Ø500', 198, 168, 86, 137, 226, 81, 20, 48],
        ['MT 60', 2000, 'F10, F12, F14, F16', 55, 'Ø500', 218, 185, 96, 150, 235, 90, 22, 52],
    ];

    const grid = $('#modelGrid');
    let currentModelFilter = 'all';

    function renderModelGrid() {
        if (!grid) return;
        const maxTorque = 2000;
        const filtered = currentModelFilter === 'all'
            ? MODELS
            : MODELS.filter(x => x.cat === currentModelFilter);

        grid.innerHTML = filtered.map((x) => {
            const origIdx = MODELS.findIndex(item => item.m === x.m);
            const pct = Math.round(x.torque / maxTorque * 100);
            return `
            <div class="model-card-light in ${x.feat ? 'is-flagship' : ''}" data-idx="${origIdx}" tabindex="0" role="button" aria-label="Open ${x.m} specification and CAD drawing">
                ${x.feat ? '<span class="model-flagship-badge">★ Flagship Model</span>' : ''}
                <div class="model-card-header">
                    <span class="model-card-name">${x.m}</span>
                    <span class="model-card-torque-tag">${x.torque} Nm</span>
                </div>
                <div class="model-card-subtitle">${x.subtitle}</div>
                <div class="model-card-bar-track">
                    <div class="model-card-bar-fill" style="width: ${pct}%"></div>
                </div>
                <div class="model-specs-grid">
                    <div class="model-spec-item">
                        <span class="model-spec-k">ISO PCD</span>
                        <span class="model-spec-v">${x.pcd}</span>
                    </div>
                    <div class="model-spec-item">
                        <span class="model-spec-k">Max Bore</span>
                        <span class="model-spec-v">${x.bore} mm</span>
                    </div>
                    <div class="model-spec-item">
                        <span class="model-spec-k">Handwheel</span>
                        <span class="model-spec-v">Ø${x.wheel} mm</span>
                    </div>
                    <div class="model-spec-item">
                        <span class="model-spec-k">Drive</span>
                        <span class="model-spec-v">Self-Locking</span>
                    </div>
                </div>
                <div class="model-card-cta">
                    <span>CAD &amp; Full Envelope</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
            </div>`;
        }).join('');

        // Wire up card clicks and keyboard interaction to open CAD Modal
        $$('.model-card-light').forEach(card => {
            const handleOpen = () => {
                const idx = parseInt(card.getAttribute('data-idx'), 10);
                openModelModal(idx);
            };
            card.addEventListener('click', handleOpen);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen();
                }
            });
        });
    }

    renderModelGrid();

    // Wire up Model Category Filter Tabs
    $$('.model-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.model-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentModelFilter = btn.getAttribute('data-filter') || 'all';
            renderModelGrid();
        });
    });

    /* =========================================================================
       3. MODEL DETAIL MODAL (CAD Drawing & Envelope Sync)
       ========================================================================= */
    const modalOverlay = $('#modelModalOverlay');
    const modalBackdrop = $('#modelModalBackdrop');
    const modalCloseBtn = $('#modelModalClose');

    function openModelModal(idx) {
        const m = MODELS[idx];
        const d = DIMS[idx];
        if (!m || !modalOverlay) return;

        const titleEl = $('#modalTitle'); if (titleEl) titleEl.textContent = `${m.m} Valve Gearbox Specification`;
        const subEl = $('#modalSub'); if (subEl) subEl.textContent = `Engineered for quarter-turn valve actuation. Rated ${m.torque} Nm with ISO 5211 mounting and self-locking worm drive.`;
        const torqEl = $('#modalTorque'); if (torqEl) torqEl.textContent = m.torque;
        const fillEl = $('#modalBarFill'); if (fillEl) fillEl.style.width = `${Math.round(m.torque / 2000 * 100)}%`;
        const pcdEl = $('#modalPcd'); if (pcdEl) pcdEl.textContent = m.pcd;
        const boreEl = $('#modalBore'); if (boreEl) boreEl.textContent = `Ø${m.bore} mm (Keyed)`;
        const wheelEl = $('#modalWheel'); if (wheelEl) wheelEl.textContent = `Ø${m.wheel} mm`;

        const DIM_DEFINITIONS = [
            { key: 'A', name: 'Housing Length', shortDesc: 'Casing height', userPov: 'Total vertical height of the gearbox casing from valve mounting axis to top cover.', pinX: 6.8, pinY: 46.0 },
            { key: 'B', name: 'Housing Width', shortDesc: 'Body width', userPov: 'Overall width of the gearbox casing body.', pinX: 32.2, pinY: 12.0 },
            { key: 'C', name: 'Center Distance', shortDesc: 'Gear-to-worm axis', userPov: 'Center-to-center distance between output stem and worm shaft.', pinX: 10.4, pinY: 66.0 },
            { key: 'D', name: 'Stop Bolt Span', shortDesc: 'Travel stop span', userPov: 'Centerline distance between dual 90° travel adjustment stop bolts.', pinX: 31.7, pinY: 91.5 },
            { key: 'E', name: 'Shaft Reach', shortDesc: 'Valve to handwheel', userPov: 'Horizontal reach from valve stem center to handwheel input hub.', pinX: 45.9, pinY: 6.4 },
            { key: 'F', name: 'Flange Height', shortDesc: 'Base spigot height', userPov: 'Height from valve mounting flange face to gear housing base.', pinX: 85.0, pinY: 86.1 },
            { key: 'G', name: 'Input Shaft Keyway', shortDesc: 'Shaft drive key', userPov: 'Input drive shaft keyway width and coupling diameter.', pinX: 56.5, pinY: 27.4 },
            { key: 'H', name: 'Stem Bore Depth', shortDesc: 'Max stem socket depth', userPov: 'Usable insertion depth of the internal drive sleeve bore.', pinX: 80.3, pinY: 91.5 }
        ];

        const cadTag = $('#cadModelTag');
        if (cadTag) cadTag.textContent = `${m.m} CAD SPEC (1:1)`;

        const dimsGrid = $('#modalDimsGrid');
        if (dimsGrid && d) {
            dimsGrid.innerHTML = DIM_DEFINITIONS.map((def, ki) => {
                const val = d[5 + ki];
                return `
                    <div class="dim-cell${ki === 0 ? ' active' : ''}" data-dim-key="${def.key}" tabindex="0">
                        <div class="dim-cell-top">
                            <span class="dim-letter">${def.key}</span>
                            <span class="dim-title">${def.name}</span>
                        </div>
                        <div class="dim-val-row">
                            <b class="dim-num">${val}</b>
                            <span class="dim-unit">mm</span>
                        </div>
                        <span class="dim-sub">${def.shortDesc}</span>
                    </div>`;
            }).join('');
        }

        const pinLayer = $('#cadPinLayer');
        if (pinLayer && d) {
            pinLayer.innerHTML = DIM_DEFINITIONS.map((def, ki) => `
                <button type="button" class="cad-pin${ki === 0 ? ' active' : ''}" data-dim-key="${def.key}" style="left:${def.pinX}%; top:${def.pinY}%;" title="DIM ${def.key}: ${def.name} (${d[5 + ki]} mm)" aria-label="Highlight Dimension ${def.key}">
                    ${def.key}
                </button>`).join('');
        }

        function setActiveDimension(key) {
            const def = DIM_DEFINITIONS.find(x => x.key === key) || DIM_DEFINITIONS[0];
            const ki = DIM_DEFINITIONS.indexOf(def);
            const val = d ? d[5 + ki] : '-';

            $$('.dim-cell').forEach(c => c.classList.toggle('active', c.getAttribute('data-dim-key') === key));
            $$('.cad-pin').forEach(p => p.classList.toggle('active', p.getAttribute('data-dim-key') === key));

            const telemKey = $('#telemKey'); if (telemKey) telemKey.textContent = `DIM ${def.key}`;
            const telemName = $('#telemName'); if (telemName) telemName.textContent = def.name;
            const telemVal = $('#telemVal'); if (telemVal) telemVal.textContent = `${val} mm`;
            const telemDesc = $('#telemDesc'); if (telemDesc) telemDesc.textContent = def.userPov;
        }

        setActiveDimension('A');

        $$('.dim-cell').forEach(cell => {
            const k = cell.getAttribute('data-dim-key');
            cell.addEventListener('mouseenter', () => setActiveDimension(k));
            cell.addEventListener('click', () => setActiveDimension(k));
        });

        $$('.cad-pin').forEach(pin => {
            const k = pin.getAttribute('data-dim-key');
            pin.addEventListener('mouseenter', () => setActiveDimension(k));
            pin.addEventListener('click', () => setActiveDimension(k));
        });

        const waBtn = $('#modalWaBtn');
        if (waBtn) {
            const waText = encodeURIComponent(`Hi Mech Torque, I would like to request a quotation and GA drawing for model ${m.m} (${m.torque} Nm).`);
            waBtn.href = `https://wa.me/919913191343?text=${waText}`;
        }

        const mailBtn = $('#modalMailBtn');
        if (mailBtn) {
            const mailSub = encodeURIComponent(`RFQ Specification: ${m.m} (${m.torque} Nm)`);
            const mailBody = encodeURIComponent(`Hello Mech Torque Sales Team,\n\nPlease provide a formal quotation and GA drawing for:\nModel: ${m.m}\nRated Torque: ${m.torque} Nm\nISO Flange: ${m.pcd}\nStem Bore: ${m.bore} mm\nHandwheel: Ø${m.wheel} mm\n`);
            mailBtn.href = `mailto:infomechtorque@gmail.com?subject=${mailSub}&body=${mailBody}`;
        }

        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Blueprint Contrast Mode Switcher (White Paper / Electric Dark Blueprint)
        const modeBtn = $('#cadModeBtn');
        const stageEl = $('#cadDrawingStage');
        const iconEl = $('#cadModeIcon');
        const textEl = $('#cadModeText');
        if (modeBtn && stageEl && !modeBtn._hasModeListener) {
            modeBtn._hasModeListener = true;
            modeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isDark = stageEl.classList.toggle('dark-blueprint');
                if (iconEl) iconEl.textContent = isDark ? '🌙' : '☀️';
                if (textEl) textEl.textContent = isDark ? 'Dark Blueprint' : 'White Canvas';
            });
        }
    }

    function closeModelModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModelModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModelModal);
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
            closeModelModal();
        }
    });

    /* =========================================================================
       4. RFQ MODEL SELECTOR & DIRECT FACTORY QUOTATION
       ========================================================================= */
    const rfqChips = $$('.rfq-chip');

    function selectRfqModel(mName) {
        const idx = MODELS.findIndex(x => x.m === mName);
        if (idx < 0) return;
        const m = MODELS[idx];

        rfqChips.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-m') === mName));

        const tEl = $('#rfqTorque'); if (tEl) tEl.textContent = `${m.torque} Nm`;
        const pEl = $('#rfqPcd'); if (pEl) pEl.textContent = m.pcd;
        const bEl = $('#rfqBore'); if (bEl) bEl.textContent = `Ø ${m.bore} mm`;
        const wEl = $('#rfqWheel'); if (wEl) wEl.textContent = `Ø ${m.wheel} mm`;

        const waBtn = $('#rfqWaBtn');
        if (waBtn) {
            const txt = encodeURIComponent(`Hi Mech Torque, I would like to request an official quotation for model ${m.m} (${m.torque} Nm, ISO Flange: ${m.pcd}, Stem Bore: Ø${m.bore}mm, Handwheel: Ø${m.wheel}mm).`);
            waBtn.href = `https://wa.me/919913191343?text=${txt}`;
        }
        const mailBtn = $('#rfqMailBtn');
        if (mailBtn) {
            const sub = encodeURIComponent(`RFQ Quotation Request: ${m.m} (${m.torque} Nm)`);
            const body = encodeURIComponent(
                `Dear Mech Torque Team,\n\n` +
                `Please provide an official quotation and delivery timeline for the following model:\n\n` +
                `• Model: ${m.m}\n` +
                `• Rated Torque: ${m.torque} Nm\n` +
                `• ISO 5211 Flange: ${m.pcd}\n` +
                `• Max Stem Bore: Ø${m.bore} mm\n` +
                `• Handwheel Diameter: Ø${m.wheel} mm\n\n` +
                `Quantity Required:\n` +
                `Delivery Location:\n` +
                `Contact Person:\n` +
                `Company Name:\n`
            );
            mailBtn.href = `mailto:infomechtorque@gmail.com?subject=${sub}&body=${body}`;
        }
    }

    rfqChips.forEach(btn => {
        btn.addEventListener('click', () => selectRfqModel(btn.getAttribute('data-m')));
    });

    /* =========================================================================
       5. NAVBAR CONTROLLER: SCROLL SHRINK & HOVER EXPANSION
       ========================================================================= */
    const nav = $('#siteNav');
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    const progressBar = $('#navProgressBar');

    const onScroll = () => {
        const isScrolled = window.scrollY > 60;
        if (nav) {
            nav.classList.toggle('solid', isScrolled);
            nav.classList.toggle('shrunk', isScrolled);
        }
        if (progressBar) {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hover expansion buffer for shrunk navbar (prevents flicker/jitter)
    if (nav) {
        let hoverTimeout = null;
        nav.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            nav.classList.add('is-hovered');
        });
        nav.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                nav.classList.remove('is-hovered');
            }, 180);
        });
    }

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            if (nav) nav.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        });
        $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
            links.classList.remove('open');
            if (nav) nav.classList.remove('menu-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }));
    }

    /* =========================================================================
       7. SCROLL REVEAL OBSERVER (SAFE INITIALIZATION)
       ========================================================================= */
    try {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add('in');
                io.unobserve(el);
            });
        }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

        document.documentElement.classList.add('has-scroll-reveal');
        $$('.reveal').forEach(el => io.observe(el));
    } catch (e) {
        console.warn('Scroll reveal observer fallback:', e);
        $$('.reveal').forEach(el => el.classList.add('in'));
    }

    const yrEl = $('#yr');
    if (yrEl) yrEl.textContent = new Date().getFullYear();

    /* =========================================================================
       8. MOBILE INTERACTIVE CAROUSELS & COMPACT HUB CONTROLLERS
       ========================================================================= */
    function initMobileInteractions() {
        // A. 3D Model Presets Bar on Mobile
        const presetPills = $$('#mobile3dPresets .preset-pill[data-stage]');
        const track = $('#track');
        if (presetPills.length && track) {
            presetPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    presetPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    const stage = parseInt(pill.getAttribute('data-stage'), 10);
                    const max = track.offsetHeight - window.innerHeight;
                    let targetTop = 0;
                    if (stage === 0) targetTop = 0;
                    else if (stage === 6) targetTop = max * 0.55;
                    else if (stage === 11) targetTop = max;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                });
            });
        }

        // B. Generic Horizontal Carousel Sync Helper
        function setupCarouselSync(gridId, tabsContainerId, counterId, titlePrefix) {
            const grid = document.getElementById(gridId);
            const tabsContainer = document.getElementById(tabsContainerId);
            const counter = document.getElementById(counterId);
            if (!grid || !tabsContainer) return;

            const updateTabAndCounter = () => {
                const tabs = Array.from(tabsContainer.querySelectorAll('.c-tab'));
                const cards = Array.from(grid.children).filter(c => c.nodeType === 1 && !c.classList.contains('mobile-only'));
                if (!cards.length) return;

                const scrollLeft = grid.scrollLeft;
                const center = scrollLeft + grid.offsetWidth / 2;
                let closestIdx = 0;
                let minDiff = Infinity;

                cards.forEach((card, idx) => {
                    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                    const diff = Math.abs(center - cardCenter);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = idx;
                    }
                });

                tabs.forEach((t, i) => t.classList.toggle('active', i === closestIdx));

                if (tabs[closestIdx]) {
                    tabsContainer.scrollTo({
                        left: tabs[closestIdx].offsetLeft - tabsContainer.offsetWidth / 2 + tabs[closestIdx].offsetWidth / 2,
                        behavior: 'smooth'
                    });
                }

                if (counter) {
                    counter.textContent = `${titlePrefix} (${closestIdx + 1} of ${cards.length})`;
                }
            };

            // Wire tabs clicks
            tabsContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.c-tab');
                if (!tab) return;
                const tabs = Array.from(tabsContainer.querySelectorAll('.c-tab'));
                const idx = tabs.indexOf(tab);
                const cards = Array.from(grid.children).filter(c => c.nodeType === 1 && !c.classList.contains('mobile-only'));
                if (cards[idx]) {
                    grid.scrollTo({ left: cards[idx].offsetLeft - 16, behavior: 'smooth' });
                }
            });

            // Debounced scroll listener
            let isTicking = false;
            grid.addEventListener('scroll', () => {
                if (isTicking) return;
                isTicking = true;
                requestAnimationFrame(() => {
                    isTicking = false;
                    updateTabAndCounter();
                });
            }, { passive: true });
        }

        // Initialize About Carousel Sync
        setupCarouselSync('aboutGrid', 'aboutCarouselTabs', 'aboutSwipeCounter', 'Swipe to explore');

        // Initialize Metallurgy Alloys Carousel Sync
        setupCarouselSync('alloysGrid', 'alloysCarouselTabs', 'alloysSwipeCounter', 'Swipe metallurgy');

        // Initialize Models Carousel Sync
        setupCarouselSync('modelGrid', 'modelsCarouselTabs', 'modelsSwipeCounter', 'Swipe models to compare');

        // C. Mobile Contact Segmented Switcher
        const contactTabs = $$('#contactSegmentTabs .contact-tab-btn');
        const contactLayout = $('.contact-layout');
        if (contactTabs.length && contactLayout) {
            // Default to quote view on mobile
            contactLayout.classList.add('show-quote');

            contactTabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    contactTabs.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const view = btn.getAttribute('data-view');
                    if (view === 'quote') {
                        contactLayout.classList.remove('show-direct');
                        contactLayout.classList.add('show-quote');
                    } else {
                        contactLayout.classList.remove('show-quote');
                        contactLayout.classList.add('show-direct');
                    }
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileInteractions);
    } else {
        setTimeout(initMobileInteractions, 150);
    }

})();
