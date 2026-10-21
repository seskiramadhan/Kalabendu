"""Stage 5, Gedung Pejabat: "Menara Kaca" (the glass tower).

Cold and sinister luxury: a clock ticking every beat, the hum of the lift,
slow pelog with gender and a crying rebab, a bowed-metal shimmer. The second
round adds the kendang. 58-second loop.
"""

from gamelan import PELOG, Track, finish, note, tick, hum, bowed_metal
from songs.common import play

NAME = 'stage5'
BEAT = 0.6
LINES = [
    '3 . 2 1  . 7 1 2  . 3 2 1  7 6 5 6',
    '5 6 7 6  5 4 5 6  7 1 7 6  5 4 2 1',
    '2 3 2 1  6 5 6 1  2 1 7 6  5 6 7 1',
]


def render():
    cycle = sum(len(l.split()) for l in LINES) * BEAT
    total = cycle * 2
    tr = Track(total)
    tr.add(hum(55.0, total + 2), 0, gain=0.18)
    for b in range(int(total / BEAT)):
        tr.add(tick(0.8, high=b % 2 == 0), b * BEAT, pan=0.8 if b % 2 else -0.8, gain=0.25)
    t = 0
    for rnd in range(2):
        for i, line in enumerate(LINES):
            tr.add(bowed_metal(note(PELOG, 5, 494.0), 4.0), t + 3.0, pan=-0.4, gain=0.07)
            t = play(tr, t, line, PELOG, 247.0, BEAT, dense='slow', kendang_style='none' if rnd == 0 else 'walk',
                     layers=('gender', 'rebab'), gong_hz=40.0)
    return finish(tr, total, reverb=0.65, wet=0.28), total
