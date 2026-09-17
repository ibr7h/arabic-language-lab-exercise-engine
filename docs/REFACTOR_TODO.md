# Refactor TODO — Arabic Language Lab

Baseline before refactor:
- Branch: `baseline-before-refactor-2026-09-18`
- Commit: `6f1b2abcf72e6828df84ffdaa84440059fed75bd`

Status legend: ⬜ not started · 🟡 in progress · ✅ verified · 🔴 blocked/failing

## Phase 1 — Arabic domain foundation

- ✅ T01 — Canonical board-piece data model: `letter`, `haraka`, `ligature`, `space`, shared transform/capabilities, legacy adapter, unit tests. CI and Pages deployment verified successfully.
- ⬜ T02 — Separate linguistic identity from visual glyph shaping; preserve `ة` and `ى` identities.
- ⬜ T03 — Lam–alif ligature engine for `لا، لأ، لإ، لآ`.
- ⬜ T04 — Expand Arabic regression matrix for hamza, alif variants, ta marbuta, alif maqsura, shadda, tanween and madd.

## Phase 2 — Harakat as first-class board pieces

- ⬜ T05 — Unified HarakaRenderer.
- ⬜ T06 — Increase and normalize haraka visual size.
- ⬜ T07 — Free haraka pieces on the board.
- ⬜ T08 — Drag free haraka pieces.
- ⬜ T09 — Resize free haraka pieces independently.
- ⬜ T10 — Attach/detach haraka to/from a letter.
- ⬜ T11 — Correct shadda + vowel combinations.
- ⬜ T12 — Correct tanween rendering and spacing.
- ⬜ T13 — Retire legacy SVG → MutationObserver compatibility path.

## Phase 3 — Board architecture

- ⬜ T14 — Capability-based select/move/resize/delete.
- ⬜ T15 — Board command model.
- ⬜ T16 — Split `app.js` into domain/board/exercise/ui/platform modules.
- ⬜ T17 — DOM-independent board state.
- ⬜ T18 — Persist board state locally.
- ⬜ T19 — Undo/redo command history.

## Phase 4 — Exercises and platforms

- ⬜ T20 — Adapt “build word” to the new board model.
- ⬜ T21 — Separate WordExercise and PhraseExercise with explicit spaces.
- ⬜ T22 — iPhone/Safari touch verification.
- ⬜ T23 — Android adapter.
- ⬜ T24 — webOS focus/D-pad adapter.
- ⬜ T25 — Accessibility: keyboard/focus/ARIA.

## Phase 5 — Verification and release

- ⬜ T26 — Browser E2E tests.
- ⬜ T27 — Full regression suite.
- ⬜ T28 — PWA/cache update strategy.
- ⬜ T29 — Synchronize README/ARCHITECTURE/CHANGELOG/VERSION.
- ⬜ T30 — Final comparison against the baseline branch.
