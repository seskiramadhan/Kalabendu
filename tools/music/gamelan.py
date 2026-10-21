"""A small gamelan orchestra made from maths.

Every instrument here is a function that returns a short sound (a NumPy array of
samples). A song places those sounds on a timeline (see `Track`), then
`finish()` adds the hall echo and evens out the volume.

Why it sounds like gamelan: bronze bars and gongs do not ring with neat
harmonics like a guitar string. Their overtones sit at odd ratios (a saron bar
rings at about 1, 2.76 and 5.4 times its note), and Javanese/Balinese pairs are
tuned a little apart so they "beat" (ombak, the shimmer of a gong).
"""

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100  # samples per second

# ---- Tuning -------------------------------------------------------------
# Gamelan scales are not Western scales. Values are cents above note 1
# (100 cents = one piano semitone). These are typical, not one exact set.
PELOG = [0, 120, 270, 540, 670, 785, 950]   # 7 notes, darker, "sad/serious"
SLENDRO = [0, 231, 474, 717, 955]            # 5 nearly-equal notes, "open/calm"


def note(scale, degree, base=293.0):
    """Frequency of a scale degree (1-based like gamelan notation, 0 = rest).

    Degrees past the scale length go up an octave, negative ones go down:
    note(SLENDRO, 6) is degree 1 one octave higher.
    """
    n = len(scale)
    d = degree - 1
    octave, step = divmod(d, n)
    cents = scale[step] + 1200 * octave
    return base * 2 ** (cents / 1200)


# ---- Building blocks ----------------------------------------------------

def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def lowpass(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)


def highpass(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def noise(dur, seed=None):
    rng = np.random.default_rng(seed)
    return rng.uniform(-1, 1, int(dur * SR))


def ring(freq, dur, partials, decays, amps, attack=0.002, detune=0.0, glide=0.0):
    """Struck metal: a set of decaying sine partials.

    partials: overtone ratios; decays: seconds each partial takes to fade to ~37%;
    detune: Hz between two copies of each partial (the gamelan shimmer);
    glide: the pitch drops by this fraction right after the hit (big gongs do).
    """
    t = t_axis(dur)
    out = np.zeros_like(t)
    bend = 1 + glide * np.exp(-t / 0.15) if glide else 1.0
    for r, d, a in zip(partials, decays, amps):
        f = freq * r * bend
        phase = 2 * np.pi * np.cumsum(f * np.ones_like(t)) / SR
        tone = np.sin(phase)
        if detune:
            tone = 0.5 * (tone + np.sin(phase + 2 * np.pi * detune * r * t))
        out += a * tone * np.exp(-t / d)
    env = np.minimum(1, t / attack) if attack else 1
    return out * env


def mallet_click(dur=0.03, bright=4000, seed=None):
    """The 'tik' of the mallet hitting the bar."""
    n = noise(dur, seed) * np.exp(-t_axis(dur) / 0.006)
    return bandpass(n, 800, bright)


# ---- Instruments --------------------------------------------------------
# Each takes a frequency and returns a mono sound.

def saron(f, vel=1.0, dur=1.6):
    """Bronze bars on a trough: bright, clear melody (the balungan)."""
    s = ring(f, dur, [1, 2.76, 5.40, 8.93], [0.9, 0.35, 0.15, 0.06], [1, 0.32, 0.12, 0.04], detune=1.2)
    s[: int(0.03 * SR)] += 0.25 * mallet_click(seed=int(f))
    return vel * s


def demung(f, vel=1.0):
    """Lower, bigger saron: heavier melody."""
    return saron(f / 2, vel, dur=2.2) * 1.1


def slenthem(f, vel=1.0):
    """Soft low bars hanging over tubes: a warm 'doom' under the melody."""
    return vel * ring(f / 4, 3.0, [1, 2.0, 3.0], [1.6, 0.6, 0.3], [1, 0.2, 0.05], attack=0.01, detune=0.6)


def peking(f, vel=1.0):
    """Small high saron: sparkle, plays fast decorations."""
    s = ring(f * 2, 0.9, [1, 2.76, 5.4], [0.45, 0.15, 0.06], [1, 0.25, 0.08], detune=2.0)
    s[: int(0.02 * SR)] += 0.2 * mallet_click(0.02, 8000, seed=int(f) + 1)
    return vel * s


def bonang(f, vel=1.0):
    """Small kettle gongs in a row: round, 'tong', a little nasal."""
    s = ring(f, 1.4, [1, 1.99, 3.02, 4.1], [0.7, 0.3, 0.12, 0.06], [1, 0.35, 0.15, 0.05], detune=1.5)
    click = mallet_click(seed=int(f) + 2)
    s[: len(click)] += 0.15 * click
    return vel * lowpass(s, 6000)


def gender(f, vel=1.0):
    """Thin bars over tubes, played with soft mallets: gentle, long and singing."""
    return vel * ring(f, 3.2, [1, 2.76, 4.0], [1.6, 0.5, 0.2], [1, 0.12, 0.04], attack=0.012, detune=0.9)


def kenong(f, vel=1.0):
    """Big kettle gong standing up: marks the big phrases."""
    return vel * ring(f / 2, 3.5, [1, 2.01, 2.98], [1.8, 0.8, 0.4], [1, 0.4, 0.15], attack=0.004, detune=0.8)


def kempul(f, vel=1.0):
    """Hanging gong, medium: 'wung', marks the half-phrases."""
    return vel * ring(f / 4, 4.5, [1, 1.51, 2.02, 2.6], [2.5, 1.0, 0.6, 0.3], [1, 0.3, 0.25, 0.08], attack=0.01, detune=1.4)


def gong(f=48.0, vel=1.0, dur=9.0):
    """Gong ageng: the huge gong that ends every cycle. Very low, beating slowly."""
    t = t_axis(dur)
    s = ring(f, dur, [1, 2.0, 2.71, 3.92, 5.2], [5.5, 3.0, 1.6, 0.9, 0.4], [1, 0.45, 0.3, 0.12, 0.05], attack=0.03, detune=0.0)
    ombak = 1 + 0.35 * np.sin(2 * np.pi * 3.1 * t)  # the gong's 'wave'
    hum = 0.6 * np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t / 3) * np.minimum(1, t / 0.15)
    return vel * lowpass((s * ombak + hum), 1800)


def kendang(kind='dhe', vel=1.0):
    """Hand drum that leads the band. kind: 'dhe' low boom, 'tak' dry slap, 'tung' ringing middle, 'ket' small tap."""
    if kind == 'tak':
        n = noise(0.12, 7) * np.exp(-t_axis(0.12) / 0.018)
        return vel * 0.9 * bandpass(n, 900, 5000)
    if kind == 'ket':
        n = noise(0.06, 9) * np.exp(-t_axis(0.06) / 0.01)
        return vel * 0.6 * bandpass(n, 2000, 7000)
    f0, f1, dec = (95, 62, 0.28) if kind == 'dhe' else (220, 170, 0.22)
    t = t_axis(0.6)
    freq = f1 + (f0 - f1) * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / dec)
    slap = bandpass(noise(0.6, 3), 300, 2500) * np.exp(-t / 0.02) * 0.4
    return vel * (body + slap)


def suling(freq, dur, vel=1.0, vibrato=5.5, depth=0.012, breath=0.08):
    """Bamboo flute: a soft pure tone with breath and a slow vibrato."""
    t = t_axis(dur)
    vib = 1 + depth * np.sin(2 * np.pi * vibrato * t) * np.minimum(1, t / 0.4)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    tone = np.sin(phase) + 0.18 * np.sin(2 * phase) + 0.05 * np.sin(3 * phase)
    air = bandpass(noise(dur, int(freq)), freq * 0.8, freq * 3.5) * breath
    env = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.15).clip(0)
    return vel * (tone + air) * env * 0.5


def rebab(freq, dur, vel=1.0):
    """Two-string bowed fiddle: a nasal, crying voice."""
    t = t_axis(dur)
    vib = 1 + 0.01 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.3)
    phase = np.cumsum(freq * vib) / SR
    saw = 2 * (phase % 1) - 1
    tone = bandpass(saw, freq * 0.9, 3500)
    env = np.minimum(1, t / 0.12) * np.minimum(1, (dur - t) / 0.2).clip(0)
    return vel * tone * env * 0.35


# ---- Horror colours (for Batara Kala) ----------------------------------

def drone(freqs, dur, vel=1.0, breathe=0.12):
    """Low tones a little out of tune with each other, slowly breathing."""
    t = t_axis(dur)
    out = sum(np.sin(2 * np.pi * f * t + i) for i, f in enumerate(freqs)) / len(freqs)
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * breathe * t)
    return vel * lowpass(out * swell, 900)


def reverse_gong(f=48.0, dur=3.0, vel=1.0):
    """A gong played backwards: sucks in toward the beat."""
    return vel * gong(f, 1.0, dur)[::-1].copy()


def bowed_metal(f, dur, vel=1.0):
    """A gong 'bowed' instead of hit: an eerie sustained metallic whine."""
    t = t_axis(dur)
    s = sum(a * np.sin(2 * np.pi * f * r * t + r) for r, a in [(1, 1), (2.76, 0.5), (5.4, 0.3), (8.9, 0.15)])
    env = np.minimum(1, t / (dur * 0.6)) * np.minimum(1, (dur - t) / 0.3).clip(0)
    trem = 1 + 0.2 * np.sin(2 * np.pi * 6.5 * t)
    return vel * s * env * trem * 0.3


def whisper(dur, vel=1.0, seed=5):
    """Breathy noise that rises in pitch: a voice behind you."""
    t = t_axis(dur)
    n = noise(dur, seed)
    lo = bandpass(n, 300, 900)
    hi = bandpass(n, 1500, 5000)
    k = t / dur
    env = np.sin(np.pi * k) ** 2
    return vel * (lo * (1 - k) + hi * k) * env * 0.5


# ---- Timeline -----------------------------------------------------------

class Track:
    """A stereo timeline. add() drops a mono sound at a time, panned left (-1) to right (+1)."""

    def __init__(self, seconds):
        self.buf = np.zeros((2, int(seconds * SR) + SR * 12))

    def add(self, sound, at, pan=0.0, gain=1.0):
        i = int(at * SR)
        n = min(len(sound), self.buf.shape[1] - i)
        if n <= 0:
            return
        left = np.cos((pan + 1) * np.pi / 4)
        right = np.sin((pan + 1) * np.pi / 4)
        self.buf[0, i:i + n] += sound[:n] * gain * left
        self.buf[1, i:i + n] += sound[:n] * gain * right


def finish(track, loop_seconds, reverb=0.45, wet=0.22):
    """Hall echo, gentle compression and a limiter, then a seamless loop.

    The sound that rings past the loop end (gong tails, echo) is folded back
    onto the start, so the music loops without a click or a gap.
    """
    from pedalboard import Pedalboard, Reverb, Compressor, Limiter, HighpassFilter

    board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=28),
        Reverb(room_size=reverb, damping=0.5, wet_level=wet, dry_level=0.85, width=0.9),
        Compressor(threshold_db=-16, ratio=2.5, attack_ms=15, release_ms=200),
        Limiter(threshold_db=-1.0, release_ms=120),
    ])
    audio = track.buf.astype(np.float32)
    audio /= max(1e-9, np.abs(audio).max()) / 0.7
    wetted = board(audio, SR)
    n = int(loop_seconds * SR)
    loop = wetted[:, :n].copy()
    tail = wetted[:, n:]
    loop[:, : tail.shape[1]] += tail[:, : n]
    return board_limit(loop)


def board_limit(x):
    from pedalboard import Pedalboard, Limiter
    x = Pedalboard([Limiter(threshold_db=-1.0, release_ms=120)])(x.astype(np.float32), SR)
    peak = np.abs(x).max()
    return x / peak * 0.89 if peak > 0.89 else x


# ---- Stage colours ------------------------------------------------------

def crackle(dur, density=18, vel=1.0, seed=21):
    """Burning wood: random pops over a low rumble."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(int(dur * density)):
        i = rng.integers(0, n - 800)
        pop = rng.uniform(-1, 1, 400) * np.exp(-np.arange(400) / rng.uniform(20, 90))
        out[i:i + 400] += pop * rng.uniform(0.2, 1.0)
    rumble = lowpass(noise(dur, seed + 1), 180) * 0.6
    return vel * (highpass(out, 900) * 0.5 + rumble)


def clank(vel=1.0, pitch=1.0, seed=31):
    """A machine part hitting metal: short, inharmonic, cold."""
    s = ring(820 * pitch, 0.35, [1, 1.73, 2.91, 4.4], [0.08, 0.05, 0.03, 0.02], [1, 0.7, 0.5, 0.3])
    hit = highpass(noise(0.05, seed), 2000) * np.exp(-t_axis(0.05) / 0.008)
    s[: len(hit)] += hit * 0.6
    return vel * s * 0.6


def steam(dur=0.8, vel=1.0, seed=41):
    """A hiss of steam."""
    t = t_axis(dur)
    return vel * highpass(noise(dur, seed), 3000) * np.minimum(1, t / 0.05) * np.exp(-t / (dur * 0.4)) * 0.4


def bedug(vel=1.0):
    """Big mosque drum, used here as a protest drum: deep 'dung'."""
    t = t_axis(0.9)
    freq = 48 + 30 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.35)
    skin = bandpass(noise(0.9, 51), 120, 1200) * np.exp(-t / 0.03) * 0.5
    return vel * (body + skin)


def tick(vel=1.0, high=True):
    """A clock tick (tik / tok)."""
    s = ring(3200 if high else 2400, 0.08, [1, 2.3], [0.012, 0.006], [1, 0.4])
    return vel * s * 0.5


def hum(freq, dur, vel=1.0):
    """Electric hum of a lift motor or air conditioning."""
    t = t_axis(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2 * t) + 0.15 * np.sin(2 * np.pi * freq * 3 * t)
    return vel * s * (0.9 + 0.1 * np.sin(2 * np.pi * 0.3 * t)) * 0.3
