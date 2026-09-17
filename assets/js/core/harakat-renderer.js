// Native Arabic harakat compatibility renderer.
// The board historically approximated some marks with hand-drawn SVG paths.
// For damma, shadda, and dammatan we instead let the browser's Arabic font
// shape the real Unicode mark on a tatweel carrier, while clipping the carrier.

const LEGACY_TOP_MARK_PATHS = new Map([
  ['M8 17 C12 7 17 22 21 12 C25 4 30 18 34 9', 'ّ'],
  ['M10 18 C9 8 19 6 23 11 C27 16 23 22 16 21 C23 23 29 20 32 14', 'ُ'],
  ['M7 19 C6 11 13 8 17 12 C20 16 17 21 12 21 C18 23 22 19 23 15 M21 14 C21 7 28 6 31 10 C34 14 31 19 27 19', 'ٌ']
]);

export function markFromLegacyPath(pathData) {
  const normalized = String(pathData || '').trim().replace(/\s+/g, ' ');
  return LEGACY_TOP_MARK_PATHS.get(normalized) || null;
}

export function nativeTopMarkSvg(mark) {
  if (!['ُ', 'ّ', 'ٌ'].includes(mark)) return '';

  // The tatweel (ـ) gives the combining mark a real Arabic base for OpenType
  // positioning. Its baseline is deliberately below the SVG viewport, so only
  // the correctly shaped mark remains visible.
  const sample = `ـ${mark}`;
  const y = mark === 'ّ' ? 41 : 40;
  const size = mark === 'ٌ' ? 45 : 46;

  return `<svg viewBox="0 0 50 28" aria-hidden="true" focusable="false" style="overflow:hidden" preserveAspectRatio="xMidYMid meet"><text x="25" y="${y}" text-anchor="middle" direction="rtl" font-size="${size}" font-weight="400" fill="currentColor" style="font-family:'Geeza Pro','SF Arabic','Noto Naskh Arabic','Traditional Arabic',serif">${sample}</text></svg>`;
}

function replaceLegacyTopMark(span) {
  if (!(span instanceof Element) || span.dataset.nativeHaraka === '1') return;
  const path = span.querySelector('svg path');
  if (!path) return;

  const mark = markFromLegacyPath(path.getAttribute('d'));
  if (!mark) return;

  span.dataset.nativeHaraka = '1';
  span.dataset.haraka = mark;
  span.innerHTML = nativeTopMarkSvg(mark);
}

function scan(root) {
  if (!root?.querySelectorAll) return;
  if (root.matches?.('.foam-mark-overlay')) replaceLegacyTopMark(root);
  root.querySelectorAll('.foam-mark-overlay').forEach(replaceLegacyTopMark);
}

let observer = null;

export function installNativeHarakatRenderer(root = document) {
  scan(root);
  if (observer || typeof MutationObserver === 'undefined' || !root?.documentElement) return observer;

  observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) scan(node);
      }
    }
  });

  observer.observe(root.documentElement, { childList: true, subtree: true });
  return observer;
}
