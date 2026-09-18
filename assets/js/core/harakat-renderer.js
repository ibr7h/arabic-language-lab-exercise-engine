// Unified Arabic haraka renderer.
// Harakat use an invisible spacing carrier so browsers can shape combining marks
// without exposing a visible tatweel/dash.
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

  // Dammatan is deliberately drawn as two compact dammas. Do not delegate
  // this mark to the platform font: Safari/Chrome can choose very different
  // glyphs and spacing for the Unicode dammatan character.
  if(m==='ٌ'){
    return `<svg class="dammatan-double-svg" viewBox="0 0 64 36" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><text class="dammatan-lobe dammatan-lobe-a" x="27" y="18" text-anchor="middle" dominant-baseline="middle" direction="rtl" font-size="66" fill="currentColor" style="font-family:${font}"> ُ</text><text class="dammatan-lobe dammatan-lobe-b" x="37" y="18" text-anchor="middle" dominant-baseline="middle" direction="rtl" font-size="66" fill="currentColor" style="font-family:${font}"> ُ</text></svg>`;
  }

  const size=m==='ّ'?66:68;
  const y=18;

  // NBSP is invisible but gives the combining mark a stable glyph box.
  // Never use Arabic tatweel (ـ) here: some browsers render it visibly.
  return `<svg viewBox="0 0 64 36" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><text x="32" y="${y}" text-anchor="middle" dominant-baseline="middle" direction="rtl" font-size="${size}" fill="currentColor" style="font-family:${font}"> ${esc(m)}</text></svg>`;
}

export function renderAttachedHaraka(mark,{anchor=50,withShadda=false}={}){
  let cls='foam-mark-overlay mark-top';
  if(BOTTOM_MARKS.has(mark)) cls='foam-mark-overlay mark-bottom';
  if(mark==='ّ') cls='foam-mark-overlay mark-shadda';
  else if(mark==='ِ' && withShadda) cls='foam-mark-overlay mark-kasra-with-shadda';
  else if(withShadda && TOP_MARKS.has(mark)) cls='foam-mark-overlay mark-top mark-with-shadda';
  return `<span class="${cls}" data-haraka="${esc(mark)}" style="--mark-anchor:${Number(anchor)||50}%">${nativeHarakaSvg(mark)}</span>`;
}

export function renderShaddaKasraStack({anchor=50}={}){
  return `<span class="foam-mark-overlay mark-stack-shadda-kasra" data-haraka-stack="ِّ" style="--mark-anchor:${Number(anchor)||50}%"><span class="stack-shadda" data-haraka="ّ">${nativeHarakaSvg('ّ')}</span><span class="stack-kasra" data-haraka="ِ">${nativeHarakaSvg('ِ')}</span></span>`;
}

export function renderFreeHaraka(mark){
  return `<span class="free-haraka-native" data-haraka="${esc(mark)}">${nativeHarakaSvg(mark)}</span>`;
}

export function markFromLegacyPath(){ return null; }
export function nativeTopMarkSvg(mark){ return nativeHarakaSvg(mark); }
export function installNativeHarakatRenderer(){ return null; }
