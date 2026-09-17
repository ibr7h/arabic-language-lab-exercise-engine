import assert from 'node:assert/strict';
import { nativeHarakaSvg, renderAttachedHaraka, renderFreeHaraka } from '../assets/js/core/harakat-renderer.js';
for (const mark of ['َ','ُ','ِ','ْ','ّ','ً','ٌ','ٍ']) {
  const svg=nativeHarakaSvg(mark);
  assert.ok(svg.includes('<svg')); assert.ok(svg.includes('<text')); assert.ok(!svg.includes('<path'));
  assert.ok(renderAttachedHaraka(mark).includes('foam-mark-overlay'));
  assert.ok(renderFreeHaraka(mark).includes('free-haraka-native'));
}
const dammatan=nativeHarakaSvg('ٌ');
assert.equal((dammatan.match(/ـُ/g)||[]).length,2);
assert.ok(dammatan.includes('x="25"')&&dammatan.includes('x="39"'));
console.log('Unified haraka renderer tests: OK');
