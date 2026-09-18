import assert from 'node:assert/strict';
import {
  BOARD_PIECE_TYPES,
  createLetterPiece,
  createHarakaPiece,
  createLigaturePiece,
  createSpacePiece,
  pieceCan,
  validateBoardPiece,
  fromLegacyLetterPiece
} from '../assets/js/core/board-piece.js';

const letter = createLetterPiece({
  id: 'letter_1',
  logicalChar: 'ب',
  marks: ['َ'],
  displayGlyph: 'بـ',
  colorClass: 'glyph-purple',
  positionName: 'أول الكلمة',
  x: 10,
  y: 20,
  scale: 1.2
});
assert.equal(letter.type, BOARD_PIECE_TYPES.LETTER);
assert.equal(letter.logicalChar, 'ب');
assert.deepEqual(letter.marks, ['َ']);
assert.equal(letter.displayGlyph, 'بـ');
assert.equal(letter.scale, 1.2);
assert.equal(pieceCan(letter, 'movable'), true);
assert.equal(pieceCan(letter, 'scalable'), true);
assert.equal(validateBoardPiece(letter).valid, true);

const haraka = createHarakaPiece({ id: 'haraka_1', mark: 'ُ', label: 'ضمة', x: 40, y: 30 });
assert.equal(haraka.type, BOARD_PIECE_TYPES.HARAKA);
assert.equal(haraka.mark, 'ُ');
assert.equal(haraka.attachedTo, null);
assert.equal(pieceCan(haraka, 'movable'), true, 'free haraka must be movable');
assert.equal(pieceCan(haraka, 'scalable'), true, 'free haraka must be scalable');
assert.equal(validateBoardPiece(haraka).valid, true);

const ligature = createLigaturePiece({
  id: 'ligature_1',
  logicalText: 'لآ',
  components: ['ل', 'آ'],
  baseText: 'لآ',
  displayGlyph: 'لآ',
  markAttachments: [{ mark: 'َ', componentIndex: 0 }],
  x: 50,
  y: 60
});
assert.equal(ligature.type, BOARD_PIECE_TYPES.LIGATURE);
assert.deepEqual(ligature.components, ['ل', 'آ']);
assert.equal(ligature.baseText, 'لآ');
assert.deepEqual(ligature.markAttachments, [{ mark: 'َ', componentIndex: 0 }]);
assert.equal(ligature.logicalText, 'لآ');
assert.equal(validateBoardPiece(ligature).valid, true);

const space = createSpacePiece({ id: 'space_1', width: 1.5, x: 70, y: 80 });
assert.equal(space.type, BOARD_PIECE_TYPES.SPACE);
assert.equal(space.width, 1.5);
assert.equal(pieceCan(space, 'scalable'), false);
assert.equal(validateBoardPiece(space).valid, true);

const legacyTaMarbuta = fromLegacyLetterPiece({
  id: 'legacy_ta',
  type: 'letter',
  baseGlyph: 'ـة',
  value: 'ـةٌ',
  marks: ['ٌ'],
  color: 'glyph-blue',
  posName: 'آخر متصل',
  x: 10,
  y: 20,
  scale: 1
});
assert.equal(legacyTaMarbuta.logicalChar, 'ة', 'ة must keep its linguistic identity');
assert.deepEqual(legacyTaMarbuta.marks, ['ٌ']);
assert.equal(legacyTaMarbuta.id, 'legacy_ta');

const legacyAlifMaqsura = fromLegacyLetterPiece({
  id: 'legacy_alif_maqsura',
  type: 'letter',
  baseGlyph: 'ـى',
  value: 'ـى',
  x: 0,
  y: 0
});
assert.equal(legacyAlifMaqsura.logicalChar, 'ى', 'ى must not be normalized to ي');

const invalid = validateBoardPiece({ id: 'bad', type: 'unknown', x: 0, y: 0, scale: 1, capabilities: {} });
assert.equal(invalid.valid, false);
assert.ok(invalid.errors.includes('INVALID_TYPE'));

assert.throws(() => createLetterPiece({}), /LETTER_REQUIRES_LOGICAL_CHAR/);
assert.throws(() => createHarakaPiece({}), /HARAKA_REQUIRES_MARK/);
assert.throws(() => createLigaturePiece({ logicalText: 'لا', components: ['ل'] }), /LIGATURE_REQUIRES_TEXT_AND_COMPONENTS/);

console.log('Board piece model tests: OK');
