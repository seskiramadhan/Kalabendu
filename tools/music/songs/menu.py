"""Menu theme: "Fajar di Marcapada" (Dawn over Marcapada).

Calm, hopeful slendro piece in a slow ketawang-like cycle: 16 beats per gong.
Two gong cycles (A, B) played twice; the second time the rebab joins and the
suling sings higher. One beat = 1 second, so the loop is 64 seconds.
"""

import numpy as np
from gamelan import (SLENDRO, note, Track, finish, saron, demung, slenthem, peking, bonang,
                     gender, kenong, kempul, gong, kendang, suling, rebab)

NAME = 'menu'
BEAT = 1.0
BASE = 280.0  # pitch of note 1

# Slendro notes are named 1 2 3 5 6 (there is no 4). '.' = rest.
NAMES = {'1': 1, '2': 2, '3': 3, '5': 4, '6': 5}

A = '2 1 2 6  2 1 2 6  3 3 . .  6 5 3 2'
B = '5 6 5 3  2 1 2 6  2 1 6 5  3 5 6 1'


def parse(line):
    return [None if c == '.' else NAMES[c] for c in line.split()]


def f(deg, octave=0):
    return note(SLENDRO, deg + 5 * octave, BASE)


def render():
    cycles = [parse(A), parse(B), parse(A), parse(B)]
    beats = [d for c in cycles for d in c]
    total = len(beats) * BEAT
    tr = Track(total)
    # A rest holds the previous note for the decorating instruments.
    held = []
    last = beats[-1]
    for d in beats:
        last = d or last
        held.append(last)

    for i, d in enumerate(beats):
        t = i * BEAT
        pos = i % 16 + 1           # 1..16 inside the gong cycle
        second = i >= 32           # second time round
        cur = held[i]
        nxt = held[(i + 1) % len(held)]

        # Balungan: the core melody on saron and demung.
        if d:
            tr.add(saron(f(d)), t, pan=-0.3, gain=0.42)
            tr.add(demung(f(d)), t, pan=0.25, gain=0.32)
        if pos % 2 == 0:
            tr.add(slenthem(f(cur)), t, gain=0.45)

        # Peking anticipates the next note on the off-beat.
        tr.add(peking(f(nxt)), t + BEAT / 2, pan=0.55, gain=0.16)

        # Bonang: walks between this note and the next, two strokes per beat.
        tr.add(bonang(f(cur)), t, pan=-0.6, gain=0.20)
        tr.add(bonang(f(nxt)), t + BEAT / 2, pan=-0.6, gain=0.16)

        # Gender: soft flowing arpeggio, four notes per beat, an octave up.
        for k, step in enumerate([0, 1, -1, 0]):
            g = np.clip(cur + step, 1, 5)
            tr.add(gender(f(g, 1)), t + k * BEAT / 4, pan=0.35, gain=0.07 if k else 0.09)

        # Punctuation: kenong on every 4th beat, kempul on 6/10/14, the big gong at 16.
        if pos % 4 == 0:
            tr.add(kenong(f(cur)), t, pan=0.1, gain=0.30)
        if pos in (6, 10, 14):
            tr.add(kempul(f(cur)), t, pan=-0.1, gain=0.33)
        if pos == 16:
            tr.add(gong(46.0), t, gain=0.85)

        # Kendang: a gentle walking pattern.
        if pos % 4 == 1:
            tr.add(kendang('dhe', 0.5), t, gain=0.5)
        elif pos % 4 == 3:
            tr.add(kendang('tung', 0.4), t, gain=0.4)
        if pos % 2 == 0:
            tr.add(kendang('ket', 0.3), t + BEAT * 0.75, gain=0.35)

        # Suling: a long, free phrase toward each 4th-beat note.
        if pos % 4 == 2:
            target = held[i + 2] if i + 2 < len(held) else held[0]
            up = 2 if second else 1
            tr.add(suling(f(target, up), BEAT * 2.6, vibrato=5.0), t + 0.15, pan=0.2, gain=0.20)

        # Rebab: joins in the second round, singing the cycle's last notes.
        if second and pos % 8 == 5:
            tr.add(rebab(f(held[i + 3 if i + 3 < len(held) else 0], 1), BEAT * 3.6), t + 0.1, pan=-0.25, gain=0.22)

    return finish(tr, total, reverb=0.6, wet=0.26), total
