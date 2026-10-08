# Tradução para legendas e transcrição — rascunho

**Não é um vídeo final.** A resposta encaminhada pelo usuário, sua verificação local e a repetição em uma análise nova estão registradas. A interface e a identidade do modelo no provedor não foram capturadas de forma independente. A versão principal terá voz em inglês e legendas PT/EN; a narração final continua pendente.

| Tempo | Tradução |
| --- | --- |
| 00:00–00:12 | Duas mudanças podem passar nos testes e falhar quando se encontram. O problema pode estar escondido na ordem das operações. |
| 00:12–00:28 | O MergeWitness ajuda a repetir essa sequência entre revisões Git e inspecionar o que uma correção candidata preserva. Seu núcleo MIT roda localmente em um repositório Node confiável. |
| 00:28–00:48 | Aqui, uma mudança acrescenta preços por cliente. Outra acrescenta um cache. Juntas, o cache devolve ao próximo cliente o preço do primeiro: noventa em vez de cem. |
| 00:48–01:15 | Antes de pedir uma correção, congelamos a sequência e declaramos o que cada mudança deve preservar. Neste exemplo, o usuário obteve uma proposta pelo Claude na web e a encaminhou. Revisamos o código, e um controlador local aplicou a proposta sem alterações. |
| 01:15–01:41 | Remover o cache esconde o erro de preço, mas perde uma funcionalidade necessária. Esse controle foi rejeitado. A proposta registrada passa na mesma sequência congelada, nos testes existentes e nos dois requisitos. Ela também passa em uma análise nova, sem outra geração. |
| 01:41–01:52 | A aprovação cobre esses checks e suas entradas declaradas. Ela não comprova todos os comportamentos. A equipe continua responsável pelo código e pela decisão de merge. |
| 01:52–02:00 | Experimente o exemplo reproduzível ou ajude a testar um caso Node real no nosso primeiro piloto de integração. |

O piloto gratuito permanece limitado a um repositório confiável, um caso e até duas sessões. Não há usuários, receita, patrocínio ou aceite em programa comprovados. O contato é `gabriel@mergewitness.com.br`; a entrega de e-mail não foi testada.
