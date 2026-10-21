"""Shared arranger: turns balungan lines into a full gamelan band part.

A stage song calls `play(track, start, line, ...)` once per gong cycle with
its own scale, tempo and style, then adds its own colours (fire crackle,
machines, march drums...). The style switches:

  dense   'slow'  bonang 2 strokes per beat, gender 4 notes per beat (calm)
          'fast'  peking doubles every beat, bonang hits off-beats (driving)
  kendang 'walk' | 'drive' | 'march' | 'none'
  layers  set of extra voices: 'gender', 'peking', 'suling', 'rebab'
"""

import numpy as np
from gamelan import (note, saron, demung, slenthem, peking, bonang, gender, kenong,
                     kempul, gong, kendang, suling, rebab)


def parse(line, names=None):
    """'2 1 2 6 . 5' -> degrees; '.' is a rest. names maps written numbers to scale steps."""
    out = []
    for c in line.split():
        if c == '.':
            out.append(None)
        else:
            out.append(names[c] if names else int(c))
    return out


def held_notes(beats):
    """Rests keep the previous note sounding for the decorating instruments."""
    last = next((b for b in reversed(beats) if b is not None), 1)
    held = []
    for b in beats:
        last = b if b is not None else last
        held.append(last)
    return held


KENDANG = {
    # position in an 8-beat bar (1-8) -> (stroke, volume); 'h' = also on the half beat
    'walk': {1: ('dhe', 0.5), 3: ('tung', 0.4), 5: ('dhe', 0.45), 7: ('tung', 0.4)},
    'drive': {1: ('dhe', 0.9), 2: ('tak', 0.6), 3: ('tung', 0.6), 4: ('tak', 0.7), 5: ('dhe', 0.9), 6: ('tak', 0.6), 7: ('dhe', 0.7), 8: ('tak', 0.8)},
    'march': {1: ('dhe', 1.0), 2: ('dhe', 0.8), 3: ('tak', 0.9), 5: ('dhe', 1.0), 6: ('dhe', 0.8), 7: ('tak', 0.9), 8: ('tak', 0.6)},
    'none': {},
}


def play(tr, start, line, scale, base, beat, dense='slow', kendang_style='walk',
         layers=('gender', 'peking'), octave=0, gong_hz=46.0, names=None, gain=1.0, suling_up=1):
    """Place one gong cycle. Returns the time it ends."""
    n_scale = len(scale)
    beats = parse(line, names)
    held = held_notes(beats)
    length = len(beats)
    f = lambda d, o=0: note(scale, d + n_scale * (o + octave), base)

    for i, d in enumerate(beats):
        t = start + i * beat
        pos = i + 1
        cur = held[i]
        nxt = held[(i + 1) % length]

        if d is not None:
            tr.add(saron(f(d)), t, pan=-0.3, gain=0.40 * gain)
            tr.add(demung(f(d)), t, pan=0.25, gain=0.30 * gain)
        if pos % 2 == 0:
            tr.add(slenthem(f(cur)), t, gain=0.42 * gain)

        if dense == 'slow':
            tr.add(bonang(f(cur)), t, pan=-0.6, gain=0.19 * gain)
            tr.add(bonang(f(nxt)), t + beat / 2, pan=-0.6, gain=0.15 * gain)
            if 'peking' in layers:
                tr.add(peking(f(nxt)), t + beat / 2, pan=0.55, gain=0.15 * gain)
        else:
            tr.add(bonang(f(nxt)), t + beat / 2, pan=-0.6, gain=0.19 * gain)
            if 'peking' in layers:
                tr.add(peking(f(cur)), t, pan=0.6, gain=0.13 * gain)
                tr.add(peking(f(nxt)), t + beat / 2, pan=0.6, gain=0.11 * gain)

        if 'gender' in layers:
            steps = [0, 1, -1, 0] if dense == 'slow' else [0, 2]
            for k, s in enumerate(steps):
                g = int(np.clip(cur + s, 1, n_scale))
                tr.add(gender(f(g, 1)), t + k * beat / len(steps), pan=0.35, gain=0.07 * gain)

        if pos % 4 == 0:
            tr.add(kenong(f(cur)), t, pan=0.1, gain=0.28 * gain)
        if length >= 16 and pos % 16 in (6, 10, 14):
            tr.add(kempul(f(cur)), t, pan=-0.1, gain=0.32 * gain)
        if pos == length:
            tr.add(gong(gong_hz), t, gain=0.8 * gain)

        k = KENDANG[kendang_style].get((pos - 1) % 8 + 1)
        if k:
            tr.add(kendang(k[0], k[1]), t, gain=0.6 * gain)
        if kendang_style in ('drive', 'march') and pos % 8 == 7:
            for r in range(3):
                tr.add(kendang('ket', 0.5), t + beat * (0.25 + r * 0.25), gain=0.45 * gain)

        if 'suling' in layers and pos % 4 == 2:
            target = held[(i + 2) % length]
            tr.add(suling(f(target, suling_up), beat * 2.6, vibrato=5.0), t + beat * 0.15, pan=0.2, gain=0.18 * gain)
        if 'rebab' in layers and pos % 8 == 5:
            target = held[(i + 3) % length]
            tr.add(rebab(f(target, 1), beat * 3.6), t + 0.1, pan=-0.25, gain=0.2 * gain)

    return start + length * beat
