import { ArabicIdentity } from './arabic-identity.js';
export const LAM_ALIF_VARIANTS = Object.freeze(['ا','أ','إ','آ']);
export function isLamAlifPair(lamUnit, alifUnit, ArabicText) {
  return ArabicText.base(lamUnit) === 'ل' && LAM_ALIF_VARIANTS.includes(ArabicText.base(alifUnit));
}
export function createLamAlifLigature(lamUnit, alifUnit, ArabicText, { connectPrev = false } = {}) {
  if (!isLamAlifPair(lamUnit, alifUnit, ArabicText)) return null;
  const lam = ArabicText.base(lamUnit), alif = ArabicText.base(alifUnit);
  const logicalText = `${lam}${ArabicText.marks(lamUnit).join('')}${alif}${ArabicText.marks(alifUnit).join('')}`.normalize('NFC');
  return {
    type:'ligature',
    logicalText,
    components:[lamUnit, alifUnit],
    displayGlyph:`${connectPrev ? 'ـ' : ''}${logicalText}`,
    baseLetters:[ArabicIdentity.canonicalLetter(lam), ArabicIdentity.canonicalLetter(alif)]
  };
}
export function mergeLamAlifUnits(units, ArabicText, canConnectToNext = () => false) {
  const source = Array.isArray(units) ? units : [];
  const out = [];
  for (let i=0;i<source.length;i+=1) {
    const current=source[i], next=source[i+1];
    if (next && isLamAlifPair(current,next,ArabicText)) {
      const prev=i>0?ArabicText.base(source[i-1]):'';
      out.push(createLamAlifLigature(current,next,ArabicText,{connectPrev:Boolean(prev)&&canConnectToNext(prev)}));
      i+=1;
    } else out.push({type:'letter',unit:current});
  }
  return out;
}
