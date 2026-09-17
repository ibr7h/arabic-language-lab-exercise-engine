// Arabic linguistic identity utilities.
// Logical identity is never collapsed for convenience: ة ≠ ه and ى ≠ ي.
export const ArabicIdentity = Object.freeze({
  canonicalLetter(value = '') {
    const text = String(value).normalize('NFC').replace(/ـ/g, '');
    for (const ch of Array.from(text)) {
      if (/[ء-غف-يٱپچژڤگ]/u.test(ch)) {
        return ch === 'ٱ' ? 'ا' : ch;
      }
    }
    return '';
  },
  visualLookupKey(value = '') {
    const logical = this.canonicalLetter(value);
    if (logical === 'ة') return 'ه';
    if (logical === 'ى') return 'ي';
    return logical;
  },
  sameIdentity(a, b) { return this.canonicalLetter(a) === this.canonicalLetter(b); },
  isAlifVariant(value = '') {
    return ['ا','أ','إ','آ','ٱ'].includes(this.canonicalLetter(value) || String(value).replace(/ـ/g,''));
  }
});
