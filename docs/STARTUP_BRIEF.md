# MergeWitness — iniciativa e primeiro piloto

Preparado em 08/10/2026. Este documento descreve uma iniciativa de software de fundador solo, com núcleo MIT e pilotos de integração. Ainda não há validação comercial externa. A data de início da atividade empresarial, a constituição formal e o histórico de financiamento não foram verificados.

Uma [apresentação curta em inglês](STARTUP_ONE_PAGE_EN.md) foi preparada para revisão. O novo filme de dois minutos tem voz Knox, master/web, corte de 30 segundos e legendas/transcrições PT/EN; a [checagem técnica e visual foi registrada](evidence/NARRATED_FILM_SITE_0.3.0.md). O fundador aprovou a voz e o vídeo em 08/10/2026 e autorizou a substituição do site do domínio pela evolução independente; a [aprovação está registrada](evidence/PRODUCT_FILM_APPROVAL_0.3.0.md). Uma proposta encaminhada do [Claude gratuito pela web passou na verificação local e em uma análise nova](CLAUDE_WEB_WORKFLOW.md), sem criar assinatura ou cobrança de API. A origem no provedor é informada pelo usuário, sem captura independente de interface/modelo. A integração de modelo por Claude Code/MCP permanece separada e não comprovada.

## O problema que queremos testar

Uma equipe pequena de Node pode integrar duas mudanças que funcionam separadamente e descobrir um erro quando elas interagem. A hipótese é que o responsável técnico valorize uma sequência curta que reproduza o erro, compare as revisões e ajude a revisar uma correção sem perder os requisitos das duas mudanças.

O primeiro comprador provável é o líder técnico de uma equipe pequena que mantém um produto Node. Isso é uma hipótese de público, ainda sem entrevistas, disposição a pagar ou frequência de uso observadas. Vamos procurar um problema recente de cache, fila ou outro comportamento com estado antes de apresentar a ferramenta.

MergeWitness executa um probe definido pelo usuário nas revisões Git confiáveis e verifica uma correção candidata contra checks congelados e requisitos explicitamente declarados. Os resultados cobrem essas observações e entradas; não garantem todos os comportamentos de um merge. O fluxo atual suporta `node --test`. Repositórios, worktrees e subprocessos devem executar somente código revisado e confiável.

## Produto e modelo de negócio

O núcleo continua MIT, com atribuição Signal Foundry. A origem é o [protótipo da competição IBM Bob](https://github.com/lawliet8886/MergeWitness/tree/5b649c4bdf4a9372c9f890816835c100b5be0d01), preservado no commit `5b649c4bdf4a9372c9f890816835c100b5be0d01`. O desenvolvimento independente ocorre em outro checkout.

O plano combina software aberto com ajuda de integração. Um serviço futuro poderia apoiar a escolha da sequência, a declaração dos requisitos e a adoção no fluxo de revisão da equipe. Se o mesmo trabalho aparecer repetidamente em equipes diferentes, isso pode indicar uma oportunidade de software: adaptar entradas, organizar evidências e facilitar revisão e comparação. Se cada caso exigir investigação artesanal, teremos uma hipótese de serviço com outra economia. Ainda não há preço, demanda ou resultado medido para decidir entre essas possibilidades.

O viewer HTML local da 0.3.0 foi implementado para tornar evaluation e repair mais fáceis de inspecionar, mantendo os JSON como evidência. O pacote exato passou na instalação local no Windows, com dois demos e seus relatórios. As suítes completas anteriores passaram com 88 testes no Linux e 93 no Windows, conforme as [evidências técnicas](evidence/VALIDATION_0.3.0.md) e [o registro posterior](evidence/CLAUDE_WEB_LOCAL_0.3.0.md). A [revisão visual da cópia privada](evidence/PRIVATE_SITE_QA_0.3.0.md) foi complementada pela [publicação e conferência do site público](evidence/PUBLIC_SITE_RELEASE_0.3.0.md). São verificações do proprietário/agente, sem instalação por cliente ou validação externa.

[QuietClash](https://github.com/arbade/quietclash) e [mumei](https://github.com/iroha924/mumei) apresentam ideias sobrepostas de comparação comportamental e proteção de checks. O [posicionamento](POSITIONING.md) registra o alcance da comparação disponível e suas limitações. Não reivindicamos novidade geral nem superioridade.

## Oferta do primeiro piloto

O primeiro piloto será gratuito e limitado a **um repositório Node confiável, um caso e até duas sessões técnicas**. Seu objetivo é descobrir se conseguimos produzir evidência útil para uma decisão real de revisão. A equipe mantém o controle do código e da decisão de merge. Não há promessa de encontrar todos os defeitos ou de entregar uma correção de produção.

O núcleo é o mesmo software MIT; a gratuidade do piloto não estabelece preço futuro. Escopo adicional exige um novo acordo. Não estão previstos hospedagem SaaS, execução remota de código, novos frameworks, APIs pagas ou novas despesas neste ciclo. Nenhum convite ou contato foi enviado.

O [kit do piloto](PILOT_KIT.md) contém perguntas antes do pitch, consentimento, roteiro de reprodução, ficha de caso e registro de retorno. O grupo de cinco desenvolvedores para aprendizagem não amplia o piloto de integração além de um repositório e um caso.

## Evidência em 08/10/2026

| Item | Estado observado |
| --- | --- |
| Pessoas externas contatadas | 0 |
| Instalações ou reproduções externas observadas | 0 |
| Casos reais externos reproduzidos | 0 |
| Retornos concretos em 7–14 dias | 0 |
| Usuários, clientes e receita | Nenhum comprovado |
| Proposta assistida por Claude | Uma resposta web encaminhada pelo usuário, verificada e repetida localmente em caso sintético; integração Claude Code/MCP e uso por clientes não comprovados |
| Empresa formal e data de início empresarial | Não verificadas |
| Pacote/viewer 0.3.0 | Candidata aceita disponível no site público, com instalação, exemplos, relatórios e filme aprovado; repositório independente público e validação externa pendentes |

As metas de aprendizagem são três de cinco reproduções sem ajuda em cerca de dez minutos, um caso real externo e dois retornos concretos em 7–14 dias. Registrar falhas e intervenções é parte do resultado. Esses números são metas internas, não requisitos de programas de apoio.

## Próximas decisões

O [site do domínio](https://mergewitness.com.br/?lang=pt) foi atualizado após autorização do fundador. O pacote aceito, as instruções, os relatórios e o filme aprovado estão públicos; a origem no concurso foi preservada no histórico. A [publicação está registrada](evidence/PUBLIC_SITE_RELEASE_0.3.0.md). O repositório independente ainda está local, sem remoto configurado ou publicação no npm.

Os próximos passos são publicar o repositório independente após a instrução correspondente e executar o protocolo externo após autorização de contato e consentimento dos participantes. A decisão comercial deve usar o problema anterior, o trabalho necessário, o benefício observado e o retorno da equipe; não apenas elogios ou instalação concluída.

A candidatura à Anthropic será preparada para avaliação **depois de um piloto real**, conforme a decisão do fundador. Isso é nosso gate de evidência. A aprovação continua discricionária e considera, entre outros fatores, tração, financiamento e integração/uso de Claude. [Termos oficiais](https://www.anthropic.com/startup-program-official-terms).

O [rascunho Anthropic](ANTHROPIC_APPLICATION_DRAFT.md) permanece sem envio. A candidatura OpenAI mantém seu gate separado no [documento existente](OPENAI_APPLICATION_DRAFT.md). Apoio de provedor é opcional; este ciclo não depende de aprovação, crédito ou nova assinatura.
