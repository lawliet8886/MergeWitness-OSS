"""Cut complete spoken sentences from the validated master, retaining provenance."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
from film_timing import chunks,readable_cues,tokens,validate_cues,vtt


def create(film):
    timeline=json.loads((film/'timeline.json').read_text(encoding='utf-8'))
    sentences=timeline['sentences']
    groups=[sentences[:2], [s for s in sentences if s['en'].startswith(('But the combined cache','After Alpha'))], [s for s in sentences if s['en'].startswith('The recorded proposal passes')], [s for s in sentences if s['en'].startswith(('Start with','Or help'))]]
    cuts=[{'start':max(0,g[0]['start']-.06),'end':g[-1]['end']+.1} for g in groups]
    length=sum(c['end']-c['start'] for c in cuts)
    assert length<30 and 30-length<6
    out=film/'teaser';out.mkdir(exist_ok=False)
    for index,cut in enumerate(cuts):
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',str(cut['start']),'-to',str(cut['end']),'-i',str(film/'master-1080p.mp4'),'-vf','scale=1280:720','-c:v','libx264','-threads','2','-preset','veryfast','-crf','23','-c:a','aac','-b:a','128k',str(out/f'part-{index}.mp4')],check=True)
    concat='\n'.join(f"file 'part-{i}.mp4'" for i in range(len(cuts)))+'\n'
    (out/'parts.ffconcat').write_text(concat,encoding='utf-8')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-f','concat','-safe','1','-i',str(out/'parts.ffconcat'),'-vf',f'tpad=stop_mode=clone:stop_duration={30-length}','-af',f'apad=pad_dur={30-length}','-c:v','libx264','-threads','2','-preset','veryfast','-crf','23','-c:a','aac','-b:a','128k','-t','30','-movflags','+faststart',str(film/'teaser-30s.mp4')],check=True)
    for language in ['en','pt']:
        cues=[];offset=0
        for cut in cuts:
            for sentence in sentences:
                if sentence['start']>=cut['start'] and sentence['end']<=cut['end']:
                    parts=chunks(sentence[language]);weights=[len(tokens(text)) for text in parts]
                    cursor=sentence['start']-cut['start']+offset
                    for text,weight in zip(parts,weights):
                        end=cursor+(sentence['end']-sentence['start'])*weight/sum(weights)
                        cues.append({'start':cursor,'end':end,'text':text});cursor=end
            offset+=cut['end']-cut['start']
        cues=readable_cues(cues,30)
        validate_cues(cues,30);(film/f'teaser-{language}.vtt').write_text(vtt(cues),encoding='utf-8')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-xerror','-i',str(film/'teaser-30s.mp4'),'-f','null','-'],check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(film/'teaser-30s.mp4')]))
    assert abs(duration-30)<.1
    receipt={'status':'TECHNICAL_PASS','durationSeconds':duration,'cutsFromValidatedMaster':cuts,'completeSentencesOnly':True,'fullDecode':'PASS','sha256':hashlib.sha256((film/'teaser-30s.mp4').read_bytes()).hexdigest(),'listeningApproval':'PENDING'}
    (film/'teaser-manifest.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8');print(json.dumps(receipt))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--film',type=Path,required=True);a=p.parse_args();create(a.film.resolve())
