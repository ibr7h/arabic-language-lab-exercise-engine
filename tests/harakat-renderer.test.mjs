import assert from 'node:assert/strict';
import { markFromLegacyPath, nativeTopMarkSvg } from '../assets/js/core/harakat-renderer.js';

const legacyCases = [
  ['M8 17 C12 7 17 22 21 12 C25 4 30 18 34 9', 'ّ'],
  ['M10 18 C9 8 19 6 23 11 C27 16 23 22 16 21 C23 23 29 20 32 14', 'ُ'],
  ['M7 19 C6 11 13 8 17 12 C20 16 17 21 12 21 C18 23 22 19 23 15 M21 14 C21 7 28 6 31 10 C34 14 31 19 27 19', 'ٌ']
];

for (const [path, mark] of legacyCases) {
  assert.equal(markFromLegacyPath(path), mark);
  const svg = nativeTopMarkSvg(mark);
  assert.ok(svg.includes('<text '), 'native mark must be rendered as font text');
  assert.ok(!svg.includes('<path '), 'native mark must not use an approximated SVG path');
}

assert.ok(nativeTopMarkSvg('ُ').includes('ـُ'), 'damma should use the native damma glyph');
assert.ok(nativeTopMarkSvg('ّ').includes('ـّ'), 'shadda should use the native shadda glyph');
const dammatan = nativeTopMarkSvg('ٌ');
assert.equal((dammatan.match(/ـُ/g) || []).length, 2, 'dammatan should render two adjacent native dammas');
assert.ok(dammatan.includes('x="23"') && dammatan.includes('x="35"'), 'the two dammas should be tightly spaced');
assert.ok(dammatan.includes('font-size="58"'), 'dammatan should use the enlarged fatha-scale glyph size');
assert.ok(dammatan.includes('viewBox="0 0 58 30"'), 'dammatan should use the compact display box');

assert.equal(markFromLegacyPath('M0 0'), null);
assert.equal(nativeTopMarkSvg('َ'), '');

console.log('harakat-renderer tests passed');
