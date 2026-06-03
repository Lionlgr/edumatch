const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = '/Users/lionelleguier/ProjetDevOps/docs/img';
const BASE = 'http://localhost:5173';
const ts = Date.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clickByText = (page, txt) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) =>
      x.textContent.includes(t)
    );
    if (b) b.click();
    return !!b;
  }, txt);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--hide-scrollbars'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();

  // 1. Accueil avec le catalogue
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT, 'app-home.png') });
  console.log('OK app-home.png');

  // 2. Inscription (rempli, role Tuteur sélectionné)
  await page.goto(BASE + '/register', { waitUntil: 'networkidle0' });
  await sleep(800);
  const inputs = await page.$$('input');
  await inputs[0].type('Camille Mercier');
  await inputs[1].type(`camille.${ts}@miage.fr`);
  await inputs[2].type('superSecret1');
  await clickByText(page, 'Tuteur');
  await sleep(400);
  await page.screenshot({ path: path.join(OUT, 'app-register.png') });
  console.log('OK app-register.png');

  // soumettre -> redirige vers le profil
  await clickByText(page, 'Créer mon compte');
  await sleep(2500);
  await page.screenshot({ path: path.join(OUT, 'app-profile.png') });
  console.log('OK app-profile.png');

  // 3. Publier une annonce de tuteur
  await page.goto(BASE + '/become-tutor', { waitUntil: 'networkidle0' });
  await sleep(800);
  await page.evaluate(() => {
    ['+ math', '+ physics', '+ algebra'].forEach((t) => {
      const b = [...document.querySelectorAll('button')].find(
        (x) => x.textContent.trim() === t
      );
      if (b) b.click();
    });
  });
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, 'app-publish.png') });
  console.log('OK app-publish.png');

  // 4. Connexion
  await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.screenshot({ path: path.join(OUT, 'app-login.png') });
  console.log('OK app-login.png');

  // 5. Accueil + modale de réservation ouverte
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await clickByText(page, 'Réserver');
  await sleep(900);
  await page.screenshot({ path: path.join(OUT, 'app-booking.png') });
  console.log('OK app-booking.png');

  await browser.close();
})().catch((e) => {
  console.error('ERREUR', e.message);
  process.exit(1);
});
