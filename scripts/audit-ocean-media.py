#!/usr/bin/env python3
"""Audit the approved Ocean Dome originals (Python stdlib + ffprobe; no conversion)."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE_COMMIT = "ada72da1ee13730918d8e4a02caadaabe35fedc6"
FOLDERS = [
    "public/images/scenarios/ionic_aquarium_mystery/story",
    "public/images/scenarios/ionic_aquarium_mystery/characters",
    "public/videos/scenarios/ionic_aquarium_mystery",
    "public/audio/scenarios/ionic_aquarium_mystery",
]


def audit(path):
    data = path.read_bytes()
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    )
    info = json.loads(probe.stdout)
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), {})
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), {})
    kind = "audio" if path.suffix == ".mp3" else "video" if path.suffix == ".mp4" else "image"
    actual_type = "JPEG" if data[:3] == b"\xff\xd8\xff" else "MP4" if data[4:8] == b"ftyp" else "MP3" if info["format"]["format_name"] == "mp3" else "unknown"
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "url": "/" + path.relative_to(ROOT / "public").as_posix(),
        "kind": kind, "fileType": actual_type, "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "format": info["format"]["format_name"],
        "width": video.get("width"), "height": video.get("height"),
        "duration": float(info["format"].get("duration", 0)) if kind != "image" else None,
        "videoCodec": video.get("codec_name"), "audioCodec": audio.get("codec_name"),
        "sampleRate": audio.get("sample_rate"), "channels": audio.get("channels"),
        "error": probe.stderr.strip(),
    }


if __name__ == "__main__":
    paths = sorted(p for folder in FOLDERS for p in (ROOT / folder).rglob("*") if p.is_file() and p.suffix.lower() != ".txt")
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        assets = list(pool.map(audit, paths))
    result = ROOT / "docs/ocean-dome/asset-inventory.json"
    result.parent.mkdir(parents=True, exist_ok=True)
    result.write_text(json.dumps({"sourceCommit": SOURCE_COMMIT, "assets": assets}, indent=2) + "\n")
    counts = {kind: sum(asset["kind"] == kind for asset in assets) for kind in ["image", "video", "audio"]}
    print(counts)
    if counts != {"image": 15, "video": 6, "audio": 92} or any(asset["error"] or asset["fileType"] == "unknown" for asset in assets):
        raise SystemExit("Unexpected, missing or unreadable media; inspect the inventory.")
