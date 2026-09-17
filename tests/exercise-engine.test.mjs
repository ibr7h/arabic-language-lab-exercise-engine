import assert from 'node:assert/strict';
import { ArabicText } from '../assets/js/core/arabic-text.js';
import { WordExerciseEngine } from '../assets/js/core/exercise-engine.js';
import { detectPlatformProfile } from '../assets/js/core/platform-profile.js';

const engine = new WordExerciseEngine(ArabicText);
const ex = engine.create('كِتَابٌ', { includeHarakat: true, contextualShapes: false, showTarget: true });
assert.deepEqual(ex.targetUnits, ['كِ','تَ','ا','بٌ']);
assert.deepEqual(ex.targetKeys, ['كِ','تَ','ا','بٌ']);

const noMarks = engine.create('كِتَابٌ', { includeHarakat: false });
assert.deepEqual(noMarks.targetKeys, ['ك','ت','ا','ب']);

const scrambled = engine.scrambleIndices(5, () => 0.999);
assert.equal(scrambled.length, 5);
assert.notDeepEqual(scrambled, [0,1,2,3,4], 'scramble must avoid returning the original order when length > 1');
assert.deepEqual([...scrambled].sort((a,b)=>a-b), [0,1,2,3,4]);

const correct = engine.compare(ex, ['كِ','تَ','ا','بٌ']);
assert.equal(correct.correct, true);
assert.equal(correct.correctCount, 4);

const wrong = engine.compare(ex, ['تَ','كِ','ا','بٌ']);
assert.equal(wrong.correct, false);
assert.equal(wrong.correctCount, 2);
assert.deepEqual(wrong.correctPositions, [false,false,true,true]);

const incomplete = engine.compare(ex, ['كِ',null,'ا',null]);
assert.equal(incomplete.complete, false);
assert.equal(incomplete.filled, 2);

assert.equal(detectPlatformProfile('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)').id, 'ios');
assert.equal(detectPlatformProfile('Mozilla/5.0 (Linux; Android 15)').id, 'android');
assert.equal(detectPlatformProfile('Mozilla/5.0 webOS.TV-2025').id, 'webos');

console.log('Exercise Engine core tests: OK');
