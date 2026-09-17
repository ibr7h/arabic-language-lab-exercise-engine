import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  AudioContext: null,
  webkitAudioContext: null
};
globalThis.document = {
  getElementById() { return null; },
  querySelectorAll() { return []; }
};

await import('../assets/js/app.js');
const bm = globalThis.window.boardManager;
const sound = globalThis.window.SoundEngine;
sound.isMuted = true;

assert.ok(bm, 'boardManager should be exposed');

bm.letterOrderMode = 'alphabetic';
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[0].char), 'ا');
bm.letterOrderMode = 'lughati';
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[0].char), 'م');
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[27].char), 'ظ');

const salat = bm.wordToPiecesData('الصَّلَاةَ');
assert.ok(salat.length >= 5);
assert.ok(!salat.some(p => p.glyph.includes('أ')), 'plain alif must not turn into hamza');
assert.ok(salat.some(p => p.type === 'ligature' && p.logicalText.includes('لا')), 'lam + plain alif should become a real lam-alif ligature without changing identity');

const p = bm.createLetterPiece('بَـ', 'glyph-purple', 'أول الكلمة', 10, 10);
bm.items = [p];
bm.activeItemId = p.id;
bm.selectedIds = new Set([p.id]);
bm.addHaraka('ُ', 'ضمة');
assert.deepEqual(p.marks.filter(m => ['َ','ُ','ِ','ْ','ً','ٌ','ٍ'].includes(m)), ['ُ']);
bm.addHaraka('ِ', 'كسرة');
assert.deepEqual(p.marks.filter(m => ['َ','ُ','ِ','ْ','ً','ٌ','ٍ'].includes(m)), ['ِ']);
bm.addHaraka('ّ', 'شدة');
assert.ok(p.marks.includes('ّ'));
assert.ok(p.marks.includes('ِ'));
bm.clearHaraka();
assert.deepEqual(p.marks, []);

bm.items = [p, bm.createLetterPiece('ـت', 'glyph-blue', 'آخر متصل', 20, 20)];
bm.selectAll();
assert.equal(bm.selectedIds.size, 2);
bm.clearSelection();
assert.equal(bm.selectedIds.size, 0);


for (const a of ['ا','أ','إ','آ']) {
  const data = bm.getLetterData(a);
  assert.equal(data.char, a, `alif variant ${a} should remain exact`);
}
const alifs = bm.wordToPiecesData('ا أ إ آ'.replace(/ /g,''));
assert.ok(alifs.some(p => p.glyph.includes('ا')));
assert.ok(alifs.some(p => p.glyph.includes('أ')));
assert.ok(alifs.some(p => p.glyph.includes('إ')));
assert.ok(alifs.some(p => p.glyph.includes('آ')));

const bear = globalThis.window.bearManager;
const sanduq = bear.contextualPhoneticParts('صُنْدُوقٌ');
assert.deepEqual(sanduq.parts, ['صُـنْـ', 'ـدُو', 'قٌ']);

console.log('Board v4 tests: OK');
