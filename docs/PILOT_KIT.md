# MergeWitness — kit do primeiro piloto

Atualizado em 09/10/2026 para participação assíncrona. A [release pública 0.3.1](https://github.com/lawliet8886/MergeWitness-OSS/releases/tag/v0.3.1) e seu [recibo técnico atual](evidence/ACCEPTANCE_0.3.1.md) são a referência de instalação. A [publicação do site 0.3.0](evidence/PUBLIC_SITE_RELEASE_0.3.0.md) é um registro histórico; não comprova a publicação das alterações deste ciclo. **Nenhum piloto externo observado:** 0 contatos, 0 instalações por participantes, 0 casos e 0 retornos. Os roteiros e modelos abaixo estão vazios; não documentam atividades já realizadas. Convites e contato individual ainda precisam de autorização própria.

## Oferta e limites

Primeiro piloto gratuito: **um repositório Node confiável, um caso e até duas sessões técnicas**. O objetivo é reproduzir uma interação e revisar as evidências de uma correção candidata, quando houver uma candidata disponível. O responsável pelo repositório continua decidindo o merge e o uso em produção.

Não há garantia de encontrar todos os erros, corrigir o sistema ou preservar requisitos que não foram declarados. O fluxo atual aceita `node --test`; executar apenas código revisado e confiável. Não oferecer execução remota, hospedagem, novos frameworks ou APIs pagas. Novas despesas não fazem parte deste ciclo. Trabalho além do escopo precisa de novo acordo.

O protocolo de cinco pessoas testa a compreensão do pacote e do relatório. Ele não oferece cinco integrações: somente um participante/equipe poderá compor o primeiro piloto de integração, com os limites acima.

## Descoberta antes de apresentar a ferramenta

Começar pelo trabalho da pessoa, sem pedir recomendação ou elogio:

1. Qual foi a última interação entre mudanças que vocês só perceberam depois de integrá-las?
2. Como reproduziram o problema? Houve uma sequência de chamadas ou estado compartilhado?
3. Quem decide se uma correção preserva as duas funcionalidades? Quais checks essa pessoa usa?
4. Quanto trabalho foi gasto? Há registro que permita medir, em vez de estimar depois?
5. Esse tipo de problema voltou? Quando seria útil usar o mesmo procedimento novamente?
6. Existe um caso que pode ser revisado e executado localmente com autorização do responsável? Quais dados precisam ficar privados?

Se não houver problema relevante, registrar isso. A hipótese de público não deve ser confirmada apenas porque alguém conseguiu instalar o demo.

## Texto de oferta — preparado, não enviado

> Estou desenvolvendo o MergeWitness, uma ferramenta local para comparar uma sequência de operações entre revisões Git e revisar uma correção com checks explícitos. Quero entender um caso recente da sua equipe antes de mostrar o produto. O primeiro piloto é gratuito e limitado a um repositório Node confiável, um caso e até duas sessões técnicas. O código e a decisão de merge continuam com vocês. Se houver um caso adequado, combinamos escopo e consentimento antes de executar qualquer coisa.

Não há destinatário selecionado ou envio autorizado neste documento.

## Consentimento e execução assíncrona

A rota principal de resposta é a [issue de instalação](https://github.com/lawliet8886/MergeWitness-OSS/issues/new?template=installation-check.yml), com consentimento explícito para resposta pública sanitizada. O email existente `gabriel@mergewitness.com.br` é secundário e sua entrega não foi verificada. Confirmar separadamente autorização para executar o código, observar uma eventual sessão técnica, guardar notas anonimizadas e eventualmente publicar um resumo. Gravação e compartilhamento de código não são condições para participar; o padrão é não gravar e não coletar fonte privada. A pessoa pode interromper a sessão.

Usar IDs `P01`–`P05` e `C01` para notas. Nomes, contatos, caminhos privados, dados de cliente, credenciais e código não entram na documentação pública. O participante mantém as fontes. Evidências técnicas completas só ficam em local acordado, com acesso e prazo definidos antes da coleta; no projeto, notas consentidas pertencem a `artifacts/product-cycle-20261009/` ignorado pelo Git. Publicação de caso exige consentimento específico posterior.

No caso real, definir base/A/B/combinação, origem da sequência, saída esperada, requisitos de ambas as mudanças e dependências declaradas. Confirmar a classificação pelo resultado: uma regressão já presente em uma branch não vira falha apenas da interação. Guardar resultados inconclusivos como inconclusivos. Não enfraquecer checks para obter aprovação.

## Protocolo de cinco pessoas

Selecionar cinco desenvolvedores externos ao projeto que trabalhem com Node. Registrar Node, npm, Git e sistema operacional. Se faltarem pré-requisitos, medir setup separadamente.

Entregar a release 0.3.1, seu SHA-256 e o [guia de participação](PARTICIPATE_PT_BR.md) ([EN](PARTICIPATE.md)). Orientar a cronometragem antes de download ou instalação: a tentativa começa ao abrir as instruções de participação com os pré-requisitos Node, npm e Git prontos e inclui download, conferência do hash, instalação do MergeWitness, demo e compreensão do relatório. Medir a preparação de pré-requisitos ausentes separadamente e registrar outras pausas. Se a pessoa abriu o guia antes de os pré-requisitos estarem prontos ou não mediu desde esse ponto, registrar o início real da medição e sua fonte; tempos que não possam ser separados ficam desconhecidos, sem inventar reinício ou preencher zero. Na modalidade assíncrona, tempos e ajuda são relatos do participante, salvo observação independente documentada. Sem ajuda, a pessoa deve instalar, executar o demo, abrir o `reportPath` real, localizar a observação errada da combinação e explicar a correção e os dois requisitos preservados. Instalação concluída sozinha não é reprodução concluída. Informar desconhecido quando não houver medição; não preencher como zero.

A meta é **3/5 reproduções sem ajuda em cerca de 10 minutos**. Registrar o tempo real, os erros e a primeira intervenção. Depois de intervir, o resultado pode ser assistido, nunca contado como sucesso sem ajuda. A meta usa as cinco tentativas externas como denominador: resultados assistidos, não concluídos e com pré-requisitos ausentes não viram sucessos sem ajuda. Publicar também o número real de tentativas e cada resultado; antes de cinco respostas, não declarar a meta cumprida. Agentes do projeto e testes automatizados não são participantes. Dez minutos é uma meta de pesquisa, não promessa de instalação do produto.

Para o único piloto real, as sessões podem ser trocas técnicas assíncronas previamente delimitadas. A primeira sessão técnica pode delimitar e reproduzir `C01`; a segunda pode revisar a candidata, os requisitos e o uso do relatório. Se não houver correção ou reprodução, registrar esse resultado. A meta é **um caso real externo**, sem substituir esse caso por fixture sintética ou replay público já conhecido.

Combinar um retorno em **7–14 dias**. A meta é **dois retornos concretos** entre as cinco pessoas: novo uso com resultado, novo caso ou pergunta técnica específica baseada na tentativa. Elogio, estrela ou resposta social não conta como retorno concreto. Uma pergunta técnica concreta é um retorno, mas não prova segundo uso independente; registrar essas categorias separadamente. Registrar também ausência de resposta e desistência. Estas são metas internas de aprendizagem. O acompanhamento é opcional, conforme consentimento, e nenhum contato foi enviado.

## Technical runbook — current 0.3.1 workflow

**The accepted 0.3.1 patch is available on GitHub; external reproduction remains pending.** Its 41168-byte archive has SHA-256 `d4a29f561e1e42015dfa12aa5726e268e9d48686fa5f71b84fbdf236d816f763`. The [current technical receipt](evidence/ACCEPTANCE_0.3.1.md) records four successful Linux/Windows Node 22/24 jobs and two fresh installed demos/reports. Historical 0.3.0/0.2.1 receipts and artifacts remain preserved. The founder approved the film; the separately recorded Claude web proposal remains scoped to its original synthetic case. Obtain contact authorization before invitations and participant consent before the pilot. There is no npm registry release.

Prerequisites: Node >=22, npm and Git. Check their versions first. Use a new working directory and installation prefix. Download the actual `mergewitness-core-0.3.1.tgz` and SHA256SUMS from the public GitHub 0.3.1 release. Compare the file hash using `Get-FileHash` in PowerShell or `sha256sum` on Linux before installing. A missing receipt is a stop, not a placeholder hash.

Installed package commands (forward-slash paths work with Node on Windows and Unix):

```sh
node --version
npm --version
git --version
npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.3.1.tgz
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs --version
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs demo tenant-cache --out ./mw-demo
```

Require version `0.3.1`. Read the returned JSON and copy its **actual `outputDir`**. That unique directory contains `evaluation.public.json` and `repair.public.json`. In the next command, replace `<outputDir>` with that returned path; retain quotes around paths containing spaces:

```sh
node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs report "<outputDir>/evaluation.public.json" --repair "<outputDir>/repair.public.json" --out ./mw-reports
```

Read the returned `reportPath` and open that actual `index.html` manually. The command does not launch a browser. Check Base/A/B passing observations, the failing Combined observation, the retained candidate repair and the declared pricing/cache checks. The installed synthetic demo uses two probe repetitions. It is not an external case or a newly generated AI repair.

Source-checkout commands use different entrypoints and must run from the reviewed checkout root:

```sh
node ./src/cli/mergewitness.mjs demo tenant-cache --out ./artifacts/startup-0.3.0/pilot-demo
node ./src/cli/mergewitness.mjs report "<outputDir>/evaluation.public.json" --repair "<outputDir>/repair.public.json" --out ./artifacts/startup-0.3.0/pilot-reports
```

Again, replace `<outputDir>` with the source demo's returned directory. Do not use source paths inside an installation, edit installed files, or assume a bare `mergewitness` command is globally available. Each invocation must preserve earlier outputs. Never overwrite historical `reports/`, media or submission files.

For the trusted real repository, prepare the v2 inputs using the [API contract](API.md). Record the exact probe/check identities and declared requirements before evaluation. Do not repurpose the synthetic demo as evidence of the real case. An ordinary suite pass or HTML generation alone is not repair approval; inspect classification, execution failures, coverage and retention results.

## Anonymized record template — no events observed

One record per participant. Async `timeSource` and `helpSource` become `participant-reported` only after a response; `independently-observed` requires separate evidence. `observed` is an evidence-backed event, not independent observation of every field. `null` means not observed or not recorded; do not replace it with a successful result. Link the separately consented `C01` worksheet only when a real case exists.

```json
{
  "participantId": "P01",
  "observed": false,
  "contactedAt": null,
  "responseAt": null,
  "sessionAt": null,
  "timeSource": null,
  "helpSource": null,
  "outcome": null,
  "consent": {
    "publicIssue": false,
    "executeTrustedCode": false,
    "followUp": false,
    "observeSession": false,
    "storeAnonymizedNotes": false,
    "recordScreen": false,
    "publishAnonymizedSummary": false
  },
  "releaseVersion": null,
  "tarballSha256": null,
  "nodeVersion": null,
  "npmVersion": null,
  "gitVersion": null,
  "os": null,
  "prerequisitesReady": null,
  "setupSeconds": null,
  "attemptSeconds": null,
  "unaidedReproduction": null,
  "firstInterventionAtSeconds": null,
  "interventions": [],
  "identifiedCombinedFailure": null,
  "explainedDeclaredRetentionChecks": null,
  "externalCaseId": null,
  "followUpDueAt": null,
  "followUpObservedAt": null,
  "concreteReturnType": null,
  "concreteReturnEvidence": null,
  "secondIndependentUse": null,
  "observedBenefitOrBlocker": null
}
```

Ficha `C01`, ainda vazia: autorização do responsável; problema e fluxo anterior; revisões exatas; sequência e saída esperada; requisitos A/B; ambiente/dependências; classificação e limites; caminhos/hashes das evidências; intervenções; candidata, se existente; resultado observado e decisão da equipe. Não registrar fonte privada ou identificadores pessoais neste modelo público.

Registro de retorno, ainda vazio: ID; data combinada; data observada; novo uso/caso/pergunta; evidência concreta; benefício ou bloqueio; consentimento para resumo. Na síntese, apresentar denominadores, tentativas assistidas, falhas e retornos ausentes. Revisar instalação ou hipótese de público se as metas não forem atingidas antes de ampliar o escopo.
