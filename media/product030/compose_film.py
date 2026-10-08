"""Compose a narrated, evidence-bound motion film; never invent provider footage."""
import argparse
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import subprocess
import wave

from PIL import Image, ImageDraw, ImageFont

from film_timing import align_words, chunks, readable_cues, sentences, tokens, validate_cues, vtt
from prepare_review import validate_run_inputs

ROOT=Path(__file__).resolve().parents[2]
W,H,FPS=1920,1080,30
FOREST,CREAM,LIME,RUST,LINE='#16382b','#f6f5ed','#d8eea0','#af432d','#c8cfc2'


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def load(path):return json.loads(path.read_text(encoding='utf-8'))
def put(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


@lru_cache(maxsize=64)
def font(size,bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',size)


def ease(value):
    value=max(0,min(1,value));return value*value*(3-2*value)


def label(draw,xy,text,size=56,color=FOREST,bold=False,max_width=1744):
    while draw.textbbox((0,0),text,font=font(size,bold))[2]>max_width:
        size-=1
        if size<30:raise ValueError('Rewrite text instead of making it unreadable.')
    draw.text(xy,text,font=font(size,bold),fill=color)


def card(draw,box,title,value,fill=FOREST):
    x,y,right,bottom=box
    draw.rounded_rectangle(box,radius=18,fill=fill)
    label(draw,(x+28,y+28),title,54,CREAM,True,max_width=right-x-56)
    label(draw,(x+28,y+112),value,116,CREAM,True,max_width=right-x-56)


def arrow(draw,start,end,color,width=5,amount=1):
    x,y=start;ex,ey=end
    tx=x+(ex-x)*amount;ty=y+(ey-y)*amount
    draw.line((x,y,tx,ty),fill=color,width=width)
    if amount>.99:
        draw.line((tx-15,ty-12,tx,ty,tx-15,ty+12),fill=color,width=width)


def render_frame(scene,t,duration):
    light=scene in (1,3,4)
    bg,fg=(CREAM,FOREST) if light else (FOREST,CREAM)
    image=Image.new('RGB',(W,H),bg);draw=ImageDraw.Draw(image)
    label(draw,(88,58),'MergeWitness',42,fg,True)
    label(draw,(1470,68),f'0.3.0 / {scene+1:02}',28,fg,max_width=350)
    draw.line((88,996,1832,996),fill=fg,width=2)
    label(draw,(88,1014),'RECORDED SYNTHETIC EXAMPLE / DECLARED CHECKS',24,fg)
    draw.rectangle((88,973,88+int(1744*min(1,t/max(1,duration))),978),fill=LIME if not light else FOREST)
    if scene==0:
        label(draw,(88,186),'Two changes pass their tests.',100,fg,True)
        label(draw,(88,306),'Then they meet.',100,LIME,True)
        phase=ease(t/2)
        card(draw,(90,520,550,805),'TENANT PRICING','PASS')
        card(draw,(690,520,1150,805),'PRODUCT CACHE','PASS')
        arrow(draw,(560,650),(680,650),LIME,amount=phase)
        arrow(draw,(1160,650),(1280,650),LIME,amount=ease((t-1)/2))
        card(draw,(1300,520,1830,805),'COMBINED','90 ≠ 100',RUST)
        label(draw,(92,874),'A clean merge can hide an interaction.',52,fg)
    elif scene==1:
        label(draw,(88,186),'Replay. Check. Inspect.',110,fg,True)
        label(draw,(88,322),'Local execution. Evidence you can read.',58,fg)
        for index,(title,detail) in enumerate([('REPLAY','Git revisions'),('VERIFY','Required features'),('INSPECT','Offline report')]):
            x=90+index*590
            active=ease((t-index*.8)/1.1)
            draw.rounded_rectangle((x,505,x+550,805),radius=18,fill=FOREST if active>.5 else LINE)
            label(draw,(x+30,550),title,68,CREAM,True,max_width=490)
            label(draw,(x+30,695),detail,48,CREAM,max_width=490)
        label(draw,(92,875),'MIT / Node 22+ / trusted, reviewed code',52,fg)
    elif scene==2:
        label(draw,(88,185),'Same SKU. Different tenants.',100,fg,True)
        cycle=t%7
        label(draw,(88,322),'Alpha → shared cache → Beta',70,fg)
        card(draw,(90,480,560,765),'ALPHA','90')
        draw.rounded_rectangle((695,465,1190,770),radius=18,outline=LINE,width=3)
        label(draw,(725,505),'CACHE KEY',48,fg,True)
        label(draw,(725,590),'notebook',72,LIME,True,max_width=430)
        label(draw,(725,687),'stores 90',48,fg)
        arrow(draw,(575,625),(680,625),LIME,amount=ease(cycle/1.4))
        arrow(draw,(1205,625),(1300,625),LIME,amount=ease((cycle-1.4)/1.4))
        card(draw,(1320,480,1830,765),'SHARED BETA','90',RUST)
        label(draw,(92,868),'Fresh Beta: 100. Shared Beta: 90.',64,fg)
        label(draw,(92,400),'Ordinary tests: PASS / frozen sequence: FAIL',42,fg)
    elif scene==3:
        label(draw,(88,186),'A proposal. Then local checks.',96,fg,True)
        label(draw,(88,316),'User-forwarded Claude web response',57,fg)
        draw.rounded_rectangle((88,465,1832,635),radius=18,fill=FOREST)
        label(draw,(126,508),'const key = JSON.stringify([tenant, sku]);',65,CREAM,True,max_width=1668)
        steps=['USER','REVIEW','LOCAL VERIFY']
        for index,title in enumerate(steps):
            x=90+index*590
            draw.rounded_rectangle((x,716,x+550,845),radius=16,outline=FOREST,width=3)
            label(draw,(x+28,748),title,57,FOREST,True,max_width=494)
        label(draw,(92,892),'Applied unchanged. Provider identity reported by user.',38,fg)
    elif scene==4:
        label(draw,(88,186),'Fix the symptom. Keep the features.',88,fg,True)
        for side,(title,states,colour) in enumerate([('REMOVE CACHE',['PASS','PASS','FAIL'],RUST),('RECORDED PROPOSAL',['PASS','PASS','PASS'],FOREST)]):
            x=90+side*910
            draw.rounded_rectangle((x,415,x+830,848),radius=18,outline=colour,width=4)
            label(draw,(x+28,448),title,53,colour,True,max_width=774)
            for index,(requirement,state) in enumerate(zip(['Sequence','Tenant pricing','Cache'],states)):
                y=550+index*83
                label(draw,(x+30,y),requirement,53,FOREST,max_width=480)
                if t>index*.55:
                    label(draw,(x+590,y),state,53,RUST if state=='FAIL' else FOREST,True,max_width=215)
        label(draw,(92,886),'Fresh analysis: PASS / same recorded code',52,fg,True)
        label(draw,(92,330),'Cache-loss control: REJECTED',47,RUST,True)
    elif scene==5:
        label(draw,(88,186),'Evidence for the checks you declared.',88,fg,True)
        for index,line in enumerate(['Declared inputs.','Trusted source.','Your merge decision.']):
            y=450+index*140
            draw.ellipse((95,y+15,125,y+45),fill=LIME)
            label(draw,(167,y),line,88,fg,True)
    else:
        label(draw,(88,184),'Replay the sequence.',108,fg,True)
        label(draw,(88,314),'Read the evidence.',108,LIME,True)
        label(draw,(88,445),'Keep what matters.',108,fg,True)
        draw.rounded_rectangle((88,652,1832,885),radius=18,fill=LIME)
        label(draw,(128,690),'Try the example. Help test one real Node case.',66,FOREST,True,max_width=1664)
        label(draw,(128,803),'gabriel@mergewitness.com.br',56,FOREST,max_width=1664)
    return image


def compose(voice,run,draft,out):
    out=out.resolve()
    if not out.is_relative_to(ROOT/'artifacts') or out.exists():raise ValueError('Use a new ignored output directory in this checkout.')
    manifest=load(draft/'draft-manifest.json')
    evaluation,negative,repair,replay,origin=validate_run_inputs(run,manifest)
    assert repair['passed'] and repair['retentionVerified'] and replay['passed']
    assert evaluation['probe']['matrix']['merged']['kind']=='fail' and not negative['passed']
    observed=evaluation['probe']['matrix']['merged']['runs'][0]['probe']['payload']['evidence']
    assert observed['observed']==90 and observed['expected']==100
    assert negative['probe']['kind']=='pass'
    assert {r['id']:r['result']['kind'] for r in negative['requirementResults']}=={'tenant-pricing':'pass','sku-cache':'fail'}
    assert 'JSON.stringify([tenant, sku])' in (run/'model-catalog.js').read_text(encoding='utf-8')
    script=load(voice/'narration-sections.json');sections=script['sections']
    asr=load(voice/'narration-asr-base.json')
    alignment=align_words([s['en'] for s in sections],[w for s in asr['segments'] for w in s['words']])
    with wave.open(str(voice/'knox-narration-master.wav'),'rb') as wav:
        assert(wav.getnchannels(),wav.getsampwidth(),wav.getframerate())==(1,2,48000)
        rate=wav.getframerate();pcm=wav.readframes(wav.getnframes());source_duration=len(pcm)/(rate*2)
    words=alignment['words'];boundaries=[0]
    for i in range(1,len(sections)):
        left=max(w['end'] for w in words if w['section']==i-1)
        right=min(w['start'] for w in words if w['section']==i)
        boundaries.append((left+right)/2)
    boundaries.append(source_duration)
    lead,tail,total=1.5,2.5,120
    gap=(total-source_duration-lead-tail)/(len(sections)-1)
    assert gap>0 and gap<5
    schedule=[{'id':s['id'],'sourceStart':boundaries[i],'sourceEnd':boundaries[i+1],
               'start':boundaries[i]+lead+i*gap,'end':boundaries[i+1]+lead+i*gap} for i,s in enumerate(sections)]
    out.mkdir(parents=True)
    audio=bytearray(round(lead*rate)*2)
    previous=0
    for i in range(len(sections)):
        end=round(boundaries[i+1]*rate)*2
        audio.extend(pcm[previous:end]);previous=end
        if i<len(sections)-1:audio.extend(bytes(round(gap*rate)*2))
    audio.extend(bytes(total*rate*2-len(audio)))
    with wave.open(str(out/'narration-timed.wav'),'wb') as wav:
        wav.setparams((1,2,rate,0,'NONE','not compressed'));wav.writeframes(audio)
    cues={'en':[],'pt':[]};sentence_records=[]
    for section_index,section in enumerate(sections):
        section_words=[w for w in words if w['section']==section_index]
        en,pt=sentences(section['en']),sentences(section['pt']);assert len(en)==len(pt)
        position=0;offset=lead+section_index*gap
        for english,portuguese in zip(en,pt):
            count=len(tokens(english));matched=section_words[position:position+count];position+=count
            begin,end=matched[0]['start']+offset,matched[-1]['end']+offset
            if end<=begin:end=begin+.1
            sentence_records.append({'section':section_index,'en':english,'pt':portuguese,'start':begin,'end':end})
            for lang,text in [('en',english),('pt',portuguese)]:
                parts=chunks(text);weights=[len(tokens(p)) for p in parts];cursor=begin
                for part,weight in zip(parts,weights):
                    finish=cursor+(end-begin)*weight/sum(weights)
                    cues[lang].append({'start':cursor,'end':finish,'text':part});cursor=finish
        assert position==len(section_words)
    for lang in cues:
        cues[lang]=readable_cues(cues[lang],total)
        validate_cues(cues[lang],total);(out/f'captions-{lang}.vtt').write_text(vtt(cues[lang]),encoding='utf-8')
        (out/f'transcript-{lang}.txt').write_text('\n\n'.join(s[lang] for s in sections)+'\n',encoding='utf-8')
    put(out/'timeline.json',{'duration':total,'originalVoiceDuration':source_duration,'lead':lead,'gap':gap,'tail':tail,'sections':schedule,'sentences':sentence_records,'wordMatchRatio':alignment['matchRatio'],'ASRAmbiguities':alignment['unmatchedTokens']})
    put(out/'caption-cues.json',cues)
    # Keep samples before the long render so composition can be inspected.
    starts=[0]+[(schedule[i-1]['end']+schedule[i]['start'])/2 for i in range(1,len(schedule))]
    ends=starts[1:]+[total]
    for i,(start,end) in enumerate(zip(starts,ends)):
        render_frame(i,(end-start)*.6,end-start).save(out/f'scene-{i+1:02}.png')
    render_frame(0,4,ends[0]).save(out/'poster.png')
    process=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-n','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','picture-master.mp4'],cwd=out,stdin=subprocess.PIPE)
    try:
        index=0
        for frame_number in range(total*FPS):
            moment=frame_number/FPS
            while index<len(ends)-1 and moment>=ends[index]:index+=1
            image=render_frame(index,moment-starts[index],ends[index]-starts[index])
            transition=.45
            if index>0 and moment-starts[index]<transition:
                previous=render_frame(index-1,ends[index-1]-starts[index-1],ends[index-1]-starts[index-1])
                image=Image.blend(previous,image,ease((moment-starts[index])/transition))
            process.stdin.write(image.tobytes())
            if frame_number%(20*FPS)==0:print(f'Rendered {moment:.0f}/{total}s',flush=True)
    finally:process.stdin.close()
    assert process.wait()==0
    for name,video_args in [('master-1080p.mp4',['-c:v','copy']),('web-720p.mp4',['-vf','scale=1280:720','-c:v','libx264','-threads','2','-preset','veryfast','-crf','23'])]:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-n','-i',str(out/'picture-master.mp4'),'-i',str(out/'narration-timed.wav'),*video_args,'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-c:a','aac','-b:a','128k','-ar','48000','-t','120','-movflags','+faststart',str(out/name)],check=True)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-xerror','-i',str(out/name),'-f','null','-'],check=True)
        probe=load_probe(out/name);assert abs(float(probe['format']['duration'])-total)<.05
        assert {s['codec_type'] for s in probe['streams']}=={'video','audio'}
    receipt={'status':'NARRATED_FILM_CANDIDATE','durationSeconds':total,'voice':'Knox / Google Vids stock voice','originalVoiceSeconds':source_duration,'fullDecode':'PASS','captions':{lang:len(cues[lang]) for lang in cues},'wordMatchRatio':alignment['matchRatio'],'unmatchedASRWords':alignment['unmatchedTokens'],'humanListeningApproval':'PENDING','independentBrowserPlayback':'PENDING','finalFilmReady':False,'inputs':{name:sha(path) for name,path in {'voiceMP4':voice/'knox-narration-original.mp4','voiceWAV':voice/'knox-narration-master.wav','script':voice/'narration-sections.json','localASR':voice/'narration-asr-base.json','evaluation':run/'evaluation.json','negative':run/'negative.json','repair':run/'repair.json','replay':run/'replay-repair.json','providerSource':run/'provider-source.json'}.items()},'outputs':{name:sha(out/name) for name in ['master-1080p.mp4','web-720p.mp4','poster.png','captions-en.vtt','captions-pt.vtt','timeline.json']},'claims':'Animated diagrams of actual synthetic observations; user-forwarded provider origin; no captured provider chat or fabricated terminal.'}
    put(out/'film-manifest.json',receipt);print(json.dumps({k:v for k,v in receipt.items() if k not in ('inputs','outputs')},indent=2))


def load_probe(path):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    for name in ('voice','run','draft','out'):parser.add_argument('--'+name,type=Path,required=True)
    args=parser.parse_args();compose(args.voice.resolve(),args.run.resolve(),args.draft.resolve(),args.out)
