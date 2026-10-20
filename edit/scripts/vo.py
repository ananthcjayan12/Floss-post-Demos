"""Generate narration clips + word timings with ElevenLabs (George)."""
import json, os, sys, base64
sys.path.insert(0, os.path.dirname(__file__))
import el

VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George - warm British storyteller
OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "vo")
LINES = [
    "Five minutes. That's how long it took to make this carousel for a real dental clinic. On WhatsApp.",
    "Here's how it happened. No app. No login. Just one message: \"Hi.\"",
    "FlossPost asks for your clinic's name, your website, and your logo. That's the whole setup.",
    "It picks your brand colour straight from your logo, and writes in your language. English, or a mix of two.",
    "While you chat, it reads your website and pulls in your locations, services, phone number... even your four-point-nine-star rating from nearly two thousand reviews. You confirm every detail, so nothing is made up.",
    "Then, a few minutes later...",
    "...your carousel arrives. Five slides in your colours, with your logo, your real contact details, and a caption ready to paste. And carousels are Instagram's most engaging format, according to a study of thirty-five million posts.",
    "Every line is checked against approved facts. Risky claims like \"painless\" or \"guaranteed\" are blocked before anything is designed. And nothing goes out until you approve it.",
    "A fresh carousel, post or story every morning, six days a week, from seventy-nine dollars a month. That's about three dollars a post. Want to see your own clinic's version? Send \"Hi\" on WhatsApp, and get your free demo carousel today.",
]
only = {int(a) for a in sys.argv[1:]}
for i, text in enumerate(LINES, 1):
    if only and i not in only:
        continue
    body = {
        "text": text, "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.2, "use_speaker_boost": True},
        "previous_text": LINES[i - 2] if i > 1 else None,
        "next_text": LINES[i] if i < len(LINES) else None,
    }
    data, _ = el.call(f"/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128", body)
    j = json.loads(data)
    open(f"{OUT}/vo{i}.mp3", "wb").write(base64.b64decode(j["audio_base64"]))
    a = j["alignment"]
    # collapse characters into words
    words, cur, start = [], "", None
    for ch, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if ch.isspace():
            if cur: words.append({"w": cur, "s": start, "e": prev_e}); cur = ""
            continue
        if not cur: start = s
        cur += ch; prev_e = e
    if cur: words.append({"w": cur, "s": start, "e": prev_e})
    json.dump(words, open(f"{OUT}/vo{i}.json", "w"))
    print(i, f"{words[-1]['e']:.2f}s", len(words), "words")
