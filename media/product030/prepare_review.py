"""Prepare the existing owner-private Site from reviewed, local evidence only.

Run after the native Sites source helper opens this exact checkout. The helper
still owns source synchronization, packaging and publication. No remote calls.
"""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
import shutil
import subprocess

PROJECT = 'appgprj_6ac797d3bcec8191873c4c6559f813c1'
BASE = '27c69b04875087643248d9ec92a59839abf8e6c7'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def verdict(report):
    return {'passed': report['passed'], 'retentionVerified': report['retentionVerified'],
            'ordinaryTestsExitCode': report['normalTests']['exitCode'], 'sequence': report['probe']['kind'],
            'requirements': {r['id']: r['result']['kind'] for r in report['requirementResults']},
            'changedFiles': report['changedFiles']}


def write(path, value):
    path.write_text(value, encoding='utf-8', newline='\n')


def validate_run_inputs(run, manifest):
    pairs=[('evaluationSha256','evaluation.json'),('negativeControlSha256','negative.json'),
           ('repairSha256','repair.json'),('replayRepairSha256','replay-repair.json'),
           ('providerSourceSha256','provider-source.json')]
    for key,name in pairs:
        assert manifest['inputs'][key] == digest(run/name), f'Draft/run input hash mismatch: {name}'
    results=[load(run/name) for _,name in pairs]
    evaluation,negative,repair,_,_=results
    for report in (negative,repair):
        assert report['analysisId']==evaluation['analysisId'], 'Repair/evaluation analysis identity mismatch.'
        assert report['evaluationId']==evaluation['evaluationId'], 'Repair/evaluation identity mismatch.'
    return results


def prepare(root, site, run, draft):
    assert load(site / '.openai/hosting.json')['project_id'] == PROJECT
    assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=site, text=True).strip() == BASE
    assert not subprocess.check_output(['git', 'status', '--porcelain'], cwd=site, text=True).strip()
    dist = site / 'dist'
    assets = dist / 'assets/product030-draft003'
    assert not assets.exists() and not (dist / 'production-review.html').exists()
    manifest = load(draft / 'draft-manifest.json')
    assert manifest['claudeProposal'] == 'USER_FORWARDED_RESPONSE_VERIFIED_LOCALLY'
    assert manifest['fullDecode'] == 'PASS' and manifest['finalFilmReady'] is False
    assert digest(draft / 'mergewitness-030-visual-draft.mp4') == manifest['outputSha256']
    names = ['evaluation.json', 'negative.json', 'repair.json', 'replay-repair.json', 'provider-source.json']
    evaluation, negative, repair, replay, origin = validate_run_inputs(run,manifest)
    assert repair['passed'] and repair['retentionVerified'] and replay['passed'] and replay['retentionVerified']
    assert repair['analysisId'] != replay['analysisId']
    assert not negative['passed'] and not negative['retentionVerified']
    assert not Path(repair['candidatePath']).exists() and not Path(replay['candidatePath']).exists()
    assert origin['candidateSourceSha256'] == digest(run / 'model-catalog.js')
    assert origin['responseEvidenceSha256'] == digest(run / 'claude-response.md')
    summary = {'version': '0.3.0', 'caseKind': 'trusted synthetic string-identifier example',
               'providerOrigin': 'reported by user; full phone response forwarded in conversation; provider UI not independently captured',
               'modelLabel': 'unknown', 'client': 'Claude web plus local MergeWitness API controller',
               'claudeCodeModelIntegration': 'NOT_RUN', 'candidateAttempt': 1,
               'classification': evaluation['probe']['classification'],
               'repetitions': 2, 'ordinaryTestsPassedAllFourSnapshots': all(r['exitCode'] == 0 for r in evaluation['normalTests'].values()),
               'sequenceMatrix': {key: evaluation['probe']['matrix'][key]['kind'] for key in ('base','branchA','branchB','merged')},
               'negativeControl': verdict(negative), 'candidate': verdict(repair), 'freshReplay': verdict(replay),
               'disposableCandidatePathsAbsent': True, 'externalPilotsObserved': 0,
               'candidateSourceSha256': origin['candidateSourceSha256'], 'responseEvidenceSha256': origin['responseEvidenceSha256'],
               'privateInputHashes': {name: digest(run / name) for name in names},
               'limits': 'Declared frozen checks only. Operator provenance is not authenticated provider identity. No endorsement, universal repair proof or external adoption.'}
    safe = json.dumps(summary, ensure_ascii=False, indent=2) + '\n'
    assert 'C:\\' not in safe and 'statePath' not in safe and 'candidatePath"' not in safe
    assets.mkdir(parents=True)
    for name in ['mergewitness-030-visual-draft.mp4', 'poster-draft.png']:
        shutil.copyfile(draft / name, assets / name)
    for source, name in [(run/'model-catalog.js','candidate-catalog.js'), (run/'claude-response.md','forwarded-response.md')]:
        shutil.copyfile(source, assets / name)
    write(assets / 'workflow-summary.json', safe)
    write(assets / 'draft-manifest.json', json.dumps(manifest, indent=2) + '\n')
    intervals = [(0,12),(12,28),(28,48),(48,75),(75,101),(101,112),(112,120)]
    captions = {
        'pt': ['Duas mudanças passam nos testes.\nA sequência expõe a interação.', 'Repita localmente e leia as evidências.\nExecute somente código confiável.', 'Base, preços e cache passam.\nCombined devolve 90; o esperado é 100.', 'Resposta encaminhada pelo usuário.\nProposta verificada e repetida localmente.', 'Remover o cache esconde o sintoma.\nA perda do requisito rejeita esse controle.', 'A aprovação cobre os checks declarados.\nEste é um caso sintético.', 'Ajude a testar um caso Node real.\nO piloto externo ainda não aconteceu.'],
        'en': ['Two changes pass their tests.\nThe sequence exposes their interaction.', 'Replay locally and read the evidence.\nExecute trusted, reviewed code only.', 'Base, pricing and cache pass.\nCombined returns 90; expected is 100.', 'Response forwarded by the user.\nProposal verified and replayed locally.', 'Removing the cache hides the symptom.\nLosing a requirement rejects that control.', 'Passing covers the declared checks.\nThis is one synthetic example.', 'Help test one real Node case.\nAn external pilot has not happened yet.']}
    stamp = lambda second: f'{second//3600:02}:{second//60%60:02}:{second%60:02}.000'
    for lang, cues in captions.items():
        vtt = 'WEBVTT\n\n' + '\n\n'.join(f'{i}\n{stamp(start)} --> {stamp(end)}\n{cue}' for i, ((start,end),cue) in enumerate(zip(intervals,cues),1)) + '\n'
        write(assets/f'draft-{lang}.vtt', vtt)
        write(assets/f'visual-transcript-{lang}.txt', 'SILENT VISUAL DRAFT — no final narration\n\n'+'\n\n'.join(cues)+'\n')
    script=(root/'docs/VIDEO_SCRIPT_EN_0.3.0.md').read_text(encoding='utf-8')
    narration='\n\n'.join(line.split('|')[2].strip() for line in script.splitlines() if re.match(r'\| \d\d:',line))+'\n'
    assert len(narration)<2500
    write(assets/'narration-en.txt',narration)
    for name in ['CLAUDE_WEB_WORKFLOW.md','STARTUP_ONE_PAGE_EN.md','STARTUP_BRIEF.md','PILOT_KIT.md','VIDEO_STORYBOARD_0.3.0.md','VIDEO_SCRIPT_EN_0.3.0.md','VIDEO_SCRIPT_PT_0.3.0.md','POSITIONING.md','evidence/PRIVATE_SITE_QA_0.3.0.md','evidence/CLAUDE_WEB_LOCAL_0.3.0.md']:
        (dist/'downloads/release-0.3.0'/name).parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(root/'docs'/name, dist/'downloads/release-0.3.0'/name)

    css = """*{box-sizing:border-box}body{margin:0;background:#f6f5ed;color:#16382b;font:17px/1.6 system-ui,sans-serif}a{color:inherit;text-underline-offset:4px}a:focus-visible,button:focus-visible,video:focus-visible{outline:3px solid #af432d;outline-offset:5px}header,main,footer{max-width:1080px;margin:auto;padding:28px}header{display:flex;gap:20px;justify-content:space-between;align-items:center;border-bottom:1px solid #b7c6b8}h1{font-size:clamp(32px,5vw,58px);line-height:1.12;letter-spacing:-.04em;max-width:850px}h2{font-size:28px;line-height:1.25;margin-top:48px}.eyebrow{font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}.notice{border-left:4px solid #af432d;padding:12px 18px;background:#e7eadf}.lead{font-size:21px;max-width:800px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{border:1px solid #b7c6b8;border-radius:12px;padding:20px;background:#fff}.card strong{font-size:25px;display:block}.pass{color:#16382b}.fail{color:#af432d}video{width:100%;display:block;border-radius:12px;background:#16382b;margin:24px 0 10px}.links{display:flex;gap:12px 24px;flex-wrap:wrap}pre{font:15px/1.6 ui-monospace,monospace;overflow:auto;border:1px solid #b7c6b8;border-radius:12px;background:#e7eadf;padding:18px}code{overflow-wrap:anywhere}button{font:inherit;padding:10px 16px;background:#16382b;color:#f6f5ed;border:0;border-radius:8px;cursor:pointer}figcaption{font-size:15px}figure{margin:0}li{margin:8px 0}footer{border-top:1px solid #b7c6b8;font-size:15px}@media(max-width:650px){header,main,footer{padding:20px}.grid{grid-template-columns:1fr}.lead{font-size:19px}header{flex-wrap:wrap}h2{font-size:25px}}"""
    write(dist/'production-review.css', css+'\n')
    prefix='assets/product030-draft003/'
    head='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="production-review.css">'
    nav='<header><a href="index.html">MergeWitness</a><span class="eyebrow">Revisão privada · 0.3.0</span></header>'
    foot='<footer>Origem: protótipo MIT de Signal Foundry para o IBM Bob. <a href="https://github.com/lawliet8886/MergeWitness/tree/5b649c4bdf4a9372c9f890816835c100b5be0d01">Código histórico</a> · <a href="evidence/LICENSE.txt">Licença e atribuição</a>. O domínio público permanece sem atualização.</footer></body></html>'
    page=head+'<title>MergeWitness · revisão do novo vídeo</title></head><body>'+nav+f'''<main>
<p class="eyebrow">Vídeo em produção</p><h1>O teste funcionou. Agora podemos mostrar o caminho.</h1>
<p class="lead">A proposta encaminhada do Claude passou localmente e em uma análise nova. Esta prévia de dois minutos mostra somente observações registradas do exemplo sintético.</p>
<p class="notice"><strong>Rascunho visual sem narração.</strong> Ainda faltam o áudio final, sua revisão e a nova checagem de reprodução no navegador. Este link é para sua revisão privada; o novo projeto ainda não foi lançado publicamente.</p>
<figure><video controls playsinline preload="metadata" poster="{prefix}poster-draft.png" aria-label="Rascunho visual do MergeWitness, sem narração"><source src="{prefix}mergewitness-030-visual-draft.mp4" type="video/mp4"><track kind="captions" src="{prefix}draft-pt.vtt" srclang="pt-BR" label="Português — texto da prévia" default><track kind="captions" src="{prefix}draft-en.vtt" srclang="en" label="English — draft text"></video><figcaption>120 segundos · 1080p · sem áudio final · gráficos baseados nos JSON locais, sem chat ou terminal simulados.</figcaption></figure>
<p class="links"><a href="{prefix}visual-transcript-pt.txt">Texto da prévia em português</a><a href="{prefix}visual-transcript-en.txt">English draft text</a><a href="{prefix}mergewitness-030-visual-draft.mp4" download>Baixar prévia MP4</a></p>
<h2>O que já está comprovado neste exemplo</h2><div class="grid"><article class="card"><strong class="pass">Proposta: passou</strong><p>Sequência, três testes comuns, preço por tenant e cache preservados.</p></article><article class="card"><strong class="pass">Repetição: passou</strong><p>Mesmo código em uma análise nova, sem gerar outra proposta.</p></article><article class="card"><strong class="fail">Sem cache: rejeitado</strong><p>O sintoma de preço desaparece, mas o requisito de cache falha.</p></article></div>
<p><a href="claude-web-workflow.html">Ver a proposta, a origem e os limites da verificação →</a></p>
<h2>Voz e roteiro</h2><p>Knox foi encontrado no catálogo real do Google Vids e uma amostra de 12,2 segundos foi salva. O arquivo MP4 dessa amostra ainda não foi recuperado. Nenhuma narração final foi gerada.</p>
<p class="links">Projeto privado de narração: link de edição omitido nesta cópia pública.<a href="{prefix}narration-en.txt">Texto limpo para narração</a><a href="downloads/release-0.3.0/VIDEO_SCRIPT_EN_0.3.0.md">Roteiro em inglês</a><a href="downloads/release-0.3.0/VIDEO_SCRIPT_PT_0.3.0.md">Tradução em português</a></p>
<h2>Projeto, piloto e próximos critérios</h2><p>O núcleo é MIT e funciona localmente. A hipótese comercial é ajudar equipes com integração e manutenção, se aparecer demanda repetida. Ainda não há piloto externo, clientes ou receita comprovados.</p>
<p class="links"><a href="downloads/release-0.3.0/STARTUP_ONE_PAGE_EN.md">Apresentação de uma página</a><a href="downloads/release-0.3.0/PILOT_KIT.md">Protocolo do primeiro piloto</a><a href="index.html#install">Instalação e exemplo reproduzível</a></p>
</main>'''+foot
    write(dist/'production-review.html', page)
    source=html.escape((run/'model-catalog.js').read_text(encoding='utf-8'))
    workflow=head+'<title>MergeWitness · proposta web verificada localmente</title></head><body>'+nav+f'''<main><p class="eyebrow">Um caso sintético registrado</p><h1>Claude sugere. A verificação local confere.</h1>
<p class="lead">A sequência e os requisitos foram congelados antes da proposta. O usuário copiou a resposta de sua conta gratuita no celular; o controlador local aplicou o código abaixo sem alterações.</p>
<p class="notice">A origem no Claude foi informada pelo usuário. A interface do provedor e o modelo não foram capturados de forma independente. Este registro demonstra uma proposta web com verificação local; não comprova integração Claude Code/MCP, uso por cliente externo ou correção universal.</p>
<h2>A proposta aplicada</h2><pre id="candidate"><code>{source}</code></pre><button type="button" id="copy-candidate">Copiar proposta</button><p id="copy-status" role="status" aria-live="polite"></p>
<p>A chave combina tenant e SKU no domínio de strings deste exemplo. Isso preservou os requisitos declarados. A serialização JSON não é uma codificação universal de identidade para valores JavaScript arbitrários.</p>
<h2>Resultados registrados</h2><ol><li>Testes comuns passaram em Base, A, B e Combined. Na sequência congelada, Combined devolveu 90 ao tenant beta; o esperado era 100.</li><li>A proposta passou na sequência, nos três testes comuns e nas verificações de preço por tenant e cache.</li><li>O controle sem cache passou na sequência e no preço, mas falhou no cache e foi rejeitado.</li><li>O mesmo código passou novamente em uma análise nova. As fontes dos checks e a fixture permaneceram intactas. Os clones de análise foram removidos.</li></ol>
<h2>Evidências e reprodução</h2><p class="links"><a href="{prefix}workflow-summary.json">Resumo JSON sem caminhos privados</a><a href="{prefix}candidate-catalog.js" download>Código aplicado</a><a href="{prefix}forwarded-response.md">Resposta encaminhada completa</a><a href="downloads/release-0.3.0/CLAUDE_WEB_WORKFLOW.md">Procedimento reproduzível</a></p>
<p><code>SHA-256: {origin['candidateSourceSha256']}</code></p><p>O controlador é opt-in e fica fora do pacote aceito. A execução foi feita no Windows com o tarball 0.3.0 preservado. Código executado em processos e worktrees precisa ser confiável e revisado.</p>
<p><a href="production-review.html">← Voltar à revisão do vídeo</a></p></main><script type="module" src="production-review.mjs"></script>'''+foot
    write(dist/'claude-web-workflow.html', workflow)
    write(dist/'production-review.mjs', """const button = document.getElementById('copy-candidate');
button.addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(document.getElementById('candidate').textContent);
    status.textContent = 'Proposta copiada.';
  } catch {
    status.textContent = 'A cópia automática não está disponível. Selecione e copie o código acima.';
  }
});
""")
    index=dist/'index.html'
    original=index.read_text(encoding='utf-8')
    marker='<section class="evidence-section" id="evidence"'
    assert original.count(marker)==1
    addition='''<section class="wrap" id="product-video" aria-labelledby="product-video-heading"><span class="section-label">0.3.0 · private production review</span><h2 id="product-video-heading">A new demonstration is in production.</h2><p>A user-forwarded Claude web proposal passed local verification and a fresh replay in one synthetic example. The silent visual draft, recorded proposal and bilingual scripts are available for private review. Final narration and changed-page browser QA remain pending.</p><p><a class="text-link" href="production-review.html">Review the new visual draft / revisar a prévia →</a></p></section>\n'''
    original=original.replace(marker,addition+marker)
    original=original.replace('No Claude-assisted workflow or candidate-generation integration has been demonstrated.','One user-forwarded Claude web proposal passed local verification and a fresh replay. Provider UI/model identity were not independently captured; Claude Code/MCP model integration remains unverified.')
    original=original.replace('A 120-second storyboard is prepared; no new 0.3.0 video has been recorded. The competition video remains historical.','A silent 120-second visual draft is prepared. Final narration and changed-page playback QA remain pending. The competition video remains historical.')
    write(index,original)
    locale=dist/'oss-locale.mjs'
    copy=locale.read_text(encoding='utf-8')
    copy=copy.replace('No Claude-assisted workflow or candidate-generation integration has been demonstrated.','One user-forwarded Claude web proposal passed local verification and a fresh replay. Provider UI/model identity were not independently captured; Claude Code/MCP model integration remains unverified.')
    copy=copy.replace('A 120-second storyboard is prepared; no new 0.3.0 video has been recorded. The competition video remains historical.','A silent 120-second visual draft is prepared. Final narration and changed-page playback QA remain pending. The competition video remains historical.')
    # Replace the scoped translations using their existing dictionary keys.
    copy=re.sub(r"providerBoundary: '(?:Nenhum|Não)[^']*'", "providerBoundary: 'Uma proposta encaminhada do Claude web passou na verificação local e na repetição. Interface e modelo do provedor não foram capturados; Claude Code/MCP com modelo continua sem comprovação.'", copy)
    copy=re.sub(r"videoPlan: '[^']*'", lambda m: m.group(0) if 'A silent' in m.group(0) else "videoPlan: 'Prévia visual de 120 segundos, sem narração final. Áudio e reprodução das páginas alteradas ainda precisam de revisão. O vídeo do concurso continua histórico.'", copy)
    write(locale,copy)
    receipt={'projectId':PROJECT,'sourceOpenedAtCommit':BASE,'draftMovieSha256':manifest['outputSha256'],
             'candidateSha256':origin['candidateSourceSha256'],'privateOnly':True,'publicDomainChanged':False,
             'browserQA':'NOT_RUN_FOR_CHANGED_PAGES','finalNarration':'NOT_GENERATED',
             'files':{p.relative_to(dist).as_posix():digest(p) for p in dist.rglob('*') if p.is_file()}}
    write(run.parent/'private-review-preparation.json',json.dumps(receipt,indent=2)+'\n')
    print(json.dumps({k:v for k,v in receipt.items() if k!='files'}))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    for name in ('root','site','run','draft'):
        parser.add_argument('--'+name,type=Path,required=True)
    args=parser.parse_args()
    prepare(*(getattr(args,name).resolve() for name in ('root','site','run','draft')))
