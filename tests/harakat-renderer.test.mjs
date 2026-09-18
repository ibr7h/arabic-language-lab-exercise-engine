import assert from 'node:assert/strict';
import { nativeHarakaSvg, renderAttachedHaraka, renderFreeHaraka } from '../assets/js/core/harakat-renderer.js';

for (const mark of ['َ','ُ','ِ','ْ','ّ','ً','ٌ','ٍ']) {
  const svg=nativeHarakaSvg(mark);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('<text'));
  assert.ok(!svg.includes('<path'));
  assert.ok(renderAttachedHaraka(mark).includes('foam-mark-overlay'));
  assert.ok(renderFreeHaraka(mark).includes('free-haraka-native'));
}
const dammatan=nativeHarakaSvg('ٌ');
assert.equal((dammatan.match(/ـُ/g)||[]).length,2);
assert.ok(dammatan.includes('x="25"')&&dammatan.includes('x="39"'));

const shaddaKasra=renderAttachedHaraka('ِ',{anchor:58,withShadda:true});
assert.ok(shaddaKasra.includes('mark-kasra-with-shadda'),'kasra must stack below shadda rather than under the letter');
assert.ok(shaddaKasra.includes('--mark-anchor:58%'),'custom letter anchor must be preserved');

const ordinaryKasra=renderAttachedHaraka('ِ',{anchor:50,withShadda:false});
assert.ok(ordinaryKasra.includes('mark-bottom'));
assert.ok(!ordinaryKasra.includes('mark-kasra-with-shadda'));

console.log('Unified haraka renderer tests: OK');
