"""Boss theme: "Batara Kala" (the true final boss).

Dark pelog in three parts, 36 seconds, looping:
  A  ombak  (12 s)  - a gong in the dark: low drone, heartbeat kendang, slow
                      clashing low notes, a bowed-metal whine and a whisper.
  B  amuk   (12 s)  - the band speeds up (like the tempo rush of a gamelan
                      piece): racing saron and peking, stabbing bonang,
                      pounding kendang.
  C  kala   (12 s)  - same rush, an octave higher with clashing half-step
                      stabs; a reversed gong sucks in to the final gong.
"""

import numpy as np
from gamelan import (PELOG, note, Track, finish, saron, demung, slenthem, peking, bonang,
                     kenong, kempul, gong, kendang, drone, reverse_gong, bowed_metal, whisper)

NAME = 'kala'
BASE = 262.0
SLOW = 0.75   # seconds per beat in part A
FAST = 0.375  # part B and C

# Pelog degrees 1..7; 0 = 7 of the octave below; '.' = rest.
A = '1 . 2 1  . 0 1 .  4 . 5 4  2 1 0 1'
B = '1 2 1 0  1 2 4 5  4 2 1 2  4 5 6 5  4 5 4 2  1 2 1 0  1 0 1 2  4 2 1 1'
C = '5 6 5 4  5 6 7 6  5 4 2 4  5 6 5 4  2 1 2 4  5 4 2 1  0 1 2 1  0 1 0 1'


def parse(line):
    return [None if c == '.' else int(c) for c in line.split()]


def f(deg, octave=0):
    return note(PELOG, deg + 7 * octave, BASE)


def render():
    total = 16 * SLOW + 32 * FAST * 2
    tr = Track(total)

    # ---- A: the dark ----
    tr.add(drone([f(1, -2), f(1, -2) * 1.017, f(2, -2)], 16 * SLOW + 1.0), 0, gain=0.30)
    tr.add(bowed_metal(f(2, 1), 5.0), 2.0, pan=0.5, gain=0.18)
    tr.add(bowed_metal(f(1, 1) * 1.03, 4.0), 7.0, pan=-0.5, gain=0.15)
    tr.add(whisper(4.0), 6.5, pan=-0.3, gain=0.18)
    notes = parse(A)
    for i, d in enumerate(notes):
        t = i * SLOW
        if d is not None:
            tr.add(demung(f(d)), t, pan=-0.2, gain=0.40)
            tr.add(slenthem(f(d)), t, gain=0.50)
            # the note a half step above, quietly: it never resolves
            tr.add(saron(f(d + 1, -1)), t + 0.03, pan=0.4, gain=0.12)
        # heartbeat: lub-dub
        if i % 4 == 0:
            tr.add(kendang('dhe', 1.0), t, gain=0.6)
            tr.add(kendang('dhe', 0.7), t + 0.22, gain=0.45)
        if i in (7, 15):
            tr.add(kempul(f(1)), t, gain=0.4)
    tr.add(reverse_gong(44.0, 2.0), 16 * SLOW - 2.0, gain=0.5)

    # ---- B and C: the rush ----
    start = 16 * SLOW
    for part, line in enumerate([B, C]):
        notes = parse(line)
        for i, d in enumerate(notes):
            t = start + (part * 32 + i) * FAST
            pos = i % 16 + 1
            up = part  # C goes an octave up
            nxt = notes[(i + 1) % len(notes)]
            tr.add(saron(f(d, up)), t, pan=-0.3, gain=0.36)
            tr.add(demung(f(d)), t, pan=0.25, gain=0.30)
            # peking doubles the speed
            tr.add(peking(f(d, up)), t, pan=0.6, gain=0.13)
            tr.add(peking(f(nxt, up)), t + FAST / 2, pan=0.6, gain=0.11)
            # bonang stabs on the off-beat, with a clashing neighbour in part C
            tr.add(bonang(f(nxt)), t + FAST / 2, pan=-0.6, gain=0.20)
            if part == 1 and pos % 4 == 2:
                tr.add(bonang(f(nxt + 1)), t + FAST / 2 + 0.01, pan=-0.5, gain=0.14)
            if pos % 2 == 0:
                tr.add(slenthem(f(d)), t, gain=0.4)
            if pos % 4 == 0:
                tr.add(kenong(f(d)), t, pan=0.1, gain=0.28)
            if pos in (6, 10, 14):
                tr.add(kempul(f(d)), t, gain=0.35)
            if pos == 16 and not (part == 1 and i == 31):
                tr.add(gong(44.0, 0.8), t, gain=0.6)
            # kendang: driving pattern with rolls into each 8th beat
            hits = {1: 'dhe', 3: 'tak', 4: 'tung', 5: 'dhe', 7: 'tak', 8: 'tak'}
            k = hits.get((pos - 1) % 8 + 1)
            if k:
                tr.add(kendang(k, 0.9), t, gain=0.75)
            if pos % 8 == 7:
                for r in range(3):
                    tr.add(kendang('ket', 0.6), t + FAST * (0.25 + r * 0.25), gain=0.5)
        start_c = start + 32 * FAST
        if part == 0:
            tr.add(whisper(3.0, seed=11), start_c - 3.0, pan=0.4, gain=0.3)
    # the end: a reversed gong sucks in, then the great gong falls on the loop point
    tr.add(reverse_gong(42.0, 2.5), total - 2.5, gain=0.7)
    tr.add(gong(42.0, 1.0), total, gain=0.75)
    tr.add(drone([f(1, -2), f(1, -2) * 1.02], 3.0, breathe=0.5), total - 3.0, gain=0.3)

    return finish(tr, total, reverb=0.55, wet=0.24), total
