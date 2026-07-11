const { test, expect } = require('@playwright/test');

const pages = [
  ['Accueil', '/index.html'],
  ['Offres', '/offres.html'],
  ['Démos', '/exemples.html'],
  ['Process', '/process.html'],
  ['FAQ', '/faq.html'],
  ['Contact', '/contact.html'],
  ['Mentions légales', '/mentions-legales.html'],
  ['Confidentialité', '/confidentialite.html'],
  ['CGV', '/cgv.html']
];

for (const [label, url] of pages) {
  test(`${label} se charge sans erreur critique`, async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(url, { waitUntil: 'networkidle' });
    expect(response, `${url} ne renvoie aucune réponse`).not.toBeNull();
    expect(response.status(), `${url} renvoie HTTP ${response.status()}`).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/Nykuto/i);

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(80);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${url} déborde horizontalement de ${overflow}px`).toBeLessThanOrEqual(2);

    expect(pageErrors, `Erreurs JavaScript sur ${url}`).toEqual([]);
    expect(consoleErrors, `Erreurs console sur ${url}`).toEqual([]);
  });
}

test('la navigation principale mène aux pages commerciales', async ({ page }, testInfo) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  if (testInfo.project.name.includes('mobile')) {
    const toggle = page.locator('.menu-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#main-nav')).toBeVisible();
  }

  for (const target of ['offres.html', 'exemples.html', 'process.html', 'faq.html', 'contact.html']) {
    const link = page.locator(`#main-nav a[href="${target}"]`).first();
    await expect(link, `Lien ${target} absent de la navigation`).toBeVisible();
  }
});

test('le menu mobile peut être ouvert', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Contrôle réservé au projet mobile');
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#main-nav')).toBeVisible();
});

test('la page contact contient un parcours de conversion', async ({ page }) => {
  await page.goto('/contact.html', { waitUntil: 'networkidle' });

  const formCount = await page.locator('form').count();
  const contactLinkCount = await page.locator('a[href^="mailto:"], a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"]').count();
  expect(formCount + contactLinkCount, 'Aucun formulaire ni lien direct de contact détecté').toBeGreaterThan(0);
});
