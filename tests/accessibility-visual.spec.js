const { test, expect } = require('@playwright/test');

const pages = ['/index.html', '/offres.html', '/exemples.html', '/process.html', '/faq.html', '/contact.html'];

for (const url of pages) {
  test(`${url} respecte les contrôles visuels et d’accessibilité de base`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });

    await expect(page.locator('main')).toBeVisible();
    expect(await page.locator('h1').count(), `${url}: aucun h1`).toBe(1);

    const buttonsWithoutName = await page.locator('button').evaluateAll((nodes) =>
      nodes.filter((node) => !(node.innerText || node.getAttribute('aria-label') || node.getAttribute('title'))).length
    );
    expect(buttonsWithoutName, `${url}: bouton sans nom accessible`).toBe(0);

    const linksWithoutName = await page.locator('a').evaluateAll((nodes) =>
      nodes.filter((node) => !(node.innerText || node.getAttribute('aria-label') || node.getAttribute('title'))).length
    );
    expect(linksWithoutName, `${url}: lien sans nom accessible`).toBe(0);

    const focusable = page.locator('a, button, input, textarea, select').first();
    if (await focusable.count()) {
      await focusable.focus();
      await expect(focusable).toBeFocused();
    }
  });
}
