# Use um repositório Node confiável

Este roteiro usa as interfaces existentes do MergeWitness **0.3.1 / v2**. Primeiro reproduza uma interação sintética conhecida, com cada etapa explícita; depois substitua os dados pelo seu próprio projeto revisado. Você precisa de Node.js 22+, Git no PATH e um checkout do código-fonte. Os auxiliares são exemplos do código-fonte e **não fazem parte do tarball 0.3.1 existente**. A Parte 1 não exige instalação npm, chave de API ou chamada a modelos. Consulte [QUICKSTART_PT_BR.md](QUICKSTART_PT_BR.md) para instalar a versão existente e [API.md](API.md) para o contrato. [English](USE_YOUR_REPOSITORY.md).

Execute apenas código confiável e revisado. Worktrees Git e subprocessos não são sandboxes de segurança. O comando de testes comuns aceito é exatamente `["node", "--test"]`; este roteiro não oferece suporte a executores arbitrários ou serviços externos sem reprodução estável.

## 1. Reproduza o exemplo confiável

Clone o [código-fonte mantido](https://github.com/lawliet8886/MergeWitness-OSS) e entre na pasta do projeto. Execute os comandos abaixo a partir dessa raiz, no PowerShell ou em um shell Linux/macOS. O produto tem evidência de aceitação em Windows e Linux; este tutorial foi validado em Windows, não em macOS.

```sh
node --version
git --version
node src/cli/mergewitness.mjs --version
node examples/trusted-repository/tutorial.mjs init "artifacts/own repository tutorial"
node src/cli/mergewitness.mjs prepare "artifacts/own repository tutorial/prepare.request.json" "artifacts/own repository tutorial/prepared.json"
node examples/trusted-repository/tutorial.mjs requests "artifacts/own repository tutorial"
node src/cli/mergewitness.mjs evaluate "artifacts/own repository tutorial/evaluate.request.json" "artifacts/own repository tutorial/evaluated.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" evaluation
```

Escolha uma área **nova, que ainda não exista**. `init` recusa um caminho existente; para repetir, escolha outro nome e use esse nome em todos os comandos. O gerador da história sintética existente roda apenas em `workspace` dentro da nova área. Ele não gera história dentro do seu projeto nem em `fixtures/.generated` compartilhado no checkout. Também cria uma história priority/cursor não utilizada, dentro dessa área isolada. O auxiliar não executa o ciclo MergeWitness: as chamadas visíveis a `prepare`, `evaluate`, `verify-repair`, `report` e `dispose` são a CLI existente.

O repositório sintético fica em `<área>/workspace/fixtures/.generated/tenant-cache-history`. Base usa preços globais; A (`tenant-pricing`) adiciona preços por locatário; B (`sku-cache`) cria cache por SKU. Os testes comuns passam nos quatro snapshots, mas A+B devolve a beta o preço de alpha que ficou no cache. A sequência consulta alpha, depois beta no mesmo catálogo e compara beta com um catálogo novo. Três repetições produzem evidência estável: Base/A/B `pass`; combinação (`merged`) `fail`, esperado `100`, observado `90`; classificação `interaction_witness`.

O `evaluate.request.json` gerado declara `observations.mjs` tanto em `probeDependencies` quanto em `dependencies` de cada requisito. Esse auxiliar importa módulos nativos do Node e `src/catalog.js` do snapshot escolhido; não usa pacotes, variáveis de ambiente ou serviços externos. `tenant-pricing` é calibrado em `branchA`; `sku-cache`, em `branchB`, mede leituras da fonte de preços com um Proxy além do contador. Auxiliares declarados devem ser arquivos regulares dentro da pasta do check; a estrutura relativa e os hashes são congelados. Imports dinâmicos/absolutos/de pacotes ou dependências de dados não declarados não são descobertos nem atestados automaticamente.

Inspecione os caminhos **realmente retornados** no JSON; não adivinhe a pasta temporária:

| Resposta | Campos usados neste roteiro |
| --- | --- |
| `prepared.json` | `analysisId`, `statePath`, `paths.base`, `paths.branchA`, `paths.branchB`, `paths.merged`, `commits` resolvidos, `normalTests`, `merge.clean` |
| `evaluated.json` | `classification`, `matrix.<snapshot>.kind`, `.consistent`, `.runs`, `requirements[].calibration`, `probeManifest`, `reportPath` |
| `good.json` / `bad.json` | `passed`, `retentionVerified`, `retentionCoverage`, `probe`, `normalTests`, `requirementResults`, um `reportPath` por tentativa |
| Resposta do relatório HTML | `reportPath` exato para abrir localmente |

`statePath` é o estado privado e mutável retornado pela análise, normalmente em uma pasta temporária do sistema. `paths.merged` é o worktree descartável do candidato, não o seu repositório original. `reportPath` aponta para o relatório canônico dentro dessa análise; ele desaparece no descarte. As respostas salvas na área do tutorial ajudam a registrar o processo, mas não substituem a cópia dos relatórios canônicos. Não altere o estado nem os arquivos congelados: eles são entradas confiáveis do processo.

Aplique a correção válida fornecida, com Map por locatário e SKU, **faça commit no candidato**, verifique e salve o relatório:

```sh
node examples/trusted-repository/tutorial.mjs repair "artifacts/own repository tutorial" good
node src/cli/mergewitness.mjs verify-repair "artifacts/own repository tutorial/verify.request.json" "artifacts/own repository tutorial/good.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" good
node src/cli/mergewitness.mjs report "artifacts/own repository tutorial/saved/evaluation.json" --repair "artifacts/own repository tutorial/saved/good.json" --out "artifacts/own repository tutorial/html good"
```

Esperado: `passed:true`, `retentionVerified:true`, testes comuns e sequência passando e os dois requisitos passando. A correção vem do arquivo existente `src/bob-repairs/tenant-cache/catalog.fixed.js`; a ferramenta não a gera. O auxiliar mostra o caminho do candidato e o HEAD com commit, sem alterar a configuração Git global.

Agora aplique o falso reparo deliberado no **mesmo candidato**. Ele mantém os preços removendo o cache:

```sh
node examples/trusted-repository/tutorial.mjs repair "artifacts/own repository tutorial" bad
node src/cli/mergewitness.mjs verify-repair "artifacts/own repository tutorial/verify.request.json" "artifacts/own repository tutorial/bad.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/own repository tutorial" bad
node src/cli/mergewitness.mjs report "artifacts/own repository tutorial/saved/evaluation.json" --repair "artifacts/own repository tutorial/saved/bad.json" --out "artifacts/own repository tutorial/html bad"
node src/cli/mergewitness.mjs dispose "artifacts/own repository tutorial/dispose.request.json" "artifacts/own repository tutorial/disposed.json"
```

O `verify-repair` ruim termina intencionalmente com código **1**, mas grava `bad.json`. Execute os comandos seguintes individualmente após essa rejeição esperada; não use uma cadeia de shell que pare nela. Espere `probe.kind:"pass"`, porém `passed:false`, `retentionVerified:false` e requisito de cache `fail`. Os testes comuns do cache também falham: o exemplo não afirma que apenas a retenção detectou a remoção. Cada tentativa tem um caminho canônico distinto, e os dois relatórios copiados permanecem. Abra os caminhos HTML retornados. Código zero em `report` significa apenas que um arquivo foi gerado, não que a correção passou.

**Salve a evidência antes de descartar.** `saved/evaluation.json`, `saved/good.json` e `saved/bad.json` são cópias dos bytes canônicos. Eles contêm caminhos locais e saída da execução; revise/remova dados privados antes de compartilhar e preserve os originais privadamente. `dispose` remove o estado/worktrees privados da análise; a história sintética, os relatórios copiados e o HTML permanecem. Os arquivos, a história Git e a branch atual do repositório original são preservados durante a preparação e a verificação.

### Controle inconclusivo e repetição

Use outra área nova para ver por que código zero não basta. O controle fornecido emite uma última linha inválida; todas as observações são inconclusivas apesar do processo terminar com zero:

```sh
node examples/trusted-repository/tutorial.mjs init "artifacts/inconclusive tutorial" inconclusive
node src/cli/mergewitness.mjs prepare "artifacts/inconclusive tutorial/prepare.request.json" "artifacts/inconclusive tutorial/prepared.json"
node examples/trusted-repository/tutorial.mjs requests "artifacts/inconclusive tutorial"
node src/cli/mergewitness.mjs evaluate "artifacts/inconclusive tutorial/evaluate.request.json" "artifacts/inconclusive tutorial/evaluated.json"
node examples/trusted-repository/tutorial.mjs save "artifacts/inconclusive tutorial" evaluation
node src/cli/mergewitness.mjs report "artifacts/inconclusive tutorial/saved/evaluation.json" --out "artifacts/inconclusive tutorial/html"
node src/cli/mergewitness.mjs dispose "artifacts/inconclusive tutorial/dispose.request.json" "artifacts/inconclusive tutorial/disposed.json"
```

Classificação esperada: `inconclusive`, nunca aprovação. Para o controle preexistente, escolha uma terceira área e troque o cenário de `init` por `preexisting`; repita o mesmo ciclo usando esse caminho. Ele emite `fail` estruturado e estável também em Base e retorna `preexisting_violation`, não uma falha exclusiva da interação. Execuções novas não sobrescrevem as saídas anteriores. A reprodução automatizada específica é `node --test tests/trusted-repository-tutorial.test.mjs`; ela verifica caminhos com espaços, preservação de bytes da fonte e de saídas anteriores, os dois reparos e os dois controles.

## 2. Substitua as entradas pelo seu projeto

Não use o gerador nem o auxiliar `repair` do tutorial no seu projeto. Use diretamente a [API v2](API.md) ou CLI existente. Revise cada revisão e check antes de executar; salve seu trabalho atual. O MergeWitness resolve revisões **com commit**, não mudanças pendentes na árvore de trabalho. Escolha a base comum e as duas alterações pretendidas, de preferência IDs imutáveis de commits, e explicite as interfaces e os recursos obrigatórios de cada branch.

1. Escreva e revise uma sequência de operações capaz de expor a interação suspeita. Ela roda sem mudanças em Base/A/B/combinação. Exercite operações reais e evidência determinística; não apenas declare a resposta final desejada. Escreva uma asserção de retenção separada para cada branch, com IDs únicos e origem explícita. Calibre o requisito na própria origem mesmo se o recurso não existir em Base.
2. Coloque checks e todos os auxiliares/dados em uma pasta autocontida, fora do candidato. Cada check imprime como **última** linha um JSON com `status:"pass"` ou `status:"fail"`; ambos os resultados estruturados terminam com zero. Saída não zero, timeout, sinal, formato inválido ou observações diferentes entre repetições são inconclusivos. Use evidência determinística: horários e IDs aleatórios podem fazer as repetições divergir.
3. Defina `repoPath`, as três revisões, `protectedTestPaths`, a sequência e todos os caminhos de requisitos/auxiliares. Proteja entradas do harness, como dados esperados, além dos testes/configurações descobertos automaticamente; não congele módulos de produção que serão corrigidos. O único executor comum aceito continua sendo `node --test`. Dependências do projeto já devem estar disponíveis de forma reproduzível nos snapshots avaliados; a ferramenta não as instala nem provisiona dependências arbitrárias.

Por exemplo, salve um `prepare.request.json` editado fora do seu repositório (substitua estes caminhos absolutos/revisões ilustrativos):

```json
{
  "repoPath": "/absolute/path/to/trusted-node-project",
  "baseRef": "BASE_COMMIT",
  "branchARef": "CHANGE_A_COMMIT",
  "branchBRef": "CHANGE_B_COMMIT",
  "testCommand": ["node", "--test"],
  "protectedTestPaths": ["test", "support/expected.json"]
}
```

```sh
node src/cli/mergewitness.mjs prepare prepare.request.json prepared.json
```

Para a instalação do release, substitua `node src/cli/mergewitness.mjs` por `node ./mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs` em todos os comandos. Em JSON no Windows, use `C:/pasta com espaços/...` ou barras invertidas escapadas. Crie `evaluate.request.json` com o `analysisId` e o `statePath` **retornados**:

```json
{
  "analysisId": "RETURNED_ANALYSIS_ID",
  "statePath": "/exact/returned/analysis-state.json",
  "probePath": "/absolute/path/to/checks/sequence.mjs",
  "probeDependencies": ["/absolute/path/to/checks/observations.mjs"],
  "requirements": [
    { "id": "feature-a", "origin": "branchA", "checkPath": "/absolute/path/to/checks/feature-a.mjs", "dependencies": ["/absolute/path/to/checks/observations.mjs"] },
    { "id": "feature-b", "origin": "branchB", "checkPath": "/absolute/path/to/checks/feature-b.mjs", "dependencies": [] }
  ],
  "repetitions": 3
}
```

```sh
node src/cli/mergewitness.mjs evaluate evaluate.request.json evaluated.json
```

Essa cobertura é escrita pelo chamador. A ferramenta não descobre recursos, gera testes, infere requisitos completos ou certifica dependências não declaradas. A repetição verifica a estabilidade observada, não correção universal. Interprete `text_conflict`, falhas de testes comuns e observações inconclusivas antes de tentar corrigir. `preexisting_violation` significa que Base já falha; `branch_violation`, que A ou B já falha; nenhum dos dois é testemunho da interação. `no_witness_found` significa que essa sequência não revelou interação, não que toda combinação é segura.

Se o merge for limpo e a avaliação oferecer evidência utilizável, edite somente o candidato em `prepared.paths.merged`, preservando checks/configurações congelados. Faça commit das alterações nesse worktree antes de `verify-repair`. Candidato sujo ou alteração de entradas protegidas são rejeitados. Crie `verify.request.json` com a mesma identidade retornada e `candidatePath` igual a esse worktree:

```json
{ "analysisId": "RETURNED_ANALYSIS_ID", "statePath": "/exact/returned/analysis-state.json", "candidatePath": "/exact/returned/clone/snapshots/merged" }
```

```sh
node src/cli/mergewitness.mjs verify-repair verify.request.json verified.json
```

Inspecione `passed`, a sequência repetida, os testes comuns e cada entrada de `requirementResults`. Preserve cada `reportPath` canônico com um nome novo antes de outra tentativa ou do descarte; copie sem alterar os bytes dos relatórios de avaliação e reparo. Gere o HTML local com esses arquivos canônicos, usando a sintaxe `report` da Parte 1. Por fim, crie `dispose.request.json` contendo apenas o `analysisId`/`statePath` retornados e execute:

```sh
node src/cli/mergewitness.mjs dispose dispose.request.json disposed.json
```

Isso encerra a análise, não aplica o reparo ao seu projeto. Transferir um candidato revisado para o repositório real é um fluxo Git separado. Preserve relatórios e fonte até revisar o que foi efetivamente verificado.
