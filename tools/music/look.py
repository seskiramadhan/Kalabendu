"""Draw a song so it can be checked by eye: loudness over time and a spectrogram.

    python3 tools/music/look.py menu   # -> tools/music/out/menu.png
"""

import os
import sys
import wave

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
name = sys.argv[1]
with wave.open(os.path.join(HERE, 'out', f'{name}.wav')) as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).mean(axis=1) / 32768

fig, (a, b) = plt.subplots(2, 1, figsize=(12, 6), sharex=True)
win = sr // 10
rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, 'same'))
t = np.arange(len(x)) / sr
a.plot(t[::50], 20 * np.log10(rms[::50] + 1e-6))
a.set_ylabel('loudness dB')
a.set_ylim(-50, 0)
a.set_title(f'{name}: loudness (top) and pitches over time (bottom)')
b.specgram(x, NFFT=4096, Fs=sr, noverlap=3072, cmap='magma', vmin=-120)
b.set_ylim(0, 3000)
b.set_ylabel('Hz')
b.set_xlabel('seconds')
plt.tight_layout()
out = os.path.join(HERE, 'out', f'{name}.png')
plt.savefig(out, dpi=80)
print(out)
