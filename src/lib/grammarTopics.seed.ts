// One-time seed data for the "Gramática" side of the grammar module.
// Hand-authored, not pipeline-generated — there are only ~14 of these and
// they're structural/pedagogical, not the kind of content that benefits
// from a recurring generation loop. Inserted once via
// scripts/seed-grammar-topics.ts. The recurring pipeline only generates the
// practice exercises that attach to these topics (grammar_exercises).

import type { CefrLevel } from "./types";

export interface GrammarTopicSeed {
  slug: string;
  title: string;
  category: string;
  cefrLevel: CefrLevel;
  sortOrder: number;
  explanationMd: string;
  language?: "es" | "pt" | "fr"; // defaults to "es" — every topic in this file predates multi-language support
}

export const GRAMMAR_TOPICS: GrammarTopicSeed[] = [
  {
    slug: "ser_estar",
    title: "Ser vs. estar",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 10,
    explanationMd: `Both mean "to be," but they're not interchangeable.

**Ser** is for identity, origin, and traits that define what something *is*:
occupation, nationality, material, time, and inherent characteristics.
- *Soy maestra.* — I am a teacher.
- *La mesa es de madera.* — The table is made of wood.
- *Son las tres.* — It's three o'clock.

**Estar** is for location, and for states or conditions — how something *is
right now*, which could change.
- *Estoy en la cocina.* — I'm in the kitchen.
- *El café está frío.* — The coffee is cold.

Some adjectives shift meaning depending on which verb you use — see the
"change of state" topic for that pair specifically.`,
  },
  {
    slug: "por_para",
    title: "Por vs. para",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 20,
    explanationMd: `**Por** points to a cause, a means, or an exchange — the reason *behind*
something, or movement *through* a place.
- *Gracias por tu ayuda.* — Thanks for your help.
- *Viajamos por México.* — We traveled through Mexico.
- *Lo cambié por otro.* — I exchanged it for another one.

**Para** points to a purpose, a destination, or a deadline — where
something is *headed*.
- *Este regalo es para ti.* — This gift is for you.
- *Salimos para Puebla mañana.* — We're leaving for Puebla tomorrow.
- *Lo necesito para el lunes.* — I need it by Monday.

A useful shortcut: *por* looks backward at the reason, *para* looks forward
at the goal.`,
  },
  {
    slug: "preterito_imperfecto",
    title: "Pretérito vs. imperfecto",
    category: "verb_usage",
    cefrLevel: "B1",
    sortOrder: 30,
    explanationMd: `Both are past tenses, but they answer different questions.

**Pretérito** — a completed action, a single event with a clear beginning
and end.
- *Ayer comí tacos.* — Yesterday I ate tacos. (done, one occasion)

**Imperfecto** — an ongoing state, a habitual action, or the background
scene the pretérito events happen against.
- *Cuando era niño, comía tacos todos los viernes.* — When I was a kid, I
  used to eat tacos every Friday. (habitual, no defined endpoint)

They often appear together: the imperfecto sets the scene, the pretérito
interrupts it.
- *Llovía cuando salí de casa.* — It was raining when I left the house.`,
  },
  {
    slug: "gender_agreement",
    title: "Concordancia de género y número",
    category: "fundamentals",
    cefrLevel: "A1",
    sortOrder: 40,
    explanationMd: `Every noun in Spanish is masculine or feminine, and articles/adjectives
must agree with it in both gender and number.

- *el libro rojo* / *los libros rojos* — the red book(s), masculine
- *la mesa roja* / *las mesas rojas* — the red table(s), feminine

Most nouns ending in **-o** are masculine and most ending in **-a** are
feminine, but there are common exceptions (*el día*, *la mano*) that just
have to be learned with the noun. Adjectives ending in **-e** or a
consonant (*grande*, *fácil*) don't change for gender, only for number
(*grandes*, *fáciles*).`,
  },
  {
    slug: "adjective_placement",
    title: "Posición del adjetivo",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 50,
    explanationMd: `Most descriptive adjectives go **after** the noun in Spanish.
- *una casa grande* — a big house

A handful of adjectives can go **before** the noun, and some actually
change meaning depending on position:
- *un amigo viejo* — a friend who is old (age)
- *un viejo amigo* — a longtime friend (how long you've known them)
- *una mujer pobre* — a woman without money
- *una pobre mujer* — a woman to be pitied

When in doubt, after the noun is the safe, neutral default.`,
  },
  {
    slug: "direct_object_pronouns",
    title: "Pronombres de objeto directo",
    category: "pronouns",
    cefrLevel: "A2",
    sortOrder: 60,
    explanationMd: `The direct object receives the action of the verb directly. Once it's
established, Spanish usually replaces it with a pronoun rather than
repeating the noun.

lo / la / los / las — matching gender and number of what they replace.

- *¿Compraste el pan?* *Sí, lo compré.* — Did you buy the bread? Yes, I
  bought it.
- *¿Viste a María?* *Sí, la vi.* — Did you see María? Yes, I saw her.

The pronoun goes right before a conjugated verb, or can attach to the end
of an infinitive or gerund: *voy a comprarlo* / *lo voy a comprar*.`,
  },
  {
    slug: "indirect_object_pronouns",
    title: "Pronombres de objeto indirecto",
    category: "pronouns",
    cefrLevel: "A2",
    sortOrder: 70,
    explanationMd: `The indirect object is who benefits from or receives the action — often
"to/for someone."

me / te / le / nos / les

- *Le di el libro a mi hermana.* — I gave the book to my sister.
- *¿Me puedes explicar eso?* — Can you explain that to me?

Note that *le* and *les* don't show gender — that's why Spanish often adds
*a ella*, *a usted*, *a ellos* for clarity even though the pronoun is
already there: *Le escribí una carta a él.*`,
  },
  {
    slug: "double_object_pronouns",
    title: "Combinación de pronombres (se lo, se la)",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 80,
    explanationMd: `When a direct and an indirect object pronoun both appear, the indirect
one comes first — but *le/les* become **se** right before *lo/la/los/las*
to avoid the awkward sound of "le lo."

- *Le di el libro a mi hermana* → *Se lo di.* — I gave it to her.
- *Les mandé las fotos* → *Se las mandé.* — I sent them to them.

Both pronouns move together: before a conjugated verb, or attached to the
end of an infinitive/gerund/affirmative command — *voy a dárselo* /
*dáselo*.`,
  },
  {
    slug: "reflexive_verbs",
    title: "Verbos reflexivos",
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 90,
    explanationMd: `A reflexive verb is one where the subject does the action to itself —
marked with *me/te/se/nos/se*.

- *Me levanto a las siete.* — I get (myself) up at seven.
- *Ella se lava las manos.* — She washes her hands.

Some verbs change meaning between the plain and reflexive form:
- *dormir* (to sleep) vs. *dormirse* (to fall asleep)
- *ir* (to go) vs. *irse* (to leave/go away)

The reflexive pronoun follows the same placement rules as object pronouns —
before the conjugated verb, or attached to an infinitive/gerund.`,
  },
  {
    slug: "gustar_verbs",
    title: 'Verbos como "gustar"',
    category: "verb_usage",
    cefrLevel: "A2",
    sortOrder: 100,
    explanationMd: `*Gustar* doesn't work like "to like" in English — it works like "to be
pleasing to." The thing being liked is the grammatical subject, and the
person is an indirect object.

- *Me gusta el café.* — Coffee is pleasing to me. (I like coffee.)
- *Me gustan los tacos.* — Tacos are pleasing to me. (I like tacos — plural
  subject, so *gustan*.)

Other verbs follow the same pattern: *encantar* (to love/be delighted by),
*molestar* (to bother), *interesar* (to interest), *faltar* (to be
lacking/missing).
- *Nos encanta esta canción.* — We love this song.`,
  },
  {
    slug: "comparatives_superlatives",
    title: "Comparativos y superlativos",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 110,
    explanationMd: `**Comparisons of inequality**: *más/menos ... que*
- *Ella es más alta que yo.* — She is taller than me.

**Comparisons of equality**: *tan ... como* (adjectives/adverbs), *tanto/a(s)
... como* (nouns)
- *Es tan inteligente como su hermano.* — He's as smart as his brother.

**Superlatives**: *el/la más ... de*
- *Es la ciudad más grande del país.* — It's the biggest city in the
  country.

A few adjectives have irregular comparative forms: *bueno → mejor*, *malo →
peor*, *grande → mayor* (age/importance), *pequeño → menor* (age).`,
  },
  {
    slug: "subjunctive_triggers",
    title: "Cuándo usar el subjuntivo",
    category: "mood",
    cefrLevel: "B1",
    sortOrder: 120,
    explanationMd: `The subjunctive isn't a tense, it's a mood — it marks that the speaker is
expressing doubt, desire, emotion, or something not yet real, usually in a
clause introduced by *que*.

Common triggers:
- **Desire/influence**: *Quiero que vengas.* — I want you to come.
- **Doubt/denial**: *No creo que sea verdad.* — I don't think it's true.
- **Emotion**: *Me alegra que estés aquí.* — I'm glad you're here.
- **Impersonal expressions**: *Es importante que estudies.* — It's
  important that you study.

If the main clause states a fact instead — *Sé que viene* (I know he's
coming) — the indicative is used instead, even though the sentence
structure looks similar.`,
  },
  {
    slug: "personal_a",
    title: 'La "a" personal',
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 130,
    explanationMd: `When the direct object of a verb is a specific person (or a pet treated
like one), Spanish adds **a** right before it — with no equivalent in
English.

- *Veo a mi hermana.* — I see my sister.
- *Busco a Juan.* — I'm looking for Juan.

Compare with a non-person object, which takes no *a*:
- *Busco mi mochila.* — I'm looking for my backpack.

Exception: after *tener* in its basic sense of possession, the personal *a*
is usually dropped — *Tengo dos hermanas*, not *Tengo a dos hermanas*.`,
  },
  {
    slug: "change_of_state",
    title: "Ser/estar con adjetivos (cambio de estado)",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 140,
    explanationMd: `Some adjectives change meaning depending on whether they follow *ser* or
*estar* — the *ser* version is an inherent trait, the *estar* version is a
temporary state or a change from what's expected.

- *Es aburrido.* — He's boring (as a person). / *Está aburrido.* — He's
  bored (right now).
- *Es listo.* — He's clever. / *Está listo.* — He's ready.
- *Es rico.* — He's wealthy. / *Está rico.* — It (food) tastes great.
- *Es malo.* — He's a bad person. / *Está malo.* — He's sick / it's gone
  bad.

The pattern to remember: *ser* describes what something fundamentally is,
*estar* describes the condition it's currently in.`,
  },
  {
    slug: "si_clauses",
    title: "Oraciones condicionales con si",
    category: "mood",
    cefrLevel: "B1",
    sortOrder: 150,
    explanationMd: `Sentences with *si* ("if") come in three main patterns, matched by verb
mood/tense.

**Real/likely** (present situations): *si* + presente indicativo, +
presente or futuro.
- *Si tengo tiempo, te llamo.* — If I have time, I'll call you.
- *Si llueve, no saldremos.* — If it rains, we won't go out.

**Hypothetical/unlikely** (present or future): *si* + imperfecto de
subjuntivo, + condicional.
- *Si tuviera más dinero, viajaría más.* — If I had more money, I'd travel
  more.

**Contrary to fact, past**: *si* + pluscuamperfecto de subjuntivo, +
condicional (or pluscuamperfecto de subjuntivo again).
- *Si hubiera sabido, te habría avisado.* — If I had known, I would have
  told you.

Never use presente de subjuntivo directly after *si* in these
constructions — that's a common learner mistake.`,
  },
  {
    slug: "relative_pronouns",
    title: "Pronombres relativos (que, quien, el cual)",
    category: "pronouns",
    cefrLevel: "B1",
    sortOrder: 160,
    explanationMd: `Relative pronouns connect a clause back to a noun already mentioned.

**Que** — the default choice for both people and things, in almost every
context.
- *El libro que compré es muy bueno.* — The book that I bought is very
  good.
- *La persona que llamó no dejó su nombre.* — The person who called didn't
  leave their name.

**Quien(es)** — only for people, and only after a preposition or comma
(never as a plain subject the way *que* can be).
- *La maestra con quien hablé fue muy amable.* — The teacher I spoke with
  was very kind.

**El cual / la cual / los cuales** — more formal, common after longer
prepositions, useful when *que* would leave it unclear what it refers to.
- *La empresa para la cual trabajo está creciendo.* — The company I work
  for is growing.`,
  },
  {
    slug: "passive_se",
    title: "El se pasivo e impersonal",
    category: "verb_usage",
    cefrLevel: "B2",
    sortOrder: 170,
    explanationMd: `Spanish avoids the passive voice (*ser* + participio) in everyday speech —
the impersonal/passive *se* is far more natural.

**Se pasivo** — when the subject doing the action isn't mentioned, and the
true subject is a thing:
- *Se venden casas aquí.* — Houses are sold here. (*venden* agrees with
  "casas")
- *Se firmó el contrato ayer.* — The contract was signed yesterday.

**Se impersonal** — for general statements with no specific subject at
all, verb always singular:
- *Se dice que va a llover.* — They say it's going to rain.
- *Se puede pagar con tarjeta.* — You can pay by card.

Compare to the true passive (*La casa fue vendida*), which reads as
formal/written — native speakers reach for *se* first in conversation.`,
  },
  {
    slug: "demonstratives",
    title: "Demostrativos (este, ese, aquel)",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 180,
    explanationMd: `Demonstratives point to something based on distance from the speaker.

- **Este/esta/estos/estas** — close to the speaker (this/these).
  *Este libro es mío.* — This book is mine.
- **Ese/esa/esos/esas** — close to the listener, or moderate distance
  (that/those).
  *¿Me pasas esa taza?* — Can you pass me that cup?
- **Aquel/aquella/aquellos/aquellas** — far from both speaker and listener
  (that/those, over there).
  *Aquella montaña se ve hermosa desde aquí.* — That mountain over there
  looks beautiful from here.

The neuter forms *esto*, *eso*, *aquello* refer to an idea or unnamed
thing, not a specific noun:
- *Eso no me parece justo.* — That doesn't seem fair to me.`,
  },
  {
    slug: "possessives",
    title: "Posesivos (mi/tu vs. mío/tuyo)",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 190,
    explanationMd: `Short possessives go before the noun; long possessives go after (or stand
alone) and agree in gender and number.

**Short form** (mi, tu, su, nuestro/a, su) — before the noun:
- *Mi hermano vive en Puebla.* — My brother lives in Puebla.
- *Nuestra casa es pequeña.* — Our house is small.

**Long form** (mío/a, tuyo/a, suyo/a, nuestro/a, suyo/a) — after the noun,
or standing alone once the noun is clear:
- *Un amigo mío me lo contó.* — A friend of mine told me.
- *Esta silla es tuya, no mía.* — This chair is yours, not mine.

*Su/suyo* is ambiguous (his/her/your formal/their) — when it matters,
clarify with *de él*, *de ella*, *de usted*, *de ellos*: *el carro de
ella*.`,
  },
  {
    slug: "negation",
    title: "Palabras negativas y doble negación",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 200,
    explanationMd: `Spanish allows — and often requires — multiple negative words in one
sentence, unlike English.

*No* + verb is the basic negation: *No quiero.* — I don't want to.

When a negative word (nada, nadie, nunca, tampoco, ninguno) comes **after**
the verb, *no* is still required before it:
- *No como nada.* — I don't eat anything.
- *No conozco a nadie aquí.* — I don't know anyone here.

When the negative word comes **before** the verb, *no* is dropped:
- *Nadie llegó a tiempo.* — Nobody arrived on time.
- *Nunca he estado en Europa.* — I've never been to Europe.

*Tampoco* means "neither/not either": *Yo tampoco quiero ir.* — I don't
want to go either.`,
  },
  {
    slug: "time_expressions",
    title: "Desde, desde hace, hace que",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 210,
    explanationMd: `Three related expressions handle "how long" in Spanish, each with a
different structure.

**Desde** — since a specific point in time:
- *Vivo aquí desde 2019.* — I've lived here since 2019.

**Desde hace** — for a duration, used with the present tense (not present
perfect, unlike English "have been"):
- *Vivo aquí desde hace cinco años.* — I've lived here for five years.

**Hace ... que** — the same idea, reordered, also common:
- *Hace cinco años que vivo aquí.* — It's been five years since I've lived
  here.

For something that stopped happening, switch to pretérito with *hace*:
- *Hace dos años que me mudé.* — I moved two years ago.`,
  },
  {
    slug: "diminutives_augmentatives",
    title: "Diminutivos y aumentativos",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 220,
    explanationMd: `Diminutives (mostly *-ito/-ita*) and augmentatives (*-ote/-ota*,
*-ísimo/-ísima*) are everywhere in Mexican Spanish — for size, but just as
often for warmth, politeness, or emphasis.

**Diminutive -ito/-ita** — small, or affectionate/softening:
- *un momentito* — just a moment (softer than "un momento")
- *mi abuelita* — my grandma (affectionate, not necessarily tiny)
- *ahorita* — right now / in a bit (from "ahora" — very Mexican, and
  famously flexible about the actual time meant)

**Augmentative -ote/-ota, -ísimo/-ísima** — big, or intense:
- *un carrazo* — quite a car
- *carísimo* — very expensive (from "caro")

Spelling adjusts to keep the sound: *poco → poquito*, *amigo → amiguito*
(g→gu before i, to keep the hard g sound).`,
  },
  {
    slug: "prepositions_a_en_de_con",
    title: "Preposiciones: a, en, de, con",
    category: "fundamentals",
    cefrLevel: "B1",
    sortOrder: 230,
    explanationMd: `Four prepositions cover a lot of ground and don't map neatly onto English
"to/at/in/of/with."

- **a** — direction/destination, time of day, the personal *a*: *Voy a la
  tienda.* / *a las tres* / *Veo a mi hermana.*
- **en** — location (in/on/at), method of transport: *Está en la mesa.* /
  *Viajamos en autobús.*
- **de** — origin, possession, material: *Soy de México.* / *el carro de mi
  papá* / *una mesa de madera.*
- **con** — accompaniment, manner: *Voy con mis amigos.* / *Lo hizo con
  cuidado.*

A common trap: "to think about" is *pensar en*, not *pensar de* (which
asks for an opinion): *Pienso en ti* (I think about you) vs. *¿Qué piensas
de la película?* (What do you think of the movie?)`,
  },
  {
    slug: "hay_vs_estar",
    title: "Hay vs. estar",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 240,
    explanationMd: `Both can describe presence, but they answer different questions.

**Hay** (from *haber*) — introduces something for the first time, when
*what exists* is the new information. Never takes a definite article
(el/la/los/las) right after it.
- *Hay un café en la esquina.* — There's a café on the corner.
- *Hay dos opciones.* — There are two options.

**Estar** — locates something already known/specific — the listener
already knows *what*, and *estar* adds *where*.
- *El café está en la esquina.* — The café is on the corner. (a specific
  café you both know)
- *Los libros están en la mesa.* — The books are on the table.

Rule of thumb: introducing something new → *hay*; saying where a known
thing is → *estar*.`,
  },
  {
    slug: "reported_speech",
    title: "Estilo indirecto",
    category: "mood",
    cefrLevel: "B2",
    sortOrder: 250,
    explanationMd: `Reporting what someone said usually shifts the tense one step into the
past, the same way English does.

- Direct: *"Voy a llegar tarde."* → Reported: *Dijo que iba a llegar
  tarde.* (presente → imperfecto)
- Direct: *"Llegué tarde."* → Reported: *Dijo que había llegado tarde.*
  (pretérito → pluscuamperfecto)
- Direct: *"Voy a llamarte."* → Reported: *Dijo que me iba a llamar* /
  *Dijo que me llamaría.*

Questions reported indirectly use *si* (for yes/no questions) or the
question word, with no inverted word order and no question marks:
- *"¿Vienes?"* → *Me preguntó si venía.*
- *"¿Dónde vives?"* → *Me preguntó dónde vivía.*`,
  },
  {
    slug: "adverb_formation",
    title: "Adverbios terminados en -mente",
    category: "fundamentals",
    cefrLevel: "A2",
    sortOrder: 260,
    explanationMd: `Most manner adverbs are formed by adding *-mente* to the **feminine
singular** form of the adjective.

- *rápido → rápida → rápidamente* — quickly
- *fácil → fácilmente* — easily (adjectives ending in a consonant just add
  -mente directly)
- *cuidadoso → cuidadosa → cuidadosamente* — carefully

If the adjective already carries a written accent, the adverb keeps it in
the same spot, alongside *-mente*'s own stress: *rápida → rápidamente*
(both stresses are pronounced; the accent stays where it was on the
adjective).

When two or more *-mente* adverbs are joined by *y* or a comma, only the
last one keeps *-mente* — the earlier ones appear as the plain feminine
adjective:
- *Habló clara y directamente.* — They spoke clearly and directly.`,
  },
];
