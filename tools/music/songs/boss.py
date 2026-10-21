"""Boss theme (every boss except Batara Kala): "Amuk" (rampage).

Fast, aggressive pelog: racing saron and peking, driving kendang with rolls,
a low drone underneath, clashing half-step bonang stabs, and a reversed gong
pulling into every big gong. 23-second loop.
"""

from gamelan import PELOG, Track, finish, note, drone, reverse_gong, bonang
from songs.common import play

NAME = 'boss'
BEAT = 0.36
LINES = [
    '1 2 1 7  1 2 4 5  4 2 1 2  4 5 6 5',
    '4 5 4 2  1 2 1 7  1 7 1 2  4 2 1 1',
    '5 6 5 4  5 6 7 6  5 4 2 4  5 6 5 4',
    '2 1 2 4  5 4 2 1  7 1 2 1  7 1 7 1',
]


def render():
    total = sum(len(l.split()) for l in LINES) * BEAT
    tr = Track(total)
    tr.add(drone([note(PELOG, 1, 65.5), note(PELOG, 2, 65.5)], total + 2, breathe=0.2), 0, gain=0.25)
    t = 0
    for i, line in enumerate(LINES):
        tr.add(reverse_gong(44.0, 1.8), t + 16 * BEAT - 1.8, gain=0.45)
        for b in range(1, 16, 4):
            d = int(line.split()[b])
            tr.add(bonang(note(PELOG, d + 1, 262.0)), t + b * BEAT + BEAT / 2, pan=-0.5, gain=0.12)
        t = play(tr, t, line, PELOG, 262.0, BEAT, dense='fast', kendang_style='drive',
                 layers=('peking',), octave=1 if i == 2 else 0, gong_hz=44.0)
    return finish(tr, total, reverb=0.45, wet=0.2), total
