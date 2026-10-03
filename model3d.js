(() => {
            'use strict';

            /* ------------------------------------------------------------------
               Easy edits: change the text printed on the model here.
            ------------------------------------------------------------------- */
            const CONFIG = {
                brand: 'MECH TORQUE',
                model: 'MT30',
                torque: '700Nm',
                pcd: 'F07, F10, F12',
                year: '2025',
                email: 'infomechtorque@gmail.com',
                leftLabel: 'CLOSE',
                rightLabel: 'CLOSE',
                bottomLabel: 'OPEN'
            };

            const $ = id => document.getElementById(id);
            const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
            const lerp = (a, b, t) => a + (b - a) * t;
            const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

            /* brand mark(s): every element with data-gear-mark gets the real Mech Torque cog glyph */
            (() => {
                const s = '<path d="M6.35,0.82 L8.96,2.08 L7.81,4.87 L5.07,3.91 L3.91,5.07 L4.87,7.81 L2.08,8.96 L0.82,6.35 L-0.82,6.35 L-2.08,8.96 L-4.87,7.81 L-3.91,5.07 L-5.07,3.91 L-7.81,4.87 L-8.96,2.08 L-6.35,0.82 L-6.35,-0.82 L-8.96,-2.08 L-7.81,-4.87 L-5.07,-3.91 L-3.91,-5.07 L-4.87,-7.81 L-2.08,-8.96 L-0.82,-6.35 L0.82,-6.35 L2.08,-8.96 L4.87,-7.81 L3.91,-5.07 L5.07,-3.91 L7.81,-4.87 L8.96,-2.08 L6.35,-0.82 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/><path d="M2.6 -2.3A3.5 3.5 0 1 0 2.6 2.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
                document.querySelectorAll('[data-gear-mark]').forEach(el => el.innerHTML = s);
            })();

            const canvas = $('gl'), pin = $('pin'), track = $('track');

            if (!window.THREE) { document.documentElement.classList.add('no-gl'); return; }

            let renderer;
            try {
                renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
            } catch (e) {
                document.documentElement.classList.add('no-gl'); return;
            }
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.86;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);

            /* ------------------------------------------------------------------
               Environment (soft boxes) so the metal and cast surfaces have
               something to reflect. Built in code, no image files needed.
            ------------------------------------------------------------------- */
            (() => {
                const pm = new THREE.PMREMGenerator(renderer);
                const es = new THREE.Scene();
                es.add(new THREE.Mesh(new THREE.BoxGeometry(40, 22, 40), new THREE.MeshBasicMaterial({ color: 0x3a4148, side: THREE.BackSide })));
                const panel = (w, h, x, y, z, intensity, col = 0xffffff) => {
                    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(intensity), side: THREE.DoubleSide }));
                    m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
                };
                panel(16, 9, 0, 10, 2, 2.6);            // overhead softbox
                panel(7, 14, -13, 2, 8, 2.1, 0xfff4e6);  // warm key, front left
                panel(6, 14, 14, 1, -4, 1.8, 0xd8e6ff); // cool rim, right rear
                panel(9, 3, 3, -3, 14, 1.2);          // front fill, low
                panel(20, 6, 0, 3, -16, .9);          // back wall glow
                scene.environment = pm.fromScene(es, 0.02).texture;
                pm.dispose();
            })();

            /* lights (env does most of the work; these add shape and shadow) */
            const key = new THREE.DirectionalLight(0xffffff, 1.3);
            key.position.set(-4, 10, 7);
            key.castShadow = true;
            key.shadow.mapSize.set(2048, 2048);
            Object.assign(key.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 40 });
            key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
            scene.add(key);
            const fill = new THREE.DirectionalLight(0xdce8ff, 0.4); fill.position.set(8, 3, 5); scene.add(fill);
            const kick = new THREE.DirectionalLight(0xfff0d6, 0.32); kick.position.set(-9, 1, -6); scene.add(kick);

            const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.22 }));
            floor.rotation.x = -Math.PI / 2; floor.position.y = -3.4; floor.receiveShadow = true; scene.add(floor);

            /* ------------------------------------------------------------------
               Materials and procedural textures
            ------------------------------------------------------------------- */
            const maxAniso = renderer.capabilities.getMaxAnisotropy();

            function castBump() {
                const c = document.createElement('canvas'); c.width = c.height = 256;
                const g = c.getContext('2d');
                g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
                for (let i = 0; i < 3200; i++) {
                    const x = Math.random() * 256, y = Math.random() * 256, r = 1 + Math.random() * 3.4;
                    const v = Math.random() < .5 ? 255 : 0, a = .15 + Math.random() * .5;
                    for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
                        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
                        gr.addColorStop(0, `rgba(${v},${v},${v},${a})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
                        g.fillStyle = gr; g.beginPath(); g.arc(x + ox, y + oy, r, 0, 7); g.fill();
                    }
                }
                const t = new THREE.CanvasTexture(c);
                t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
                return t;
            }
            const bumpFlat = castBump(); bumpFlat.repeat.set(.35, .35);
            const bumpRound = bumpFlat.clone(); bumpRound.repeat.set(5, 1.5); bumpRound.needsUpdate = true;

            const M = {
                cast: new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: .42, metalness: .05, clearcoat: .55, clearcoatRoughness: .22, bumpMap: bumpFlat, bumpScale: .007, envMapIntensity: .32 }),
                castR: new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: .42, metalness: .05, clearcoat: .55, clearcoatRoughness: .22, bumpMap: bumpRound, bumpScale: .007, envMapIntensity: .32 }),
                gear: new THREE.MeshStandardMaterial({ color: 0xc0c8ce, roughness: .26, metalness: 1 }),
                worm: new THREE.MeshStandardMaterial({ color: 0xb4bcc3, roughness: .24, metalness: 1 }),
                shaft: new THREE.MeshStandardMaterial({ color: 0x9aa2a9, roughness: .26, metalness: 1 }),
                bolt: new THREE.MeshStandardMaterial({ color: 0xc3cad0, roughness: .22, metalness: 1 }),
                flange: new THREE.MeshStandardMaterial({ color: 0xaeb5bb, roughness: .3, metalness: 1 }),
                dark: new THREE.MeshStandardMaterial({ color: 0x0b0c0d, roughness: .75, metalness: .2 }),
                red: new THREE.MeshPhysicalMaterial({ color: 0xe80d0d, roughness: .34, metalness: .05, clearcoat: .3, clearcoatRoughness: .24, envMapIntensity: .9 }),
                blue: new THREE.MeshPhysicalMaterial({ color: 0x0868f5, roughness: .28, metalness: .06, clearcoat: .5, clearcoatRoughness: .16, bumpMap: bumpFlat, bumpScale: .008, envMapIntensity: 1.05 }),
                blueR: new THREE.MeshPhysicalMaterial({ color: 0x0868f5, roughness: .28, metalness: .06, clearcoat: .5, clearcoatRoughness: .16, bumpMap: bumpRound, bumpScale: .008, envMapIntensity: 1.05 }),
                rubber: new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: .92, metalness: 0 }),
                disc: new THREE.MeshStandardMaterial({ color: 0xcdd3d8, roughness: .2, metalness: 1 }),
                plate: new THREE.MeshStandardMaterial({ color: 0xcfd4d8, roughness: .35, metalness: 1 })
            };

            function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
            /* The real Mech Torque cog glyph, as an SVG Path2D, drawn at any radius/position on a canvas */
            const GEAR_D = 'M6.35,0.82 L8.96,2.08 L7.81,4.87 L5.07,3.91 L3.91,5.07 L4.87,7.81 L2.08,8.96 L0.82,6.35 L-0.82,6.35 L-2.08,8.96 L-4.87,7.81 L-3.91,5.07 L-5.07,3.91 L-7.81,4.87 L-8.96,2.08 L-6.35,0.82 L-6.35,-0.82 L-8.96,-2.08 L-7.81,-4.87 L-5.07,-3.91 L-3.91,-5.07 L-4.87,-7.81 L-2.08,-8.96 L-0.82,-6.35 L0.82,-6.35 L2.08,-8.96 L4.87,-7.81 L3.91,-5.07 L5.07,-3.91 L7.81,-4.87 L8.96,-2.08 L6.35,-0.82 Z';
            const GEAR_PATH = new Path2D(GEAR_D);
            function gearIcon(g, cx, cy, r, color) {
                g.save(); g.translate(cx, cy); g.scale(r / 9, r / 9);
                g.strokeStyle = color; g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 1.7;
                g.stroke(GEAR_PATH);
                g.beginPath(); g.arc(2.6, 0, 3.5, -2.3, 2.3); g.lineWidth = 1.6; g.stroke();
                g.restore();
            }
            const FONT = '"Barlow Condensed","Arial Narrow",Arial,sans-serif';
            const FONT_TEXT = '"Barlow",Arial,sans-serif';

            /* Cast marks on the cover: OPEN / CLOSE pads, laid out like the real cover */
            const cover = { S: 269.5, w: 1024, h: 1094 };
            const coverCanvas = document.createElement('canvas'); coverCanvas.width = cover.w; coverCanvas.height = cover.h;
            const coverTex = new THREE.CanvasTexture(coverCanvas); coverTex.encoding = THREE.sRGBEncoding; coverTex.anisotropy = maxAniso;
            function drawCover() {
                const g = coverCanvas.getContext('2d'), S = cover.S;
                const X = x => (x + 1.9) * S, Y = y => (1.4 - y) * S;
                g.clearRect(0, 0, cover.w, cover.h);
                const pad = (cx, cy, pw, ph, rot, text, size) => {
                    g.save(); g.translate(X(cx), Y(cy));
                    g.fillStyle = '#0c0d0f'; g.strokeStyle = 'rgba(128,135,143,.6)'; g.lineWidth = 5;
                    rr(g, -pw * S / 2, -ph * S / 2, pw * S, ph * S, 12); g.fill(); g.stroke();
                    g.rotate(rot); g.font = `700 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
                    g.fillStyle = 'rgba(0,0,0,.95)'; g.fillText(text, 3, 4);
                    g.fillStyle = '#62676e'; g.fillText(text, 0, 0);
                    g.restore();
                };
                pad(-1.4, 0, .42, 1.32, -Math.PI / 2, CONFIG.leftLabel, 92);
                pad(1.4, 0, .42, 1.32, Math.PI / 2, CONFIG.rightLabel, 92);
                pad(0, -1.37, 1.27, .36, Math.PI, CONFIG.bottomLabel, 84);
                coverTex.needsUpdate = true;
            }
            drawCover();

            /* Name plate: Stamped data plate drawn with authentic Mech Torque trademark logo */
            const GEAR_B64 = 'data:image/png;base64,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';
            const officialLogoImg = new Image();
            officialLogoImg.onload = () => {
                drawPlate();
            };
            officialLogoImg.src = GEAR_B64;

            const NP_SCALE = 3;
            const npCanvas = document.createElement('canvas'); npCanvas.width = 1024 * NP_SCALE; npCanvas.height = 570 * NP_SCALE;
            const npTex = new THREE.CanvasTexture(npCanvas); npTex.encoding = THREE.sRGBEncoding; npTex.anisotropy = maxAniso;
            npTex.minFilter = THREE.LinearMipmapLinearFilter; npTex.magFilter = THREE.LinearFilter; npTex.generateMipmaps = true;

            function drawPlate() {
                const g = npCanvas.getContext('2d'), w = 1024, h = 570;
                g.setTransform(NP_SCALE, 0, 0, NP_SCALE, 0, 0);
                g.imageSmoothingEnabled = true;
                g.imageSmoothingQuality = 'high';
                g.clearRect(0, 0, w, h);

                /* high-contrast clean brushed metallic aluminum background */
                g.fillStyle = '#f6f8fa'; g.fillRect(0, 0, w, h);
                const grad = g.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, '#ffffff'); grad.addColorStop(.45, '#f0f3f6'); grad.addColorStop(1, '#dfe4e8');
                g.fillStyle = grad; g.fillRect(0, 0, w, h);

                /* outer deep black border */
                g.strokeStyle = '#050709'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
                /* inner gold precision border line */
                g.strokeStyle = 'rgba(255, 255, 255, 0.85)'; g.lineWidth = 3; g.strokeRect(17, 17, w - 34, h - 34);

                const colX = w * .36, rowsH = h * .82, rh = rowsH / 4;

                /* dividing grid lines */
                g.lineWidth = 4; g.strokeStyle = '#0a0d10'; g.beginPath();
                g.moveTo(colX, 17); g.lineTo(colX, rowsH);
                g.moveTo(17, rowsH); g.lineTo(w - 17, rowsH);
                for (let i = 1; i < 4; i++) { g.moveTo(colX, i * rh); g.lineTo(w - 17, i * rh); }
                g.stroke();

                /* right column: bold high-contrast specifications */
                g.textBaseline = 'middle';
                const rows = [
                    { k: 'MODEL NO', v: CONFIG.model },
                    { k: 'TORQUE', v: CONFIG.torque },
                    { k: 'PCD', v: CONFIG.pcd },
                    { k: 'MFG. YEAR', v: CONFIG.year }
                ];
                rows.forEach((r, i) => {
                    const cy = (i + .5) * rh;
                    g.textAlign = 'left';
                    g.fillStyle = '#1e293b';
                    g.font = `700 36px ${FONT_TEXT}`;
                    g.fillText(r.k + ' :', colX + 24, cy);

                    g.fillStyle = '#050709';
                    g.font = `800 48px ${FONT}`;
                    /* Place value at colX + 340 so MODEL NO and MFG. YEAR NEVER overlap! */
                    g.fillText(r.v, colX + 340, cy);
                });

                /* left column: authentic brand identity */
                const lCx = colX / 2;
                const iconY = rowsH * .27;

                if (officialLogoImg.complete && officialLogoImg.naturalWidth > 0) {
                    /* draw authentic company gear logo directly */
                    g.drawImage(officialLogoImg, lCx - 70, iconY - 65, 140, 140);
                }

                /* Brand name below icon */
                g.textAlign = 'center';
                g.font = `800 66px ${FONT}`;
                g.fillStyle = '#050709';
                g.fillText('MECH', lCx, rowsH * .58);
                g.fillText('TORQUE', lCx, rowsH * .77);

                /* bottom strip: email & origin */
                g.font = `700 32px ${FONT_TEXT}`;
                g.fillStyle = '#0f172a';
                g.fillText(CONFIG.email + '   •   RAJKOT, INDIA', w / 2, rowsH + (h - rowsH) / 2 + 2);

                /* 4 corner mounting rivets with cross head slots */
                const rivets = [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]];
                rivets.forEach(([rx, ry]) => {
                    g.fillStyle = '#b8bfc6';
                    g.beginPath(); g.arc(rx, ry, 12, 0, Math.PI * 2); g.fill();
                    g.strokeStyle = '#334155'; g.lineWidth = 2.5; g.stroke();

                    g.beginPath();
                    g.moveTo(rx - 7, ry); g.lineTo(rx + 7, ry);
                    g.moveTo(rx, ry - 7); g.lineTo(rx, ry + 7);
                    g.strokeStyle = '#1e293b'; g.lineWidth = 2; g.stroke();
                });

                npTex.needsUpdate = true;
            }
            drawPlate();
            if (officialLogoImg.complete) {
                drawPlate();
            }
            if (document.fonts && document.fonts.load) {
                Promise.all([document.fonts.load(`700 90px "Barlow Condensed"`), document.fonts.load(`500 40px "Barlow"`)])
                    .then(() => { drawCover(); drawPlate(); }).catch(() => { });
            }

            /* Yellow indicator disc. Arrow points at 225 degrees when the disc is unrotated. */
            function indicatorTexture() {
                const c = document.createElement('canvas'); c.width = c.height = 512;
                const g = c.getContext('2d'), R = 256;
                g.fillStyle = '#efc400'; g.fillRect(0, 0, 512, 512);
                const gr = g.createRadialGradient(200, 190, 20, 256, 256, R);
                gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(0,0,0,.10)');
                g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
                g.translate(R, R); g.rotate(135 * Math.PI / 180);
                g.fillStyle = '#111';
                g.beginPath();
                g.moveTo(-R * .93, 0); g.lineTo(-R * .6, -R * .15); g.lineTo(-R * .6, -R * .05);
                g.lineTo(R * 1.05, -R * .27); g.lineTo(R * 1.05, R * .27); g.lineTo(-R * .6, R * .05); g.lineTo(-R * .6, R * .15);
                g.closePath(); g.fill();
                const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = maxAniso;
                return t;
            }

            /* ------------------------------------------------------------------
               Geometry helpers
            ------------------------------------------------------------------- */
            const ex = (shape, depth, o = {}) => new THREE.ExtrudeGeometry(shape, Object.assign({
                depth, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 32
            }, o));
            const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; };

            /* Outline of the housing / cover / flange plate. Origin = gear axis. */
            function outline() {
                const W = 1.9, T = 1.4, Sh = -.55, Nk = 1.37, tp = -1.75, B = -2.66, R = .6, rb = .25;
                const s = new THREE.Shape();
                s.moveTo(-W + R, T); s.lineTo(W - R, T); s.quadraticCurveTo(W, T, W, T - R);
                s.lineTo(W, Sh); s.bezierCurveTo(W, Sh - .6, Nk, tp + .6, Nk, tp);
                s.lineTo(Nk, B + rb); s.quadraticCurveTo(Nk, B, Nk - rb, B);
                s.lineTo(-Nk + rb, B); s.quadraticCurveTo(-Nk, B, -Nk, B + rb);
                s.lineTo(-Nk, tp); s.bezierCurveTo(-Nk, tp + .6, -W, Sh - .6, -W, Sh);
                s.lineTo(-W, T - R); s.quadraticCurveTo(-W, T, -W + R, T);
                return s;
            }
            /* Cavity: gear circle plus the worm chamber below it */
            function cavity() {
                const Rc = 1.17, cx = 1.05, yTop = -.55, yBot = -1.67;
                const a = Math.atan2(yTop, Math.sqrt(Rc * Rc - yTop * yTop));
                const xa = Math.sqrt(Rc * Rc - yTop * yTop);
                const p = new THREE.Path();
                p.moveTo(-cx, yTop); p.lineTo(-cx, yBot); p.lineTo(cx, yBot); p.lineTo(cx, yTop); p.lineTo(xa, yTop);
                p.absarc(0, 0, Rc, a, Math.PI - a, false);
                p.lineTo(-cx, yTop);
                return p;
            }
            const WORM_Y = -1.27;

            /* ------------------------------------------------------------------
               PARTS
            ------------------------------------------------------------------- */
            const root = new THREE.Group(); scene.add(root);

            /* 1. Housing ------------------------------------------------------- */
            const housing = new THREE.Group();
            {
                const s = outline(); s.holes.push(cavity());
                const g = ex(s, .92, { bevelThickness: .04, bevelSize: .035 }); g.translate(0, 0, -.46);
                housing.add(mesh(g, M.cast));

                // bearing bosses for the worm shaft
                const tube = (rOut, rIn, x0, x1) => {
                    const sh = new THREE.Shape(); sh.absarc(0, 0, rOut, 0, Math.PI * 2, false);
                    if (rIn) { const h = new THREE.Path(); h.absarc(0, 0, rIn, 0, Math.PI * 2, true); sh.holes.push(h); }
                    const gg = ex(sh, Math.abs(x1 - x0), { bevelThickness: .03, bevelSize: .03, bevelSegments: 2 });
                    gg.rotateY(Math.PI / 2); gg.translate(Math.min(x0, x1), WORM_Y, 0);
                    return gg;
                };
                housing.add(mesh(tube(.47, .27, -2.1, -1.5), M.castR));
                housing.add(mesh(tube(.47, 0, 1.5, 1.95), M.castR));

                // bosses for the travel-stop bolts
                for (const sx of [-1, 1]) {
                    const b = mesh(new THREE.CylinderGeometry(.36, .42, .42, 40), M.castR);
                    b.position.set(sx * 1.1, 1.56, 0); housing.add(b);
                }
            }
            root.add(housing);

            /* 2. Flange plate (valve side) -------------------------------------- */
            const plate = new THREE.Group();
            {
                const s = outline();
                const hole = new THREE.Path(); hole.absarc(0, 0, .3, 0, Math.PI * 2, true); s.holes.push(hole);
                const g = ex(s, .16, { bevelThickness: .03, bevelSize: .03 }); g.translate(0, 0, -.69);
                plate.add(mesh(g, M.cast));

                // spigot with ISO 5211 style bolt circles (F07 70 mm, F10 102 mm, F12 125 mm, drawn to scale)
                const sp = new THREE.Shape(); sp.absarc(0, 0, 1.16, 0, Math.PI * 2, false);
                const ctr = new THREE.Path(); ctr.absarc(0, 0, .3, 0, Math.PI * 2, true); sp.holes.push(ctr);
                const ring = (r, off) => { for (let i = 0; i < 4; i++) { const a = off + i * Math.PI / 2, h = new THREE.Path(); h.absarc(Math.cos(a) * r, Math.sin(a) * r, .075, 0, Math.PI * 2, true); sp.holes.push(h); } };
                ring(.56, Math.PI / 4); ring(.82, 0); ring(1.0, Math.PI / 4);
                const g2 = ex(sp, .18, { bevelThickness: .02, bevelSize: .02, bevelSegments: 1 });
                g2.translate(0, 0, -.72 - .18 - .02);
                plate.add(mesh(g2, M.flange));
            }
            root.add(plate);

            /* 3. Sector gear + hub ---------------------------------------------- */
            const N_TEETH = 22, LEAD = 2 * Math.PI * .9 / N_TEETH;
            const gear = new THREE.Group();
            {
                const teeth = 8, Rt = .97, Rr = .84, Rh = .44, pa = 2 * Math.PI / N_TEETH;
                const c0 = -Math.PI / 2, a0 = c0 - teeth * pa / 2, a1 = c0 + teeth * pa / 2;
                const P = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
                const s = new THREE.Shape();
                let p = P(a0, Rh); s.moveTo(p[0], p[1]);
                p = P(a0, Rr); s.lineTo(p[0], p[1]);
                const prof = [[.2, Rr], [.35, Rt], [.65, Rt], [.8, Rr], [1, Rr]];
                for (let i = 0; i < teeth; i++) for (const [f, r] of prof) { p = P(a0 + (i + f) * pa, r); s.lineTo(p[0], p[1]); }
                p = P(a1, Rh); s.lineTo(p[0], p[1]);
                s.absarc(0, 0, Rh, a1, a0, true);
                for (const d of [-.75, -.25, .25, .75]) {
                    const h = new THREE.Path(), a = c0 + d * 1.0; h.absarc(Math.cos(a) * .68, Math.sin(a) * .68, .085, 0, Math.PI * 2, true); s.holes.push(h);
                }
                const g = ex(s, .26, { bevelThickness: .02, bevelSize: .012, bevelSegments: 1 }); g.translate(0, 0, -.13);
                gear.add(mesh(g, M.gear));

                // hub with keyway
                const hs = new THREE.Shape(); hs.absarc(0, 0, .45, 0, Math.PI * 2, false);
                const kr = .24, kw = .05, ky = .31, yk = Math.sqrt(kr * kr - kw * kw);
                const hole = new THREE.Path();
                hole.moveTo(kw, yk); hole.lineTo(kw, ky); hole.lineTo(-kw, ky); hole.lineTo(-kw, yk);
                const aR = Math.atan2(yk, kw); hole.absarc(0, 0, kr, Math.PI - aR, aR + Math.PI * 2, false);
                hs.holes.push(hole);
                const hg = ex(hs, .84, { bevelThickness: .03, bevelSize: .025, bevelSegments: 1 }); hg.translate(0, 0, -.42);
                gear.add(mesh(hg, M.gear));
                for (const z of [.2, .3]) {
                    const cl = mesh(new THREE.CylinderGeometry(.56, .56, .06, 48), M.gear);
                    cl.rotation.x = Math.PI / 2; cl.position.z = z; gear.add(cl);
                }
            }
            root.add(gear);

            /* 4. Worm shaft ------------------------------------------------------ */
            const worm = new THREE.Group();
            {
                const core = new THREE.CylinderGeometry(.24, .24, 4.8, 48); core.rotateZ(Math.PI / 2); core.translate(-1.0, 0, 0);
                worm.add(mesh(core, M.shaft));
                const body = new THREE.CylinderGeometry(.255, .255, 1.56, 48); body.rotateZ(Math.PI / 2);
                worm.add(mesh(body, M.worm));
                for (const x of [-.9, .9]) {
                    const cg = new THREE.CylinderGeometry(.36, .36, .11, 48); cg.rotateZ(Math.PI / 2); cg.translate(x, 0, 0);
                    worm.add(mesh(cg, M.worm));
                }
                // helical thread. Start phase lines the thread up with the tooth gaps at the closed position.
                const xs = LEAD * (Math.round(-.72 / LEAD - .25) + .25), turns = 1.46 / LEAD, per = 28;
                const pts = [];
                for (let i = 0; i <= Math.ceil(turns * per); i++) {
                    const t = i / per * Math.PI * 2;
                    pts.push(new THREE.Vector3(xs + LEAD * t / (Math.PI * 2), .285 * Math.cos(t), .285 * Math.sin(t)));
                }
                const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, .062, 12, false);
                worm.add(mesh(tg, M.worm));
                // key at the input end
                const key = mesh(new THREE.BoxGeometry(.8, .055, .1), M.dark); key.position.set(-3.0, .235, 0); worm.add(key);
                const chamfer = mesh(new THREE.CylinderGeometry(.19, .24, .06, 40), M.shaft); chamfer.rotation.z = Math.PI / 2; chamfer.position.x = -3.43; worm.add(chamfer);
            }
            worm.position.y = WORM_Y;
            root.add(worm);

            /* 5. Cover ------------------------------------------------------------ */
            const coverG = new THREE.Group();
            {
                const g = ex(outline(), .16, { bevelThickness: .03, bevelSize: .03 }); g.translate(0, 0, .53);
                coverG.add(mesh(g, M.cast));
                const boss = mesh(new THREE.CylinderGeometry(.78, .8, .07, 64), M.castR); boss.rotation.x = Math.PI / 2; boss.position.z = .755; coverG.add(boss);
                const marks = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.06), new THREE.MeshStandardMaterial({
                    map: coverTex, transparent: true, roughness: .5, metalness: .3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, depthWrite: false
                }));
                marks.position.set(0, -.63, .723); coverG.add(marks);
            }
            root.add(coverG);

            /* 6. Cover bolts (4) --------------------------------------------------- */
            function hexBolt(headR, headH, shankR, shankL, washerR) {
                const g = new THREE.Group();
                const wh = washerR ? .035 : 0;
                if (washerR) { const w = mesh(new THREE.CylinderGeometry(washerR, washerR, wh, 40), M.bolt); w.position.y = wh / 2; g.add(w); }
                const h = mesh(new THREE.CylinderGeometry(headR, headR, headH, 6), M.bolt); h.position.y = wh + headH / 2; g.add(h);
                const dome = mesh(new THREE.CylinderGeometry(headR * .82, headR, .02, 36), M.bolt); dome.position.y = wh + headH + .01; g.add(dome);
                const s = mesh(new THREE.CylinderGeometry(shankR, shankR, shankL, 20), M.bolt); s.position.y = -shankL / 2; g.add(s);
                return g;
            }
            const BOLT_POS = [[-1.5, .95], [1.5, .95], [-1.05, -2.45], [1.05, -2.45]];
            const coverBolts = BOLT_POS.map(([x, y]) => {
                const outer = new THREE.Group(), inner = hexBolt(.19, .15, .085, .7, .27);
                inner.rotation.x = Math.PI / 2; outer.add(inner);
                outer.position.set(x, y, .72); outer.userData.home = outer.position.clone();
                root.add(outer); return outer;
            });

            /* 7. Travel-stop bolts and lock nuts --------------------------------- */
            const stopBolts = [-1, 1].map(sx => {
                const b = hexBolt(.24, .16, .11, 1.2, 0); b.position.set(sx * 1.1, 2.42, 0); b.userData.home = b.position.clone(); root.add(b); return b;
            });
            const nuts = [-1, 1].map(sx => {
                const n = new THREE.Group();
                const h = mesh(new THREE.CylinderGeometry(.26, .26, .17, 6), M.bolt); n.add(h);
                n.position.set(sx * 1.1, 1.855, 0); n.userData.home = n.position.clone(); root.add(n); return n;
            });

            /* 8. Indicator and name plate ---------------------------------------- */
            const indicator = new THREE.Group();
            {
                const disc = new THREE.Mesh(new THREE.CircleGeometry(.68, 72), new THREE.MeshStandardMaterial({ map: indicatorTexture(), roughness: .42, metalness: .05 }));
                disc.position.z = .022; disc.castShadow = false; disc.receiveShadow = true; indicator.add(disc);
                const lip = mesh(new THREE.CylinderGeometry(.7, .7, .026, 72), M.dark); lip.rotation.x = Math.PI / 2; lip.position.z = .0; indicator.add(lip);
                for (const sy of [-1, 1]) {
                    const s = mesh(new THREE.CylinderGeometry(.075, .075, .035, 20), M.bolt); s.rotation.x = Math.PI / 2; s.position.set(0, sy * .52, .04); indicator.add(s);
                    const sl = new THREE.Mesh(new THREE.BoxGeometry(.11, .014, .006), M.dark); sl.position.set(0, sy * .52, .06); indicator.add(sl);
                    const sl2 = sl.clone(); sl2.rotation.z = Math.PI / 2; indicator.add(sl2);
                }
            }
            indicator.position.set(0, 0, .82); indicator.userData.home = indicator.position.clone();
            root.add(indicator);

            const nameplate = new THREE.Group();
            {
                const side = M.plate;
                const face = new THREE.MeshStandardMaterial({ map: npTex, roughness: .25, metalness: .32 });
                const box = mesh(new THREE.BoxGeometry(1.72, .96, .024), [side, side, side, side, face, side]);
                nameplate.add(box);
            }
            nameplate.position.set(0, -2.12, .738); nameplate.userData.home = nameplate.position.clone();
            root.add(nameplate);

            /* 9. Red handwheel on the input shaft --------------------------------- */
            const wheel = new THREE.Group();
            {
                const rim = new THREE.TorusGeometry(1.2, .095, 20, 80); rim.rotateY(Math.PI / 2);
                wheel.add(mesh(rim, M.red));
                const hub = new THREE.CylinderGeometry(.36, .4, .6, 48); hub.rotateZ(Math.PI / 2);
                wheel.add(mesh(hub, M.red));
                for (let i = 0; i < 4; i++) {
                    const sp = new THREE.CylinderGeometry(.07, .115, 1.02, 24); sp.translate(0, .69, 0);
                    const m = mesh(sp, M.red); m.rotation.x = i * Math.PI / 2 + Math.PI / 4; wheel.add(m);
                }
                const washer = mesh(new THREE.CylinderGeometry(.27, .27, .04, 40), M.bolt); washer.rotation.z = Math.PI / 2; washer.position.x = -.32; wheel.add(washer);
                const nut = mesh(new THREE.CylinderGeometry(.2, .2, .15, 6), M.bolt); nut.rotation.z = Math.PI / 2; nut.position.x = -.4; wheel.add(nut);
                // spinner knob on the rim
                const knob = mesh(new THREE.CylinderGeometry(.09, .11, .42, 24), M.dark); knob.position.set(.3, 0, 1.2); knob.rotation.z = 0; wheel.add(knob);
            }
            wheel.position.set(-2.9, WORM_Y, 0);
            wheel.visible = false;
            root.add(wheel);

            /* 10. Butterfly valve. Its stem axis is Y, top flange face is y = 0. ---- */
            const CY = -3.3, RO = 2.3, RI = 1.75;
            const valve = new THREE.Group();
            const discGroup = new THREE.Group();
            {
                const topFl = mesh(new THREE.CylinderGeometry(1.15, 1.15, .3, 72), M.blueR); topFl.position.y = -.15; valve.add(topFl);
                const neck = mesh(new THREE.CylinderGeometry(.82, 1.0, .9, 56), M.blueR); neck.position.y = -.72; valve.add(neck);

                const rs = new THREE.Shape(); rs.absarc(0, 0, RO, 0, Math.PI * 2, false);
                const bore = new THREE.Path(); bore.absarc(0, 0, RI, 0, Math.PI * 2, true); rs.holes.push(bore);
                for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, h = new THREE.Path(); h.absarc(Math.cos(a) * 2.03, Math.sin(a) * 2.03, .11, 0, Math.PI * 2, true); rs.holes.push(h); }
                const rg = ex(rs, .9, { bevelThickness: .05, bevelSize: .04, curveSegments: 72 }); rg.translate(0, CY, -.45);
                valve.add(mesh(rg, M.blue));

                const ss = new THREE.Shape(); ss.absarc(0, 0, RI + .05, 0, Math.PI * 2, false);
                const sh = new THREE.Path(); sh.absarc(0, 0, 1.6, 0, Math.PI * 2, true); ss.holes.push(sh);
                const sg = ex(ss, 1.06, { bevelEnabled: false, curveSegments: 72 }); sg.translate(0, CY, -.53);
                valve.add(mesh(sg, M.rubber));

                const boss = mesh(new THREE.CylinderGeometry(.36, .4, .28, 40), M.blueR); boss.position.y = CY - RO - .06; valve.add(boss);

                // disc (lens section) and stem, both turn about Y
                const prof = [[0, .11], [.6, .085], [1.2, .06], [1.56, .045], [1.58, .02], [1.58, -.02], [1.56, -.045], [1.2, -.06], [.6, -.085], [0, -.11]].map(a => new THREE.Vector2(a[0], a[1]));
                const lg = new THREE.LatheGeometry(prof, 72); lg.rotateX(Math.PI / 2); lg.translate(0, CY, 0);
                discGroup.add(mesh(lg, M.disc));
                const stemTop = .62, stemBot = CY - 1.75;
                const stem = mesh(new THREE.CylinderGeometry(.2, .2, stemTop - stemBot, 32), M.disc); stem.position.y = (stemTop + stemBot) / 2; discGroup.add(stem);
                const key = mesh(new THREE.BoxGeometry(.05, .5, .1), M.dark); key.position.set(0, stemTop - .35, .2); discGroup.add(key);
                const hubD = mesh(new THREE.CylinderGeometry(.34, .34, .34, 32), M.disc); hubD.position.y = CY; discGroup.add(hubD);
                valve.add(discGroup);
            }
            const discAnchor = new THREE.Object3D(); discAnchor.position.set(0, CY, 0); discGroup.add(discAnchor);
            valve.visible = false;
            scene.add(valve);
            const VALVE_Y = -.94;   // gearbox back face sits on the valve top flange

            /* ------------------------------------------------------------------
               Timeline (p = scroll progress 0..1)
               0 - .55   assemble the gearbox (q = p/.55 drives the original windows)
               .50-.58   handwheel
               .60-.75   tilt upright, valve rises, gearbox lowers onto it
               .78-.87   wheel turns, disc opens      .89-.97  wheel reverses, disc closes
            ------------------------------------------------------------------- */
            const WIN = {
                housing: [.04, .15], plate: [.15, .25], gear: [.25, .36], worm: [.36, .47], cover: [.47, .58],
                bolts: [.58, .66], stops: [.67, .735], nuts: [.72, .775], indicator: [.775, .815], plate2: [.80, .845]
            };
            const Q = .55;
            const win = (k, q, shift = 0, scale = 1) => { const [a, b] = WIN[k]; return ease(clamp((q - a - shift) / ((b - a) * scale))); };
            const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

            const D0 = -Math.PI / 4;           // closed position (arrow points left, like the photo)
            const SPIN = Math.PI * 2;

            function deltaAt(p) {
                const up = clamp((p - .78) / .09), dn = clamp((p - .89) / .08);
                return D0 + (Math.PI / 2) * (up - dn);
            }

            function apply(p) {
                const q = clamp(p / Q);
                
                // 1. Housing: sits in center
                const eH = win('housing', q);
                housing.position.set(0, 0, -0.6 * (1 - eH)); 
                housing.rotation.set(0, -.25 * (1 - eH), 0);

                // 2. Flange plate: explodes back & left into clear view (never hidden behind housing!)
                const eP = win('plate', q);
                plate.position.set(-2.6 * (1 - eP), 0.6 * (1 - eP), -3.2 * (1 - eP));

                // 3. Sector gear (worm wheel): explodes forward & right above the cover
                const eG = win('gear', q);
                const delta = deltaAt(p);
                gear.position.set(1.9 * (1 - eG), 0.7 * (1 - eG), 1.8 * (1 - eG));
                gear.rotation.z = delta + (1 - eG) * 1.1;

                // 4. Worm shaft: explodes along input axis to the left & forward
                const eW = win('worm', q);
                worm.position.set(-4.4 * (1 - eW), WORM_Y + 0.6 * (1 - eW), 0.8 * (1 - eW));
                worm.rotation.x = -N_TEETH * (delta - D0) - (1 - eW) * SPIN * 2;

                // 5. Top cover: explodes forward and slightly lower
                const eC = win('cover', q);
                coverG.position.set(0.4 * (1 - eC), -0.6 * (1 - eC), 4.2 * (1 - eC));

                // 6. Cover bolts: explode forward from cover
                coverBolts.forEach((b, i) => {
                    const e = win('bolts', q, i * .0075);
                    const off = [[-.4, .3], [.4, .3], [-.2, -.3], [.2, -.3]][i];
                    b.position.set(b.userData.home.x + 0.4 * (1 - eC) + off[0] * (1 - e), b.userData.home.y - 0.6 * (1 - eC) + off[1] * (1 - e), b.userData.home.z + 4.2 * (1 - eC) + 2.8 * (1 - e));
                    b.rotation.z = (1 - e) * SPIN * 1.5;
                });

                // 7. Travel stop bolts & nuts: explode straight UP with spherical ball knobs
                stopBolts.forEach((b, i) => {
                    const e = win('stops', q, i * .01);
                    b.position.set(b.userData.home.x, b.userData.home.y + 2.2 * (1 - e), 0);
                    b.rotation.y = (1 - e) * SPIN * 1.5;
                });
                nuts.forEach((n, i) => {
                    const e = win('nuts', q, i * .01), eb = win('stops', q, i * .01);
                    n.position.set(n.userData.home.x, n.userData.home.y + .5 * (1 - e) + 2.2 * (1 - eb), 0);
                    n.rotation.y = (1 - e) * SPIN;
                });

                // 8. Position indicator: explodes forward and sits cleanly on top of cover boss
                const eI = win('indicator', q);
                indicator.position.set(
                    indicator.userData.home.x + 1.6 * (1 - eI) + 0.4 * (1 - eC),
                    indicator.userData.home.y + 0.2 * (1 - eI) - 0.6 * (1 - eC),
                    indicator.userData.home.z + 4.2 * (1 - eC) + 2.4 * (1 - eI)
                );
                indicator.rotation.z = delta + (1 - eI) * -1.6;

                // 9. Nameplate: explodes forward & down from cover
                const eN = win('plate2', q);
                nameplate.position.set(nameplate.userData.home.x + 0.4 * (1 - eC), nameplate.userData.home.y - 1.2 * (1 - eN) - 0.6 * (1 - eC), nameplate.userData.home.z + 4.2 * (1 - eC) + 2.0 * (1 - eN));

                // 10. Handwheel
                const eHW = seg(p, .50, .58);
                wheel.visible = eHW > 0;
                wheel.scale.setScalar(Math.max(.001, Math.min(1, eHW * 2.5)));
                wheel.position.set(-2.9 - 4.2 * (1 - eHW), WORM_Y, 0);
                wheel.rotation.x = worm.rotation.x - (1 - eHW) * SPIN * 2;

                // 11. Tilt upright & mount to valve
                const eTilt = seg(p, .60, .70);
                root.rotation.x = -Math.PI / 2 * eTilt;
                root.position.y = 1.3 * Math.sin(Math.PI * eTilt);

                const eV = seg(p, .60, .70);
                valve.visible = p > .605;
                valve.position.y = VALVE_Y - 6 * (1 - eV);
                discGroup.rotation.y = delta - D0;
                floor.position.y = lerp(-3.4, -6.75, seg(p, .58, .66));
            }

            /* ------------------------------------------------------------------
               Camera: exploded 3/4 view, front view, wheel view, valve view
            ------------------------------------------------------------------- */
            const CAM = [
                { p: 0,      az: -.68, el: .32, d: 26.5, t: [-.4, 0.75, 1.0] },  /* Generous headroom: stop balls fully visible! */
                { p: .22,    az: -.50, el: .25, d: 20.0, t: [-.3, 0.4, 0.8] },
                { p: .30,    az: -.35, el: .22, d: 17.5, t: [-.2, 0.3, 0.6] },
                { p: .3685,  az: -.15, el: .20, d: 14.5, t: [0.0, 0.85, 0.4] },  /* STOPS: Focuses on top stops with balls fully visible */
                { p: .426,   az: -.10, el: .14, d: 12.8, t: [0.0, 0.1, 0.6] },   /* INDICATOR */
                { p: .448,   az: -.06, el: .09, d: 10.5, t: [0.0, -0.6, 0.7] },
                { p: .468,   az: -.02, el: .03, d: 6.8,  t: [0.0, -1.85, .738] }, /* NAMEPLATE: Focuses on nameplate ONLY at this stage */
                { p: .498,   az: -.02, el: .03, d: 6.8,  t: [0.0, -1.85, .738] },
                { p: .530,   az: -.10, el: .09, d: 14.0, t: [-.72, -.08, .1] },   /* HANDWHEEL */
                { p: .620,   az: -.60, el: .22, d: 19.2, t: [-.9, -.85, .22] },
                { p: .720,   az: -.55, el: .29, d: 21.5, t: [-.75, -2.45, .2] },
                { p: .820,   az: -.55, el: .30, d: 20.5, t: [-.75, -2.7, .2] },
                { p: 1.0,    az: -.42, el: .27, d: 20.0, t: [-.75, -2.7, .2] }
            ];
            function camAt(p) {
                let i = 0; while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
                const a = CAM[i], b = CAM[i + 1], t = ease(clamp((p - a.p) / (b.p - a.p)));
                return { az: lerp(a.az, b.az, t), el: lerp(a.el, b.el, t), d: lerp(a.d, b.d, t), t: a.t.map((v, j) => lerp(v, b.t[j], t)) };
            }

            let dragAz = 0, dragEl = 0, dragging = false, mx = 0, my = 0, mxs = 0, mys = 0;
            let cw = 1, ch = 1;

            function updateCamera(p) {
                const asp = cw / ch, c = camAt(p);
                const az = c.az + dragAz + mxs * .07;
                const el = c.el + dragEl - mys * .04;
                let dist = c.d;
                if (asp < 1.35) {
                    // Mobile: Make model large, bold & impressive (not tiny)
                    const isTall = p > 0.55;
                    const mobileFactor = isTall ? 0.76 : 0.70;
                    dist *= Math.min(2.15, (1.35 / asp) * mobileFactor);
                }
                const [tx, ty, tz] = c.t;
                camera.position.set(tx + dist * Math.sin(az) * Math.cos(el), ty + dist * Math.sin(el), tz + dist * Math.cos(az) * Math.cos(el));
                camera.lookAt(tx, ty, tz);
                const sh = ease(clamp(p / .47));
                if (asp > 1.15) camera.setViewOffset(cw, ch, -cw * lerp(.17, .13, sh), 0, cw, ch);
                else {
                    // Position model centered in the upper spotlight zone above the HUD card
                    const yShift = p > 0.55 ? 0.16 : 0.13;
                    camera.setViewOffset(cw, ch, 0, ch * yShift, cw, ch);
                }
            }

            function resize() {
                cw = pin.clientWidth; ch = pin.clientHeight;
                renderer.setSize(cw, ch, false);
                camera.aspect = cw / ch; camera.updateProjectionMatrix();
            }
            new ResizeObserver(resize).observe(pin);
            resize();

            /* drag to rotate (vertical swipes still scroll the page) */
            let lx = 0, ly = 0;
            canvas.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.classList.add('drag'); try { canvas.setPointerCapture(e.pointerId); } catch (_) { } });
            canvas.addEventListener('pointermove', e => {
                mx = e.clientX / cw - .5; my = e.clientY / ch - .5;
                if (!dragging) return;
                dragAz += (e.clientX - lx) * .0065; dragEl = clamp(dragEl + (e.clientY - ly) * .004, -.55, .55);
                lx = e.clientX; ly = e.clientY;
            });
            const endDrag = () => { dragging = false; canvas.classList.remove('drag'); };
            canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag); canvas.addEventListener('pointerleave', () => { if (!dragging) { mx = 0; my = 0; } });

            /* ------------------------------------------------------------------
               Copy, rail, scroll
            ------------------------------------------------------------------- */
                        /* ------------------------------------------------------------------
               Copy, rail, scroll & 3D Stages
            ------------------------------------------------------------------- */
            const HERO = { h: 'MT30 worm gear operator', p: 'A 700 Nm manual gearbox for butterfly valves. Scroll to assemble it.' };
            const STAGES = [
                {
                    at: .022, g: 0, obj: housing, h: 'Cast iron housing', tag: 'Cast Iron · ASTM A48-83 30A · IS 210 FG 200',
                    p: 'One-piece housing machined from cast iron. It carries the worm wheel and worm shaft in a sealed, grease-packed chamber.'
                },
                {
                    at: .0825, g: 1, obj: plate, h: 'ISO mounting flange', tag: 'ISO 5211 · F07 / F10 / F12',
                    p: 'Drilled to the ISO 5211 bolt circle so the MT-30 bolts straight onto a standard butterfly valve top flange.'
                },
                {
                    at: .1375, g: 2, obj: gear, h: 'Worm wheel', tag: 'Ductile Iron · ASTM A70-50-05 · SGI 500/7',
                    p: 'The sector gear that turns the valve stem. Its keyed hub locates directly on the stem so there is no lost motion.'
                },
                {
                    at: .198, g: 3, obj: worm, h: 'Worm shaft', tag: 'Carbon Steel · A576-1045 · 45C8',
                    p: 'The input worm, cut onto a hardened carbon-steel shaft. This is what the handwheel turns to drive the worm wheel.'
                },
                {
                    at: .2585, g: 4, obj: coverG, h: 'Top cover', tag: 'Cast Iron · ASTM A48-83 30A · IS 210 FG 200',
                    p: 'Closes the housing and carries the raised OPEN and CLOSE marks that read the sector gear\'s travel.'
                },
                {
                    at: .319, g: 4, obj: coverBolts[0], h: 'Cover bolts', tag: '4 × hex bolt',
                    p: 'Four bolts clamp the cover to the housing and seal the gear chamber.'
                },
                {
                    at: .3685, g: 5, obj: stopBolts[0], h: 'Travel-stop bolts', tag: '2 × adjustable stop',
                    p: 'A pair of set bolts with lock nuts fix the open and closed end points of the quarter turn.'
                },
                {
                    at: .426, g: 6, obj: indicator, h: 'Position indicator', tag: 'Open / close pointer',
                    p: 'The yellow pointer shows valve position at a glance, reading against the CLOSE and OPEN marks cast into the cover.'
                },
                {
                    at: .443, g: 7, obj: nameplate, h: 'Mech Torque nameplate', tag: 'MT-30 · 700 Nm · 2025',
                    p: 'Every gearbox carries a Mech Torque data plate stamped with its model, torque rating, PCD and build year.'
                },
                {
                    at: .50, g: 8, obj: wheel, h: 'Handwheel', tag: 'Ø350 mm handwheel',
                    p: 'A 350 mm handwheel keyed onto the input shaft, the MT-30\'s rated handwheel size for its 700 Nm output.'
                },
                {
                    at: .60, g: 9, obj: valve, h: 'Bolted to the butterfly valve', tag: '700 Nm · 32 mm max bore',
                    p: 'The gearbox mounts on the valve\'s top flange and its hub engages the stem directly, rated to 700 Nm on drive bores up to 32 mm.'
                },
                {
                    at: .775, g: 10, obj: discAnchor, h: 'Turn to open', tag: 'Quarter turn · 90°',
                    p: 'Wheel, worm, worm wheel, stem: one gear train. A quarter turn of the wheel swings the disc a full 90° and the pointer tracks it.'
                },
                {
                    at: .885, g: 10, obj: discAnchor, h: 'Turn to close', tag: 'Self-locking worm drive',
                    p: 'Reverse the wheel and the disc swings back across the bore. The worm drive holds position without a brake, at any point in the stroke.'
                },
                {
                    at: .975, g: 10, obj: nameplate, h: 'MT-30, ready to fit', tag: 'Manufacturing Gearbox · Rajkot, India',
                    p: 'A quarter-turn manual gearbox built for butterfly valves, from Mech Torque.'
                }
            ];
            const RAIL_PARTS = [
                { num: '01', code: 'BODY', name: 'Cast Iron Housing', spec: 'IS 210 FG 200 · Sealed Chamber' },
                { num: '02', code: 'MNT', name: 'ISO 5211 Mount Flange', spec: 'F07 / F10 / F12 Bolt Circle' },
                { num: '03', code: 'GEAR', name: 'Worm Wheel Quadrant', spec: 'SGI 500/7 Ductile Iron' },
                { num: '04', code: 'SHAFT', name: 'Hardened Worm Shaft', spec: '45C8 Carbon Steel' },
                { num: '05', code: 'COVER', name: 'Top Seal Cover Plate', spec: 'Dual O-Ring · IP67 Weatherproof' },
                { num: '06', code: 'STOPS', name: 'Travel-Stop Bolts', spec: '2 × Hex Set Bolts · ±5° Adj' },
                { num: '07', code: 'PTR', name: 'Position Indicator', spec: 'Continuous 90° Open/Close' },
                { num: '08', code: 'TAG', name: 'Mech Torque Nameplate', spec: 'MT-30 · 700 Nm · Serialized' },
                { num: '09', code: 'WHEEL', name: 'Manual Handwheel', spec: 'Ø350 mm Poly-Coated Steel' },
                { num: '10', code: 'VALVE', name: 'Butterfly Valve Coupling', spec: 'Direct Stem Engagement' },
                { num: '11', code: 'DRIVE', name: 'Quarter-Turn Operation', spec: '700 Nm · Self-Locking 90°' }
            ];
            const rail = $('rail');
            RAIL_PARTS.forEach((p, idx) => {
                const li = document.createElement('li');
                li.setAttribute('data-idx', idx);
                li.innerHTML = `
                    <div class="rail-capsule">
                        <div class="rail-cap-top">
                            <span class="rail-cap-badge">STAGE ${p.num} // CAD REF</span>
                            <span class="rail-cap-status"><span class="rail-cap-pulse"></span>LOCKED</span>
                        </div>
                        <div class="rail-cap-title">${p.name}</div>
                        <div class="rail-cap-meta"><span class="rail-cap-dot"></span>${p.spec}</div>
                    </div>
                    <div class="rail-tracer"></div>
                    <div class="rail-node">
                        <span class="rail-bracket bracket-l">[</span>
                        <div class="rail-pip-anchor">
                            <i class="rail-pip"></i>
                            <span class="rail-radar-ping"></span>
                        </div>
                        <span class="rail-bracket bracket-r">]</span>
                        <span class="rail-idx">${p.num}</span>
                    </div>
                `;
                rail.appendChild(li);
            });
            const railItems = [...rail.children];
            const copy = $('copy'), head = $('head'), lede = $('lede'), specs = $('specs'), cta = $('cta'), tagEl = $('tag');
            const calloutSvg = $('calloutSvg'), calloutLine = $('calloutLine'), calloutDot = $('calloutDot'), calloutHalo = $('calloutHalo'), calloutRing = $('calloutRing'), calloutLabel = $('calloutLabel'), calloutTag = $('calloutTag');
            const projVec = new THREE.Vector3();
            function updateCallout(idx) {
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
            }
            let stageIdx = -2, swapTimer = 0;

            function setStage(i) {
                if (i === stageIdx) return;
                stageIdx = i;
                const g = i < 0 ? -1 : STAGES[i].g;
                railItems.forEach((li, j) => { li.classList.toggle('now', j === g); li.classList.toggle('done', j < g); });
                const src = i < 0 ? HERO : STAGES[i];
                clearTimeout(swapTimer);
                copy.classList.add('swap');
                swapTimer = setTimeout(() => {
                    head.textContent = src.h; lede.textContent = src.p;
                    if (src.tag) tagEl.textContent = src.tag;
                    copy.classList.toggle('is-hero', i < 0);
                    copy.classList.toggle('tag-on', i >= 0 && !!src.tag);
                    copy.classList.remove('swap');
                }, reduceMotion ? 0 : 200);
            }

            let cur = 0, tgt = 0;
            function readScroll() {
                const max = track.offsetHeight - window.innerHeight;
                tgt = max > 0 ? clamp(window.scrollY / max) : 0;

                const navProg = document.getElementById('navProgressBar');
                if (navProg) {
                    const totalH = document.documentElement.scrollHeight - window.innerHeight;
                    const pct = totalH > 0 ? clamp((window.scrollY / totalH) * 100, 0, 100) : 0;
                    navProg.style.width = pct + '%';
                }
            }
            addEventListener('scroll', readScroll, { passive: true });
            addEventListener('resize', readScroll);
            readScroll(); cur = tgt;

            /* Rail click-to-stage navigation */
            railItems.forEach((li, idx) => {
                li.addEventListener('click', () => {
                    const targetStage = STAGES.find(s => s.g === idx);
                    if (targetStage) {
                        const max = track.offsetHeight - window.innerHeight;
                        window.scrollTo({ top: targetStage.at * max + 6, behavior: 'smooth' });
                    }
                });
            });

            const rootEl = document.documentElement;
            let frameCount = 0;
            function tick() {
                requestAnimationFrame(tick);
                frameCount++;
                /* Luxury inertia damping: 0.06 creates smooth, cinematic deceleration */
                cur += (tgt - cur) * (reduceMotion ? 1 : .06);
                if (Math.abs(tgt - cur) < .0002) cur = tgt;

                mxs += (mx - mxs) * .06; mys += (my - mys) * .06;
                if (!dragging && !reduceMotion) {
                    const back = cur < .97 ? .05 : .0;
                    dragAz *= 1 - back; dragEl *= 1 - back;
                }

                apply(cur);
                updateCamera(cur);

                let idx = -1;
                for (let i = 0; i < STAGES.length; i++) if (cur >= STAGES[i].at - .0005) idx = i;
                setStage(idx);
                updateCallout(idx);
                const done = cur >= .97;
                specs.classList.toggle('on', done); cta.classList.toggle('on', done);

                if (frameCount % 45 === 1) {
                    const o = parseFloat(getComputedStyle(rootEl).getPropertyValue('--shadow-opacity')) || .16;
                    floor.material.opacity = o;
                }
                renderer.render(scene, camera);
            }
            tick();
        })();