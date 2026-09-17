# CHANGELOG

## v3 — 2026-09-16
- تحسين سلاسة قلم السبورة باستخدام Pointer Events وcoalesced events ومنحنيات quadratic ودقة Retina.
- إضافة التحكم في سماكة القلم وزر تراجع.
- إضافة ترتيبين للحروف: هجائي، وترتيب كتاب لغتي للصف الأول.
- دعم كلمات مكتملة متعددة على السبورة مع كلمات جاهزة وحقل لإضافة أي كلمة.
- إضافة تحديد الكل، إلغاء التحديد، حذف المحدد، وتحريك مجموعة محددة دفعة واحدة.
- فصل الحركة عن الحرف بصريًا ومنطقيًا؛ يمكن استبدال الحركة وإزالتها، مع دعم الشدة مع حركة.
- تحسين موضع الحركات حسب شكل الحرف: أول/وسط/آخر/منفصل.
- تحديث cache إلى v3.

# Changelog

## v2 Phase 0–2 — 2026-09-16
- Arabic grapheme parser.
- Correct sukun/madd dynamic segmentation.
- Event-driven speech sequencing.
- Canvas resize preservation and CSS guide lines.
- Zoom accessibility correction and live toast status.
- Local Tailwind build.
- Native Web Audio feedback.
- Local lightweight confetti.
- PWA manifest, service worker, install button, and icons.
- Automated Arabic engine smoke tests.

## v4 — Mobile interaction, Arabic form fidelity, board editing
- Deselect board content by tapping empty board space.
- Tapping any letter in a completed board word selects the whole word as a group while keeping the tapped letter active for harakat editing.
- Added board letter/group size controls (65%–180%, reset to 100%).
- Enlarged magnetic-board diacritics and adjusted their anchors.
- Added explicit support for alif variants: ا، أ، إ، آ, preserving the exact form in completed words.
- Bear Analyzer now renders each phonetic/letter segment using the contextual form the letter has in the complete word.
- Reworked whiteboard sizing around the visible container, VisualViewport/ResizeObserver updates, and touch fallback for older mobile browsers.
- Added visible copyright notice and proprietary LICENSE.txt.
- Bumped offline cache to v4.


## v4 Secure hardening
- CSP: `script-src 'self'`.
- Removed Google Fonts network dependency.
- Removed inline event handlers; added allowlisted dispatcher without eval.
- Service Worker restricted to same-origin caching.
- Added security review.

## v4.1 — Single-letter manipulation
- First tap selects a whole completed word; second tap selects the touched letter only.
- Long-press on touch devices directly selects one letter.
- Added detach/regroup controls for word groups.
- Added distinct selection outlines for word, letter, and multi-selection modes.
- Bumped offline cache to v4.1.
