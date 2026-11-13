#!/usr/bin/env python3
"""Verify the author-approved editorial partition and time real decoded MP3 routes."""
import argparse
import csv
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'production-archive/dessert/EDITORIAL'

def read(name):
    return list(csv.DictReader((SOURCE / name).open(encoding='utf-8-sig')))

def write(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--presentation', action='store_true', help='Write the concise-results runtime audit separately from the historical editorial audit.')
    args = parser.parse_args()
    approved = json.loads((ROOT / 'src/data/dessertEditorial.json').read_text())
    media = json.loads((ROOT / 'src/data/dessertMedia.json').read_text())
    keep = read('Dessert_Shortened_Manifest.csv')
    cut = read('Dessert_Cut_List.csv')
    full = read('Dessert_Full_Editorial_Audit.csv')
    key = lambda row: Path(row['file_name']).stem
    assert [key(r) for r in keep] == approved['keep']
    assert [key(r) for r in cut] == approved['cut']
    assert (len(keep), len(cut), len(full)) == (100, 117, 217)
    assert len(set(approved['keep'] + approved['cut'])) == 217
    assert set(approved['keep'] + approved['cut']) == set(media['recordings'])
    for name, expected in approved['sourceHashes'].items():
        assert hashlib.sha256((SOURCE / name).read_bytes()).hexdigest() == expected
    inventory = []
    for row in full:
        identity = key(row)
        recording = media['recordings'][identity]
        assert row['text'] == recording['text']
        assert row['speaker'] == recording['speaker']
        status = 'KEEP' if identity in approved['keep'] else 'CUT'
        assert row['status'] == status
        path = ROOT / 'public' / recording['audio'].lstrip('/')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == recording['sha256']
        inventory.append({'id': identity, 'status': status, 'audio': recording['audio'], 'sha256': recording['sha256'], 'duration': recording['duration']})
    code = r'''
import { dessertCheckpoint, dessertReady, dessertAct } from './tests/support/dessert-checkpoints.mjs';
import { DESSERT_MEDIA, DESSERT_NODES, dessertAudioRoutes } from './src/data/dessertFlow.mjs';
const routes = ['A','B','C','D'].map(ending => {
 const state=dessertReady(dessertAct(dessertCheckpoint('assessment',ending),'assess'));
 const recordings=state.visited.map(row=>DESSERT_MEDIA.recordings[row.id]);
 const movies=state.visited.flatMap(row=>{const n=DESSERT_NODES[row.node];return n.video&&row.id===n.videoAt?[{id:n.video,seconds:DESSERT_MEDIA.videos[n.video].duration,overlappingSpeechSeconds:DESSERT_MEDIA.recordings[row.id].duration}]:[]});
 return {ending,consequence:state.decision.consequence,spokenClipOccurrences:recordings.length,recordedSpeechSeconds:recordings.reduce((n,r)=>n+r.duration,0),clipIds:recordings.map(r=>r.id),videos:movies,videoSeconds:movies.reduce((n,r)=>n+r.seconds,0),additionalVideoHoldSeconds:movies.reduce((n,r)=>n+Math.max(0,r.seconds-r.overlappingSpeechSeconds),0),mandatoryFixedTransitionSeconds:0,studentInteractionSeconds:null};
});
console.log(JSON.stringify({routes,audioRoutes:dessertAudioRoutes(),nodes:Object.entries(DESSERT_NODES).map(([id,n])=>({id,...n}))}));
'''
    result = json.loads(subprocess.check_output(['node', '--input-type=module'], input=code.encode(), cwd=ROOT))
    assert set(result['audioRoutes']) == set(approved['keep'])
    baseline = json.loads((ROOT / 'docs/dessert/editorial/baseline-runtime.json').read_text())
    for route in result['routes']:
        assert len([r for r in route['clipIds'] if r.startswith('CH04_END_')]) == 4
        assert all(r in approved['keep'] for r in route['clipIds'])
        before = next(r for r in baseline['routes'] if r['ending'] == route['ending'])['recordedSpeechSeconds']
        route.update(baselineRecordedSpeechSeconds=before, savedSpeechSeconds=before-route['recordedSpeechSeconds'], savedSpeechPercent=100*(before-route['recordedSpeechSeconds'])/before)
    report = {'edition': approved['edition'], 'keep': 100, 'cut': 117, 'originalRecordings': 217, 'captionMismatches': [], 'extraRetainedClips': [], 'sourceMediaChanged': False, 'scene21Active': False, 'inventory': inventory, 'routes': result['routes'], 'notes': ['Duration sums use existing decoded MP3 metadata at 1x. No optional wrong-choice retries, option narration or answer replay in these representative routes.', 'All five questions answered correctly; professional outcome is independent of scientific assessment.', 'Video runs concurrently with speech. Extra hold is max(video minus its simultaneous narration, 0), not the sum of video and speech.', 'No fixed cinematic transition timer was added; interaction time remains self-paced.', 'The authored 19:05 baseline excludes repeated UI notifications present in the implemented 20:14 successful route.', 'The retained calibration correction is played after the actual control measurement; the 100-clip selection is unchanged.']}
    if args.presentation:
        report['presentation'] = 'Direct results; graded explanations and completion messages are optional explicit review only.'
    destination = 'docs/dessert/presentation/runtime-audit.json' if args.presentation else 'docs/dessert/editorial/editorial-audit.json'
    write(ROOT / destination, report)
    write(ROOT / 'docs/dessert/audio-routes.json', {i: {'speaker': media['recordings'][i]['speaker'], 'caption': media['recordings'][i]['text'], 'audio': media['recordings'][i]['audio'], 'routes': r} for i, r in sorted(result['audioRoutes'].items())})
    write(ROOT / 'docs/dessert/scene-map.json', result['nodes'])
    print(json.dumps({'keep': 100, 'cut': 117, 'routes': [{k: v for k, v in r.items() if k not in ['clipIds', 'videos']} for r in result['routes']]}, indent=2))

if __name__ == '__main__':
    main()
