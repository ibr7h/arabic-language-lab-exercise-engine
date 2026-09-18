// Unified native-Arabic haraka renderer.
// Free and attached marks share the same native SVG; CSS controls placement only.
const TOP_MARKS = new Set(['َ','ُ','ْ','ّ','ً','ٌ']);
const BOTTOM_MARKS = new Set(['ِ','ٍ']);
const LABELS = Object.freeze({'َ':'فتحة','ُ':'ضمة','ِ':'كسرة','ْ':'سكون','ّ':'شدة','ً':'تنوين فتح','ٌ':'تنوين ضم','ٍ':'تنوين كسر'});

export function harakaLabel(mark){ return LABELS[mark] || 'حركة'; }

function esc(mark){
  return String(mark||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function nativeHarakaSvg(mark){
  const m=String(mark||'');
  if(!TOP_MARKS.has(m)&&!BOTTOM_MARKS.has(m)) return '';
  const font="'Geeza Pro','SF Arabic','Noto Naskh Arabic','Traditional Arabic',serif";
  if(m==='ٌ') return `<svg viewBox="0 0 64 34" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><text x="25" y="58" text-anchor="middle" direction="rtl" font-size="66" fill="currentColor" style="font-family:${font}">ـُ</text><text x="39" y="58" text-anchor="middle" direction="rtl" font-size="66" fill="currentColor" style="font-family:${font}">ـُ</text></svg>`;
  const y=TOP_MARKS.has(m)?58:-7, size=m==='ّ'?64:66;
  return `<svg viewBox="0 0 64 34" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><text x="32" y="${y}" text-anchor="middle" direction="rtl" font-size="${size}" fill="currentColor" style="font-family:${font}">ـ${esc(m)}</text></svg>`;
}

export function renderAttachedHaraka(mark,{anchor=50,withShadda=false}={}){
  let cls='foam-mark-overlay mark-top';
  if(BOTTOM_MARKS.has(mark)) cls='foam-mark-overlay mark-bottom';
  if(mark==='ّ') cls='foam-mark-overlay mark-shadda';
  else if(mark==='ِ' && withShadda) cls='foam-mark-overlay mark-kasra-with-shadda';
  else if(withShadda && TOP_MARKS.has(mark)) cls='foam-mark-overlay mark-top mark-with-shadda';
  return `<span class="${cls}" data-haraka="${esc(mark)}" style="--mark-anchor:${Number(anchor)||50}%">${nativeHarakaSvg(mark)}</span>`;
}

export function renderFreeHaraka(mark){
  return `<span class="free-haraka-native" data-haraka="${esc(mark)}">${nativeHarakaSvg(mark)}</span>`;
}

export function markFromLegacyPath(){ return null; }
export function nativeTopMarkSvg(mark){ return nativeHarakaSvg(mark); }
export function installNativeHarakatRenderer(){ return null; }
