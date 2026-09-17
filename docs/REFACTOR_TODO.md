# Refactor TODO — Arabic Language Lab

Baseline before refactor:
- Branch: `baseline-before-refactor-2026-09-18`
- Commit: `6f1b2abcf72e6828df84ffdaa84440059fed75bd`

Status legend: ⬜ not started · 🟡 in progress · ✅ verified · 🔴 blocked/failing

## Phase 1 — Arabic domain foundation

- ✅ T01 — Canonical board-piece data model: `letter`, `haraka`, `ligature`, `space`, shared transform/capabilities, legacy adapter, unit tests. CI and Pages deployment verified successfully.
- 🟡 T02 — Separate linguistic identity from visual glyph shaping; preserve `ة` and `ى` identities. Implementation complete; CI verification pending.
- 🟡 T03 — Lam–alif ligature engine for `لا، لأ، لإ، لآ`. Implementation complete; CI verification pending.
- 🟡 T04 — Expand Arabic regression matrix for hamza, alif variants, ta marbuta, alif maqsura, shadda, tanween and madd. Implementation complete; CI verification pending.

## Phase 2 — Harakat as first-class board pieces

- 🟡 T05 — Unified HarakaRenderer. Implementation complete; CI verification pending.
- 🟡 T06 — Increase and normalize haraka visual size. Implementation complete; CI verification pending.
- 🟡 T07 — Free haraka pieces on the board. Implementation complete; CI verification pending.
- 🟡 T08 — Drag free haraka pieces. Implementation complete; CI verification pending.
- 🟡 T09 — Resize free haraka pieces independently. Implementation complete; CI verification pending.
- 🟡 T10 — Attach/detach haraka to/from a letter. Implementation complete; CI verification pending.
- 🟡 T11 — Correct shadda + vowel combinations. Implementation complete; CI verification pending.
- 🟡 T12 — Correct tanween rendering and spacing. Implementation complete; CI verification pending.
- 🟡 T13 — Retire legacy SVG → MutationObserver compatibility path. Implementation complete; CI verification pending.

## Phase 3 — Board architecture

- 🟡 T14 — Capability-based select/move/resize/delete. Implementation complete; CI verification pending.
- 🟡 T15 — Board command model. Implementation complete; CI verification pending.
- 🟡 T16 — Split `app.js` into domain/board/exercise/ui/platform modules. Core domain, board state, commands and exercise layers extracted; UI controller split remains to verify.
- 🟡 T17 — DOM-independent board state. Implementation complete; CI verification pending.
- 🟡 T18 — Persist board state locally. Implementation complete; CI verification pending.
- 🟡 T19 — Undo/redo command history. Implementation complete; CI verification pending.

## Phase 4 — Exercises and platforms

- 🟡 T20 — Adapt “build word” to the new board model. Canonical piece flow integrated; CI pending.
- 🟡 T21 — Separate WordExercise and PhraseExercise with explicit spaces. Implemented with fixed space slots; CI pending.
- 🟡 T22 — iPhone/Safari touch verification. iOS adapter, 44px targets and safe areas implemented; automated verification pending. Physical-device check remains manual.
- 🟡 T23 — Android adapter. Shared touch adapter and 44px targets implemented; CI pending.
- 🟡 T24 — webOS focus/D-pad adapter. Arrow/D-pad + Enter/Delete keyboard mapping and focus styling implemented; CI pending.
- 🟡 T25 — Accessibility: keyboard/focus/ARIA. Board pieces now expose role, label, pressed state and keyboard movement; CI pending.

## Phase 5 — Verification and release

- ⬜ T26 — Browser E2E tests.
- ⬜ T27 — Full regression suite.
- 🟡 T28 — PWA/cache update strategy. Network-first code updates + Service Worker update/reload strategy implemented and unit-tested; final CI pending.
- ⬜ T29 — Synchronize README/ARCHITECTURE/CHANGELOG/VERSION.
- ⬜ T30 — Final comparison against the baseline branch.
