import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  AudioContext: null,
  webkitAudioContext: null,
  matchMedia() { return { matches: false }; }
};
globalThis.requestAnimationFrame = fn => fn();
globalThis.document = {
  getElementById() { return null; },
  querySelectorAll() { return []; },
  body: { classList: { add(){}, remove(){} }, addEventListener(){} }
};

await import('../assets/js/app.js');
const bm = globalThis.window.boardManager;
const bear = globalThis.window.bearManager;
const pen = globalThis.window.whiteboardPen;
const sound = globalThis.window.SoundEngine;
sound.isMuted = true;

assert.ok(bm);

bm.letterOrderMode = 'alphabetic';
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[0].char), 'ا');
bm.letterOrderMode = 'lughati';
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[0].char), 'م');
assert.equal(bm.normalizeLetterKey(bm.getOrderedLetters()[27].char), 'ظ');

for (const a of ['ا','أ','إ','آ']) {
  const data = bm.getLetterData(a);
  assert.equal(data.char, a);
}

const salat = bm.wordToPiecesData('الصَّلَاةَ');
assert.ok(salat.some(p => p.type === 'ligature' && p.logicalText.includes('لا')), 'plain alif must remain plain alif inside the lam-alif ligature');
assert.ok(!salat.some(p => p.glyph.includes('أ')), 'plain alif must not turn into hamza');
const eman = bm.wordToPiecesData('إِيمَانٌ');
assert.ok(eman.some(p => p.glyph.includes('إ')), 'hamza-below alif must be preserved');
const amal = bm.wordToPiecesData('آمَالٌ');
assert.ok(amal.some(p => p.glyph.includes('آ')), 'madda alif must be preserved');

const w1 = bm.createLetterPiece('كـ','glyph-purple','أول الكلمة',10,10,{wordId:'w',wordLabel:'كتب'});
const w2 = bm.createLetterPiece('ـتـ','glyph-green','وسط الكلمة',50,10,{wordId:'w',wordLabel:'كتب'});
const w3 = bm.createLetterPiece('ـب','glyph-blue','آخر متصل',90,10,{wordId:'w',wordLabel:'كتب'});
bm.items = [w1,w2,w3];
bm.selectedIds.clear();
bm.selectItemForInteraction(w2);
assert.equal(bm.selectedIds.size, 3, 'tapping a completed word piece should select whole word');
assert.equal(bm.activeItemId, w2.id, 'tapped letter remains active for haraka editing');
bm.resizeSelected(0.2);
assert.ok(bm.items.every(x => Math.abs(x.scale - 1.2) < 1e-9));
bm.resetSelectedSize();
assert.ok(bm.items.every(x => x.scale === 1));

const sanduq = bear.contextualPhoneticParts('صُنْدُوقٌ');
assert.deepEqual(sanduq.parts, ['صُـنْـ', 'ـدُو', 'قٌ']);
const kitab = bear.contextualPhoneticParts('كِتَابٌ');
assert.deepEqual(kitab.parts, ['كِـ', 'ـتَـا', 'بٌ']);

// Mobile/touch pen fallback unit test with a lightweight canvas mock.
const ctx = {
  globalCompositeOperation:'source-over', lineCap:'round', lineJoin:'round', lineWidth:1,
  setTransform(){}, save(){}, restore(){}, beginPath(){}, arc(){}, fill(){}, moveTo(){}, lineTo(){}, quadraticCurveTo(){}, stroke(){}, clearRect(){},
  set strokeStyle(v){ this._strokeStyle=v; }, set fillStyle(v){ this._fillStyle=v; }
};
const host = { getBoundingClientRect(){ return { width: 320, height: 280 }; } };
const canvas = {
  parentElement: host, width:0, height:0, style:{},
  getContext(){ return ctx; },
  getBoundingClientRect(){ return { left:0, top:0, width:320, height:280 }; },
  setPointerCapture(){}, releasePointerCapture(){}
};
pen.canvas = canvas; pen.ctx = ctx; pen.cssWidth=320; pen.cssHeight=280; pen.dpr=1; pen.strokes=[]; pen.currentStroke=null; pen.drawing=false;
pen.resize();
assert.equal(pen.cssWidth, 320);
assert.equal(pen.cssHeight, 280);
const preventDefault = () => {};
pen.startTouch({ touches:[{clientX:20,clientY:30,force:0.7}], preventDefault });
pen.drawTouch({ touches:[{clientX:40,clientY:50,force:0.7}], preventDefault });
pen.stopTouch({ preventDefault });
assert.equal(pen.strokes.length, 1, 'touch drawing should record one stroke');
assert.ok(pen.strokes[0].points.length >= 2);

console.log('Board v4 + mobile pen tests: OK');
