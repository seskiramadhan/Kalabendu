"""Stage 4, Jalan Raya Demo: "Rakyat Bersatu" (the people united).

A march: bedug drums on the strong beats, kendang in a marching pattern,
bold slendro melody and a rallying suling. 32-second loop.
"""

from gamelan import SLENDRO, Track, finish, bedug
from songs.common import play

NAME = 'stage4'
BEAT = 0.5
NAMES = {'1': 1, '2': 2, '3': 3, '5': 4, '6': 5}
LINES = [
    '1 1 . 2  3 5 6 5  3 2 1 2  3 5 3 2',
    '6 6 . 5  3 5 6 1  2 1 6 5  3 2 1 6',
    '1 1 . 2  3 5 6 5  6 5 3 2  1 2 3 5',
    '6 1 6 5  3 2 1 2  3 5 6 1  6 5 2 1',
]


def render():
    total = sum(len(l.split()) for l in LINES) * BEAT
    tr = Track(total)
    t = 0
    for line in LINES:
        for b in range(16):
            if b % 4 in (0, 2):
                tr.add(bedug(1.0 if b % 4 == 0 else 0.7), t + b * BEAT, gain=0.55)
        t = play(tr, t, line, SLENDRO, 294.0, BEAT, dense='fast', kendang_style='march',
                 layers=('peking', 'suling'), names=NAMES, suling_up=2)
    return finish(tr, total, reverb=0.4, wet=0.18), total
