# MergeWitness 0.3.0 — roteiro de 120 segundos

Preparado em 08/10/2026. **Storyboard, sem gravação nova ou publicação.** Narração em português brasileiro e legendas em inglês. O vídeo deve mostrar uma execução verificada e o HTML real produzido por ela. Não gerar imagens de terminais, resultados, usuários ou sessões como se fossem evidência.

## Evidência e gate de gravação

O pacote exato e viewer 0.3.0 passaram na [aceitação técnica local](evidence/VALIDATION_0.3.0.md), incluindo duas demonstrações instaladas no Windows e seus relatórios. A demonstração é sintética e usa uma correção retida, não uma nova resposta de IA. A revisão visual da nova versão ainda está pendente antes da gravação. O [baseline 0.2.1](evidence/VALIDATION_0.2.1.md) continua sendo evidência histórica; não deve ser apresentado como uma execução da 0.3.0.

Para gravar a 0.3.0, usar o tarball aceito, executar `demo tenant-cache`, guardar o JSON retornado e produzir o report a partir de `evaluation.public.json` e `repair.public.json` daquele mesmo `outputDir`. Ver comandos e distinção entre instalação e fonte no [kit do piloto](PILOT_KIT.md). Gravar o caminho real retornado em `reportPath`. Não criar uma simulação enquanto essa evidência estiver pendente.

O HTML pode aparecer em captura de tela ou gravação da página offline. Identificá-lo como **“Relatório offline de execução registrada” / “Offline report from a recorded run”**. Mostrar o terminal como execução ao vivo somente se a captura realmente contiver aquela execução. Se uma versão histórica for usada, exibir sua versão verdadeira e separar qualquer descrição planejada da 0.3.0.

## Cenas e texto

Os intervalos somam 120 segundos. Medir a narração real e ajustar pausas dentro destes intervalos; não acelerar resultados até ficarem ilegíveis.

| Tempo | Imagem e evidência | Narração em português | English captions |
| --- | --- | --- | --- |
| 00:00–00:12 | Título curto sobre o HTML real; rótulo “demo sintético”. Mostrar Base/A/B/Combined sem fabricar estados. | Duas mudanças podem funcionar separadas e falhar quando interagem. O MergeWitness compara uma sequência de operações entre revisões Git e organiza a evidência para quem revisa o código. | Two changes can pass separately and fail together. Replay one operation sequence across Git revisions. Review the observed evidence. |
| 00:12–00:27 | Captura real do entrypoint instalado, versão verificada e início do demo. Manter a linha do comando legível. | Esta é uma demonstração sintética, executada localmente com o pacote instalado. Ela não usa chave de API. O caso combina preço por cliente e cache de produto. | Synthetic tenant-pricing and cache demo. Verified installed package. Local execution; no API key. |
| 00:27–00:45 | Abrir o `reportPath` real. Enquadrar as observações das quatro revisões e o witness, com valores efetivamente presentes. | A mesma sequência passa na base e nas duas branches. Na combinação, o preço de Alpha fica no cache e Beta recebe noventa, quando deveria receber cem. | The same sequence passes in Base, A and B. Combined returns 90 for Beta instead of 100. |
| 00:45–01:00 | Mostrar avaliação e identidade do probe no HTML ou JSON correspondente. Não rotular todo teste comum como suficiente. | O relatório mostra o que foi executado e observado. Os checks foram declarados antes da verificação. Um resultado inconclusivo continua inconclusivo; gerar HTML não transforma falha em aprovação. | Inspect executed observations and declared checks. Inconclusive remains inconclusive. A report is evidence, not automatic approval. |
| 01:00–01:18 | Mostrar repair verdadeiro e checks de preço/cache. Usar o resultado real; não animar geração de uma correção por Claude. | A correção incluída nesta demonstração passa no probe e nos requisitos declarados: preços por cliente continuam distintos e o cache continua funcionando. A verificação cobre esses checks, não todos os comportamentos possíveis. | Retained demo repair passes the probe and declared checks. Tenant pricing and caching remain. Coverage is limited to those checks. |
| 01:18–01:34 | Enquadrar o HTML offline registrado e os arquivos de evidência. Mostrar “sem execução remota” como limite do piloto, não recurso de sandbox. | O viewer é um relatório HTML offline da execução registrada. O fluxo mantém os JSON para inspeção. Só devemos executar código confiável e revisado; worktrees e subprocessos não são um sandbox de segurança. | Offline HTML from a recorded run. JSON evidence remains available. Trusted, reviewed code only. Worktrees are not a hardened sandbox. |
| 01:34–01:48 | Cartela simples de escopo sobre captura real: núcleo MIT; 1 repo / 1 caso / até 2 sessões. Sem logotipos de clientes. | O núcleo é MIT. Estamos preparando o primeiro piloto gratuito para uma equipe Node: um repositório confiável, um caso e até duas sessões técnicas, começando pelo problema real da equipe. | MIT core. First free integration pilot: one trusted Node repository, one case, up to two technical sessions. |
| 01:48–02:00 | Fecho: “piloto ainda não realizado”; caminho/link só após autorização e readback. Manter versão e demo sintético visíveis. | Ainda não há usuários ou casos externos comprovados. O próximo passo é testar reprodução, utilidade e retorno com desenvolvedores externos. Esta demonstração mostra o produto local; o piloto vai testar a hipótese de negócio. | No verified external users or cases yet. Next: external reproduction, a real case and concrete returns. Local evidence; business hypothesis still untested. |

## Produção sem nova despesa

Usar captura real, recursos locais já disponíveis e voz gravada pelo fundador. Google Vids é opcional somente se já houver acesso e uso sem gasto adicional; não contratar plano, abrir teste com cobrança ou comprar geração. Nenhuma nova integração de modelo é necessária para este roteiro.

Criar uma pasta nova, por exemplo `artifacts/startup-0.3.0/video/<run-id>/`, para captura, áudio, legendas, manifesto e exportação. Não sobrescrever vídeos, TTS, relatórios ou scripts históricos em `media/`, `reports/` ou `submission/`. O material histórico de IBM Bob pode ser citado como origem, mas não representa uma nova execução de Claude ou da 0.3.0.

## Recording acceptance checklist

- Bind the capture to the accepted tarball SHA-256, exact version, demo output directory, evaluation/repair hashes and actual HTML report path/hash.
- Label synthetic fixtures, predefined repair and recorded/static HTML throughout the relevant scenes.
- Check that observed revision results and retained checks match the underlying JSON; include limitations without implying blanket merge safety.
- Remove personal paths, repository secrets and unrelated desktop content before recording; never replace real result text with a fabricated execution.
- Measure narration and subtitle timing against the exported video. Check readable captions and report details at ordinary playback size, all transitions and a complete decode.
- Verify the final duration is 120 seconds and retain export metadata/hash. Record actual deviations and any editing intervention.
- Preserve historical media. Publication and any external link/readback remain separate, explicitly authorized actions.

Nenhuma gravação, exportação, instalação externa, publicação, piloto ou integração Claude é afirmada por este storyboard.
