import assert from 'node:assert/strict';
import { ArabicText } from '../assets/js/core/arabic-text.js';
import { createLamAlifLigature, mergeLamAlifUnits, composeLigatureText } from '../assets/js/core/ligature-engine.js';

for (const word of ['لا','لأ','لإ','لآ']) {
  const units=ArabicText.letterUnits(word), merged=mergeLamAlifUnits(units,ArabicText,()=>false);
  assert.equal(merged.length,1);
  assert.equal(merged[0].type,'ligature');
  const lig=createLamAlifLigature(units[0],units[1],ArabicText);
  assert.equal(lig.logicalText,word);
  assert.equal(lig.baseText,word);
  assert.deepEqual(lig.components,Array.from(word));
  assert.deepEqual(lig.markAttachments,[]);
}

const withFatha=createLamAlifLigature(
  ArabicText.letterUnits('لَا')[0],
  ArabicText.letterUnits('لَا')[1],
  ArabicText
);
assert.equal(withFatha.baseText,'لا','visual base must not bake the fatha into the ligature glyph');
assert.equal(withFatha.logicalText,'لَا');
assert.deepEqual(withFatha.components,['ل','ا']);
assert.deepEqual(withFatha.markAttachments,[{mark:'َ',componentIndex:0}]);
assert.equal(composeLigatureText(withFatha.components,[]),'لا','detaching the mark must recover bare lam-alif');
assert.equal(composeLigatureText(withFatha.components,withFatha.markAttachments),'لَا');

const withKasraOnSecond=createLamAlifLigature('ل','إِ',ArabicText);
assert.deepEqual(withKasraOnSecond.markAttachments,[{mark:'ِ',componentIndex:1}]);
assert.equal(withKasraOnSecond.logicalText,'لإِ');

const connected=mergeLamAlifUnits(ArabicText.letterUnits('بلا'),ArabicText,base=>base==='ب');
assert.equal(connected.length,2);
assert.equal(connected[1].type,'ligature');
assert.ok(connected[1].displayGlyph.startsWith('ـ'));
assert.equal(connected[1].displayGlyph,'ـلا');

console.log('Lam-alif editable ligature tests: OK');
