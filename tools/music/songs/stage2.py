"""Stage 2, Pabrik Tutup: "Mesin Mati" (dead machines).

Cold pelog over a machine rhythm: clanking metal on every half beat with a
lopsided swing, steam hisses, a low repeating slenthem figure. The band
starts without kendang, then the drum kicks in. 32-second loop.
"""

from gamelan import PELOG, Track, finish, clank, steam
from songs.common import play

NAME = 'stage2'
BEAT = 0.5
LINES = [
    '5 . 5 4  2 1 2 4  5 . 5 4  2 1 2 1',
    '5 6 5 4  2 4 5 6  7 6 5 4  2 1 2 1',
    '1 2 1 7  1 2 4 2  1 7 6 7  1 2 1 1',
    '5 6 5 4  2 4 5 6  7 6 5 4  2 1 2 1',
]


def render():
    total = sum(len(l.split()) for l in LINES) * BEAT
    tr = Track(total)
    # the machine: clank, clank-clank, with one beat a bit late
    steps = int(total / (BEAT / 2))
    for s in range(steps):
        t = s * BEAT / 2 + (0.03 if s % 4 == 3 else 0)
        tr.add(clank(0.9 if s % 4 == 0 else 0.5, pitch=1.0 if s % 2 == 0 else 1.33, seed=31 + s % 5), t, pan=0.7 if s % 2 else -0.7, gain=0.25)
        if s % 16 == 12:
            tr.add(steam(1.0, seed=41 + s), t, pan=0.3, gain=0.35)
    t = 0
    for i, line in enumerate(LINES):
        t = play(tr, t, line, PELOG, 233.0, BEAT, dense='fast', kendang_style='none' if i == 0 else 'drive',
                 layers=('peking',), gong_hz=42.0)
    return finish(tr, total, reverb=0.35, wet=0.18), total
