import { test, expect } from '@playwright/test';

test.describe('Arabic Language Lab board E2E', () => {
  test.beforeEach(async ({ page }) => {
    const errors=[];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:8080/', { waitUntil:'networkidle' });
    await expect(page.locator('#boardCanvas')).toBeVisible();
    page.__errors=errors;
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
});
