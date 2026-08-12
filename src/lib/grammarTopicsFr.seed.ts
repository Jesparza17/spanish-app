// Initial French grammar topics — same hand-authored pattern as the Spanish
// and Portuguese topic seed files, a deliberately small starting set (not
// matching Spanish's current 26). Slugs are suffixed "_fr" so they never
// collide with the globally-unique slug constraint on grammar_topics.

import type { GrammarTopicSeed } from "./grammarTopics.seed";

export const GRAMMAR_TOPICS_FR: GrammarTopicSeed[] = [
  {
    slug: "intro_fr",
    title: "Introduction au français",
    category: "introduction",
    cefrLevel: "A1",
    sortOrder: 1,
    language: "fr",
    explanationMd: `Un aperçu rapide avant d'entrer dans les sujets spécifiques — ce cours
utilise le **français standard (de France)**. Le français du Québec ou
d'Afrique diffère sur certains points de vocabulaire et de prononciation,
mais la grammaire de base reste la même.

**Prononciation — quelques pièges pour un débutant :**
- Les consonnes finales sont généralement **muettes** : *petit* se
  prononce sans le "t", *beaucoup* sans le "p" final.
- Les voyelles nasales (**an, en, in, on, un**) n'ont pas d'équivalent en
  espagnol — *pain*, *bon*, *un*.
- La **liaison** : une consonne finale muette se prononce parfois devant
  une voyelle — *les amis* se dit "lez-ami", pas "le-ami".
- **H** ne se prononce jamais, mais certains mots se comportent comme
  s'ils commençaient par une consonne (*le héros*, pas *l'héros*) — ce
  sont des exceptions à apprendre au cas par cas.

**Genre et articles** — comme en espagnol, chaque nom est masculin ou
féminin (*le livre*, *la table*), avec accord des adjectifs. Voir le
sujet "Genre et accord" pour les règles complètes.

**Tu et vous, tous les deux actifs** — contrairement aux simplifications
faites pour l'espagnol et le portugais dans ce cours, le français utilise
vraiment les deux formes au quotidien. Voir le sujet "Tu vs. vous."

**Ordre des mots** — sujet-verbe-objet, comme en espagnol/portugais/
anglais : *Je mange du pain.* Les questions simples peuvent se former
juste avec l'intonation (*Tu parles anglais?*), ou avec *est-ce que*
(*Est-ce que tu parles anglais?*).

**Négation** — le français encadre le verbe avec **ne... pas** : *Je ne
sais pas.* À l'oral courant, le "ne" est souvent laissé de côté (*Je sais
pas*), mais à l'écrit et dans ce cours, on garde la forme complète.

**Phrases essentielles pour commencer :**
- *Bonjour!* / *Salut!* — Hello! / Hi! (salut est plus familier)
- *Bonsoir* — Good evening
- *S'il vous plaît* / *Merci* — Please / Thank you
- *Excusez-moi* — Excuse me
- *Pardon* — Sorry
- *Comment ça va?* / *Ça va?* — How's it going?

À partir d'ici, les sujets suivants approfondissent chacune de ces idées.`,
  },
  {
    slug: "tu_vous_fr",
    title: "Tu vs. vous",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 5,
    language: "fr",
    explanationMd: `Unlike the simplifications made for Latin American Spanish and Brazilian
Portuguese in this app, French genuinely uses **both** forms in everyday
speech and writing — this isn't a register you can drop.

**Tu** — informal "you," singular only. Used with family, friends, people
your own age, children.
- *Tu parles français?* — Do you speak French?

**Vous** — the formal "you" singular (strangers, elders, professional
contexts), **and** the only plural "you" regardless of formality — there's
no separate informal-plural the way ustedes/vosotros split in Spanish.
- *Vous êtes professeur?* — Are you a teacher? (formal, one person)
- *Vous venez tous les deux?* — Are you both coming? (plural, any register)

When unsure with a new adult, default to **vous** — switching from vous to
tu uninvited can read as presumptuous.`,
  },
  {
    slug: "genre_nombre_fr",
    title: "Genre et accord",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 10,
    language: "fr",
    explanationMd: `Every French noun is masculine or feminine, and articles/adjectives must
agree with it in both gender and number.

- *le livre rouge* / *les livres rouges* — the red book(s), masculine
- *la table rouge* / *les tables rouges* — the red table(s), feminine

Most adjectives add **-e** for the feminine (*grand → grande*) and **-s**
for the plural (*grand → grands*), combining as needed (*grande →
grandes*). Adjectives already ending in **-e** don't double it (*jeune*
stays *jeune* for both genders). A number of adjectives have irregular
feminine forms worth learning individually — *beau → belle*, *nouveau →
nouvelle*, *vieux → vieille*.`,
  },
  {
    slug: "articles_fr",
    title: "Les articles (le, la, un, du)",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 15,
    language: "fr",
    explanationMd: `French uses articles far more consistently than English — general
statements need one where English uses none.

**Definite** (le/la/les — "the," but also generic statements): *J'aime le
café.* — I like coffee (coffee in general, not "the coffee").

**Indefinite** (un/une/des — "a/an," "some"): *J'ai un chat.* — I have a
cat. *Elle a des amis à Paris.* — She has friends in Paris.

**Partitive** (du/de la/des — an unspecified amount of something): *Je
mange du pain.* — I'm eating (some) bread. *Elle boit de l'eau.* — She's
drinking water.

After a negation, indefinite/partitive articles usually collapse to
**de**: *J'ai un chat* → *Je n'ai pas de chat.*`,
  },
  {
    slug: "passe_compose_imparfait_fr",
    title: "Passé composé vs. imparfait",
    category: "verb_usage",
    cefrLevel: "B1",
    sortOrder: 30,
    language: "fr",
    explanationMd: `Both are past tenses, but they answer different questions.

**Passé composé** — a completed action, a single event with a clear
beginning and end.
- *Hier, j'ai mangé des tacos.* — Yesterday I ate tacos. (done, one
  occasion)

**Imparfait** — an ongoing state, a habitual action, or the background
scene the passé composé events happen against.
- *Quand j'étais enfant, je mangeais des tacos tous les vendredis.* —
  When I was a kid, I used to eat tacos every Friday.

They often appear together: the imparfait sets the scene, the passé
composé interrupts it.
- *Il pleuvait quand je suis sorti de la maison.* — It was raining when I
  left the house.`,
  },
  {
    slug: "avoir_etre_auxiliaire_fr",
    title: "Avoir ou être? (passé composé)",
    category: "verb_usage",
    cefrLevel: "B1",
    sortOrder: 35,
    language: "fr",
    explanationMd: `A distinctly French wrinkle: the passé composé needs an auxiliary verb,
and most verbs use **avoir** — but around fifteen verbs (mostly movement
or state-change) use **être** instead, and their past participle then
agrees in gender/number with the subject.

The classic "être verbs": **aller, venir, arriver, partir, entrer,
sortir, monter, descendre, naître, mourir, rester, tomber, retourner,
passer** (sometimes), plus all reflexive verbs.

- *J'ai mangé.* — I ate. (avoir — most verbs)
- *Je suis allé au marché.* — I went to the market. (être — aller)
- *Elle est partie tôt.* — She left early. (être + feminine agreement:
  partie, not parti)

A useful shortcut: most être-verbs describe movement between places or a
change of state — arriving, leaving, going up, going down, being born,
dying.`,
  },
  {
    slug: "pronoms_objet_fr",
    title: "Pronoms objets (le, la, lui, leur)",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 60,
    language: "fr",
    explanationMd: `The direct object receives the action of the verb directly — **le/la/
les**, agreeing in gender and number with what they replace, placed
**before** the conjugated verb (unlike English).

- *Tu as acheté le pain? Oui, je l'ai acheté.* — Did you buy the bread?
  Yes, I bought it.
- *Tu as vu Marie? Oui, je l'ai vue.* — Did you see Marie? Yes, I saw her.

The indirect object is who benefits from or receives the action —
**lui** (singular, both genders) / **leur** (plural).
- *J'ai donné le livre à ma sœur* → *Je lui ai donné le livre.* — I gave
  her the book.
- *J'ai écrit aux enfants* → *Je leur ai écrit.* — I wrote to them.

Both pronoun types go right before the conjugated verb (or before the
infinitive when there is one): *je veux le voir*, not *je veux voir le*.`,
  },
];
