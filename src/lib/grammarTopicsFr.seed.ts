// Initial French grammar topics — same hand-authored pattern as the Spanish
// and Portuguese topic seed files, a deliberately small starting set (not
// matching Spanish's current 26). Slugs are suffixed "_fr" so they never
// collide with the globally-unique slug constraint on grammar_topics.

import type { GrammarTopicSeed } from "./grammarTopics.seed";

export const GRAMMAR_TOPICS_FR: GrammarTopicSeed[] = [
  {
    slug: "intro_fr",
    title: "Introduction to French",
    category: "introduction",
    cefrLevel: "A1",
    sortOrder: 1,
    language: "fr",
    explanationMd: `A quick overview before diving into specific topics — this course uses
**standard (Metropolitan France) French**. Québécois or African French
differ on some vocabulary and pronunciation points, but the core grammar
stays the same.

**Pronunciation — a few pitfalls for a beginner:**
- Final consonants are usually **silent**: *petit* is pronounced without
  the "t," *beaucoup* without the final "p."
- The nasal vowels (**an, en, in, on, un**) have no equivalent in
  Spanish — *pain*, *bon*, *un*.
- **Liaison**: a silent final consonant is sometimes pronounced before a
  vowel — *les amis* is said "lez-ami," not "le-ami."
- **H** is never pronounced, but some words behave as if they started
  with a consonant (*le héros*, not *l'héros*) — these are exceptions
  learned case by case.

**Gender and articles** — like Spanish, every noun is masculine or
feminine (*le livre*, *la table*), with adjectives agreeing accordingly.
See the "Gender and agreement" topic for the full rules.

**Tu and vous, both active** — unlike the simplifications made for
Spanish and Portuguese in this course, French genuinely uses both forms
in everyday speech. See the "Tu vs. vous" topic.

**Word order** — subject-verb-object, like Spanish/Portuguese/English:
*Je mange du pain.* — I eat bread. Simple questions can be formed just
with intonation (*Tu parles anglais?*), or with *est-ce que* (*Est-ce que
tu parles anglais?*).

**Negation** — French wraps the verb with **ne... pas**: *Je ne sais
pas.* — I don't know. In everyday spoken French, the "ne" is often
dropped (*Je sais pas*), but in writing and in this course, the full form
is kept.

**Essential phrases to start with:**
- *Bonjour!* / *Salut!* — Hello! / Hi! (salut is more casual)
- *Bonsoir* — Good evening
- *S'il vous plaît* / *Merci* — Please / Thank you
- *Excusez-moi* — Excuse me
- *Pardon* — Sorry
- *Comment ça va?* / *Ça va?* — How's it going?

From here, the following topics dig deeper into each of these ideas.`,
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
  {
    slug: "possessifs_adjectifs_fr",
    title: "Possessive adjectives (mon, ma, mes, ton, ta, tes, etc.)",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 70,
    language: "fr",
    explanationMd: `Possessive adjectives in French agree with the **gender and number of the noun they modify**, not the person who owns it — this is a key difference from English. They always come before the noun.

The forms are:
- **1st person singular** (my): *mon* (masculine), *ma* (feminine), *mes* (plural)
- **2nd person singular** (your): *ton* (masculine), *ta* (feminine), *tes* (plural)
- **3rd person singular** (his/her/its): *son* (masculine), *sa* (feminine), *ses* (plural)
- **1st person plural** (our): *notre* (masculine/feminine), *nos* (plural)
- **2nd person plural** (your): *votre* (masculine/feminine), *vos* (plural)
- **3rd person plural** (their): *leur* (masculine/feminine), *leurs* (plural)

Note that *son/sa/ses* can mean "his," "her," or "its" depending on context — when ambiguous, clarify with *de lui*, *d'elle*, etc.

Also, before a vowel or silent h, *ma*, *ta*, and *sa* become *mon*, *ton*, and *son*: *mon amie* (my female friend), *ton école* (your school), *son histoire* (his/her story).

Examples:
- *Mon livre est rouge.* — My book is red.
- *Ma maison est grande.* — My house is big.
- *Mes enfants adorent jouer.* — My children love to play.
- *Notre professeur est très gentil.* — Our teacher is very kind.
- *Leur voiture est neuve.* — Their car is new.`,
  },
  {
    slug: "demonstratifs_adjectifs_fr",
    title: "Demonstrative adjectives (ce, cet, cette, ces)",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 80,
    language: "fr",
    explanationMd: `Demonstrative adjectives point out a specific person or thing. They agree in gender and number with the noun they modify and always come before the noun.

- **Masculine singular**: *ce* (this/that) — *ce livre* (this/that book)
- **Masculine singular before vowel or silent h**: *cet* (this/that) — *cet ami* (this/that friend), *cet hôtel* (this/that hotel)
- **Feminine singular**: *cette* (this/that) — *cette maison* (this/that house)
- **Plural**: *ces* (these/those) — *ces livres*, *ces maisons* (these/those books/houses)

French *ce/cet/cette/ces* doesn't distinguish between "this" and "that" the way English does — context or adverbs like *-ci* (this one here) and *-là* (that one there) clarify if needed: *ce livre-ci* (this book), *ce livre-là* (that book).

Examples:
- *Ce film est excellent.* — This/that film is excellent.
- *Cet homme est mon père.* — This/that man is my father.
- *Cette femme parle français.* — This/that woman speaks French.
- *Ces enfants jouent dans le parc.* — These/those children are playing in the park.
- *Ce café-ci est meilleur que ce café-là.* — This café is better than that café.`,
  },
  {
    slug: "verbes_reflexes_fr",
    title: "Reflexive verbs",
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 90,
    language: "fr",
    explanationMd: `A reflexive verb is one where the subject does the action to itself — marked with the reflexive pronoun *se/s'* (to do it to oneself). The reflexive pronoun agrees with the subject and goes right before the verb.

The reflexive pronouns are:
- *je* → *me* (m' before a vowel)
- *tu* → *te* (t' before a vowel)
- *il/elle/on* → *se* (s' before a vowel)
- *nous* → *nous*
- *vous* → *vous*
- *ils/elles* → *se* (s' before a vowel)

Common reflexive verbs:
- *se lever* — to get up
- *s'appeler* — to be named
- *se laver* — to wash (oneself)
- *se coucher* — to go to bed
- *s'habiller* — to get dressed
- *se promener* — to take a walk
- *se réveiller* — to wake up
- *se tromper* — to be mistaken

In the passé composé, reflexive verbs always use *être* as the auxiliary, and the past participle sometimes agrees with the reflexive pronoun: *Je me suis levé(e).* — I got up. *Ils se sont trompés.* — They made a mistake.

Examples:
- *Je me réveille à sept heures.* — I wake up at seven o'clock.
- *Comment t'appelles-tu?* — What is your name?
- *Elle s'habille rapidement.* — She gets dressed quickly.
- *Nous nous promenons au parc.* — We are taking a walk in the park.
- *Ils se sont couchés tôt.* — They went to bed early.`,
  },
  {
    slug: "imperatif_fr",
    title: "The imperative (commands)",
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 100,
    language: "fr",
    explanationMd: `The imperative is used to give commands or make requests. It exists in three forms — *tu* (informal singular), *nous* (let's...), and *vous* (formal/plural). The subject pronoun is dropped; only the verb remains.

For regular -er verbs, drop the final -s from the *tu* form:
- *parler* (to speak) → *parle!* (speak!), *parlons!* (let's speak!), *parlez!* (speak! formal/plural)
- *manger* (to eat) → *mange!*, *mangeons!*, *mangez!* (we keep the *e* before *o* to preserve the soft g sound)
- *commencer* (to begin) → *commence!*, *commençons!*, *commencez!* (cedilla before *a* to keep the soft c sound)

For -ir verbs, the forms match the present tense:
- *finir* (to finish) → *finis!*, *finissons!*, *finissez!*

Irregular verbs keep their irregularities:
- *avoir* → *aie!*, *ayons!*, *ayez!*
- *être* → *sois!*, *soyons!*, *soyez!*
- *aller* → *va!*, *allons!*, *allez!*
- *venir* → *viens!*, *venons!*, *venez!*

With reflexive verbs, the reflexive pronoun attaches to the end with a hyphen: *Lève-toi!* (Get up!), *Levons-nous!* (Let's get up!), *Levez-vous!* (Get up, formal!)

Examples:
- *Ferme la porte!* — Close the door!
- *Parlons français!* — Let's speak French!
- *Écoutez-moi!* — Listen to me! (formal)
- *Assieds-toi!* — Sit down!
- *Venez ici, s'il vous plaît!* — Come here, please!`,
  },
  {
    slug: "comparatifs_superlatifs_fr",
    title: "Comparatives and superlatives",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 110,
    language: "fr",
    explanationMd: `**Comparatives** compare two things using three patterns:

- **Comparative of superiority**: *plus ... que* (more ... than)
  *Ce film est plus intéressant que celui-ci.* — This film is more interesting than that one.

- **Comparative of inferiority**: *moins ... que* (less ... than)
  *Elle est moins grande que son frère.* — She is less tall than her brother.

- **Comparative of equality**: *aussi ... que* (as ... as)
  *Il est aussi intelligent que sa sœur.* — He is as intelligent as his sister.

**Superlatives** express the highest or lowest degree. The superlative uses *le/la/les* + *plus/moins* + adjective + preposition + context:
- *C'est la plus belle maison du quartier.* — It's the most beautiful house in the neighborhood.
- *C'est le moins cher restaurant de la ville.* — It's the least expensive restaurant in the city.

A few adjectives have irregular forms:
- *bon* (good) → comparative: *meilleur* (better), superlative: *le meilleur* (the best)
- *mauvais* (bad) → comparative: *pire* (worse), superlative: *le pire* (the worst)
- *petit* (small) → comparative: *plus petit* or *moindre* (smaller/lesser)

Examples:
- *Paris est plus grand que Lyon.* — Paris is bigger than Lyon.
- *Cette voiture est moins chère que celle-là.* — This car is less expensive than that one.
- *Le français est aussi difficile que l'allemand.* — French is as difficult as German.
- *C'est le meilleur chocolat que j'ai jamais goûté.* — It's the best chocolate I've ever tasted.
- *Marie est la plus jeune de la classe.* — Marie is the youngest in the class.`,
  },
  {
    slug: "pronoms_relatifs_fr",
    title: "Relative pronouns (qui, que, où, dont)",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 120,
    language: "fr",
    explanationMd: `Relative pronouns connect a dependent clause to a noun or noun phrase in the main clause. They refer back to an antecedent — the noun being described.

- **Qui** — subject of the relative clause (who/that); refers to people or things
  *L'homme qui parle est mon professeur.* — The man who is speaking is my teacher.

- **Que** (or *qu'* before a vowel) — direct object of the relative clause (whom/that); refers to people or things
  *Le film que j'ai regardé était très bon.* — The film that I watched was very good.

- **Où** — expresses location or time (where, when); refers to places or moments
  *La maison où j'habite est vieille.* — The house where I live is old.
  *Le jour où nous nous sommes rencontrés était magique.* — The day when we met was magical.

- **Dont** — replaces *de + qui/que/lequel* (of whom/which, whose); used for possession and after verbs/adjectives that take *de*
  *L'auteur dont j'ai lu le livre est célèbre.* — The author whose book I read is famous.
  *C'est un sujet dont on parle beaucoup.* — It's a subject that people talk about a lot.

Examples:
- *Les enfants qui jouent dans le parc sont heureux.* — The children who are playing in the park are happy.
- *C'est un livre que tout le monde recommande.* — It's a book that everyone recommends.
- *La ville où elle travaille est magnifique.* — The city where she works is beautiful.
- *Les amis dont tu m'as parlé sont très sympathiques.* — The friends (about) whom you told me are very nice.`,
  },
  {
    slug: "subjonctif_emploi_fr",
    title: "Subjunctive mood (when to use)",
    category: "mood",
    cefrLevel: "B1",
    sortOrder: 130,
    language: "fr",
    explanationMd: `The subjunctive isn't a tense, it's a mood — it marks the speaker's attitude toward what's being said: doubt, desire, emotion, or unreality. It almost always appears in a dependent clause introduced by *que*, after a main clause that triggers it.

**Common triggers for the subjunctive:**

- **Desire, will, or command** — verbs like *vouloir* (want), *demander* (ask), *exiger* (demand), *souhaiter* (wish), *préférer* (prefer)
  *Je veux qu'il vienne.* — I want him to come.
  *Elle souhaite que tu réussisses.* — She wishes that you succeed.

- **Doubt, disbelief, or denial** — *douter* (doubt), *ne pas croire* (not believe), *nier* (deny)
  *Je doute qu'il soit là.* — I doubt that he is there.
  *Je ne crois pas qu'elle ait raison.* — I don't believe that she's right.

- **Emotion** — *craindre* (fear), *avoir peur* (be afraid), *être heureux/triste* (be happy/sad), *regretter* (regret)
  *J'ai peur qu'il fasse mauvais.* — I'm afraid the weather will be bad.
  *Je suis triste qu'elle parte.* — I'm sad that she's leaving.

- **Impersonal expressions** — *il faut* (it's necessary), *il est important* (it's important), *il est possible* (it's possible), *c'est dommage* (it's a shame)
  *Il faut que tu étudies.* — You need to study.
  *C'est dommage qu'il pleuve.* — It's a shame that it's raining.

Compare to the indicative, which is used when the main clause states a fact:
- *Je sais qu'il vient.* — I know he is coming. (fact — indicative)
- *Je veux qu'il vienne.* — I want him to come. (desire — subjunctive)

Examples:
- *Il est possible que je parte demain.* — It's possible that I might leave tomorrow.
- *Nous avons peur que vous vous trompiez.* — We're afraid that you're making a mistake.
- *Il ne faut pas que tu sois en retard.* — You must not be late.
- *Je préfère que nous restions ici.* — I prefer that we stay here.`,
  },
];
