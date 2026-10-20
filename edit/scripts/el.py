"""Small ElevenLabs helper. Reads the API key from ../../.env (key name: ElevenLabs)."""
import json, os, sys, base64, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def key():
    for line in open(os.path.join(ROOT, ".env")):
        if "=" in line:
            k, v = line.split("=", 1)
            if k.strip().lower() == "elevenlabs":
                return v.strip().strip('"').strip("'")
    sys.exit("No ElevenLabs key in .env")

def call(path, body=None, method=None):
    req = urllib.request.Request("https://api.elevenlabs.io" + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method or ("POST" if body is not None else "GET"),
        headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read(), r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} on {path}: {e.read()[:500].decode(errors='replace')}")
