// Native Arabic harakat compatibility renderer.
// The board historically approximated some marks with hand-drawn SVG paths.
// For damma, shadda, and dammatan we instead let the browser's Arabic font
// shape real Unicode marks on tatweel carriers, while clipping the carriers.

const LEGACY_TOP_MARK_PATHS = new Map([
  ['M8 17 C12 7 17 22 21 12 C25 4 30 18 34 9', 'ّ'],
  ['M10 18 C9 8 19 6 23 11 C27 16 23 22 16 21 C23 23 29 20 32 14', 'ُ'],
  ['M7 19 C6 11 13 8 17 12 C20 16 17 21 12 21 C18 23 22 19 23 15 M21 14 C21 7 28 6 31 10 C34 14 31 19 27 19', 'ٌ']
]);

const NATIVE_MARK_BOX = {
  'ُ': { width: 0.96, height: 0.70 },
  'ّ': { width: 1.00, height: 0.72 },
  // Tanween damm: compact overall box, but each individual damma is drawn
  // at roughly the same visual scale as the fatha overlay.
  'ٌ': { width: 0.92, height: 0.58 }
};

const ARABIC_MARK_FONT = "'Geeza Pro','SF Arabic','Noto Naskh Arabic','Traditional Arabic',serif";

export function markFromLegacyPath(pathData) {
  const normalized = String(pathData || '').trim().replace(/\s+/g, ' ');
  return LEGACY_TOP_MARK_PATHS.get(normalized) || null;
}

function nativeSingleTopMarkSvg(mark) {
  const sample = `ـ${mark}`;
  const y = mark === 'ّ' ? 41 : 40;
  const size = 46;
  return `<svg viewBox="0 0 50 28" aria-hidden="true" focusable="false" style="overflow:hidden" preserveAspectRatio="xMidYMid meet"><text x="25" y="${y}" text-anchor="middle" direction="rtl" font-size="${size}" font-weight="400" fill="currentColor" style="font-family:${ARABIC_MARK_FONT}">${sample}</text></svg>`;
}

function nativeDammatanSvg() {
  // Educational display: two large, tightly adjacent dammas.
  // A separate tatweel carrier is retained for each mark so the Arabic font
  // shapes the damma correctly, while both carriers remain below the viewport.
  const sample = 'ـُ';
  return `<svg viewBox="0 0 58 30" aria-hidden="true" focusable="false" style="overflow:hidden" preserveAspectRatio="xMidYMid meet"><text x="23" y="50" text-anchor="middle" direction="rtl" font-size="58" font-weight="400" fill="currentColor" style="font-family:${ARABIC_MARK_FONT}">${sample}</text><text x="35" y="50" text-anchor="middle" direction="rtl" font-size="58" font-weight="400" fill="currentColor" style="font-family:${ARABIC_MARK_FONT}">${sample}</text></svg>`;
}

export function nativeTopMarkSvg(mark) {
  if (mark === 'ٌ') return nativeDammatanSvg();
  if (mark === 'ُ' || mark === 'ّ') return nativeSingleTopMarkSvg(mark);
  return '';
}

function replaceLegacyTopMark(span) {
  if (!(span instanceof Element) || span.dataset.nativeHaraka === '1') return;
  const path = span.querySelector('svg path');
  if (!path) return;

  const mark = markFromLegacyPath(path.getAttribute('d'));
  if (!mark) return;

  span.dataset.nativeHaraka = '1';
  span.dataset.haraka = mark;

  const box = NATIVE_MARK_BOX[mark];
  if (box) {
    span.style.width = `${box.width}em`;
    span.style.height = `${box.height}em`;
  }

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
