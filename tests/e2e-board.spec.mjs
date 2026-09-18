import { test, expect } from '@playwright/test';

test.describe('Arabic Language Lab board E2E', () => {
  test.beforeEach(async ({ page }) => {
    const errors=[];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:8080/', { waitUntil:'networkidle' });
    await expect(page.locator('#boardCanvas')).toBeVisible();
    page.__errors=errors;
  });

  test('visible build badge identifies the loaded app version', async ({ page }) => {
    const badge=page.locator('#appVersionBadge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Version v12.7 • Build 2026-09-19');
  });

  test('live haraka calibration supports global and selected-piece scopes', async ({ page }) => {
    await page.locator('#harakaCalibrationToggle').click();
    const panel=page.locator('#harakaCalibrationPanel');
    await expect(panel).toBeVisible();

    await page.locator('#calHarakaSize').evaluate(el => { el.value='130'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calHarakaXOffset').evaluate(el => { el.value='4'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calHarakaTopGap').evaluate(el => { el.value='0.22'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calHarakaBottomGap').evaluate(el => { el.value='0.08'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calShaddaStackTop').evaluate(el => { el.value='0.24'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calShaddaKasraGap').evaluate(el => { el.value='8'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calDammatanSize').evaluate(el => { el.value='86'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calDammatanGap').evaluate(el => { el.value='6'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calDammatanX').evaluate(el => { el.value='3'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.locator('#calDammatanY').evaluate(el => { el.value='-2'; el.dispatchEvent(new Event('input',{bubbles:true})); });

    const vars=await page.evaluate(() => {
      const s=document.documentElement.style;
      return {
        size:s.getPropertyValue('--haraka-attached-scale').trim(),
        x:s.getPropertyValue('--haraka-x-offset').trim(),
        top:s.getPropertyValue('--haraka-top-offset').trim(),
        bottom:s.getPropertyValue('--haraka-bottom-offset').trim(),
        stackTop:s.getPropertyValue('--haraka-stack-top-offset').trim(),
        stack:s.getPropertyValue('--haraka-stack-kasra-top').trim(),
        dammatanSize:s.getPropertyValue('--dammatan-scale').trim(),
        a:s.getPropertyValue('--dammatan-lobe-a-x').trim(),
        b:s.getPropertyValue('--dammatan-lobe-b-x').trim(),
        dx:s.getPropertyValue('--dammatan-x-offset').trim(),
        dy:s.getPropertyValue('--dammatan-y-offset').trim()
      };
    });
    expect(vars).toEqual({
      size:'1.3',x:'4px',top:'-0.22em',bottom:'-0.08em',stackTop:'-0.24em',stack:'8%',
      dammatanSize:'0.86',a:'-3px',b:'3px',dx:'3px',dy:'-2px'
    });
    await expect(page.locator('#harakaCalibrationSummary')).toContainText('scope=global');
    await expect(page.locator('#harakaCalibrationSummary')).toContainText('x=4');

    // Select one letter and give it a private X offset without changing the global root value.
    await page.locator('#exerciseModeFree').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#quickLetterSelect').selectOption('م');
    await page.locator('#letterShapesSpotlight button[title="منفصل"]').click();
    const letter=page.locator('.piece-type-letter').first();
    await letter.click();
    await page.locator('#harakaCalibrationScope').selectOption('selected');
    await page.locator('#calHarakaXOffset').evaluate(el => { el.value='17'; el.dispatchEvent(new Event('input',{bubbles:true})); });
    await expect(letter).toHaveCSS('--haraka-x-offset','17px');
    const rootX=await page.evaluate(() => document.documentElement.style.getPropertyValue('--haraka-x-offset').trim());
    expect(rootX).toBe('4px');

    await page.reload({waitUntil:'networkidle'});
    await page.locator('#harakaCalibrationToggle').click();
    await expect(page.locator('#harakaCalibrationSummary')).toContainText('scope=global');
  });

  test('visual controls preserve selection, phrase spaces, modes and font propagation', async ({ page }) => {
    // Piece frame visibility must change visually, while selection remains visible.
    await page.locator('#exerciseModeFree').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#harakaModeFree').click();
    await page.locator('#harakatButtonsRow button[title="فتحة"]').click();
    await page.locator('#harakatButtonsRow button[title="ضمة"]').click();

    const firstHaraka=page.locator('.piece-type-haraka').first();
    const selectedHaraka=page.locator('.piece-type-haraka').last();
    await expect(selectedHaraka).toHaveClass(/is-selected/);

    const visibleFrame=await firstHaraka.evaluate(el => {
      const s=getComputedStyle(el,'::before');
      return { width:s.borderTopWidth, color:s.borderTopColor };
    });
    expect(Number.parseFloat(visibleFrame.width)).toBeGreaterThan(0);
    expect(visibleFrame.color).not.toBe('rgba(0, 0, 0, 0)');

    await page.locator('#pieceFrameToggleBtn').click();
    await expect(page.locator('#boardCanvas')).toHaveClass(/piece-frames-hidden/);
    await expect(page.locator('#pieceFrameToggleBtn')).toHaveAttribute('aria-pressed','false');

    const hiddenFrame=await firstHaraka.evaluate(el => getComputedStyle(el,'::before').borderTopColor);
    expect(hiddenFrame).toBe('rgba(0, 0, 0, 0)');

    const selectedFrame=await selectedHaraka.evaluate(el => {
      const s=getComputedStyle(el,'::before');
      return { width:s.borderTopWidth, color:s.borderTopColor };
    });
    expect(Number.parseFloat(selectedFrame.width)).toBeGreaterThanOrEqual(3);
    expect(selectedFrame.color).not.toBe('rgba(0, 0, 0, 0)');

    // The free-haraka SVG box must sit inside the expanded visual frame.
    const geometry=await selectedHaraka.evaluate(el => {
      const piece=el.getBoundingClientRect();
      const svg=el.querySelector('svg')?.getBoundingClientRect();
      const s=getComputedStyle(el);
      const font=Number.parseFloat(s.fontSize);
      const padX=Number.parseFloat(s.getPropertyValue('--piece-frame-pad-x'))*font;
      const padY=Number.parseFloat(s.getPropertyValue('--piece-frame-pad-y'))*font;
      return svg ? {
        left:piece.left-padX, right:piece.right+padX,
        top:piece.top-padY, bottom:piece.bottom+padY,
        svgLeft:svg.left, svgRight:svg.right, svgTop:svg.top, svgBottom:svg.bottom
      } : null;
    });
    expect(geometry).not.toBeNull();
    expect(geometry.svgLeft).toBeGreaterThanOrEqual(geometry.left-1);
    expect(geometry.svgRight).toBeLessThanOrEqual(geometry.right+1);
    expect(geometry.svgTop).toBeGreaterThanOrEqual(geometry.top-1);
    expect(geometry.svgBottom).toBeLessThanOrEqual(geometry.bottom+1);

    // Completed phrases preserve an explicit visual gap between words.
    await page.locator('#exerciseModeCompleted').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#customBoardWord').fill('ذَهَبَ مُحَمَّدٌ');
    await page.locator('button[data-onclick="boardManager.addCustomCompletedWord()"]').click();
    const pieces=page.locator('.free-foam-piece');
    await expect(pieces).toHaveCount(7);
    const xs=await pieces.evaluateAll(els => els.map(el => Number.parseFloat(el.style.left)).sort((a,b)=>b-a));
    const gaps=xs.slice(0,-1).map((x,i)=>x-xs[i+1]);
    const sorted=[...gaps].sort((a,b)=>a-b);
    const median=sorted[Math.floor(sorted.length/2)];
    expect(Math.max(...gaps)).toBeGreaterThan(median*1.45);
    await expect(page.locator('#currentWordPreview')).toContainText('ذَهَبَ مُحَمَّدٌ');

    // School mode stacks kasra below shadda; Uthmani mode puts kasra below the base letter.
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#customBoardWord').fill('مِّ');
    await page.locator('button[data-onclick="boardManager.addCustomCompletedWord()"]').click();
    await expect(page.locator('.mark-stack-shadda-kasra')).toHaveCount(1);
    await page.locator('#harakaCalibrationToggle').click();
    await page.locator('#shaddaKasraMode').selectOption('uthmani');
    await expect(page.locator('.mark-stack-shadda-kasra')).toHaveCount(0);
    await expect(page.locator('.mark-shadda[data-haraka="ّ"]')).toHaveCount(1);
    await expect(page.locator('.mark-bottom[data-haraka="ِ"]')).toHaveCount(1);

    // Changing the app font reaches the SVG harakat as well as the letter glyphs.
    await page.locator('#appFontPicker').selectOption('font-naskh');
    const rootFont=await page.evaluate(() => document.documentElement.style.getPropertyValue('--arabic-font-family').trim());
    expect(rootFont.length).toBeGreaterThan(0);
    const markFont=await page.locator('.foam-mark-overlay text').first().evaluate(el => getComputedStyle(el).fontFamily);
    expect(markFont.length).toBeGreaterThan(0);

    expect(page.__errors).toEqual([]);
  });

  test('a selected letter keeps its dropped position inside a completed word', async ({ page }) => {
    await page.locator('#exerciseModeCompleted').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#customBoardWord').fill('كتب');
    await page.locator('button[data-onclick="boardManager.addCustomCompletedWord()"]').click();

    const letters=page.locator('.piece-type-letter');
    await expect(letters).toHaveCount(3);
    const target=letters.nth(1);

    // First click selects the word, second click selects this letter only.
    await target.click();
    await target.click();
    await expect(target).toHaveClass(/is-letter-selected/);

    const targetId=await target.getAttribute('data-piece-id');
    const beforeTarget=await target.evaluate(el => ({
      left:Number.parseFloat(el.style.left),
      top:Number.parseFloat(el.style.top)
    }));
    const beforeSiblings=await letters.evaluateAll((els,targetId) =>
      els.filter(el => el.dataset.pieceId !== targetId).map(el => ({
        id:el.dataset.pieceId,
        left:Number.parseFloat(el.style.left),
        top:Number.parseFloat(el.style.top)
      })), targetId);

    const box=await target.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box.x+box.width/2, box.y+box.height/2);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+48, box.y+box.height/2+28, {steps:6});
    await page.mouse.up();

    const afterTarget=await page.locator(`[data-piece-id="${targetId}"]`).evaluate(el => ({
      left:Number.parseFloat(el.style.left),
      top:Number.parseFloat(el.style.top)
    }));
    expect(afterTarget.left).toBeGreaterThan(beforeTarget.left+30);
    expect(afterTarget.top).toBeGreaterThan(beforeTarget.top+15);

    const afterSiblings=await page.locator('.piece-type-letter').evaluateAll((els,targetId) =>
      els.filter(el => el.dataset.pieceId !== targetId).map(el => ({
        id:el.dataset.pieceId,
        left:Number.parseFloat(el.style.left),
        top:Number.parseFloat(el.style.top)
      })), targetId);
    expect(afterSiblings).toEqual(beforeSiblings);

    // Drop coordinates must survive a full reload/PWA-style restore.
    await page.reload({waitUntil:'networkidle'});
    const restored=page.locator(`[data-piece-id="${targetId}"]`);
    await expect(restored).toBeVisible();
    const restoredPos=await restored.evaluate(el => ({
      left:Number.parseFloat(el.style.left),
      top:Number.parseFloat(el.style.top)
    }));
    expect(Math.abs(restoredPos.left-afterTarget.left)).toBeLessThan(1);
    expect(Math.abs(restoredPos.top-afterTarget.top)).toBeLessThan(1);

    expect(page.__errors).toEqual([]);
  });

  test('lam-alif, free haraka, resize, keyboard movement, phrase spaces', async ({ page }) => {
    // Completed-word shaping must render lam-alif as one visual piece.
    await page.locator('#exerciseModeCompleted').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#customBoardWord').fill('لا');
    await page.locator('button[data-onclick="boardManager.addCustomCompletedWord()"]').click();
    const ligature=page.locator('.piece-type-ligature');
    await expect(ligature).toHaveCount(1);
    await expect(ligature).toContainText('لا');

    // Free haraka is an independent draggable/scalable board piece.
    await page.locator('#exerciseModeFree').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#harakaModeFree').click();
    await page.locator('#harakatButtonsRow button[title="فتحة"]').click();
    const haraka=page.locator('.piece-type-haraka').first();
    await expect(haraka).toBeVisible();

    const before=await haraka.boundingBox();
    await page.locator('button[data-onclick="boardManager.resizeSelected(0.1)"]').click();
    const after=await haraka.boundingBox();
    expect(after.width).toBeGreaterThan(before.width);

    const leftBefore=Number.parseFloat(await haraka.evaluate(el => el.style.left));
    await haraka.focus();
    await page.keyboard.press('ArrowRight');
    const moved=page.locator('.piece-type-haraka').first();
    const leftAfter=Number.parseFloat(await moved.evaluate(el => el.style.left));
    expect(leftAfter).toBeGreaterThan(leftBefore);

    // Phrase mode keeps explicit spaces as fixed assembly slots.
    await page.locator('#exerciseModeBuild').click();
    await page.locator('#exerciseKind').selectOption('phrase');
    await page.locator('#exerciseTargetWord').fill('ذَهَبَ مُحَمَّدٌ');
    await page.locator('.exercise-primary-btn').click();
    await expect(page.locator('.exercise-slot.fixed-space')).toHaveCount(1);
    await expect(page.locator('.exercise-slot.fixed-space')).toContainText('␣');

    expect(page.__errors).toEqual([]);
  });

  test('free haraka has no visible carrier and always adds as standalone', async ({ page }) => {
    await page.locator('#exerciseModeCompleted').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#harakaModeFree').click();
    await page.locator('#harakatButtonsRow button[title="فتحة"]').click();

    const freeHaraka=page.locator('.piece-type-haraka').first();
    await expect(freeHaraka).toBeVisible();
    const html=await freeHaraka.innerHTML();
    expect(html).not.toContain('ـ');
    await expect(freeHaraka.locator('[data-haraka="َ"]')).toHaveCount(1);

    expect(page.__errors).toEqual([]);
  });

  test('field corrections: editable lam-alif and attached haraka geometry', async ({ page }) => {
    await page.locator('#exerciseModeFree').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();

    // Direct lam-alif pieces must be available without typing a completed word.
    await expect(page.locator('button[data-lam-alif]')).toHaveCount(8);
    await page.locator('button[data-lam-alif="لا"]').click();
    await expect(page.locator('.piece-type-ligature')).toHaveCount(1);
    await expect(page.locator('.piece-type-ligature')).toContainText('لا');

    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();

    // A fatha inside لَا must remain detachable from the ligature.
    await page.locator('#exerciseModeCompleted').click();
    await page.locator('#customBoardWord').fill('لَا');
    await page.locator('button[data-onclick="boardManager.addCustomCompletedWord()"]').click();
    const markedLigature=page.locator('.piece-type-ligature').last();
    await expect(markedLigature.locator('.foam-mark-overlay[data-haraka="َ"]')).toHaveCount(1);
    await markedLigature.click();
    await page.locator('button[data-onclick="boardManager.detachSelectedHaraka()"]').click();
    await expect(page.locator('.piece-type-haraka')).toHaveCount(1);
    await expect(page.locator('.piece-type-ligature').last().locator('.foam-mark-overlay[data-haraka="َ"]')).toHaveCount(0);

    // إِ uses a dedicated kasra anchor instead of drifting left.
    await page.locator('#exerciseModeFree').click();
    await page.locator('button[data-onclick="boardManager.clearBoard()"]').click();
    await page.locator('#quickLetterSelect').selectOption('إ');
    await page.locator('#letterShapesSpotlight button[title="منفصل"]').click();
    await page.locator('#harakaModeAttached').click();
    await page.locator('#harakatButtonsRow button[title="كسرة"]').click();
    const kasra=page.locator('.piece-type-letter .foam-mark-overlay[data-haraka="ِ"]');
    await expect(kasra).toHaveAttribute('style', /--mark-anchor:58%/);
    const attachedKasraBox=await kasra.boundingBox();

    // With shadda, kasra must be a composite stack below shadda and still above the letter center.
    await page.locator('#harakatButtonsRow button[title="شدة"]').click();
    const stack=page.locator('.piece-type-letter .mark-stack-shadda-kasra');
    await expect(stack).toHaveCount(1);
    const shaddaInStack=stack.locator('.stack-shadda');
    const kasraInStack=stack.locator('.stack-kasra');
    await expect(shaddaInStack).toHaveCount(1);
    await expect(kasraInStack).toHaveCount(1);
    const shaddaStackBox=await shaddaInStack.boundingBox();
    const kasraStackBox=await kasraInStack.boundingBox();
    const letterGlyphBox=await page.locator('.piece-type-letter .foam-piece-glyph').boundingBox();
    expect(shaddaStackBox).not.toBeNull();
    expect(kasraStackBox).not.toBeNull();
    expect(letterGlyphBox).not.toBeNull();
    expect(kasraStackBox.y).toBeGreaterThan(shaddaStackBox.y);
    expect(kasraStackBox.y + kasraStackBox.height / 2).toBeLessThan(letterGlyphBox.y + letterGlyphBox.height / 2);
    const stackCenterGap=(kasraStackBox.y+kasraStackBox.height/2)-(shaddaStackBox.y+shaddaStackBox.height/2);
    const letterFontSize=await page.locator('.piece-type-letter').evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize));
    expect(stackCenterGap/letterFontSize).toBeLessThan(0.18);

    // Attached marks must sit close to the letter instead of using the old large offsets.
    const stackTopRatio=await stack.evaluate(el => {
      const top=Math.abs(Number.parseFloat(getComputedStyle(el).top));
      const font=Number.parseFloat(getComputedStyle(el.parentElement).fontSize);
      return top/font;
    });
    expect(stackTopRatio).toBeLessThan(0.5);

    // Dammatan uses the custom compact two-damma renderer, not the platform default glyph.
    await page.locator('#harakaModeFree').click();
    await page.locator('#harakatButtonsRow button[title="تنوين ضم"]').click();
    const dammatanPiece=page.locator('.piece-type-haraka').last();
    await expect(dammatanPiece.locator('.dammatan-double-svg .dammatan-lobe')).toHaveCount(2);

    // Attached and free haraka should use the same visual scale at 100%.
    await page.locator('#harakaModeFree').click();
    await page.locator('#harakatButtonsRow button[title="كسرة"]').click();
    const freeKasraBox=await page.locator('.piece-type-haraka .free-haraka-piece-glyph').last().boundingBox();
    expect(attachedKasraBox).not.toBeNull();
    expect(freeKasraBox).not.toBeNull();
    const scaleDifference=Math.abs(attachedKasraBox.width-freeKasraBox.width)/freeKasraBox.width;
    expect(scaleDifference).toBeLessThan(0.18);

    expect(page.__errors).toEqual([]);
  });

});
