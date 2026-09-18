# Refactor TODO — Arabic Language Lab

Baseline before refactor:
- Branch: `baseline-before-refactor-2026-09-18`
- Commit: `6f1b2abcf72e6828df84ffdaa84440059fed75bd`

Status legend: ⬜ not started · 🟡 in progress · ✅ verified · 🔴 blocked/failing

## Phase 1 — Arabic domain foundation

- ✅ T01 — Canonical board-piece data model: `letter`, `haraka`, `ligature`, `space`, shared transform/capabilities, legacy adapter, unit tests. CI and Pages deployment verified successfully.
- ✅ T02 — Separate linguistic identity from visual glyph shaping; `ة` and `ى` identities preserved. Verified by CI.
- ✅ T03 — Lam–alif ligature engine for `لا، لأ، لإ، لآ`. Verified by unit/regression and browser CI.
- ✅ T04 — Arabic regression matrix for hamza, alif variants, ta marbuta, alif maqsura, shadda, tanween and madd. Verified by CI.

## Phase 2 — Harakat as first-class board pieces

- ✅ T05 — Unified HarakaRenderer. Verified by CI.
- ✅ T06 — Haraka visual size increased and normalized. Verified by browser CI.
- ✅ T07 — Free haraka pieces on the board. Verified by browser CI.
- ✅ T08 — Drag/move free haraka pieces. Verified by browser CI.
- ✅ T09 — Resize free haraka pieces independently. Verified by browser CI.
- ✅ T10 — Attach/detach haraka to/from a letter. Implemented with history support and regression checks.
- ✅ T11 — Shadda + vowel combinations retained in one grapheme and rendered by the unified renderer.
- ✅ T12 — Tanween rendering and spacing unified; dammatan uses two adjacent native dammas.
- ✅ T13 — Legacy SVG → MutationObserver compatibility path retired.

## Phase 3 — Board architecture

- ✅ T14 — Capability-based select/move/resize/delete integrated.
- ✅ T15 — Board command model implemented and tested.
- ✅ T16 — Domain, board state/commands/history, exercise engines, platform adapter and board UI view extracted into modules.
- ✅ T17 — DOM-independent BoardState implemented and tested.
- ✅ T18 — Board state persistence implemented with local storage serialization tests.
- ✅ T19 — Undo/redo command history implemented across movement, resize, add/delete, harakat and layout operations.

## Phase 4 — Exercises and platforms

- ✅ T20 — Build-word activity adapted to canonical board pieces.
- ✅ T21 — WordExercise and PhraseExercise separated with explicit fixed space slots.
- 🟡 T22 — iPhone/Safari touch verification. iOS adapter, 44px targets, safe areas and touch-oriented behavior are implemented and automated checks pass. Final physical Safari/iPhone release check remains manual.
- ✅ T23 — Android adapter implemented with touch targets and shared input behavior.
- ✅ T24 — webOS focus/D-pad adapter implemented with Arrow/Enter/Delete mappings.
- ✅ T25 — Accessibility: keyboard/focus/ARIA integrated and browser-tested.

## Phase 5 — Verification and release

- ✅ T26 — Browser E2E tests cover lam–alif, free haraka, resize, keyboard movement and phrase spaces.
- ✅ T27 — Full regression suite: v3/v4/v4.1 plus new Arabic/board/exercise/platform tests pass together.
- ✅ T28 — PWA/cache strategy uses network-first code updates plus Service Worker update/reload flow and automated tests.
- ✅ T29 — README/ARCHITECTURE/CHANGELOG/VERSION synchronized for Refactor v5.
- ✅ T30 — Final comparison against baseline completed; baseline remains `6f1b2abcf72e6828df84ffdaa84440059fed75bd` and `main` is ahead with no commits behind.


## Field correction pass — 2026-09-18

- ✅ F01 — `لَا`: fatha remains editable/detachable from the lam–alif ligature; browser E2E verified.
- ✅ F02 — Attached/free haraka visual scale normalized and browser geometry regression verified. Physical iPhone/Safari visual check remains part of T22.
- ✅ F03 — Kasra stacks below shadda above the letter when both occur together; renderer and browser tests verified.
- ✅ F04 — Dedicated kasra anchor for `إِ` implemented and browser regression verified; physical iPhone/Safari visual check remains part of T22.
- ✅ F05 — `لا، ـلا، لأ، ـلأ، لإ، ـلإ، لآ، ـلآ` exposed directly in the board toolbox and E2E verified.
- ✅ F06 — Unit/regression + Playwright E2E + GitHub Pages deployment all passed on run #98.
