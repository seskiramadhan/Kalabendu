"""Stage 1, Hutan Terbakar -> Kebun Sawit: "Api di Hulu" (fire upriver).

Tense pelog with a driving kendang, a low drone and burning-wood crackle all
the way through; bowed-metal cries rise like heat. The second round goes an
octave up. 43-second loop.
"""

from gamelan import PELOG, Track, finish, note, crackle, drone, bowed_metal
from songs.common import play

NAME = 'stage1'
BEAT = 0.45
LINES = [
    '1 2 1 6  5 6 1 2  3 2 1 2  6 5 3 5',
    '6 5 3 2  1 2 3 5  6 5 6 1  2 1 6 5',
    '3 5 6 5  3 2 1 2  4 3 2 1  2 1 6 5',
]


def render():
    cycle = sum(len(l.split()) for l in LINES) * BEAT
    total = cycle * 2
    tr = Track(total)
    tr.add(crackle(total + 2), 0, gain=0.22)
    tr.add(drone([note(PELOG, 1, 65.5), note(PELOG, 1, 65.5) * 1.012], total + 2, breathe=0.08), 0, gain=0.22)
    t = 0
    for rnd in range(2):
        for line in LINES:
            tr.add(bowed_metal(note(PELOG, 2, 524.0), 3.5), t + 2.0, pan=0.5, gain=0.08)
            t = play(tr, t, line, PELOG, 262.0, BEAT, dense='fast', kendang_style='drive',
                     layers=('peking',), octave=rnd, gong_hz=44.0)
    return finish(tr, total, reverb=0.5, wet=0.22), total
