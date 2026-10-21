"""Stage 3, Pasar Rakyat -> Lantai Bursa: "Harga Naik" (prices going up).

First the market: quick, playful slendro with chattering kendang and a
busy suling. Then the trading floor: the same speed in pelog, lines that keep
falling (like the index), and colder bells. 40-second loop.
"""

from gamelan import SLENDRO, PELOG, Track, finish
from songs.common import play

NAME = 'stage3'
BEAT = 0.42
NAMES = {'1': 1, '2': 2, '3': 3, '5': 4, '6': 5}
PASAR = [
    '3 5 6 5  3 2 1 2  3 5 3 2  6 5 3 5',
    '6 1 6 5  3 5 6 1  2 1 6 5  3 2 1 2',
]
BURSA = [
    '7 6 5 4  6 5 4 2  5 4 2 1  2 1 7 6',
    '7 6 5 4  6 5 4 2  4 2 1 7  1 7 6 5',
]


def render():
    total = (len(PASAR) + len(BURSA)) * 16 * BEAT * 2
    tr = Track(total)
    t = 0
    for _ in range(2):
        for line in PASAR:
            t = play(tr, t, line, SLENDRO, 294.0, BEAT, dense='fast', kendang_style='walk',
                     layers=('peking', 'suling'), names=NAMES, suling_up=2)
        for line in BURSA:
            t = play(tr, t, line, PELOG, 262.0, BEAT, dense='fast', kendang_style='drive',
                     layers=('peking', 'gender'), gong_hz=44.0)
    return finish(tr, total, reverb=0.45, wet=0.2), total
