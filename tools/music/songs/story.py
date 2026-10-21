"""Story scenes and the warung: "Wayang Malam" (shadow play at night).

Very calm slendro: soft gender ripples, slenthem underneath, a lone suling,
gong every 16 beats. No drums. 38-second loop.
"""

from gamelan import SLENDRO, Track, finish
from songs.common import play

NAME = 'story'
BEAT = 1.2
NAMES = {'1': 1, '2': 2, '3': 3, '5': 4, '6': 5}
LINES = ['3 5 3 2  . 1 2 6  . 6 1 2  3 2 1 6', '2 3 2 1  3 2 1 6  5 6 1 2  1 6 5 6']


def render():
    total = sum(len(l.split()) for l in LINES) * BEAT
    tr = Track(total)
    t = 0
    for line in LINES:
        t = play(tr, t, line, SLENDRO, 262.0, BEAT, dense='slow', kendang_style='none',
                 layers=('gender', 'suling'), names=NAMES, gain=0.85)
    return finish(tr, total, reverb=0.7, wet=0.3), total
