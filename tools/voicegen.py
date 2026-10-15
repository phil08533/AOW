# Generates B.U.R.P. voice clips for one voice pack. Run by the admin app's Script Studio (server.js), or by hand:
#   python3 tools/voicegen.py job.json
# job.json: {"pack": {...settings...}, "out": "dist/voice/<pack>", "lines": [["<hash>", "<text>"], ...], "force": false}
# Engines: "kokoro" (54 built-in voices, two can be blended) and "piper" (100+ free voices, downloaded on first use).
# Effects run after the voice: pitch, robot ring, metal echo, radio, reverb, doubler, bitcrush, volume.
import json, os, sys, tarfile, urllib.request
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, 'voice_models')
KOKORO_URL = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
PIPER_HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/'

def say(*a): print(*a, flush=True)

def fetch(url, dest):
    if os.path.exists(dest): return dest
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    say('DOWNLOAD', url)
    tmp = dest + '.part'
    with urllib.request.urlopen(url) as r, open(tmp, 'wb') as f:
        while True:
            b = r.read(1 << 20)
            if not b: break
            f.write(b)
    os.replace(tmp, dest); return dest

# ---------------- engines ----------------
_kok = None
def kokoro(text, P):
    global _kok
    from kokoro_onnx import Kokoro
    if _kok is None:
        m = fetch(KOKORO_URL + 'kokoro-v1.0.int8.onnx', os.path.join(MODELS, 'kokoro', 'kokoro.onnx'))
        v = fetch(KOKORO_URL + 'voices-v1.0.bin', os.path.join(MODELS, 'kokoro', 'voices.bin'))
        _kok = Kokoro(m, v)
    voice = P.get('voice', 'bm_george'); v2 = P.get('voice2'); mix = float(P.get('mix', 0) or 0)
    style = voice
    if v2 and mix > 0: style = _kok.get_voice_style(voice) * (1 - mix) + _kok.get_voice_style(v2) * mix
    lang = P.get('lang') or ('en-gb' if voice[:1] == 'b' else 'en-us')
    a, sr = _kok.create(text, voice=style, speed=float(P.get('speed', 1.0)), lang=lang)
    return a.astype(np.float64), sr

_pip = {}
def piper_path(key):
    # key like en_GB-alan-medium  ->  en/en_GB/alan/medium/en_GB-alan-medium.onnx
    d = os.path.join(MODELS, 'piper'); onnx = os.path.join(d, key + '.onnx')
    if not os.path.exists(onnx):
        if key.startswith('voice-'):  # the older GitHub release voices
            tgz = fetch('https://github.com/rhasspy/piper/releases/download/v0.0.2/' + key + '.tar.gz', os.path.join(d, key + '.tar.gz'))
            with tarfile.open(tgz) as t:
                for m in t.getmembers():
                    if m.name.endswith('.onnx'): m.name = key + '.onnx'; t.extract(m, d)
                    elif m.name.endswith('.onnx.json'): m.name = key + '.onnx.json'; t.extract(m, d)
        else:
            lang, name, q = key.split('-', 2)[0], key.split('-')[1], key.split('-')[-1]
            base = f'{PIPER_HF}{lang.split("_")[0]}/{lang}/{name}/{q}/{key}'
            fetch(base + '.onnx.json', onnx + '.json'); fetch(base + '.onnx', onnx)
    return onnx
def piper(text, P):
    import wave, io
    from piper import PiperVoice
    key = P.get('voice', 'en_GB-alan-medium')
    if key not in _pip: _pip[key] = PiperVoice.load(piper_path(key))
    v = _pip[key]; buf = io.BytesIO()
    try:
        from piper import SynthesisConfig
        cfg = SynthesisConfig(speaker_id=int(P['speaker']) if P.get('speaker') not in (None, '') else None, length_scale=1.0 / max(0.3, float(P.get('speed', 1.0))))
        with wave.open(buf, 'wb') as w: v.synthesize_wav(text, w, syn_config=cfg)
    except ImportError:
        with wave.open(buf, 'wb') as w: v.synthesize_wav(text, w)
    buf.seek(0)
    with wave.open(buf) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return a, sr

ENGINES = {'kokoro': kokoro, 'piper': piper}

# ---------------- effects ----------------
def resample(a, k):  # k > 1 = higher and shorter
    if abs(k - 1) < 1e-3: return a
    n = max(1, int(len(a) / k)); return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a)
def biquad_band(a, sr, lo, hi):
    f = np.fft.rfft(a); fr = np.fft.rfftfreq(len(a), 1 / sr); f[(fr < lo) | (fr > hi)] *= 0.05; return np.fft.irfft(f, len(a))
def effects(a, sr, F):
    F = F or {}
    p = float(F.get('pitch', 0) or 0)
    if p: a = resample(a, 2 ** (p / 12))
    ring = float(F.get('ring', 0) or 0)
    if ring:
        t = np.arange(len(a)) / sr; a = a * ((1 - ring) + ring * np.sin(2 * np.pi * float(F.get('ringHz', 52)) * t))
    echo = float(F.get('echo', 0) or 0)
    if echo:
        out = a.copy()
        for d, g in [(0.009, 0.45), (0.017, 0.3), (0.026, 0.18)]:
            k = int(d * sr); out[k:] += a[:-k] * g * echo
        a = out
    dbl = float(F.get('doubler', 0) or 0)
    if dbl:
        k = int(0.022 * sr); b = resample(a, 1.006); b = np.pad(b, (k, 0))[:len(a)]; b = np.pad(b, (0, len(a) - len(b)))
        a = a + b * dbl * 0.7
    radio = float(F.get('radio', 0) or 0)
    if radio:
        b = biquad_band(a, sr, 320, 3200); b = np.tanh(b * (1 + radio * 4)) / np.tanh(1 + radio * 4); a = a * (1 - radio) + b * radio
    rev = float(F.get('reverb', 0) or 0)
    if rev:
        out = np.pad(a, (0, int(sr * 0.6)))
        for d, g in [(0.043, 0.5), (0.067, 0.42), (0.097, 0.35), (0.131, 0.28), (0.173, 0.22), (0.229, 0.16), (0.307, 0.11)]:
            k = int(d * sr); out[k:k + len(a)] += a * g * rev
        a = out
    bits = int(F.get('crush', 0) or 0)
    if bits:
        q = 2 ** max(2, bits); m = max(1e-6, np.abs(a).max()); a = np.round(a / m * q) / q * m
    m = max(1e-6, np.abs(a).max()); return np.clip(a / m * 0.85 * float(F.get('volume', 1.0) or 1.0), -1, 1)

def mp3(a, sr, path, kbps=40):
    import lameenc
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16)
    enc = lameenc.Encoder(); enc.set_bit_rate(int(kbps)); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(5)
    tmp = path + '.part'; open(tmp, 'wb').write(enc.encode(pcm.tobytes()) + enc.flush()); os.replace(tmp, path)

def main():
    job = json.load(open(sys.argv[1], encoding='utf-8'))
    P = job['pack']; out = job['out']; os.makedirs(out, exist_ok=True)
    eng = ENGINES[P.get('engine', 'kokoro')]
    lines = job['lines']; n = len(lines); made = 0
    say('PROGRESS', 0, n)
    for i, (h, text) in enumerate(lines):
        path = os.path.join(out, h + '.mp3')
        if job.get('force') or not os.path.exists(path):
            spoken = text.replace('B.U.R.P.', 'Burp')
            for a_, b_ in (P.get('say_as') or {}).items(): spoken = spoken.replace(a_, b_)
            a, sr = eng(spoken, P); mp3(effects(a, sr, P.get('fx') or P), sr, path, P.get('kbps', 40)); made += 1
        say('PROGRESS', i + 1, n)
    say('DONE', made)

if __name__ == '__main__':
    try: main()
    except Exception as e:
        say('ERROR', repr(e)); sys.exit(1)
