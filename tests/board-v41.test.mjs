import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  AudioContext: null,
  webkitAudioContext: null,
  matchMedia() { return { matches: false }; }
};
globalThis.requestAnimationFrame = fn => fn();
Object.defineProperty(globalThis, 'navigator', { value: { vibrate(){} }, configurable: true });
globalThis.document = {
  getElementById() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {},
  body: { classList: { add(){}, remove(){} }, addEventListener(){} }
};

await import('../assets/js/app.js');
const bm = globalThis.window.boardManager;
const sound = globalThis.window.SoundEngine;
sound.isMuted = true;

const a = bm.createLetterPiece('كـ','glyph-purple','أول الكلمة',240,20,{wordId:'w41',wordLabel:'كتب'});
const b = bm.createLetterPiece('ـتـ','glyph-green','وسط الكلمة',160,20,{wordId:'w41',wordLabel:'كتب'});
const c = bm.createLetterPiece('ـب','glyph-blue','آخر متصل',80,20,{wordId:'w41',wordLabel:'كتب'});
bm.items = [a,b,c];
bm.setSelection([], 'none', null);

bm.selectItemForInteraction(b);
assert.equal(bm.selectionMode, 'word');
assert.equal(bm.selectedIds.size, 3, 'first tap must select the whole word');

bm.selectItemForInteraction(b);
assert.equal(bm.selectionMode, 'letter');
assert.deepEqual([...bm.selectedIds], [b.id], 'second tap must select only the touched letter');

bm.selectItemForInteraction(a);
assert.equal(bm.selectionMode, 'word', 'tapping a different member after single-letter mode returns to whole-word selection');
assert.equal(bm.selectedIds.size, 3);

bm.detachSelectedWord();
assert.equal(bm.selectionMode, 'multi');
assert.ok(bm.items.every(x => x.wordId === null), 'detach removes word grouping');
assert.ok(bm.items.every(x => x.detachedFrom === 'w41'), 'detach preserves regroup identity');

bm.selectItemForInteraction(b);
assert.equal(bm.selectionMode, 'letter');
const oldX = b.x;
b.x += 35;
assert.notEqual(b.x, oldX, 'one detached letter can be moved independently');

bm.regroupSelection();
assert.equal(bm.selectionMode, 'word');
assert.ok(bm.items.every(x => x.wordId === 'w41'), 'regroup restores the original group from one detached member');
assert.ok(bm.items.every(x => !('detachedFrom' in x)), 'regroup clears detached metadata');

bm.selectItemForInteraction(c, { forceLetter: true });
assert.equal(bm.selectionMode, 'letter');
assert.deepEqual([...bm.selectedIds], [c.id], 'long-press path force-selects one letter');

console.log('Board v4.1 single-letter interaction tests: OK');
