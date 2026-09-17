// Canonical data model for magnetic-board pieces.
// This module is deliberately UI-agnostic so board state can be tested without the DOM.

export const BOARD_PIECE_TYPES = Object.freeze({
  LETTER: 'letter',
  HARAKA: 'haraka',
  LIGATURE: 'ligature',
  SPACE: 'space'
});

export const BOARD_CAPABILITIES = Object.freeze({
  SELECTABLE: 'selectable',
  MOVABLE: 'movable',
  SCALABLE: 'scalable',
  DELETABLE: 'deletable',
  ATTACHABLE: 'attachable'
});

const TYPE_CAPABILITIES = Object.freeze({
  [BOARD_PIECE_TYPES.LETTER]: Object.freeze({ selectable: true, movable: true, scalable: true, deletable: true, attachable: true }),
  [BOARD_PIECE_TYPES.HARAKA]: Object.freeze({ selectable: true, movable: true, scalable: true, deletable: true, attachable: true }),
  [BOARD_PIECE_TYPES.LIGATURE]: Object.freeze({ selectable: true, movable: true, scalable: true, deletable: true, attachable: true }),
  [BOARD_PIECE_TYPES.SPACE]: Object.freeze({ selectable: true, movable: true, scalable: false, deletable: true, attachable: false })
});

const VALID_TYPES = new Set(Object.values(BOARD_PIECE_TYPES));
const DIACRITIC_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/u;

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function makePieceId(type) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCapabilities(type, overrides = {}) {
  return Object.freeze({
    ...TYPE_CAPABILITIES[type],
    ...(overrides || {})
  });
}

function createBasePiece(type, data = {}) {
  if (!VALID_TYPES.has(type)) throw new Error(`UNKNOWN_BOARD_PIECE_TYPE:${type}`);

  return {
    id: String(data.id || makePieceId(type)),
    type,
    x: finiteNumber(data.x, 0),
    y: finiteNumber(data.y, 0),
    scale: Math.max(0.05, finiteNumber(data.scale, 1)),
    rotation: finiteNumber(data.rotation, 0),
    zIndex: Math.trunc(finiteNumber(data.zIndex, 0)),
    capabilities: normalizeCapabilities(type, data.capabilities),
    metadata: { ...(data.metadata || {}) }
  };
}

export function createLetterPiece(data = {}) {
  const logicalChar = String(data.logicalChar ?? '').normalize('NFC');
  if (!logicalChar) throw new Error('LETTER_REQUIRES_LOGICAL_CHAR');

  return {
    ...createBasePiece(BOARD_PIECE_TYPES.LETTER, data),
    logicalChar,
    marks: Array.isArray(data.marks) ? [...data.marks] : [],
    displayGlyph: String(data.displayGlyph ?? logicalChar),
    colorClass: String(data.colorClass ?? ''),
    positionName: String(data.positionName ?? ''),
    wordId: data.wordId == null ? null : String(data.wordId),
    wordLabel: data.wordLabel == null ? null : String(data.wordLabel),
    exerciseId: data.exerciseId == null ? null : String(data.exerciseId),
    exerciseUnit: data.exerciseUnit == null ? null : String(data.exerciseUnit),
    exerciseTargetIndex: Number.isInteger(data.exerciseTargetIndex) ? data.exerciseTargetIndex : null,
    exerciseSlot: Number.isInteger(data.exerciseSlot) ? data.exerciseSlot : null
  };
}

export function createHarakaPiece(data = {}) {
  const mark = String(data.mark ?? '').normalize('NFC');
  if (!mark) throw new Error('HARAKA_REQUIRES_MARK');

  return {
    ...createBasePiece(BOARD_PIECE_TYPES.HARAKA, data),
    mark,
    label: String(data.label ?? ''),
    attachedTo: data.attachedTo == null ? null : String(data.attachedTo),
    offsetX: finiteNumber(data.offsetX, 0),
    offsetY: finiteNumber(data.offsetY, 0)
  };
}

export function createLigaturePiece(data = {}) {
  const logicalText = String(data.logicalText ?? '').normalize('NFC');
  const components = Array.isArray(data.components) ? data.components.map(value => String(value).normalize('NFC')) : [];
  if (!logicalText || components.length < 2) throw new Error('LIGATURE_REQUIRES_TEXT_AND_COMPONENTS');

  return {
    ...createBasePiece(BOARD_PIECE_TYPES.LIGATURE, data),
    logicalText,
    components,
    displayGlyph: String(data.displayGlyph ?? logicalText),
    marks: Array.isArray(data.marks) ? [...data.marks] : [],
    colorClass: String(data.colorClass ?? '')
  };
}

export function createSpacePiece(data = {}) {
  return {
    ...createBasePiece(BOARD_PIECE_TYPES.SPACE, data),
    width: Math.max(0.1, finiteNumber(data.width, 1))
  };
}

export function pieceCan(piece, capability) {
  if (!piece || !capability) return false;
  return Boolean(piece.capabilities?.[capability]);
}

export function validateBoardPiece(piece) {
  const errors = [];
  if (!piece || typeof piece !== 'object') return { valid: false, errors: ['PIECE_REQUIRED'] };
  if (!VALID_TYPES.has(piece.type)) errors.push('INVALID_TYPE');
  if (!piece.id) errors.push('ID_REQUIRED');
  if (!Number.isFinite(Number(piece.x)) || !Number.isFinite(Number(piece.y))) errors.push('INVALID_POSITION');
  if (!Number.isFinite(Number(piece.scale)) || Number(piece.scale) <= 0) errors.push('INVALID_SCALE');
  if (!piece.capabilities || typeof piece.capabilities !== 'object') errors.push('CAPABILITIES_REQUIRED');

  if (piece.type === BOARD_PIECE_TYPES.LETTER && !piece.logicalChar) errors.push('LOGICAL_CHAR_REQUIRED');
  if (piece.type === BOARD_PIECE_TYPES.HARAKA && !piece.mark) errors.push('MARK_REQUIRED');
  if (piece.type === BOARD_PIECE_TYPES.LIGATURE && (!piece.logicalText || !Array.isArray(piece.components) || piece.components.length < 2)) errors.push('INVALID_LIGATURE');

  return { valid: errors.length === 0, errors };
}

function legacyLogicalChar(legacy = {}) {
  const source = String(legacy.logicalChar ?? legacy.baseGlyph ?? legacy.value ?? '').normalize('NFC');
  for (const ch of Array.from(source)) {
    if (ch === 'ـ' || DIACRITIC_RE.test(ch)) continue;
    return ch;
  }
  return '';
}

function legacyMarks(legacy = {}) {
  if (Array.isArray(legacy.marks)) return [...legacy.marks];
  return Array.from(String(legacy.value ?? '')).filter(ch => DIACRITIC_RE.test(ch));
}

// Transitional adapter used while app.js is migrated incrementally.
// It intentionally preserves ة and ى as themselves; visual lookup rules belong in a renderer, not in identity.
export function fromLegacyLetterPiece(legacy = {}) {
  const logicalChar = legacyLogicalChar(legacy);
  if (!logicalChar) throw new Error('LEGACY_LETTER_REQUIRES_ARABIC_BASE');

  return createLetterPiece({
    id: legacy.id,
    logicalChar,
    marks: legacyMarks(legacy),
    displayGlyph: legacy.baseGlyph || legacy.value || logicalChar,
    colorClass: legacy.color || legacy.colorClass || '',
    positionName: legacy.posName || legacy.positionName || '',
    x: legacy.x,
    y: legacy.y,
    scale: legacy.scale,
    rotation: legacy.rotation,
    zIndex: legacy.zIndex,
    wordId: legacy.wordId,
    wordLabel: legacy.wordLabel,
    exerciseId: legacy.exerciseId,
    exerciseUnit: legacy.exerciseUnit,
    exerciseTargetIndex: legacy.exerciseTargetIndex,
    exerciseSlot: legacy.exerciseSlot,
    metadata: { legacyValue: legacy.value ?? null }
  });
}
