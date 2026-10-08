# MergeWitness 0.3.0 — novo vídeo do produto

Atualizado em 08/10/2026 após o plano aprovado. **Produção em andamento; não é o filme final.** A versão principal terá voz em inglês, legendas PT/EN e duração alvo de 120 segundos. O roteiro anterior em português foi preservado no checkpoint local desta etapa.

## O que foi observado

O pacote aceito 0.3.0 e seus relatórios passaram pela [aceitação técnica](evidence/VALIDATION_0.3.0.md) e a cópia privada do site pela [revisão visual registrada](evidence/PRIVATE_SITE_QA_0.3.0.md). São verificações internas, sem adoção externa.

Nesta etapa, uma instalação nova do mesmo tarball preparou Base/A/B/Combined e congelou a sequência e os requisitos de preço/cache antes de qualquer proposta de modelo. Os testes comuns passaram nos quatro snapshots; a sequência falhou somente na combinação, com 90 observado para beta e 100 esperado. Um controle sem cache fez a sequência/preço passar, mas falhou no cache e foi rejeitado. Esse controle foi criado pelo controlador local, sem modelo.

Uma amostra original Knox de 12,2 segundos foi gerada em um projeto novo, privado, do Google Vids. A exportação foi indicada pela interface; o MP4 ainda não foi recuperado como arquivo local verificável. Não houve geração de narração completa ou nova chamada paga de TTS.

O usuário encaminhou a resposta completa obtida no Claude gratuito pelo celular. O código foi revisado e aplicado sem alterações pelo controlador local: passou na sequência, nos três testes comuns e nos dois requisitos. A mesma proposta passou em uma análise nova; fixture e fontes dos checks ficaram intactas e os clones foram removidos. A origem no provedor é informada pelo usuário; interface e modelo não foram capturados de forma independente. Isso não comprova integração Claude Code/MCP.

## Roteiro e materiais

Usar o [roteiro em inglês](VIDEO_SCRIPT_EN_0.3.0.md) e a [tradução PT](VIDEO_SCRIPT_PT_0.3.0.md). Os sete intervalos somam 120 segundos: problema, instalação, comparação, proposta de modelo, verificação, limites e convite ao piloto.

A terceira prévia visual silenciosa usa os resultados JSON registrados e a paleta do site existente. Exibe aviso persistente de rascunho sem narração final e identifica a proposta como encaminhada pelo usuário e verificada localmente. As sete imagens foram inspecionadas em 1920×1080; o MP4 de 120 segundos passou por decode completo. Não contém tela falsa de chat, terminal simulado ou voz apresentada como concluída. Isso não atesta sincronização com narração, reprodução no navegador ou legibilidade final no celular.

## Gate do filme final

A resposta encaminhada, o módulo proposto, o patch e o bundle foram preservados. Verificação e repetição passaram, com as intervenções relatadas. [Procedimento web/local e resultados](CLAUDE_WEB_WORKFLOW.md).

Recuperar a amostra Knox e conferir voz/pronúncia. Produzir a narração completa pelo acesso existente, sem contratação ou cobrança nova. Sulafat é a alternativa escolhida, mas a rota histórica de Google Cloud consome créditos e continua exigindo autorização específica se houver nova síntese cobrada.

Entregar master, arquivo para web, corte derivado de 30 segundos, capa, legendas e transcrições. Conferir todas as cenas, decode completo, áudio e legendas contra o arquivo exportado e legibilidade no celular. Não promover a prévia silenciosa a filme final.

Preparar o player do site com reprodução por clique, controles, capa, PT/EN e transcrições. Conferir a nova versão na cópia privada antes de qualquer atualização pública. Preservar o filme do IBM Bob na seção histórica e manter licença/atribuição. Domínio público, novo repositório remoto, divulgação e candidaturas aguardam instrução própria.
