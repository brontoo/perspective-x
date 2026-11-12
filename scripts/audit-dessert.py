#!/usr/bin/env python3
"""Validate/import the supplied Dessert media and author-script inventories.
No audio generation or MP4 edits. Originals are retained, WebPs are derivatives.
"""
import argparse,csv,hashlib,json,re,shutil,subprocess,concurrent.futures
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def probe(p):
 j=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True)
 return {'duration':float(j['format']['duration']),'streams':[{k:s[k] for k in ['codec_type','codec_name','sample_rate','channels','width','height'] if k in s} for s in j['streams']]}
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--source',type=Path);ap.add_argument('--scripts',type=Path);args=ap.parse_args()
 archive=ROOT/'production-archive/dessert';archive.mkdir(parents=True,exist_ok=True)
 if args.source:
  for folder in ['PHOTOS','AUDIO']:
   for p in (args.source/folder).rglob('*'):
    if p.is_file() and (folder=='PHOTOS' or p.suffix in ['.csv','.txt']):
     dest=archive/folder/p.relative_to(args.source/folder);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
  for folder,ext,target in [('AUDIO','.mp3','audio/scenarios/ionic_dessert_mystery/cinematic'),('VIDEO','.mp4','videos/scenarios/ionic_dessert_mystery/cinematic')]:
   for p in (args.source/folder).rglob('*'+ext):
    rel=p.relative_to(args.source/folder);dest=ROOT/'public'/target/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 if args.scripts:
  dest=archive/'SCRIPTS';shutil.copytree(args.scripts,dest,dirs_exist_ok=True)
 photos=sorted((archive/'PHOTOS').glob('*.jpg'));mp3=sorted((ROOT/'public/audio/scenarios/ionic_dessert_mystery/cinematic').rglob('*.mp3'));videos=sorted((ROOT/'public/videos/scenarios/ionic_dessert_mystery/cinematic').glob('*.mp4'))
 assert (len(photos),len(mp3),len(videos))==(28,217,6)
 inv=list(csv.DictReader((archive/'AUDIO/audio_manifest.csv').open(encoding='utf-8-sig')))
 authorfile=next((archive/'SCRIPTS').rglob('manifest.csv'))
 author={Path(x['file_name']).stem:x for x in csv.DictReader(authorfile.open(encoding='utf-8-sig'))}
 assert len(inv)==len(author)==217
 media={'images':{},'videos':{},'recordings':{}};audit={'originalCounts':{'images':28,'videos':6,'recordings':217},'inventory':[],'unresolved':[],'sourceScriptMismatches':[],'visualFindings':[
  {'id':'IMAGE_03/V02','finding':'Source labels include FLOUR, inconsistent with the candidate set. The presentation masks the label-bearing foreground; original pixels/video bytes are preserved.'},
  {'id':'IMAGE_15','finding':'Illustrated shell/electron counts are decorative, not scientifically authoritative. The live Na/Cl renderer covers the diagram during this scene.'}]}
 imageout=ROOT/'public/images/scenarios/ionic_dessert_mystery/cinematic';imageout.mkdir(parents=True,exist_ok=True)
 for p in photos:
  key='IMAGE_'+re.search(r'IMAGE_(\d+)',p.name)[1];im=Image.open(p);im.verify();im=Image.open(p).convert('RGB')
  paths={}
  for size,suffix in [(1376,''),(768,'-768')]:
   dest=imageout/(key+suffix+'.webp');image=im.copy();image.thumbnail((size,size));image.save(dest,'WEBP',quality=92,method=6);paths['url' if not suffix else 'smallUrl']='/'+str(dest.relative_to(ROOT/'public'))
  media['images'][key]={**paths,'width':im.width,'height':im.height,'source':str(p.relative_to(ROOT)),'sourceSha256':sha(p),'sha256':sha(ROOT/'public'/paths['url'].lstrip('/'))}
  audit['inventory'].append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'format':'JPEG','size':p.stat().st_size})
 results=dict(zip(mp3+videos,concurrent.futures.ThreadPoolExecutor(4).map(probe,mp3+videos)))
 known={p.name:p for p in mp3};assert len(known)==217
 for row in inv:
  key=Path(row['file_name']).stem;p=known[row['file_name']];a=author[key];script=next((archive/'SCRIPTS').rglob(row['source_script']))
  text=script.read_text(encoding='utf-8-sig').strip()
  assert text==a['text'].strip(),key
  assert row['speaker']==a['speaker'],key
  assert p.parent.name==row['speaker'],key
  media['recordings'][key]={'id':key,'audio':'/'+str(p.relative_to(ROOT/'public')),'speaker':row['speaker'],'text':text,'scene':a['scene'],'chapter':a['chapter'],'direction':a['direction'],'duration':results[p]['duration'],'sha256':sha(p),'sourceScript':str(script.relative_to(ROOT)),'sourceScriptSha256':sha(script),'captionSource':'supplied author TXT and matching manifest.csv'}
  audit['inventory'].append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'format':'MP3',**results[p]})
 for p in videos:
  key=re.match(r'V\d+',p.name)[0];end=imageout/(key+'-end.webp')
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-sseof','-0.08','-i',str(p),'-frames:v','1','-c:v','libwebp','-quality','94',str(end)],check=True)
  media['videos'][key]={'id':key,'url':'/'+str(p.relative_to(ROOT/'public')),'end':'/'+str(end.relative_to(ROOT/'public')),'duration':results[p]['duration'],'embeddedAudio':any(s['codec_type']=='audio' for s in results[p]['streams']),'playbackMuted':True,'sha256':sha(p)}
  audit['inventory'].append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'format':'MP4',**results[p]})
 hashes={}
 for key,x in media['recordings'].items():hashes.setdefault(x['sha256'],[]).append(key)
 audit['duplicateRecordingHashes']=[x for x in hashes.values() if len(x)>1]
 audit['sourceScriptsPresent']=217;audit['captions']='Supplied source scripts, not inferred old dialogue or ASR';audit['inventory'].sort(key=lambda x:x['path'])
 write(ROOT/'src/data/dessertMedia.json',media);write(ROOT/'docs/dessert/asset-audit.json',audit)
 print(json.dumps({'images':28,'videos':6,'recordings':217,'authorScripts':217,'duplicates':audit['duplicateRecordingHashes'],'unresolved':audit['unresolved']}))
if __name__=='__main__':main()
