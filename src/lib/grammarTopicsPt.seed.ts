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
];
