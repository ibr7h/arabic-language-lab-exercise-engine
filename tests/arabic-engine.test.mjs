import assert from 'node:assert/strict';
import { ArabicText } from '../assets/js/core/arabic-text.js';

assert.deepEqual(ArabicText.letterUnits('كَتَبَ'), ['كَ','تَ','بَ']);
assert.deepEqual(ArabicText.phoneticParts('صُنْدُوقٌ').parts, ['صُنْ','دُو','قٌ']);
assert.deepEqual(ArabicText.phoneticParts('كِتَابٌ').parts, ['كِ','تَا','بٌ']);
assert.deepEqual(ArabicText.phoneticParts('مَدْرَسَةٌ').parts, ['مَدْ','رَ','سَ','ةٌ']);
assert.equal(ArabicText.isMaddPair('بَ','و'), false, 'واو لا تعد مداً بعد الفتحة');
assert.equal(ArabicText.isMaddPair('بُ','و'), true, 'واو تعد مداً بعد الضمة');
console.log('ArabicText tests: OK');
