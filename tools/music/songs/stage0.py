"""Stage 0, Kampung Saat Fajar: "Pagi di Kampung" (village morning).

Bright, cheerful slendro at a walking pace: saron melody, peking sparkle,
bonang on the off-beats, a playful suling. 32-second loop.
"""

from gamelan import SLENDRO, Track, finish
from songs.common import play

NAME = 'stage0'
BEAT = 0.5
NAMES = {'1': 1, '2': 2, '3': 3, '5': 4, '6': 5}
LINES = [
    '6 5 3 2  5 3 2 1  3 2 1 6  2 1 6 5',
    '2 3 5 6  1 6 5 3  6 5 3 2  3 5 6 1',
    '6 5 3 2  5 3 2 1  3 2 1 6  2 1 6 5',
    '1 2 1 6  5 6 1 2  3 2 1 6  5 3 2 1',
]


def render():
    total = sum(len(l.split()) for l in LINES) * BEAT
    tr = Track(total)
    t = 0
    for i, line in enumerate(LINES):
        t = play(tr, t, line, SLENDRO, 300.0, BEAT, dense='fast', kendang_style='walk' if i % 2 == 0 else 'drive',
                 layers=('peking', 'suling'), names=NAMES, suling_up=1 + (i % 2))
    return finish(tr, total, reverb=0.45, wet=0.2), total
