# Architecture — Arabic Language Lab Refactor v5

## الهدف

فصل قواعد العربية وحالة السبورة ومنطق الأنشطة والمنصات عن DOM، بحيث نستطيع اختبار كل طبقة بشكل مستقل وتطوير iOS/Android/webOS دون نسخ منطق المشروع.

## 1. Arabic Core

### `arabic-text.js`
مسؤول عن grapheme segmentation والحركات والمد والسكون والتحليل الصوتي.

### `arabic-identity.js`
يحفظ الهوية اللغوية الأصلية. لا يستخدم تحويلات العرض كهوية:
- `ة` تبقى `ة`.
- `ى` تبقى `ى`.
- lookup بصري منفصل عند الحاجة.

### `ligature-engine.js`
يكشف زوج لام + أحد أشكال الألف `ا/أ/إ/آ` ويعطي token من نوع `ligature`. تبقى المكونات المنطقية محفوظة، بينما يمر العرض في text run واحدة حتى يقوم محرك الخط العربي بتشكيل الوصلة.

### `harakat-renderer.js`
Renderer موحد لجميع الحركات باستخدام Unicode داخل SVG text. لا يعتمد على MutationObserver ولا على رسومات paths تقريبية.

## 2. Board Domain

### نموذج القطعة

الأنواع:

- `letter`: حرف منطقي + marks + display glyph.
- `haraka`: حركة مستقلة مع `mark`, موضع وحجم مستقلين، ويمكن ربطها بحرف.
- `ligature`: تركيب منطقي متعدد المكونات مع display glyph واحد.
- `space`: فاصل منطقي.

الخصائص المشتركة تشمل `id, x, y, scale, rotation, zIndex, capabilities, metadata`.

### Capabilities

السلوك لا يُفترض من النوع فقط. القطعة قد تحمل:
`selectable, movable, scalable, deletable, attachable`.

### `board-state.js`
حالة مستقلة عن DOM مع snapshot/restore وserialization والحفظ المحلي.

### `board-commands.js`
أوامر قابلة للاختبار مثل:
`ADD_PIECE, DELETE_PIECES, RESIZE_PIECES, MOVE_PIECE, MOVE_MANY, REPLACE_ALL`.

### `board-history.js`
سجل snapshots للـUndo/Redo بحد أقصى للحفظ.

## 3. Exercise Domain

### `exercise-engine.js`
نشاط كلمة واحدة. الهدف عبارة عن وحدات حروف، مع مقارنة اختيارية بالحركات.

### `phrase-exercise-engine.js`
نشاط عبارة، ويعامل المسافة كـunit صريحة `␠`. المسافة في واجهة التركيب خانة ثابتة وليست قطعة يجب على الطالب سحبها.

في نشاط الترتيب لا تحمل القطع `wordId` لفرض ترتيب مسبق؛ تحمل بيانات النشاط فقط.

## 4. Platform Layer

### `platform-profile.js`
اكتشاف iOS / Android / webOS / desktop.

### `platform-adapter.js`
يحّول input المنصة إلى أوامر:
- iOS/Android: touch target لا يقل عن 44px.
- webOS: D-pad/OK.
- desktop: keyboard/pointer.
- الأسهم تحرك القطعة، Enter/Space تفعّل، Delete/Backspace تحذف.

## 5. UI Layer

`ui/board-piece-view.js` مسؤول عن خصائص عنصر القطعة المرئية: classes، الحجم، position، touch target وARIA الأساسية. يبقى قرار التفاعل في boardManager.

## 6. Harakat modes

- **Attached**: الحركة جزء من marks للحرف، وهو الوضع التعليمي المعتاد.
- **Free**: الحركة BoardPiece مستقلة يمكن نقلها وتكبيرها.
- **Attach**: تحويل الحركة الحرة إلى mark على أقرب حرف.
- **Detach**: استخراج mark من الحرف إلى قطعة حرة.

## 7. Persistence

المفتاح المحلي الحالي:
`arabic-language-lab.board.v1`

يحفظ عناصر السبورة وبعض metadata. snapshots الخاصة بالـUndo مستقلة عن حالة العمل.

## 8. PWA

Service Worker:
- navigation: network-first.
- code/styles/worker/JSON/manifest: network-first.
- بقية الأصول: cache-first.
- cache version يتغير مع إصدار التطبيق.
- التطبيق يطلب `registration.update()` ويستجيب لـ`controllerchange`.

## 9. Verification

طبقات التحقق:
1. Syntax checks.
2. Arabic/domain unit tests.
3. Board state/commands/history tests.
4. Regression tests v3/v4/v4.1.
5. Exercise/platform/PWA tests.
6. Chromium E2E.
7. تجربة Safari/iPhone فعلية تبقى manual release check.
