# Narração do produto — português

Knox stock voice, generated through the existing Google Vids account on 2026-10-08. The exported narration is 101.888 seconds. The 120-second film inserts section pauses without respeeding speech. PT/EN captions are aligned to the actual recorded speech with local ASR; proper-name recognition is fallible. The founder listened and approved the voice and video on 2026-10-08; see [owner acceptance](evidence/PRODUCT_FILM_APPROVAL_0.3.0.md).

Duas mudanças podem passar nos testes e falhar quando se encontram. O problema pode estar na ordem das operações, mesmo após um merge Git sem conflito.

O MergeWitness repete a sequência entre revisões Git, compara observações e verifica o que uma correção preserva. O núcleo open source MIT roda localmente em um repositório Node confiável. As evidências ficam em um relatório offline.

Neste exemplo sintético, uma mudança acrescenta preços por tenant. Outra acrescenta um cache. Alpha custa noventa. Beta deveria receber o preço global de cem. Porém, o cache combinado usa apenas o produto como chave. Depois de Alpha, Beta recebe noventa. Os testes comuns passam. A sequência congelada expõe a interação.

Antes de pedir uma correção, congelamos a sequência e declaramos o que cada mudança deve preservar. Nesta demonstração, o usuário obteve uma proposta no Claude pela web e a encaminhou. Revisamos o código, e um controlador local aplicou a proposta sem alterações. A nova chave combina tenant e produto.

Remover o cache pode esconder o erro de preço, mas perde uma funcionalidade necessária. Esse controle foi rejeitado. A proposta registrada passa na mesma sequência, nos testes existentes e nos dois requisitos. Consultas repetidas continuam usando o cache. O mesmo código também passa em uma análise nova, sem outra geração.

A aprovação cobre esses checks e suas entradas declaradas. Ela não comprova todos os comportamentos. Sua equipe continua responsável pelo código e pela decisão de merge.

Comece pelo exemplo reproduzível. Ou ajude a testar um caso Node real no nosso primeiro piloto gratuito de integração. Repita a sequência. Leia as evidências. Preserve o que importa.
