"""
Voice-over for the story film, generated with Kokoro (open-weight neural TTS, Apache-2.0).
Each line is placed at the second it belongs to in story-timeline.js; a line that would
run into the next one is gently sped up to fit.

    pip install kokoro-onnx soundfile
    # model files from https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
    python voiceover.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin [--voice am_michael]
    -> out/story-vo.wav
"""
import argparse, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

# (start second, line). Spelling is tuned for the TTS (e.g. "M-T thirty").
SCRIPT = [
    (0.6,  "Every plant has one valve nobody wants to touch."),
    (4.7,  "Every shift. The same fight."),
    (6.7,  "Two people. One cheater bar."),
    (9.95, "And it still won't move."),
    (13.25, "So they called Mech Torque."),
    (15.5, "It starts as a line."),
    (18.35, "Then it becomes iron."),
    (20.5, "A cast iron housing. A ductile iron worm wheel. A carbon steel worm."),
    (26.0, "Adjustable travel stops, and a pointer you can read at a glance."),
    (30.85, "Rated seven hundred newton metres."),
    (33.55, "Next morning. Same valve."),
    (35.95, "Bolted straight onto the top flange."),
    (38.8, "Now it takes one hand."),
    (40.9, "Ninety degrees. Every time."),
    (43.3, "Let go. It holds."),
    (45.5, "Same valve. No fight."),
    (49.35, "Mech Torque. Gearboxes that drive valve excellence."),
]
DURATION = 54.0
SR_OUT = 48000

ap = argparse.ArgumentParser()
ap.add_argument('--model', required=True)
ap.add_argument('--voices', required=True)
ap.add_argument('--voice', default='am_michael')
ap.add_argument('--speed', type=float, default=0.9)
ap.add_argument('--out', default='story-vo.wav')
a = ap.parse_args()

k = Kokoro(a.model, a.voices)
track = np.zeros(int(DURATION * SR_OUT), dtype=np.float32)

def trim(x, thr=0.004):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 200): idx[-1] + 1200] if len(idx) else x

for i, (t0, text) in enumerate(SCRIPT):
    nxt = SCRIPT[i + 1][0] if i + 1 < len(SCRIPT) else DURATION - .6
    room = nxt - t0 - .15
    speed = a.speed
    for _ in range(4):
        y, sr = k.create(text, voice=a.voice, speed=speed, lang='en-us')
        y = trim(np.asarray(y, dtype=np.float32))
        if len(y) / sr <= room: break
        speed = min(1.35, speed * (len(y) / sr) / room * 1.02)
    # resample 24k -> 48k (linear is fine for speech at this ratio after the 2x upsample)
    n = int(len(y) * SR_OUT / sr)
    y = np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y).astype(np.float32)
    y *= np.minimum(1, np.arange(n) / 240)   # 5 ms fade-in
    s = int(t0 * SR_OUT)
    track[s:s + n] += y[:len(track) - s]
    print(f'{t0:6.2f}s  {n / SR_OUT:4.2f}s (room {room:4.2f}s, speed {speed:.2f})  {text}')

track /= max(1e-6, np.abs(track).max()) / 0.9
os.makedirs(os.path.join(os.path.dirname(__file__), 'out'), exist_ok=True)
sf.write(os.path.join(os.path.dirname(__file__), 'out', a.out), np.stack([track, track], 1), SR_OUT, subtype='PCM_16')
print('voice-over written: out/' + a.out)
