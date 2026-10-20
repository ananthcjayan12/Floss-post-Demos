"""Walkthrough narration (version 2) with word timings."""
import json, os, sys, base64
sys.path.insert(0, os.path.dirname(__file__))
import el

VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George
OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "wvo")
LINES = [
    "Here's exactly how a dental clinic gets its first branded Instagram carousel from FlossPost. Six simple steps, all inside WhatsApp.",
    "Step one. Open WhatsApp and send FlossPost a message. Just \"Hi\". You'll get a quick welcome. Tap \"Get my free demo\".",
    "Step two. Confirm your name, then type your clinic's name, exactly as you want it to appear on your posts.",
    "Step three. Paste your website link. FlossPost reads it in the background, and picks up your services, locations and opening hours. No website? Just tap \"No website\".",
    "Step four. Send your logo, ideally as a document, so it stays sharp. FlossPost picks your brand colour from it. Keep it, or choose another.",
    "Step five. Choose your language, and confirm the phone number patients should call. Add your opening hours, or skip for now. Then check what it found on your website, and tap \"All correct\".",
    "Step six. Sit back. A few minutes later, your free demo carousel arrives. Five slides, in your colours, with your logo and your real contact details. Plus a ready-made caption. Tap to copy it, and post.",
    "And that's it. From then on, a fresh draft arrives every morning. Approve it in one tap, ask for a change, or skip the day.",
    "Try it with your own clinic. Send \"Hi\" to FlossPost on WhatsApp, and get your free demo carousel in about five minutes.",
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
    open(f"{OUT}/w{i}.mp3", "wb").write(base64.b64decode(j["audio_base64"]))
    a = j["alignment"]
    words, cur, start, prev_e = [], "", None, 0
    for ch, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if ch.isspace():
            if cur: words.append({"w": cur, "s": start, "e": prev_e}); cur = ""
            continue
        if not cur: start = s
        cur += ch; prev_e = e
    if cur: words.append({"w": cur, "s": start, "e": prev_e})
    json.dump(words, open(f"{OUT}/w{i}.json", "w"))
    print(i, f"{words[-1]['e']:.2f}s  ", " ".join(f"{x['w']}@{x['s']:.1f}" for x in words))
