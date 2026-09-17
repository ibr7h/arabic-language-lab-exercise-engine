// UI-only decoration for a magnetic-board piece.
// Domain state and interaction decisions stay outside this module.
export function decorateBoardPieceElement(el, {
  item,
  selected = false,
  selectionMode = 'none',
  mobile = false,
  minTouchTarget = 0,
  contentHtml = '',
  deleteAction = ''
} = {}) {
  if (!el || !item) throw new Error('BOARD_PIECE_VIEW_REQUIRES_ELEMENT_AND_ITEM');

  el.dataset.pieceId = item.id;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-pressed', selected ? 'true' : 'false');
  el.style.touchAction = 'none';
  if (minTouchTarget > 0) {
    el.style.minWidth = `${minTouchTarget}px`;
    el.style.minHeight = `${minTouchTarget}px`;
  }

  const selectionClass = !selected ? ''
    : selectionMode === 'word' ? ' is-selected is-word-selected'
    : selectionMode === 'letter' ? ' is-selected is-letter-selected'
    : ' is-selected is-multi-selected';

  el.className = `free-foam-piece foam-glyph ${item.color || ''} group piece-type-${item.type}${item.exerciseId ? ' exercise-piece' : ''}${selectionClass}`;
  el.style.left = `${Number(item.x) || 0}px`;
  el.style.top = `${Number(item.y) || 0}px`;

  const baseFontSize = item.type === 'haraka'
    ? (mobile ? 72 : 88)
    : item.type === 'ligature'
      ? (mobile ? 58 : 72)
      : (mobile ? 52 : 66);
  el.style.fontSize = `${Math.round(baseFontSize * (Number(item.scale) || 1))}px`;
  el.style.transform = `rotate(${Number(item.rotation) || 0}deg)`;
  el.innerHTML = `${contentHtml}${deleteAction}`;
  return el;
}
