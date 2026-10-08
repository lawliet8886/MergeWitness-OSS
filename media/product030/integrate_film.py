"""Apply the approved film/clarity refinement to the existing private Site."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[2]
PROJECT='appgprj_6ac797d3bcec8191873c4c6559f813c1'


def put(path,text):path.write_text(text,encoding='utf-8',newline='\n')
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def integrate(site,film,expected_source):
    assert json.loads((site/'.openai/hosting.json').read_text(encoding='utf-8'))['project_id']==PROJECT
    assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=site,text=True).strip()==expected_source
    assert not subprocess.check_output(['git','status','--porcelain'],cwd=site,text=True).strip()
    manifest=json.loads((film/'film-manifest.json').read_text(encoding='utf-8'))
    assert manifest['fullDecode']=='PASS' and manifest['durationSeconds']==120
    for name,wanted in manifest['outputs'].items():assert digest(film/name)==wanted,name
    dist=site/'dist';assets=dist/'assets/product030-film'
    assert not assets.exists();assets.mkdir()
    names=['web-720p.mp4','poster.png','captions-en.vtt','captions-pt.vtt','transcript-en.txt','transcript-pt.txt','film-manifest.json']
    for name in names:shutil.copyfile(film/name,assets/name)
    shutil.copyfile(ROOT/'scripts/run-installed-example.mjs',dist/'downloads/run-example.mjs')
    index=(dist/'index.html').read_text(encoding='utf-8')
    def take(identifier):
        nonlocal index
        pattern=rf'<section\b[^>]*id="{identifier}"[\s\S]*?</section>'
        match=re.search(pattern,index);assert match,identifier
        block=match.group(0);index=index[:match.start()]+index[match.end():];return block
    lab=take('lab');history=take('evidence');take('product-video')
    video='''<section class="product-film wrap" id="product-video" aria-labelledby="product-video-heading">
<div class="film-heading"><span class="section-label" data-i18n="filmLabel">Recorded 0.3.0 example</span><h2 id="product-video-heading" data-i18n="filmTitle">Green tests. A hidden interaction.</h2><p class="section-intro" data-i18n="filmBody">A synthetic case: reproduce the sequence, reject a cache-losing control, and check the recorded proposal.</p></div>
<figure class="product-film-player"><video id="product-film" controls playsinline preload="metadata" poster="assets/product030-film/poster.png" aria-label="Narrated MergeWitness 0.3.0 example"><source src="assets/product030-film/web-720p.mp4" type="video/mp4"><track kind="captions" src="assets/product030-film/captions-en.vtt" srclang="en" label="English"><track kind="captions" src="assets/product030-film/captions-pt.vtt" srclang="pt-BR" label="Português" default></video><figcaption data-i18n="filmCaption">2:00 · Knox narration · PT/EN captions · recorded synthetic example</figcaption></figure>
<div class="source-links"><a class="text-link" href="assets/product030-film/transcript-en.txt" data-i18n="filmTranscriptEn">Transcript · EN</a><a class="text-link" href="assets/product030-film/transcript-pt.txt" data-i18n="filmTranscriptPt">Transcrição · PT</a><a class="text-link" href="claude-web-workflow.html" data-i18n="filmWorkflow">Proposal, results and provenance</a><a class="text-link" href="production-review.html" data-i18n="filmReview">Private film review</a></div>
<p class="film-boundary" data-i18n="filmBoundary">The web response was forwarded by the user and applied unchanged by a local controller. Provider UI/model identity were not independently captured; Claude Code/MCP model integration is unverified.</p>
</section>'''
    marker='<section class="release-section';assert index.count(marker)==1
    index=index.replace(marker,video+'\n'+marker)
    archive='''<section class="history-archive" id="history"><div class="wrap"><span class="section-label" data-i18n="archiveLabel">Origin and attribution</span><h2 data-i18n="archiveTitle">The competition is part of the history.</h2></div><details><summary class="wrap" data-i18n="archiveSummary">Open the preserved IBM Bob prototype, lab and original video</summary>'''+lab+history+'</details></section>'
    index=index.replace('<section class="closing">',archive+'\n<section class="closing">')
    index=index.replace('href="#evidence" data-i18n="navEvidence"','href="#history" data-i18n="navEvidence"')
    old='<div class="hero-actions"><a class="button lime" href="#release-evidence"><span data-i18n="viewRecordedReport">Read recorded HTML</span><span aria-hidden="true">↓</span></a><a class="text-link" href="#install"><span data-i18n="installPackage">Install local candidate</span><span aria-hidden="true">↓</span></a></div>'
    new='<div class="hero-actions"><a class="button lime" href="#install"><span data-i18n="runExample">Run the example</span><span aria-hidden="true">↓</span></a><a class="text-link" href="#product-video"><span data-i18n="watchFilm">Watch the 2-minute demo</span><span aria-hidden="true">▶</span></a></div><p class="hero-prerequisites" data-i18n="heroRequirements">MIT · Node 22+ · npm · Git · local execution</p>'
    assert old in index;index=index.replace(old,new)
    index=index.replace('<g fill="#f6f5ed" font-size="20"','<g fill="#f6f5ed" font-size="26"')
    # Prerequisites are visible before the download, followed by a simpler companion.
    note=re.search(r'<p class="install-note"[\s\S]*?</p>',index).group(0)
    index=index.replace(note,'',1).replace('<p class="install-links">',note+'<p class="install-links">',1)
    index=index.replace('<a class="text-link" href="downloads/SHA256SUMS_0.3.0"', '<a class="text-link" href="downloads/run-example.mjs" download data-i18n="downloadHelper">Download example helper</a><a class="text-link" href="downloads/SHA256SUMS_0.3.0"',1)
    code_start=index.index('<div class="install-code">') if '<div class="install-code">' in index else None
    # Existing command block is identified by its stable first heading.
    first=index.index('<h3 data-i18n="prerequisitesTitle">') if 'data-i18n="prerequisitesTitle"' in index else None
    pattern=r'<h3[^>]*>1\.[\s\S]*?<p[^>]*data-i18n="reportPathNote"[\s\S]*?</p>'
    match=re.search(pattern,index)
    if not match:
        pattern=r'<h3[^>]*>1\.[\s\S]*?<p[^>]*>Require version 0\.3\.0[\s\S]*?</p>'
        match=re.search(pattern,index)
    if not match:
        # The current block's last paragraph has a different existing dictionary key.
        begin=index.index('<h3',index.index('id="install"'));end=index.index('</div>\n</section>',begin)
        replacement_span=(begin,end)
    else:replacement_span=(match.start(),match.end())
    install='''<p class="install-helper-note" data-i18n="saveDownloads">Save the tarball and run-example.mjs in the same new working folder. The helper uses the supplied synthetic demo repair; it does not call a model.</p>
<h3 data-i18n="prerequisitesTitle">1. Check prerequisites</h3><pre><code>node --version\nnpm --version\ngit --version</code></pre>
<h3 data-i18n="installationTitle">2. Install the candidate</h3><div class="command-row"><pre><code id="install-copy">npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.3.0.tgz</code></pre><button type="button" class="command-copy" data-copy-target="install-copy" data-i18n="copyStep">Copy</button></div>
<h3 data-i18n="helperTitle">3. Run the example and generate HTML</h3><div class="command-row"><pre><code id="helper-copy">node ./run-example.mjs</code></pre><button type="button" class="command-copy" data-copy-target="helper-copy" data-i18n="copyStep">Copy</button></div>
<p data-i18n="helperPaths">The helper prints the actual outputDir and reportPath. Open the printed reportPath manually. It refuses another package version or unverified retention. Each run needs fresh output folders.</p><p class="command-status" role="status" aria-live="polite"></p>'''
    index=index[:replacement_span[0]]+install+index[replacement_span[1]:]
    metrics=re.search(r'<dl class="pilot-metrics">[\s\S]*?</dl>',index);assert metrics
    index=index[:metrics.start()]+'<div class="pilot-status"><span class="section-label" data-i18n="pilotStage">Early-stage project</span><h3 data-i18n="pilotInvitation">Help validate one real case.</h3><p data-i18n="pilotNoTraction">No external pilot, customer or recurring demand has been observed yet. The local package and synthetic examples are available for review.</p><a class="text-link" href="downloads/release-0.3.0/STARTUP_ONE_PAGE_EN.md" data-i18n="onePage">Read the project one-pager</a></div>'+index[metrics.end():]
    put(dist/'index.html',index)
    updates={
      'en':{'heroTitle':'<span>Replay the bug.</span><span>Check the repair.</span><span>Keep both <em>features.</em></span>','heroBody':'Changes can pass their tests and fail together after a clean merge. Replay the operation sequence, check a repair against frozen requirements from both changes, and inspect the recorded evidence.','pricing':'A · Pricing','cache':'B · Cache','runExample':'Run the example','watchFilm':'Watch the 2-minute demo','heroRequirements':'MIT · Node 22+ · npm · Git · local execution','filmLabel':'Recorded 0.3.0 example','filmTitle':'Green tests. A hidden interaction.','filmBody':'A synthetic case: reproduce the sequence, reject a cache-losing control, and check the recorded proposal.','filmCaption':'2:00 · Knox narration · PT/EN captions · recorded synthetic example','filmTranscriptEn':'Transcript · EN','filmTranscriptPt':'Transcrição · PT','filmWorkflow':'Proposal, results and provenance','filmReview':'Private film review','filmBoundary':'The web response was forwarded by the user and applied unchanged by a local controller. Provider UI/model identity were not independently captured; Claude Code/MCP model integration is unverified.','archiveLabel':'Origin and attribution','archiveTitle':'The competition is part of the history.','archiveSummary':'Open the preserved IBM Bob prototype, lab and original video','downloadHelper':'Download example helper','saveDownloads':'Save the tarball and run-example.mjs in the same new working folder. The helper uses the supplied synthetic demo repair; it does not call a model.','prerequisitesTitle':'1. Check prerequisites','installationTitle':'2. Install the candidate','helperTitle':'3. Run the example and generate HTML','copyStep':'Copy','helperPaths':'The helper prints the actual outputDir and reportPath. Open the printed reportPath manually. It refuses another package version or unverified retention. Each run needs fresh output folders.','pilotStage':'Early-stage project','pilotInvitation':'Help validate one real case.','pilotNoTraction':'No external pilot, customer or recurring demand has been observed yet. The local package and synthetic examples are available for review.','onePage':'Read the project one-pager','releaseRunOne':'Price × cache: witness and checked repair','releaseRunTwo':'Second installed reproduction','pilotBoundary':'Your team keeps the source and the merge decision. Execute trusted, reviewed code locally. The first external pilot has not happened yet.','roadmapBody':'The next validation is reproduction by outside developers and one real interaction from a consenting team. These observations will test the product and the integration-service hypothesis.','videoPlan':'A narrated 120-second film candidate is prepared. Owner listening approval remains pending; the competition video is preserved in the archive.'},
      'pt':{'heroTitle':'<span>Reproduza a falha.</span><span>Confira a correção.</span><span>Preserve as <em>funções.</em></span>','heroBody':'Mudanças podem passar nos testes e falhar juntas após um merge sem conflito. Repita a sequência de operações, confira a correção com requisitos congelados das duas mudanças e inspecione as evidências.','pricing':'A · Preços','cache':'B · Cache','runExample':'Execute o exemplo','watchFilm':'Veja o demo de 2 minutos','heroRequirements':'MIT · Node 22+ · npm · Git · execução local','filmLabel':'Exemplo 0.3.0 registrado','filmTitle':'Testes verdes. Uma interação escondida.','filmBody':'Um caso sintético: reproduzir a sequência, rejeitar um controle que perde o cache e conferir a proposta registrada.','filmCaption':'2:00 · voz Knox · legendas PT/EN · exemplo sintético registrado','filmTranscriptEn':'Transcrição · EN','filmTranscriptPt':'Transcrição · PT','filmWorkflow':'Proposta, resultados e origem','filmReview':'Revisão privada do filme','filmBoundary':'A resposta web foi encaminhada pelo usuário e aplicada sem alterações pelo controlador local. Interface e modelo do provedor não foram capturados; integração de modelo por Claude Code/MCP não foi comprovada.','archiveLabel':'Origem e atribuição','archiveTitle':'O concurso faz parte da história.','archiveSummary':'Abrir o protótipo IBM Bob, laboratório e vídeo originais preservados','downloadHelper':'Baixar helper do exemplo','saveDownloads':'Salve o tarball e run-example.mjs na mesma pasta de trabalho nova. O helper usa a correção fornecida do demo sintético; não chama um modelo.','prerequisitesTitle':'1. Confira os pré-requisitos','installationTitle':'2. Instale a candidata','helperTitle':'3. Execute o exemplo e gere o HTML','copyStep':'Copiar','helperPaths':'O helper imprime o outputDir e o reportPath reais. Abra manualmente o reportPath retornado. Ele recusa outra versão do pacote ou retenção não verificada. Cada execução precisa de pastas de saída novas.','pilotStage':'Projeto em fase inicial','pilotInvitation':'Ajude a validar um caso real.','pilotNoTraction':'Ainda não houve piloto externo, cliente ou demanda recorrente observados. O pacote local e os exemplos sintéticos estão disponíveis para revisão.','onePage':'Leia a apresentação do projeto','releaseRunOne':'Preço × cache: testemunho e correção conferida','releaseRunTwo':'Segunda reprodução instalada','pilotBoundary':'Sua equipe mantém o código e a decisão de merge. Execute código confiável e revisado localmente. O primeiro piloto externo ainda não aconteceu.','roadmapBody':'A próxima validação é a reprodução por desenvolvedores externos e uma interação real de uma equipe participante. Essas observações vão testar o produto e a hipótese de serviço de integração.','videoPlan':'Uma candidata narrada de 120 segundos foi preparada. A revisão de voz pelo responsável continua pendente; o filme do concurso está preservado no histórico.'}}
    locale=(dist/'oss-locale.mjs').read_text(encoding='utf-8')
    updates['en']['combined']='A + B'
    updates['pt']['combined']='A + B'
    declaration='export const copy ='
    assert locale.count(declaration)==1
    assignments='\nObject.assign(en,'+json.dumps(updates['en'],ensure_ascii=False)+');\nObject.assign(pt,'+json.dumps(updates['pt'],ensure_ascii=False)+');\n'
    put(dist/'oss-locale.mjs',locale.replace(declaration,assignments+'\n'+declaration))
    app=(dist/'app.mjs').read_text(encoding='utf-8')
    app=app.replace("  $('#recorded-video').setAttribute('aria-label', t().videoLabel);","  $('#recorded-video').setAttribute('aria-label', t().videoLabel);\n  const film = $('#product-film');\n  if (film) { film.setAttribute('aria-label', language === 'pt' ? 'Exemplo narrado MergeWitness 0.3.0' : 'Narrated MergeWitness 0.3.0 example'); [...film.textTracks].forEach(track => { track.mode = track.language.startsWith(language) ? 'showing' : 'disabled'; }); }")
    app += '''\n$$('[data-copy-target]').forEach(button => button.addEventListener('click', async () => {
  const command = document.getElementById(button.dataset.copyTarget).textContent;
  const status = $('.command-status');
  try { await navigator.clipboard.writeText(command); status.textContent = t().copied; }
  catch { status.textContent = command; }
}));
'''
    put(dist/'app.mjs',app)
    css='''\n/* Current-product film and bounded clarity refinement. */
.product-film{padding-block:88px}.film-heading{max-width:1000px;margin-bottom:34px}.product-film-player video{display:block;width:100%;aspect-ratio:16/9;background:var(--forest);border-radius:12px}.product-film-player figcaption{font-size:14px;line-height:1.5;color:var(--muted);margin-top:12px}.product-film .source-links{margin-top:22px}.film-boundary{font-size:15px;line-height:1.6;color:var(--muted);max-width:1020px;margin-top:20px}.hero-copy .hero-prerequisites{font-size:15px;margin-top:18px;letter-spacing:.015em}.history-archive{border-top:1px solid var(--line);padding-top:70px}.history-archive h2{font-size:42px;max-width:900px;margin-bottom:24px}.history-archive summary{font-size:18px;padding-block:22px;cursor:pointer;line-height:1.5}.pilot-status{border-top:1px solid var(--line);padding-top:24px}.pilot-status h3{font-size:35px;margin-bottom:20px}.pilot-status p{font-size:18px;max-width:470px;margin-bottom:22px}.command-row{display:flex;align-items:start;gap:10px}.command-row pre{flex:1;min-width:0;margin:0}.command-copy{min-height:44px;min-width:72px;padding:10px 14px;background:var(--lime);border:1px solid var(--line);border-radius:5px;color:var(--forest);font-size:14px;font-weight:700}.command-status{min-height:24px;font-size:14px;overflow-wrap:anywhere}.install-helper-note{margin-block:18px;font-size:16px}.languages button{min-height:44px;min-width:44px}.header nav a{min-height:44px;display:inline-flex;align-items:center}
.install-section>div{min-width:0}.install-commands{grid-template-columns:minmax(0,1fr)}.install-commands pre{min-width:0;max-width:100%;overflow-x:auto}
@media(max-width:700px){.product-film{padding-block:52px}.history-archive{padding-top:48px}.history-archive h2{font-size:32px}.product-film-player figcaption,.film-boundary{font-size:14px}.hero-copy .hero-prerequisites{font-size:13px}.pilot-status h3{font-size:29px}.command-row{flex-wrap:wrap}.command-row pre{flex-basis:100%}.hero-actions .text-link{min-height:44px;display:inline-flex;align-items:center}}
'''
    with (dist/'style.css').open('a',encoding='utf-8',newline='\n') as output:output.write(css)
    review=(dist/'production-review.html').read_text(encoding='utf-8')
    review=review.replace('Rascunho visual sem narração.','Candidata narrada do filme.').replace('Ainda faltam o áudio final, sua revisão e a nova checagem de reprodução no navegador.','A narração Knox foi gerada e exportada. Sua avaliação da voz e a checagem final de reprodução estão em andamento.')
    review=review.replace('assets/product030-draft003/mergewitness-030-visual-draft.mp4','assets/product030-film/web-720p.mp4').replace('assets/product030-draft003/poster-draft.png','assets/product030-film/poster.png').replace('assets/product030-draft003/draft-pt.vtt','assets/product030-film/captions-pt.vtt').replace('assets/product030-draft003/draft-en.vtt','assets/product030-film/captions-en.vtt')
    review=review.replace('Rascunho visual do MergeWitness, sem narração','Candidata narrada do MergeWitness').replace('120 segundos · 1080p · sem áudio final','120 segundos · master 1080p · player web 720p · narração Knox')
    review=review.replace('Knox foi encontrado no catálogo real do Google Vids e uma amostra de 12,2 segundos foi salva. O arquivo MP4 dessa amostra ainda não foi recuperado. Nenhuma narração final foi gerada.','Knox foi confirmado no catálogo real do Google Vids. A audição foi recuperada e a narração completa foi gerada em um documento novo, privado. Os arquivos passaram por decode completo; a transcrição local auxilia a sincronização, e a avaliação humana da voz permanece pendente.')
    review=review.replace('assets/product030-draft003/visual-transcript-pt.txt','assets/product030-film/transcript-pt.txt').replace('assets/product030-draft003/visual-transcript-en.txt','assets/product030-film/transcript-en.txt')
    review=review.replace('Esta prévia de dois minutos','Esta candidata narrada de dois minutos').replace('Baixar prévia MP4','Baixar candidata MP4')
    put(dist/'production-review.html',review)
    receipt={'project':PROJECT,'sourceOpenedAt':expected_source,'filmSource':str(film.relative_to(ROOT)),'movieSha256':digest(film/'web-720p.mp4'),'humanListeningApproval':'PENDING','changes':'current film, clearer hero, prerequisites and copied steps, supplied-demo companion, single early-stage statement, collapsible preserved history, complete EN/PT keys','publicDomainChanged':False}
    put(film/'site-integration.json',json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--site',type=Path,required=True);parser.add_argument('--film',type=Path,required=True);parser.add_argument('--expected-source',required=True)
    args=parser.parse_args();integrate(args.site.resolve(),args.film.resolve(),args.expected_source)
