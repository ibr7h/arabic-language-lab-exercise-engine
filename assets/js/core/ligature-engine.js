import { ArabicIdentity } from './arabic-identity.js';

export const LAM_ALIF_VARIANTS = Object.freeze(['ا','أ','إ','آ']);

export function isLamAlifPair(lamUnit, alifUnit, ArabicText) {
  return ArabicText.base(lamUnit) === 'ل' && LAM_ALIF_VARIANTS.includes(ArabicText.base(alifUnit));
}

function collectMarkAttachments(units, ArabicText) {
  return units.flatMap((unit, componentIndex) =>
    ArabicText.marks(unit).map(mark => ({ mark, componentIndex }))
  );
}

export function composeLigatureText(components = [], markAttachments = []) {
  const chars = components.map(value => String(value || '').normalize('NFC'));
  for (const attachment of markAttachments || []) {
    const index = Number(attachment?.componentIndex);
    const mark = String(attachment?.mark || '');
    if (!Number.isInteger(index) || index < 0 || index >= chars.length || !mark) continue;
    chars[index] += mark;
  }
  return chars.join('').normalize('NFC');
}

export function createLamAlifLigature(lamUnit, alifUnit, ArabicText, { connectPrev = false } = {}) {
  if (!isLamAlifPair(lamUnit, alifUnit, ArabicText)) return null;
  const components = [ArabicText.base(lamUnit), ArabicText.base(alifUnit)];
  const markAttachments = collectMarkAttachments([lamUnit, alifUnit], ArabicText);
  const logicalText = composeLigatureText(components, markAttachments);
  const baseText = components.join('');
  return {
    type: 'ligature',
    logicalText,
    baseText,
    components,
    markAttachments,
    displayGlyph: `${connectPrev ? 'ـ' : ''}${baseText}`,
    baseLetters: components.map(value => ArabicIdentity.canonicalLetter(value))
  };
}

export function mergeLamAlifUnits(units, ArabicText, canConnectToNext = () => false) {
  const source = Array.isArray(units) ? units : [];
  const out = [];
  for (let i = 0; i < source.length; i += 1) {
    const current = source[i], next = source[i + 1];
    if (next && isLamAlifPair(current, next, ArabicText)) {
      const prev = i > 0 ? ArabicText.base(source[i - 1]) : '';
      out.push(createLamAlifLigature(current, next, ArabicText, {
        connectPrev: Boolean(prev) && canConnectToNext(prev)
      }));
      i += 1;
    } else {
      out.push({ type: 'letter', unit: current });
    }
  }
  return out;
}
