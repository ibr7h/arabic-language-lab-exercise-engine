# CHANGELOG

## Refactor v5 — 2026-09-18

### Arabic domain
- فصل الهوية اللغوية عن lookup العرض؛ الحفاظ على `ة` و`ى`.
- إضافة محرك لام–ألف لـ `لا، لأ، لإ، لآ`.
- إضافة Arabic regression matrix للهمزات والتاء المربوطة والألف المقصورة والشدة والتنوين والمد.

### Harakat
- استبدال الرسومات اليدوية بـUnified Unicode Haraka Renderer.
- تكبير الحركات وتوحيد مقياسها.
- تنوين الضم يظهر كضمتين متقاربتين.
- إضافة Free Haraka pieces قابلة للسحب والتكبير.
- إضافة attach/detach للحركة.
- إزالة مسار SVG → MutationObserver القديم.

### Board
- نموذج موحد للقطع: letter / haraka / ligature / space.
- capability-based selection/movement/resize/delete.
- BoardState مستقل عن DOM.
- Board Commands وUndo/Redo history.
- حفظ واستعادة حالة السبورة محليًا.
- إدخال الوصلات في معاينة ونطق الكلمات.
- استخراج Board Piece View إلى UI module.

### Exercises
- تكيف Build Word مع النموذج الجديد.
- إضافة PhraseExerciseEngine مع مسافات صريحة وخانات ثابتة.

### Platforms & accessibility
- PlatformAdapter لـiOS/Android/webOS/desktop.
- safe-area على iOS و44px touch targets لـiOS/Android.
- D-pad/keyboard movement وfocus مرئي لـwebOS.
- ARIA labels/pressed state للقطع.

### PWA & QA
- network-first للشيفرة والأنماط لتقليل stale cache.
- Service Worker update/controller reload flow.
- إضافة unit/regression tests جديدة واختبار Chromium E2E.
- بقاء اختبار Safari/iPhone الفعلي كخطوة release يدوية.

## v4.1 — 2026-09-16
- تحديد حرف واحد داخل كلمة مكتملة بالضغطة الثانية أو الضغط المطوّل.
- فك الكلمات وإعادة تجميع الحروف.
- تمييز selection modes بصريًا.

## v4 Secure — 2026-09-16
- CSP مع `script-src 'self'`.
- إزالة Google Fonts network dependency.
- dispatcher مسموح دون `eval` أو `new Function`.
- Service Worker same-origin.
- مراجعة أمنية.

## v4 — 2026-09-16
- تحسين mobile interactions وVisualViewport/ResizeObserver.
- دعم `ا، أ، إ، آ`.
- تكبير الحركات والتحكم بحجم الحروف/المجموعات.
- تحسين contextual forms.

## v3 — 2026-09-16
- Pointer Events وقلم السبورة.
- ترتيب كتاب لغتي/هجائي.
- كلمات مكتملة متعددة، تحديد الكل، النثر، والحركات القابلة للاستبدال.

## v2 — 2026-09-16
- Arabic grapheme parser.
- قواعد السكون والمد.
- sequencing للصوت.
- local Tailwind/Web Audio/confetti.
- PWA وsmoke tests.
