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
];
