"""Generate music bed and sound effects with ElevenLabs."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import el

PUB = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
what = sys.argv[1]
if what == "music":
    data, ct = el.call("/v1/music?output_format=mp3_44100_128", {
        "prompt": "Upbeat, warm, modern tech product launch background music. Light plucky synths, soft electric piano, "
                  "gentle four-on-the-floor kick with crisp claps, optimistic and confident, clean and minimal, "
                  "no vocals, steady energy that leaves space for a voiceover, 112 BPM, ends with a clean resolving outro.",
        "music_length_ms": 92000, "force_instrumental": True})
    open(f"{PUB}/music.mp3", "wb").write(data); print("music", ct, len(data))
else:
    SFX = {
        "whoosh": ("Fast clean cinematic whoosh transition, airy swoosh", 0.8),
        "pop": ("Soft bubbly UI pop, friendly notification bubble", 0.5),
        "rewind": ("Short tape rewind effect, quick reverse scrub sweep", 1.2),
        "ding": ("Bright pleasant notification chime, single soft ding", 1.0),
        "tick": ("Clock ticking fast, three quick ticks then soft swoosh", 1.5),
        "stamp": ("Firm rubber stamp hit with slight paper thud, short", 0.5),
        "swish": ("Subtle soft paper swish, card sliding", 0.5),
        "riser": ("Short shimmering uplifting riser into soft impact, modern", 2.0),
    }
    for name, (text, dur) in SFX.items():
        data, _ = el.call("/v1/sound-generation", {"text": text, "duration_seconds": dur, "prompt_influence": 0.6})
        open(f"{PUB}/sfx/{name}.mp3", "wb").write(data); print(name, len(data))
