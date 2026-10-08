"""Align known narration with fallible local ASR, never unrelated speech."""
from difflib import SequenceMatcher
import re
import textwrap
import math


def tokens(text):
    text=re.sub(r'\b100\b','one hundred',text.lower())
    text=re.sub(r'\b90\b','ninety',text)
    return re.findall(r'[a-z0-9]+',text)


def align_words(section_texts, recognized):
    desired=[]
    for section,text in enumerate(section_texts):
        desired.extend({'token':word,'section':section} for word in tokens(text))
    observed=[]
    for word in recognized:
        parts=tokens(word['word'])
        for index,part in enumerate(parts):
            span=(word['end']-word['start'])/len(parts)
            observed.append({'token':part,'start':word['start']+index*span,'end':word['start']+(index+1)*span})
    matcher=SequenceMatcher(None,[w['token'] for w in desired],[w['token'] for w in observed],autojunk=False)
    mapping={i+k:j+k for i,j,n in matcher.get_matching_blocks() for k in range(n)}
    ratio=len(mapping)/max(1,len(desired))
    if ratio<.93:raise ValueError(f'Recognized speech does not sufficiently match the script ({ratio:.3f}).')
    aligned=[]
    for index,item in enumerate(desired):
        if index in mapping:
            row=observed[mapping[index]]
            start,end=row['start'],row['end']
        else:
            left=max((i for i in mapping if i<index),default=None)
            right=min((i for i in mapping if i>index),default=None)
            start=observed[mapping[left]]['end'] if left is not None else 0
            end=observed[mapping[right]]['start'] if right is not None else observed[-1]['end']
            missing=(right if right is not None else len(desired))-(left if left is not None else -1)-1
            offset=index-(left if left is not None else -1)-1
            span=max(0,end-start)/max(1,missing)
            start,end=start+span*offset,start+span*(offset+1)
        aligned.append({**item,'start':start,'end':end,'directMatch':index in mapping})
    starts=[min(w['start'] for w in aligned if w['section']==i) for i in range(len(section_texts))]
    return {'matchRatio':ratio,'words':aligned,'sectionStarts':starts,'unmatchedTokens':[w['token'] for w in aligned if not w['directMatch']]}


def sentences(text):return re.split(r'(?<=[.!?])\s+',text.strip())


def chunks(text,width=40):
    words=text.split();count=max(1,math.ceil(len(text)/(width*2+1)))
    while count<=len(words):
        target=len(text)/count
        states={(0,0):(0,[])}
        for group in range(count):
            for (used,position),(score,parts) in list(states.items()):
                if used!=group:continue
                for end in range(position+1,len(words)+1):
                    value=' '.join(words[position:end]);lines=textwrap.wrap(value,width=width,break_long_words=False,break_on_hyphens=False)
                    if len(lines)>2:break
                    if len(words)-end<count-group-1:continue
                    cost=score+(len(value)-target)**2+(10000 if end-position<3 and count>1 else 0)
                    key=(group+1,end)
                    if key not in states or cost<states[key][0]:states[key]=(cost,parts+['\n'.join(lines)])
        if (count,len(words)) in states:return states[(count,len(words))][1]
        count+=1
    raise ValueError('Caption text cannot be wrapped into readable chunks.')


def readable_cues(cues,duration):
    rows=[dict(cue) for cue in cues];index=0
    while index<len(rows):
        cue=rows[index];text=cue['text'].replace('\n',' ')
        required=max(1.0,len(text)/28)
        limit=rows[index+1]['start'] if index+1<len(rows) else duration
        if cue['start']+required<=limit+.001:
            cue['end']=max(cue['end'],cue['start']+required);index+=1;continue
        if index+1<len(rows):
            combined=text+' '+rows[index+1]['text'].replace('\n',' ')
            lines=textwrap.wrap(combined,width=40,break_long_words=False,break_on_hyphens=False)
            if len(lines)<=2:
                cue['text']='\n'.join(lines);cue['end']=rows[index+1]['end'];rows.pop(index+1);continue
        if index>0:
            combined=rows[index-1]['text'].replace('\n',' ')+' '+text
            lines=textwrap.wrap(combined,width=40,break_long_words=False,break_on_hyphens=False)
            if len(lines)<=2:
                rows[index-1]['text']='\n'.join(lines);rows[index-1]['end']=cue['end'];rows.pop(index);index-=1;continue
        raise ValueError('Caption reading time is insufficient; revise the text or timing.')
    validate_cues(rows,duration);return rows


def validate_cues(cues,duration):
    previous=0
    for cue in cues:
        if not(0<=cue['start']<cue['end']<=duration+.001) or cue['start']<previous-.001:
            raise ValueError('Captions overlap or exceed the movie duration.')
        if not cue['text'].strip() or len(cue['text'].splitlines())>2:
            raise ValueError('Use readable, nonempty captions of at most two lines.')
        if cue['end']-cue['start']<.999 or len(cue['text'].replace('\n',' '))/(cue['end']-cue['start'])>28.01:
            raise ValueError('Caption reading time is insufficient.')
        previous=cue['end']


def stamp(seconds):
    value=round(seconds*1000)
    return f'{value//3600000:02}:{value//60000%60:02}:{value//1000%60:02}.{value%1000:03}'


def vtt(cues):
    return 'WEBVTT\n\n'+'\n\n'.join(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(cues,1))+'\n'
