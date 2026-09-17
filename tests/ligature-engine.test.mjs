import assert from 'node:assert/strict';
import { ArabicText } from '../assets/js/core/arabic-text.js';
import { createLamAlifLigature, mergeLamAlifUnits } from '../assets/js/core/ligature-engine.js';
for (const word of ['لا','لأ','لإ','لآ']) {
  const units=ArabicText.letterUnits(word), merged=mergeLamAlifUnits(units,ArabicText,()=>false);
  assert.equal(merged.length,1); assert.equal(merged[0].type,'ligature');
  const lig=createLamAlifLigature(units[0],units[1],ArabicText);
  assert.equal(lig.logicalText,word); assert.equal(lig.components.length,2);
}
const connected=mergeLamAlifUnits(ArabicText.letterUnits('بلا'),ArabicText,base=>base==='ب');
assert.equal(connected.length,2); assert.equal(connected[1].type,'ligature'); assert.ok(connected[1].displayGlyph.startsWith('ـ'));
console.log('Lam-alif ligature tests: OK');
