// Initial Brazilian Portuguese grammar topics — same hand-authored pattern
// as grammarTopics.seed.ts's Spanish topics, deliberately a small starting
// set (not matching Spanish's current 26) since this is the first round of
// Portuguese content. Slugs are suffixed "_pt" so they never collide with
// the globally-unique slug constraint on grammar_topics, even where the
// underlying grammar point (ser/estar, por/para) exists in both languages.

import type { GrammarTopicSeed } from "./grammarTopics.seed";

export const GRAMMAR_TOPICS_PT: GrammarTopicSeed[] = [
  {
    slug: "intro_pt",
    title: "Introduction to Portuguese",
    category: "introduction",
    cefrLevel: "A1",
    sortOrder: 1,
    language: "pt",
    explanationMd: `A quick overview before diving into specific topics — this course uses
**Brazilian Portuguese**, so a few notes here don't apply to Portugal
(the pronoun *você*, certain vocabulary, pronunciation).

**Pronunciation — a few sounds that don't exist in Spanish/English:**
- **ão** is a nasal sound, roughly "ow" through the nose — *pão*, *não*,
  *coração*.
- **lh** sounds like the "lli" in "million" — *filho*, *trabalho*.
- **nh** sounds like the Spanish "ñ" — *amanhã*, *banho*.
- **ç** always sounds like "s" — *começar*, *coração*.
- At the end of a word, **-e** and **-o** are usually reduced: *dente*
  sounds almost like "dentchi," *carro* almost like "carru."

**Gender and articles** — like Spanish, every noun is masculine or
feminine (*o livro*, *a mesa*), with adjectives agreeing accordingly. See
the "Gender and agreement" topic for the full rules.

**Você, not tu** — in Brazil, the everyday pronoun for "you" is **você**,
which takes third-person conjugation. See the "Você vs. tu" topic for why.

**Word order** — subject-verb-object, like Portuguese/Spanish/English:
*Eu como pão.* — I eat bread. Yes/no questions usually don't invert word
order, just intonation: *Você fala inglês?* — Do you speak English?

**Negation** — *não* goes before the verb: *Eu não sei.* — I don't know.
Unlike Spanish, Portuguese doesn't typically double up the negation with
another negative word afterward.

**Essential phrases to start with:**
- *Oi!* / *Olá!* — Hi!
- *Bom dia* / *Boa tarde* / *Boa noite* — Good morning/afternoon/evening
- *Por favor* / *Obrigado* (said by a man) / *Obrigada* (said by a woman)
  — Please / Thank you (thank-you agrees with the speaker's gender, not
  the listener's)
- *Com licença* — Excuse me
- *Desculpa* — Sorry
- *Tudo bem?* — How's it going? (extremely common, very casual)

From here, the following topics dig deeper into each of these ideas.`,
  },
  {
    slug: "pronomes_pessoais_pt",
    title: "Você vs. tu",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 5,
    language: "pt",
    explanationMd: `No português brasileiro do dia a dia, **você** é a forma padrão de "you" no
singular — e, apesar de parecer uma forma de tratamento formal, ela usa a
conjugação da **terceira pessoa** (a mesma de *ele/ela*), não uma
conjugação própria.

- *Você fala português muito bem.* — You speak Portuguese very well.
- *Ele fala português muito bem.* — mesma forma verbal: *fala*.

O pronome **tu** existe mas é raro na maior parte do Brasil (mais comum em
algumas regiões, como o Rio Grande do Sul) — este curso usa **você** como
padrão, seguindo o uso mais comum no Brasil.

O mesmo vale no plural: **vocês** usa a forma de *eles/elas*.
- *Vocês vêm à festa?* — Are you (all) coming to the party?

Por isso, cada verbo tem só **quatro** formas realmente distintas no dia a
dia: eu, você (=ele/ela), nós, vocês (=eles/elas).`,
  },
  {
    slug: "ser_estar_pt",
    title: "Ser vs. estar",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 15,
    language: "pt",
    explanationMd: `Os dois significam "to be," mas não são intercambiáveis.

**Ser** é para identidade, origem e características que definem o que
algo *é*: profissão, nacionalidade, material, hora, traços permanentes.
- *Sou professora.* — I am a teacher.
- *A mesa é de madeira.* — The table is made of wood.
- *São três horas.* — It's three o'clock.

**Estar** é para localização, e para estados ou condições — como algo
*está* neste momento, algo que pode mudar.
- *Estou na cozinha.* — I'm in the kitchen.
- *O café está frio.* — The coffee is cold.

Alguns adjetivos mudam de sentido dependendo do verbo usado — um
paralelo direto do mesmo fenômeno em espanhol.`,
  },
  {
    slug: "genero_numero_pt",
    title: "Concordância de gênero e número",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 10,
    language: "pt",
    explanationMd: `Todo substantivo em português é masculino ou feminino, e artigos/adjetivos
precisam concordar com ele em gênero e número.

- *o livro vermelho* / *os livros vermelhos* — the red book(s), masculine
- *a mesa vermelha* / *as mesas vermelhas* — the red table(s), feminine

A maioria das palavras terminadas em **-o** é masculina e em **-a** é
feminina, mas há exceções comuns que precisam ser aprendidas junto com a
palavra — *o dia*, *a mão*. Adjetivos terminados em **-e** ou consoante
(*grande*, *fácil*) não mudam de gênero, só de número (*grandes*,
*fáceis*).`,
  },
  {
    slug: "por_para_pt",
    title: "Por vs. para",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 20,
    language: "pt",
    explanationMd: `**Por** aponta para uma causa, um meio ou uma troca — o motivo *por trás*
de algo, ou movimento *através* de um lugar.
- *Obrigado por sua ajuda.* — Thanks for your help.
- *Viajamos por o México.* — We traveled through Mexico. (na fala,
  "pelo México")
- *Troquei por outro.* — I exchanged it for another one.

**Para** aponta para um propósito, um destino ou um prazo — para onde
algo está *indo*.
- *Este presente é para você.* — This gift is for you.
- *Saímos para São Paulo amanhã.* — We're leaving for São Paulo
  tomorrow.
- *Preciso disso para segunda.* — I need it by Monday.

Um jeito prático de lembrar: *por* olha para trás, para o motivo; *para*
olha para frente, para o objetivo.`,
  },
  {
    slug: "preterito_imperfeito_pt",
    title: "Pretérito perfeito vs. imperfeito",
    category: "verb_usage",
    cefrLevel: "B1",
    sortOrder: 30,
    language: "pt",
    explanationMd: `Os dois são tempos do passado, mas respondem perguntas diferentes.

**Pretérito perfeito** — uma ação completa, um evento único com começo e
fim claros.
- *Ontem comi tacos.* — Yesterday I ate tacos. (feito, uma vez)

**Imperfeito** — um estado contínuo, uma ação habitual, ou o cenário de
fundo onde os eventos do pretérito acontecem.
- *Quando eu era criança, comia tacos toda sexta-feira.* — When I was a
  kid, I used to eat tacos every Friday.

Frequentemente aparecem juntos: o imperfeito monta a cena, o pretérito a
interrompe.
- *Chovia quando saí de casa.* — It was raining when I left the house.`,
  },
  {
    slug: "pronomes_objeto_pt",
    title: "Pronomes de objeto (o, a, lhe)",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 60,
    language: "pt",
    explanationMd: `O objeto direto recebe a ação do verbo diretamente — **o/a/os/as**,
concordando em gênero e número com o que substituem.

- *Comprou o pão? Sim, comprei-o.* (formal/escrito) — na fala cotidiana,
  é comum simplesmente dizer *Sim, comprei.* ou *Sim, eu comprei ele.*

O objeto indireto é quem se beneficia ou recebe a ação — **lhe/lhes**.
- *Dei o livro a ela* → *Dei-lhe o livro.* — I gave her the book.

Na língua escrita/formal, o pronome costuma vir antes do verbo em frases
negativas ou com certas palavras (*não o vejo*), e depois do verbo (com
hífen) em frases afirmativas simples (*vejo-o*). Na fala do dia a dia no
Brasil, é comum evitar essa colocação e usar o pronome antes do verbo em
quase todo contexto, ou substituir pelo pronome pessoal (*ele/ela*) depois
do verbo.`,
  },
  {
    slug: "possessivos_pt",
    title: "Possessive adjectives and pronouns",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 70,
    language: "pt",
    explanationMd: `Portuguese possessives come in two forms: **short possessives** that go before the noun, and **long possessives** that go after the noun or stand alone.

**Short form** (meu/minha, teu/tua, seu/sua, nosso/nossa, vosso/vossa — used in all persons): appears before the noun and agrees in gender and number with the noun, not the possessor.
- *Meu livro é azul.* — My book is blue.
- *Tua casa fica longe.* — Your house is far away.
- *Nossos amigos vêm amanhã.* — Our friends are coming tomorrow.

**Long form** (meu/a, teu/a, seu/a, nosso/a, vosso/a) — stands after the noun or replaces it entirely, and also agrees with the noun. Often used with the definite article (*o meu*, *a minha*).
- *Este livro é meu.* — This book is mine.
- *Aquele carro é deles.* — That car is theirs.
- *O nosso apartamento é novo.* — Our apartment is new.

**Note**: Brazilian Portuguese rarely uses *vosso* or *teu*; **você** (taking *seu/sua*) is the standard form.`,
  },
  {
    slug: "demonstrativos_pt",
    title: "Demonstrative pronouns and adjectives",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 80,
    language: "pt",
    explanationMd: `Demonstratives point to something based on distance from the speaker and listener.

**Este/esta/estes/estas** (feminine agrees with noun) — close to the speaker (this/these).
- *Este livro aqui é meu.* — This book here is mine.
- *Estes dias foram interessantes.* — These days have been interesting.

**Esse/essa/esses/essas** — close to the listener, or at moderate distance (that/those).
- *Você gosta desse café?* — Do you like that coffee?
- *Esses alunos na frente são muito quietos.* — Those students in front are very quiet.

**Aquele/aquela/aqueles/aquelas** — far from both speaker and listener (that over there/those over there).
- *Aquele prédio lá é muito velho.* — That building over there is very old.
- *Aquela vez, chovia muito.* — That time (way back when), it was raining a lot.

**Neuter forms** (isto, isso, aquilo) refer to ideas, situations, or unnamed things:
- *Isso não me parece correto.* — That doesn't seem right to me.
- *Aquilo foi uma surpresa!* — That was a surprise!`,
  },
  {
    slug: "verbos_reflexivos_pt",
    title: "Reflexive verbs",
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 90,
    language: "pt",
    explanationMd: `A reflexive verb is one where the subject does the action to itself — marked with *me*, *te*, *se*, *nos*, *vos*.

**Common reflexive verbs:**
- *Acordar* (to wake up) → *Eu me acordo cedo.* — I wake (myself) up early.
- *Sentar* (to sit down) → *Ela se senta na cadeira.* — She sits down.
- *Divertir* (to have fun) → *Nós nos divertimos na festa.* — We had fun at the party.
- *Lavar* (to wash/bathe) → *Você se lava antes de sair?* — Do you wash yourself before going out?

**Meaning shift with reflexives:** some verbs change meaning when made reflexive:
- *Dormir* (to sleep) vs. *dormir-se* (to fall asleep)
- *Ir* (to go) vs. *ir-se* (to leave/go away)
- *Perder* (to lose) vs. *perder-se* (to get lost)

**Placement rule**: the reflexive pronoun comes right before the conjugated verb in most Brazilian Portuguese (or attaches to an infinitive after *a*, *de*, *para*): *Vou me levantar cedo.* — I'm going to get up early.`,
  },
  {
    slug: "estar_gerundio_pt",
    title: "Present continuous with estar + gerund",
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 100,
    language: "pt",
    explanationMd: `The progressive aspect in Portuguese is formed with **estar + gerund** (the *-ando/-endo* form of the verb). This shows an action in progress right now.

**Formation**: take the conjugated form of *estar*, then add the gerund (infinitive stem + *-ando* for -ar verbs, *-endo* for -er/-ir verbs).
- *Falar* → *falando*: *Estou falando com meu amigo.* — I am speaking with my friend.
- *Comer* → *comendo*: *O cachorro está comendo.* — The dog is eating.
- *Sair* → *saindo*: *Eles estão saindo de casa.* — They are leaving the house.

**Common irregular gerunds** (stem changes):
- *Vir* → *vindo*: *Você está vindo para a reunião?* — Are you coming to the meeting?
- *Trazer* → *trazendo*: *Ela está trazendo o bolo.* — She is bringing the cake.
- *Dizer* → *dizendo*: *O que você está dizendo?* — What are you saying?

**Note**: the gerund never changes for person or number — only *estar* conjugates. *Estou correndo* and *Você está correndo* have the same gerund *correndo*.`,
  },
  {
    slug: "comparativos_superlativos_pt",
    title: "Comparatives and superlatives",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 110,
    language: "pt",
    explanationMd: `Portuguese comparatives and superlatives follow straightforward patterns, with a few irregular forms to memorize.

**Comparisons of inequality**: *mais/menos ... que* (more/less ... than)
- *Ele é mais alto que sua irmã.* — He is taller than his sister.
- *Este livro é menos interessante que aquele.* — This book is less interesting than that one.

**Comparisons of equality**: *tão ... quanto* (as ... as, for adjectives/adverbs); *tanto/a(s) ... quanto* (as much/many ... as, for nouns)
- *Você é tão inteligente quanto ele.* — You are as intelligent as he is.
- *Ele fala português tão bem quanto inglês.* — He speaks Portuguese as well as English.
- *Ela tem tantos amigos quanto eu.* — She has as many friends as I do.

**Superlatives**: *o/a mais ... de* / *o/a menos ... de* (the most/least ...)
- *Rio de Janeiro é a cidade mais bonita do Brasil.* — Rio de Janeiro is the most beautiful city in Brazil.
- *Ele é o aluno menos interessado da turma.* — He is the least interested student in the class.

**Irregular comparatives and superlatives**:
- *Bom* (good) → *melhor* (better) → *o melhor* (the best)
- *Mau* (bad) → *pior* (worse) → *o pior* (the worst)
- *Grande* (big/great) → *maior* (bigger/greater) → *o maior* (the biggest)
- *Pequeno* (small) → *menor* (smaller) → *o menor* (the smallest)`,
  },
  {
    slug: "colocacao_pronominal_pt",
    title: "Pronoun placement: próclise, enclise, and mesoclise",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 120,
    language: "pt",
    explanationMd: `In Portuguese, object pronouns (o/a/os/as, me, te, lhe, etc.) move depending on context — this is called **pronominal placement**, and Brazilian Portuguese is more flexible than written/formal Portuguese.

**Próclise** (pronoun before the verb) — used in these cases:
- After negative words: *Não te vi ontem.* — I didn't see you yesterday.
- After certain conjunctions (*que*, *se*, *porque*, *quando*): *Quando você me chamou, eu estava dormindo.* — When you called me, I was sleeping.
- After adverbs (except final position): *Talvez a encontre amanhã.* — Maybe I'll find her tomorrow.
- In questions: *Você a conhece?* — Do you know her?
- In subordinate clauses: *Se o vir, diga-lhe que liguei.* — If you see him, tell him I called.

**Enclise** (pronoun attached to the end with a hyphen) — used in affirmative commands and sentences with no triggering word:
- *Chama-o para a reunião.* — Call him for the meeting. (plain statement)
- *Dê-me a chave.* — Give me the key. (command)

**Mesoclise** (pronoun within a future or conditional form) — formal/written Portuguese:
- *Chamar-te-ei amanhã.* — I will call you tomorrow. (rare in modern Brazilian speech; *vou te chamar* is standard)

**Brazilian note**: in everyday speech, próclise is far more common than enclise, and mesoclise is rarely used at all — most speakers say *vou te chamar* rather than *chamar-te-ei*.`,
  },
  {
    slug: "futuro_subjuntivo_pt",
    title: "Future subjunctive in conditional clauses",
    category: "mood",
    cefrLevel: "B2",
    sortOrder: 130,
    language: "pt",
    explanationMd: `The **future subjunctive** is a distinctive Portuguese tense (less common in Spanish, rare in French) — it expresses a hypothetical future condition that hasn't yet been determined. It appears mainly in *se* clauses when the condition might or might not happen.

**Formation**: for regular verbs, take the third-person plural preterite form and remove the *-m*, then add endings: *-ar → -ar/-ares/-ar/-armos/-ardes/-arem*, *-er → -er/-eres/-er/-ermos/-erdes/-erem*, *-ir → -ir/-ires/-ir/-irmos/-irdes/-irem*.
- *Falar* (preterite: *falaram*) → *se eu falar* (if I speak), *se você falar* (if you speak)
- *Vender* (preterite: *venderam*) → *se eu vender* (if I sell)
- *Partir* (preterite: *partiram*) → *se eu partir* (if I leave)

**Pattern**: *se* + future subjunctive, + future indicative (or imperative):
- *Se você me ligar amanhã, eu vou estar em casa.* — If you call me tomorrow, I will be at home.
- *Se chover no fim de semana, ficaremos em casa.* — If it rains on the weekend, we will stay home.
- *Quando você chegar, nos avise.* — Whenever you arrive, let us know. (when used with *quando/assim que*, it still takes future subjunctive)

**Irregular forms** follow the preterite stem:
- *Ser* (preterite: *foram*) → *if I be*: *Se você for lá, traga-me um presente.* — If you go there, bring me a present.
- *Ir* (same as *ser*): *Se ele ir*, he goes (conditional future)
- *Estar* (preterite: *estiveram*) → *if I stay*: *Se você estiver aqui amanhã...*

**Note**: This is one of the most distinctively Portuguese features — Spanish uses conditional + present indicative instead; the future subjunctive keeps Portuguese clear about future contingencies.`,
  },
];
