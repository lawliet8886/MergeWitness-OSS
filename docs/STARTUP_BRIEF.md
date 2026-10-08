# MergeWitness — iniciativa e primeiro piloto

Preparado em 08/10/2026. Este documento descreve uma iniciativa de software de fundador solo, com núcleo MIT e pilotos de integração. Ainda não há validação comercial externa. A data de início da atividade empresarial, a constituição formal e o histórico de financiamento não foram verificados.

## O problema que queremos testar

Uma equipe pequena de Node pode integrar duas mudanças que funcionam separadamente e descobrir um erro quando elas interagem. A hipótese é que o responsável técnico valorize uma sequência curta que reproduza o erro, compare as revisões e ajude a revisar uma correção sem perder os requisitos das duas mudanças.

O primeiro comprador provável é o líder técnico de uma equipe pequena que mantém um produto Node. Isso é uma hipótese de público, ainda sem entrevistas, disposição a pagar ou frequência de uso observadas. Vamos procurar um problema recente de cache, fila ou outro comportamento com estado antes de apresentar a ferramenta.

MergeWitness executa um probe definido pelo usuário nas revisões Git confiáveis e verifica uma correção candidata contra checks congelados e requisitos explicitamente declarados. Os resultados cobrem essas observações e entradas; não garantem todos os comportamentos de um merge. O fluxo atual suporta `node --test`. Repositórios, worktrees e subprocessos devem executar somente código revisado e confiável.

## Produto e modelo de negócio

O núcleo continua MIT, com atribuição Signal Foundry. A origem é o [protótipo da competição IBM Bob](https://github.com/lawliet8886/MergeWitness/tree/5b649c4bdf4a9372c9f890816835c100b5be0d01), preservado no commit `5b649c4bdf4a9372c9f890816835c100b5be0d01`. O desenvolvimento independente ocorre em outro checkout.

O plano combina software aberto com ajuda de integração. Um serviço futuro poderia apoiar a escolha da sequência, a declaração dos requisitos e a adoção no fluxo de revisão da equipe. Se o mesmo trabalho aparecer repetidamente em equipes diferentes, isso pode indicar uma oportunidade de software: adaptar entradas, organizar evidências e facilitar revisão e comparação. Se cada caso exigir investigação artesanal, teremos uma hipótese de serviço com outra economia. Ainda não há preço, demanda ou resultado medido para decidir entre essas possibilidades.

O viewer HTML local da 0.3.0 foi implementado para tornar evaluation e repair mais fáceis de inspecionar, mantendo os JSON como evidência. O pacote exato passou na instalação local no Windows, com dois demos e seus relatórios, e a suíte completa passou com 88 testes. A [aceitação técnica](evidence/VALIDATION_0.3.0.md) foi complementada pela [revisão visual da cópia privada](evidence/PRIVATE_SITE_QA_0.3.0.md): desktop/mobile, EN/PT, relatórios, teclado, clipboard, downloads e vídeo histórico foram conferidos no escopo registrado. São verificações do proprietário/agente, sem instalação por cliente ou validação externa.

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
| Integração ou uso de Claude no produto | Nenhum comprovado |
| Empresa formal e data de início empresarial | Não verificadas |
| Pacote/viewer 0.3.0 | Aceitação técnica e revisão da cópia privada concluídas no escopo registrado; validação externa pendente |

As metas de aprendizagem são três de cinco reproduções sem ajuda em cerca de dez minutos, um caso real externo e dois retornos concretos em 7–14 dias. Registrar falhas e intervenções é parte do resultado. Esses números são metas internas, não requisitos de programas de apoio.

## Próximas decisões

Agora, com o pacote e a revisão privada conferidos, preparar a distribuição pública e executar o protocolo externo somente após autorização para publicação e contato. A decisão comercial deve usar o problema anterior, o trabalho necessário, o benefício observado e o retorno da equipe; não apenas elogios ou instalação concluída.

A candidatura à Anthropic será preparada para avaliação **depois de um piloto real**, conforme a decisão do fundador. Isso é nosso gate de evidência. A aprovação continua discricionária e considera, entre outros fatores, tração, financiamento e integração/uso de Claude. [Termos oficiais](https://www.anthropic.com/startup-program-official-terms).

O [rascunho Anthropic](ANTHROPIC_APPLICATION_DRAFT.md) permanece sem envio. A candidatura OpenAI mantém seu gate separado no [documento existente](OPENAI_APPLICATION_DRAFT.md). Apoio de provedor é opcional; este ciclo não depende de aprovação, crédito ou nova assinatura.
