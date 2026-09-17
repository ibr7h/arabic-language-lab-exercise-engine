import assert from 'node:assert/strict';
import { ArabicText } from '../assets/js/core/arabic-text.js';
import { ArabicIdentity } from '../assets/js/core/arabic-identity.js';

// Letter identity and grapheme preservation.
for (const [text, expectedBase] of [['ةٌ','ة'],['هٌ','ه'],['ى','ى'],['ي','ي'],['أَ','أ'],['إِ','إ'],['آ','آ'],['ؤُ','ؤ'],['ئِ','ئ']]) {
  const units=ArabicText.letterUnits(text);
  assert.equal(units.length,1,text);
  assert.equal(ArabicText.base(units[0]),expectedBase,text);
  assert.equal(ArabicIdentity.canonicalLetter(units[0]),expectedBase === 'ٱ' ? 'ا' : expectedBase,text);
}

// Shadda may coexist with a short vowel and must remain in the same grapheme.
for (const text of ['بَّ','بُّ','بِّ']) {
  const unit=ArabicText.letterUnits(text)[0];
  assert.ok(ArabicText.marks(unit).includes('ّ'), text);
  assert.equal(ArabicText.letterUnits(text).length,1,text);
}

// All three tanween forms are distinct.
assert.equal(ArabicText.unitRule('بً'),'تنوين فتح');
assert.equal(ArabicText.unitRule('بٌ'),'تنوين ضم');
assert.equal(ArabicText.unitRule('بٍ'),'تنوين كسر');

// Madd rules remain directional and vowel-specific.
assert.equal(ArabicText.isMaddPair('بَ','ا'),true);
assert.equal(ArabicText.isMaddPair('بُ','و'),true);
assert.equal(ArabicText.isMaddPair('بِ','ي'),true);
assert.equal(ArabicText.isMaddPair('بَ','و'),false);
assert.equal(ArabicText.isMaddPair('بُ','ي'),false);

console.log('Arabic regression matrix: OK');
