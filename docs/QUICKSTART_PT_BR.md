# Instalar e reproduzir o MergeWitness

Requisitos: Node.js 22 ou superior, npm e Git no PATH. A versão 0.3.0 é um pacote **local**; ainda não existe publicação npm nem um novo repositório remoto mantido. O núcleo não precisa de chave de API nem de dependências npm em tempo de execução.

Na cópia do código, gere o pacote:

```sh
npm pack --ignore-scripts --pack-destination ./artifacts
```

Copie `mergewitness-core-0.3.0.tgz` e o `SHA256SUMS` correspondente para uma pasta separada. Compare o SHA-256 antes de instalar. No PowerShell:

```powershell
Get-FileHash ./mergewitness-core-0.3.0.tgz -Algorithm SHA256
npm install --offline --ignore-scripts --no-audit --no-fund --prefix ./mw-tools ./mergewitness-core-0.3.0.tgz
if ($LASTEXITCODE -ne 0) { throw 'A instalação falhou.' }
```

Execute a demonstração e crie o relatório HTML usando os caminhos retornados:

```powershell
$mw = './mw-tools/node_modules/mergewitness-core/src/cli/mergewitness.mjs'
node $mw --version
$demo = node $mw demo tenant-cache --out ./mw-demo | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'A demonstração falhou.' }
$evaluation = Join-Path $demo.outputDir 'evaluation.public.json'
$repair = Join-Path $demo.outputDir 'repair.public.json'
$report = node $mw report $evaluation --repair $repair --out ./mw-reports | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'A geração do relatório falhou.' }
$report.reportPath
```

Abra o arquivo indicado no navegador. Ele funciona offline e não executa código do repositório. Também é possível usar `./mw-tools/node_modules/.bin/mergewitness.cmd` no Windows ou `./mw-tools/node_modules/.bin/mergewitness` no Linux. Os comandos completos com `node` dispensam alterações no PATH.

Resultado esperado: versão `0.3.0`; a sequência passa na base e nas alterações A e B, falha na combinação e passa após a correção preparada. Os requisitos separados de preço por cliente e cache também passam. O relatório mostra **Interaction witness found** e **Declared checks passed**. É um exemplo sintético conhecido, com duas repetições, e a correção é fornecida; não há descoberta ou geração automática de correção.

Rode novamente: cada execução deve produzir diretórios diferentes e preservar os relatórios anteriores. O comando `report` pode omitir `--repair`; nesse caso, o HTML deixa claro que a correção não foi fornecida. Seu código de saída zero indica geração do arquivo, não aprovação universal de uma correção.

## Usar o código-fonte e um caso próprio

```sh
node src/cli/mergewitness.mjs demo tenant-cache --out ./artifacts/demo
node scripts/test.mjs
node scripts/run-corpus.mjs
```

O corpus do código tem oito cenários sintéticos e quatro regressões públicas conhecidas, com versões e licenças preservadas. Os casos públicos são replays em um harness mínimo, não merges upstream nem prova de taxa geral de detecção.

Para um repositório Node próprio, leia [API.md](API.md): `prepare`, `evaluate`, `verify-repair` e `dispose` usam JSON e estado explícito. O único runner suportado é `node --test`. Revise e execute somente código confiável; subprocessos e clones não constituem um sandbox resistente a código malicioso.

A aprovação cobre as sequências, requisitos e dependências declarados. QuietClash e mumei têm sobreposição com a abordagem. Não há superioridade ou adoção externa comprovada. Consulte os [limites do relatório](REPORTS.md) e o [kit do piloto](PILOT_KIT.md) no código-fonte.

Se houver falha, guarde o comando, stderr, versão do Node e sistema operacional, removendo caminhos pessoais e segredos antes de compartilhar. Não desative verificações para obter um resultado verde.
