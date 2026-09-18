import assert from 'node:assert/strict';
import { nativeHarakaSvg, renderAttachedHaraka, renderShaddaKasraStack, renderFreeHaraka } from '../assets/js/core/harakat-renderer.js';

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


const dammatan=nativeHarakaSvg('ٌ');
assert.ok(dammatan.includes('dammatan-double-svg'),'dammatan must use the dedicated two-damma renderer');
assert.equal((dammatan.match(/class="dammatan-lobe /g)||[]).length,2,'dammatan must contain exactly two damma lobes');
assert.ok(dammatan.includes('x="27"')&&dammatan.includes('x="37"'),'dammatan lobes must remain compact and side-by-side');
assert.ok(!dammatan.includes('ـ'),'dammatan renderer must not use a visible tatweel carrier');

const stack=renderShaddaKasraStack({anchor:58});
assert.ok(stack.includes('mark-stack-shadda-kasra'));
assert.ok(stack.includes('stack-shadda'));
assert.ok(stack.includes('stack-kasra'));
assert.ok(stack.includes('data-haraka="ّ"'));
assert.ok(stack.includes('data-haraka="ِ"'));
assert.ok(stack.includes('--mark-anchor:58%'));

const ordinaryKasra=renderAttachedHaraka('ِ',{anchor:50,withShadda:false});
assert.ok(ordinaryKasra.includes('mark-bottom'));
assert.ok(!ordinaryKasra.includes('mark-stack-shadda-kasra'));

console.log('Unified haraka renderer tests: OK');
