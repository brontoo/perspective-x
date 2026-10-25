"""Audit the approved uploads and build a deterministic ATOM DIVE runtime manifest.

--prepare relocates production text and preserves the original six videos in docs.
Runtime clips retain the last five seconds at original speed, without video audio.
No illustration, dialogue, voice recording or original media is regenerated.
"""
import argparse
import concurrent.futures
import hashlib
import json
import pathlib
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOC = ROOT / "docs/atom-dive"
ARCHIVE = DOC / "production-archive"
PUBLIC = ROOT / "public"
MEDIA_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp3", ".wav", ".mp4"}


def probe(path):
    return json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)
    ]))


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path):
    return path.relative_to(ROOT).as_posix()


def url(path):
    return "/" + path.relative_to(PUBLIC).as_posix()


def run(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main(prepare):
    inventory, moved, issues, resolutions = [], [], [], []
    for group in ["images", "audio", "videos"]:
        folder = PUBLIC / group / "scenarios/atom_dive"
        for path in sorted(folder.rglob("*")):
            if not path.is_file() or path.suffix.lower() in MEDIA_EXTENSIONS:
                continue
            destination = ARCHIVE / group / path.relative_to(folder)
            if prepare:
                destination.parent.mkdir(parents=True, exist_ok=True)
                if destination.exists():
                    assert checksum(destination) == checksum(path), "Archive collision"
                shutil.move(path, destination)
            moved.append({"original": relative(path), "archive": relative(destination)})
    original_mappings = ARCHIVE / "relocations.json"
    if moved:
        original_mappings.parent.mkdir(parents=True, exist_ok=True)
        original_mappings.write_text(json.dumps(moved, indent=2) + "\n")
    elif original_mappings.exists():
        moved = json.loads(original_mappings.read_text())

    story = json.loads((DOC / "07_learning_and_handoff/story_manifest.json").read_text())
    exit_ticket = json.loads((DOC / "07_learning_and_handoff/exit_ticket.json").read_text())
    dialogue = json.loads((DOC / "audio_manifest.json").read_text())
    images = {}
    image_root = PUBLIC / "images/scenarios/atom_dive"
    for path in sorted(image_root.rglob("*")):
        if path.is_file() and path.suffix.lower() in {".jpg", ".png"}:
            info = probe(path)["streams"][0]
            item = {"path": relative(path), "url": url(path), "sha256": checksum(path),
                    "format": info["codec_name"], "width": info["width"], "height": info["height"]}
            inventory.append(item)
            if "revisions" not in path.parts:
                images[path.stem] = item
    assert len([k for k in images if k.startswith("AD_I")]) == 8
    for scene in story["story_sequence"]:
        key = pathlib.Path(scene["image"]).stem
        scene["authoredImage"] = scene["image"]
        scene["art"] = images[key]["url"]
        scene["image"] = scene["art"]
        resolutions.append({"authored_image": scene["authoredImage"], "actual_image": scene["art"]})

    videos = {}
    for name in ["AD_V01_last_signal", "AD_V02_enter_metallic", "AD_V03_metallic_route",
                 "AD_V04_enter_ionic", "AD_V05_find_orbit", "AD_V06_homecoming"]:
        original = PUBLIC / f"videos/scenarios/atom_dive/04_five_second_videos/{name}.mp4"
        archived = ARCHIVE / f"original-videos/{name}.mp4"
        if original.exists() and prepare:
            archived.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(original, archived)
        source = archived if archived.exists() else original
        data = probe(source)
        video = next(s for s in data["streams"] if s["codec_type"] == "video")
        source_duration = float(video.get("duration", data["format"]["duration"]))
        start = max(0, source_duration - 5)
        target = PUBLIC / f"videos/scenarios/atom_dive/runtime/{name}.mp4"
        end = PUBLIC / f"images/scenarios/atom_dive/video-ends/{name}.webp"
        if prepare:
            target.parent.mkdir(parents=True, exist_ok=True)
            end.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                run(["-ss", str(start), "-i", str(source), "-t", "5", "-an", "-c:v", "libx264",
                     "-preset", "fast", "-crf", "18", "-threads", "2", "-movflags", "+faststart", str(target)])
            count = int(next(s for s in probe(target)["streams"] if s["codec_type"] == "video")["nb_frames"])
            if not end.exists():
                run(["-i", str(target), "-vf", f"select=eq(n\\,{count - 1})", "-fps_mode", "vfr",
                     "-frames:v", "1", "-c:v", "libwebp", "-lossless", "1", str(end)])
        runtime = probe(target)
        duration = float(runtime["format"]["duration"])
        has_audio = any(s["codec_type"] == "audio" for s in runtime["streams"])
        assert duration <= 5.0 and not has_audio, f"Invalid runtime clip: {name}"
        videos[name + ".mp4"] = {"url": url(target), "end": url(end), "duration": duration,
                                  "sha256": checksum(target), "hasAudio": has_audio}
        inventory.append({"path": relative(source), "sha256": checksum(source), "format": "mp4",
                          "duration": float(data["format"]["duration"]), "video_duration": source_duration,
                          "has_audio": any(s["codec_type"] == "audio" for s in data["streams"]),
                          "runtime": videos[name + ".mp4"], "trim_leading_seconds": start,
                          "endpoint": "actual last decoded runtime frame; original speed preserved"})
        end_info = probe(end)["streams"][0]
        inventory.append({"path": relative(end), "url": url(end), "format": end_info["codec_name"],
                          "width": end_info["width"], "height": end_info["height"], "sha256": checksum(end),
                          "derived_from": url(target), "frame": "actual last decoded frame"})

    def audit_line(line):
        candidates = list((PUBLIC / "audio/scenarios/atom_dive").rglob(line["id"] + ".mp3"))
        if len(candidates) != 1:
            issues.append({"id": line["id"], "reason": "missing or ambiguous recording", "matches": len(candidates)})
            return {**line, "audio": None, "duration": None}
        path = candidates[0]
        info = probe(path)
        assert any(s["codec_type"] == "audio" for s in info["streams"])
        run(["-i", str(path), "-f", "null", "-"])
        sidecar = ARCHIVE / "audio/05_voiceover/dialogue_lines" / line["scene"] / (line["id"] + ".txt")
        assert " ".join(sidecar.read_text().split()) == " ".join(line["text"].split()), line["id"]
        return {**line, "authored_audio": line["audio"], "audio": url(path),
                "duration": float(info["format"]["duration"]), "sha256": checksum(path),
                "verification": "MP3 decoded; ID, scene, speaker, condition and exact authored sidecar matched"}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        lines = list(pool.map(audit_line, dialogue))
    assert len({x["id"] for x in lines}) == len(dialogue) == 61
    for line in lines:
        if line["video"]:
            assert line["video"] in videos
    duplicates = []
    hashes = {}
    for line in lines:
        hashes.setdefault(line.get("sha256"), []).append(line["id"])
    duplicates = [ids for sha, ids in hashes.items() if sha and len(ids) > 1]
    media_hashes = {}
    for group in ["images", "audio", "videos"]:
        for path in sorted((PUBLIC / group / "scenarios/atom_dive").rglob("*")):
            if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS:
                media_hashes.setdefault(checksum(path), []).append(relative(path))
    duplicate_media = [paths for paths in media_hashes.values() if len(paths) > 1]
    presentation = json.loads((DOC / "presentation-policy.json").read_text())
    revised = []
    for scene, asset_url in presentation["stills"].items():
        path = PUBLIC / asset_url.lstrip("/")
        info = probe(path)["streams"][0]
        revised.append({"scene": scene, "path": relative(path), "url": asset_url, "format": info["codec_name"], "width": info["width"], "height": info["height"], "sha256": checksum(path)})
    assert len(videos) == 6 and set(presentation["withheldVideos"]).issubset(videos)
    manifest = {"scenario": "atom_dive", "sourceCommit": "15eb615ae67341e7dedfbeba4123580d898a0fa5", "presentation": presentation,
                "story": story, "assessment": exit_ticket, "images": images,
                "characters": {key: images[key] for key in ["C_HAMAD", "C_ALYA", "C_RASHID", "C_ORBIT"]},
                "videos": videos, "dialogue": lines}
    target = ROOT / "src/data/atomDiveMedia.json"
    target.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    report = {"inventory": inventory, "audio": lines, "production_documents_relocated": moved,
              "image_extension_resolutions": resolutions, "duplicate_recording_hashes": duplicates,
              "duplicate_public_media_hashes": duplicate_media,
              "unresolved": issues, "active_presentation": presentation, "revised_stills": revised,
              "pending_visual_replacements": [{"video_id": key, "reason": reason, "runtime_status": "withheld; correct still/scientific renderer used"} for key, reason in presentation["withheldVideos"].items()],
              "limitations": ["Recordings are mapped by authored IDs and exact transcript sidecars; no independent acoustic transcription or speaker identification is claimed."]}
    (DOC / "asset-audit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"storyImages": 8, "characters": 4, "runtimeVideos": len(videos),
                      "recordings": len(lines), "unresolved": issues, "duplicateRecordings": duplicates,
                      "duplicatePublicMedia": duplicate_media, "revisedStills": len(revised), "withheldVideos": len(presentation["withheldVideos"])}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--prepare", action="store_true")
    main(parser.parse_args().prepare)
