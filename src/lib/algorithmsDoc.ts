// Plain-English explanation of every scoring/scheduling algorithm in the
// app, rendered as a Glossary tab via renderMiniMarkdown. Keep this in sync
// whenever a threshold in srs.ts / grammarQueue.ts / dashboard.ts changes —
// it's meant to be the actual current numbers, not a rough approximation.

export const ALGORITHMS_DOC = `
**Vocab & verb flashcards — spaced repetition (SM-2 style, same shape as Anki)**

Every vocab word and verb you review has its own schedule: an ease factor (how easy this item has been for you, starting at 2.5), an interval (days until it's due again), and a repetitions count. Grading a card 0-5 after seeing the answer:

- 0-2 ("Again") means you didn't know it — repetitions resets to 0 and it comes back tomorrow.
- 3 ("Hard") through 5 ("Easy") means you knew it — repetitions goes up, and the interval grows: 1 day after your first success, 6 days after your second, then *previous interval × ease factor* every time after that.
- The ease factor itself nudges up or down slightly with each grade (easier grades raise it, harder ones lower it), with a floor of 1.3 so a struggling item never spirals to near-zero growth.

There's no shortcut to skip this — every item's interval is earned through the normal grade progression, so the dashboard's mastery bars reflect real review history.

**What "due" and the review order mean**

A card is due once its interval has elapsed. The default review order is most-overdue first, then most-frequent (lower frequency rank = more common word) as a tiebreaker — so within what's due, you see common words before rare ones. Switching to a theme narrows the pool to just that theme's words instead. The verb frequency slider works the same way but as a hard filter (e.g. "Top 200") rather than a sort order, and only applies to verbs.

**Grammar & verb-tense tests — pass mark and reprompt loop**

Every scored test (a grammar topic, the combined test, a single tense, or a tense group) uses the same pass mark: roughly 87% correct (the "26 out of 30" idea, scaled to whatever the actual test length is — 10, 12, or 15 questions). After you finish, anything you missed gets offered back to you as a "Review N missed" round — you can keep clearing rounds until everything's correct, or click "Done" to stop early. Only your very first pass through the questions counts toward the score and the retest schedule below; review rounds are just remedial practice on top.

**Retest scheduling — bronze / silver / gold**

Passing a test schedules a retest, the same way a flashcard schedules its next review, but coarser since a whole test is a bigger commitment than one card:

- First pass: retest tomorrow.
- Each subsequent pass roughly doubles the gap: 1 → 3 → 7 → 14 → 28 days, capped at 180 days.
- Failing doesn't wipe the slate — the interval shrinks to 30% of what it was (floored at 1 day), so one bad day after a long streak costs you real ground but doesn't erase it. A lapse from gold typically lands you back around silver, not all the way to bronze.

The tier shown on each test result and picker tile is read straight from that interval: **bronze** once you've passed at all (interval ≥ 1 day), **silver** once the gap has grown past 14 days, **gold** past 60 days. When a retest's interval has elapsed, you'll see a "tests ready for retest" pill on the dashboard.

**CEFR level badge — coverage, not a single test**

Your overall level badge is the highest CEFR level (A1 through C2) where you've covered at least 65% of that level's content *and* every level below it also clears the bar — so you can't "skip" a weak A2 by racing ahead to B1 content. Coverage blends three things:

- Vocab and verbs you've retained (graded 3+ at least twice, or an interval that's already grown past a year) — the same signal as the dashboard's mastery bars, at a stricter bar.
- Grammar topics at silver-tier mastery or better.
- Verb tenses at silver-tier mastery or better.

Not every topic or tense counts equally. Each one carries a difficulty weight, so mastering a hard one moves your coverage more than mastering an easy one at the same level:

- Grammar topics: introduction (0.75×) < fundamentals (1×) < pronouns / verb usage like ser-vs-estar (1.25×) < mood — the subjunctive topics (1.75×).
- Verb tenses: simple tenses like presente or futuro (1×) < preterite/imperfect's aspect distinction or the imperative (~1.1-1.15×) < compound/perfect tenses (~1.2-1.25×) < subjunctive tenses (~1.75-1.9×, the classic hard point for English speakers learning a Romance language).

Combined and tense-group tests aren't part of this — they span multiple CEFR levels, so there's no single level to credit them to.

**Dashboard mastery bars — a simpler, separate bucket system**

The four-color bars on the dashboard (new / learning / known / mastered) are a coarser, purely descriptive view of your vocab and verb SRS state — not the same cutoffs the CEFR badge uses. An item is "new" with zero successful reviews, "learning" below a 21-day interval, "known" between 21 and 179 days, and "mastered" at 180 days or beyond. Think of this as "how is my review pile doing right now," while the CEFR badge is the stricter, curated answer to "what level am I at."

**Streaks**

A streak counts consecutive days with at least one logged review (any grade, any test, any practice attempt) — today doesn't break a streak still active from yesterday if you haven't reviewed yet, but the streak stops the moment a full day passes with nothing logged.
`.trim();
