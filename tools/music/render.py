"""Render a song to WAV + MP3.

Usage (from the repo root):
    pip install -r tools/music/requirements.txt
    python3 tools/music/render.py menu          # -> tools/music/out/menu.mp3
    python3 tools/music/render.py kala --install # also copies it into assets/music/

Each song lives in tools/music/songs/<name>.py and has a render() function.
"""

import argparse
import importlib
import os
import shutil
import subprocess
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gamelan import SR  # noqa: E402


def save_wav(path, audio):
    data = (np.clip(audio, -1, 1).T * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('song')
    ap.add_argument('--install', action='store_true', help='copy the MP3 to assets/music/')
    args = ap.parse_args()
    song = importlib.import_module(f'songs.{args.song}')
    audio, seconds = song.render()
    out = os.path.join(HERE, 'out')
    os.makedirs(out, exist_ok=True)
    wav = os.path.join(out, f'{args.song}.wav')
    mp3 = os.path.join(out, f'{args.song}.mp3')
    save_wav(wav, audio)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-b:a', '128k', mp3], check=True)
    peak = 20 * np.log10(np.abs(audio).max() + 1e-9)
    rms = 20 * np.log10(np.sqrt((audio ** 2).mean()) + 1e-9)
    print(f'{args.song}: {seconds:.1f} s loop, peak {peak:.1f} dB, average {rms:.1f} dB -> {mp3}')
    if args.install:
        dest = os.path.join(HERE, '..', '..', 'assets', 'music', f'{args.song}.mp3')
        shutil.copy(mp3, dest)
        print('installed', os.path.normpath(dest))


if __name__ == '__main__':
    main()
