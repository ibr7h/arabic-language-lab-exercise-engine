import assert from 'node:assert/strict';
import { nativeHarakaSvg, renderAttachedHaraka, renderFreeHaraka } from '../assets/js/core/harakat-renderer.js';

for (const mark of ['َ','ُ','ِ','ْ','ّ','ً','ٌ','ٍ']) {
  const svg=nativeHarakaSvg(mark);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('<text'));
  assert.ok(!svg.includes('<path'));
  assert.ok(!svg.includes('ـ'), 'haraka renderer must never expose a visible tatweel carrier');
  assert.ok(svg.includes(mark), 'rendered SVG must contain the requested haraka');
  const attached=renderAttachedHaraka(mark);
  const free=renderFreeHaraka(mark);
  assert.ok(attached.includes('foam-mark-overlay'));
  assert.ok(free.includes('free-haraka-native'));
  assert.ok(!attached.includes('ـ'));
  assert.ok(!free.includes('ـ'));
}

const shaddaKasra=renderAttachedHaraka('ِ',{anchor:58,withShadda:true});
assert.ok(shaddaKasra.includes('mark-kasra-with-shadda'),'kasra must stack below shadda rather than under the letter');
assert.ok(shaddaKasra.includes('--mark-anchor:58%'),'custom letter anchor must be preserved');

const ordinaryKasra=renderAttachedHaraka('ِ',{anchor:50,withShadda:false});
assert.ok(ordinaryKasra.includes('mark-bottom'));
assert.ok(!ordinaryKasra.includes('mark-kasra-with-shadda'));

console.log('Unified haraka renderer tests: OK');
