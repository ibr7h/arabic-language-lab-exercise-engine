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
    await expect(badge).toHaveText('Version v12.3 • Build 2026-09-18');
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
