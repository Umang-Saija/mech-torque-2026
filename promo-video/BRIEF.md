# Mech Torque: "Same Valve. No Fight." Launch film

## The idea
Plant teams don't buy a gearbox. They buy the end of a fight they have every shift.
So the film doesn't open on the product. It opens on the problem: 02:47, night shift, two people
fighting a seized butterfly valve with a cheater bar. Then a single phone call, the MT-30 being
engineered from line to iron, and the same valve at 06:10, opened with one hand.
The last line repeats the first one: *Same valve. No fight.*

**Brand device: the quarter turn.** A valve's working life is 90°, so every transition is a
90°/360° conic sweep, the logo turns a quarter as it draws, and the hero number is **0° → 90°**.

## Structure (52.5 s, 30 fps; 9:16 Reels/Stories and 4:5 feed/LinkedIn)
| Time | Act | Picture | On screen |
|---|---|---|---|
| 0–11.6 | I · Night shift | Sodium light, steam at the flange, haze. A worker strains on a cheater bar, it slips. A second joins, it slips again. Defeat. Handheld camera. | `02:47 · Night shift` · Every shift. / Same valve. / **Same fight.** · Two people. / One cheater bar. / **Still stuck.** |
| 11.6–15.3 | II · The call | Freeze-frame drains to grey and blurs. Glass call card: ringing, then connected. A quarter-turn wipe exits. | There's a better way. |
| 15–33 | III · Engineered | Blueprint wireframe. A laser sheet scans it into cast iron. Seven parts lock in with material callouts. Nameplate glint. Handwheel fits. | It starts as a line. / Then it becomes **iron.** · 01–07 part callouts · Rated **700 Nm.** |
| 33–37.2 | IV · Morning | Warm light-leak cut to `06:10`, sun through the windows. The MT-30 lowers onto the same valve and seats. | Same valve. / New **drive.** |
| 37.2–45.2 | V · One hand | One worker turns the handwheel one-handed. The disc swings 0→90°, the pointer goes CLOSE→OPEN, a live dial counts. He lets go and it stays. | One hand. / **Ninety degrees.** · Let go. / It **holds.** |
| 45.2–47.6 | Resolve | Fist bump. | Same valve. / **No fight.** |
| 47.6–52.5 | End card | The cog mark draws itself with a quarter turn. Wordmark, tagline, range, contact. | Gearboxes that drive valve excellence. · MT-20 to MT-60 · 250 to 2,000 Nm · +91 99131 91343 |

## Accuracy rules followed
- **Gearbox and valve are not re-modelled.** The film loads the website's own `model3d.js` at render
  time, so the same housing, flange, worm wheel, worm shaft, cover, bolts, stops, indicator,
  nameplate, handwheel and blue butterfly valve that ship on the site are used here. The assembly
  path, mounting and the worm-to-wheel kinematics (wheel, worm, sector gear, stem and pointer
  all driven from one angle) also come from the site's own `apply()` function.
- Specs come only from the 2025 catalogue: MT-30 700 Nm, ISO 5211 F07/F10/F12, 32 mm max drive bore,
  housing and cover IS 210 FG 200 / ASTM A48 30A, worm wheel SGI 500/7, worm shaft 45C8 / A576-1045,
  range MT-20 to MT-60 at 250 to 2,000 Nm.
- "Self-locking, holds without a brake" is the website's own claim. No ratios, IP ratings or
  certifications are claimed that the catalogue doesn't state.
- The workers, the plant, "Line 4" and the times are a dramatisation, not a real customer.

## Sound
An original score and sound design, synthesised in code (no samples, nothing to license). It moves
from a cold minor drone with steel groaning under load, through a phone ring and a building pulse,
to a warm major resolve. Every clank, footstep and ratchet tick is placed from the same timeline as
the picture. The mix is mastered to −14 LUFS / −1 dBTP for Instagram and LinkedIn. There is no
voice-over, so the story reads with the sound off, which is how most feeds autoplay.

## Rebuild
```
node story-score.js                          # out/story-score.wav
node render.js --comp story --w 1080 --h 1920 --out out/story-picture-9x16.mp4
node render.js --comp story --w 1080 --h 1350 --out out/story-picture-4x5.mp4
node finish.js story                         # grain, vignette, loudness -> out/MechTorque-Story-*.mp4
```
The product-only cut (`reel.html`, `score.js`, `node finish.js reel`) is a 48 s alternative that
skips the story and stays on the engineering.

## Post copy

**Instagram (Reels)**
> 02:47. Same valve. Same fight. 🔧
> Then one call changed the night shift.
> MT-30 worm gear operator · 700 Nm · ISO 5211 F07/F10/F12
> One hand. Ninety degrees. It holds.
> Made in Rajkot 🇮🇳 · DM or call +91 99131 91343
> #valveautomation #butterflyvalve #gearbox #industrialengineering #makeinindia #rajkot #oilandgas #processindustry

**LinkedIn**
> Every plant has one: the valve that takes two people and a cheater bar every shift.
>
> We built the MT-30 so it takes one hand. It's a quarter-turn worm gear operator rated 700 Nm,
> bolts straight onto the ISO 5211 top flange (F07/F10/F12), and its self-locking worm drive
> holds any position without a brake.
>
> Housing in IS 210 FG 200 cast iron, worm wheel in SGI 500/7 ductile iron, worm shaft in 45C8
> carbon steel. Engineered and manufactured in Rajkot, India. The range runs MT-20 to MT-60,
> 250 to 2,000 Nm.
>
> Same valve. No fight.
> 📞 +91 99131 91343 · ✉ infomechtorque@gmail.com
