# معمل اللغات العربية التفاعلي — PWA

تطبيق تعليمي عربي يعمل كتطبيق ويب تقدمي (PWA) ويجمع بين السبورة المغناطيسية، أشكال الحروف، الحركات، تحليل الكلمات، وأنشطة تكوين الكلمات والعبارات.

## الإصدار الحالي

**Refactor v5 — 2026-09-18**

المرجع الثابت قبل إعادة الهيكلة:
- Branch: `baseline-before-refactor-2026-09-18`
- Commit: `6f1b2abcf72e6828df84ffdaa84440059fed75bd`

## أهم ما يدعمه التطبيق

- تجزئة عربية مبنية على grapheme clusters عبر `Intl.Segmenter` مع fallback.
- فصل **الهوية اللغوية** للحرف عن الشكل البصري؛ `ة ≠ ه` و`ى ≠ ي`.
- دعم الألف: `ا، أ، إ، آ`.
- دعم وصلات لام–ألف كقطعة مرئية واحدة: `لا، لأ، لإ، لآ`.
- نظام موحد للحركات باستخدام Unicode العربي بدل المسارات اليدوية.
- الحركات المرتبطة بالحرف، إضافة إلى **حركة حرة** مستقلة قابلة للسحب والتكبير والتصغير.
- ربط الحركة الحرة بأقرب حرف وفصل الحركة من الحرف.
- دعم الشدة مع الحركة والتنوين بأنواعه.
- أنواع قطع السبورة: `letter`, `haraka`, `ligature`, `space`.
- تحديد/تحريك/تكبير/حذف مبني على capabilities بدل ربط السلوك بنوع `letter` فقط.
- حفظ السبورة محليًا واستعادتها بعد إغلاق التطبيق.
- Undo / Redo لتغييرات السبورة.
- ثلاثة أوضاع: الوضع الحر، تكوين كلمة/عبارة، والكلمات المكتملة.
- `WordExerciseEngine` للكلمات و`PhraseExerciseEngine` للعبارات مع مسافات صريحة.
- iOS/Android touch adapter، وwebOS/desktop keyboard/D-pad adapter.
- ARIA وfocus مرئي والتحريك بأسهم لوحة المفاتيح.
- PWA مع تحديث Service Worker تلقائي واستراتيجية network-first للشيفرة والأنماط.

## البنية

الطبقات الأساسية:

```
Arabic Core
  ├─ arabic-text.js
  ├─ arabic-identity.js
  ├─ ligature-engine.js
  └─ harakat-renderer.js

Board Domain
  ├─ board-piece.js
  ├─ board-state.js
  ├─ board-commands.js
  └─ board-history.js

Exercise Domain
  ├─ exercise-engine.js
  └─ phrase-exercise-engine.js

Platform
  ├─ platform-profile.js
  └─ platform-adapter.js

UI
  └─ ui/board-piece-view.js
```

التفاصيل في `docs/ARCHITECTURE.md`.

## التشغيل محليًا

```bash
python3 -m http.server 8080
```

ثم افتح:

`http://127.0.0.1:8080/`

لا يعتمد تشغيل التطبيق الأساسي على خطوط أو JavaScript خارجيين؛ يستخدم خطوط النظام المحلية وملفات المشروع.

## الاختبارات

الـCI يفحص syntax ويشغّل اختبارات الوحدة وRegression واختبار المتصفح. من أمثلة الاختبارات:

```bash
node tests/arabic-engine.test.mjs
node tests/arabic-regression-matrix.test.mjs
node tests/ligature-engine.test.mjs
node tests/board-piece-model.test.mjs
node tests/board-state.test.mjs
node tests/board-history.test.mjs
node tests/board-commands.test.mjs
node tests/phrase-exercise-engine.test.mjs
node tests/platform-adapter.test.mjs
node tests/harakat-renderer.test.mjs
node tests/pwa-strategy.test.mjs
```

اختبار E2E في `tests/e2e-board.spec.mjs` يتحقق داخل Chromium من وصلة لام–ألف، الحركة الحرة، التكبير، التحريك بلوحة المفاتيح، ومسافات العبارات.

> اختبار iOS الآلي يغطي إعدادات اللمس، safe areas، وأحجام targets في الكود. يبقى الفحص النهائي على Safari/iPhone فعلي خطوة يدوية لأن CI يعمل على Chromium/Linux.

## PWA والتحديث

- التنقل: network-first مع fallback إلى الصفحة المخزنة.
- ملفات JavaScript/CSS/worker وJSON/manifest: network-first.
- الأصول الأخرى: cache-first.
- عند انتقال Service Worker إلى controller جديد يعاد تحميل التطبيق تلقائيًا عند وجود نسخة سابقة، لتقليل مشكلة بقاء كاش قديم على الأجهزة المثبت عليها الـPWA.

## GitHub Pages

النشر يتم آليًا من `main` عبر GitHub Actions **بعد نجاح اختبارات الوحدة وE2E**.

## الأمان

التطبيق ثابت client-side ولا يحتوي أسرار خادم. توجد CSP، ولا يستخدم `eval` أو `new Function`، والـService Worker يتعامل مع نفس origin فقط. راجع `SECURITY_REVIEW_v4.md`.

## الحقوق

Copyright © 2026 Ibrahim Alneami — All Rights Reserved.

راجع `LICENSE.txt` لشروط الملكية والترخيص التجاري وإعادة البيع.
