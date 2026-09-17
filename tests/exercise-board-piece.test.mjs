import assert from 'node:assert/strict';

globalThis.window = {
  addEventListener() {},
  AudioContext: null,
  webkitAudioContext: null,
  matchMedia() { return { matches: false }; }
};
globalThis.requestAnimationFrame = fn => fn();
Object.defineProperty(globalThis, 'navigator', { value: { userAgent:'node-test', maxTouchPoints:0, vibrate(){} }, configurable: true });
globalThis.document = {
  getElementById() { return null; },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  addEventListener() {},
  body: { dataset:{}, classList: { add(){}, remove(){} }, addEventListener(){} }
};

await import('../assets/js/app.js');
const bm = globalThis.window.boardManager;
const eb = globalThis.window.exerciseBoard;
assert.ok(eb, 'exerciseBoard must be exposed to node tests');

const piece = bm.createLetterPiece('كِ','glyph-red','حرف مستقل للنشاط',10,20,{
  exerciseId:'ex1', exerciseUnit:'كِ', exerciseTargetIndex:0
});
assert.equal(piece.wordId, null, 'exercise tile must not be pre-grouped as a completed word');
assert.equal(piece.exerciseId, 'ex1');
assert.equal(piece.exerciseUnit, 'كِ');
assert.equal(piece.exerciseSlot, null);

console.log('Exercise board independent-piece tests: OK');
