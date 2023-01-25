import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

test('open page and fetch elements', async ({ page, context }) => {
  test.setTimeout(300000);
  console.log("process.env.fetchUrl: ", process.env.fetchUrl)
  const res = await fetch(process.env.fetchUrl as string);
  const links = await res.json() as string[];

  let dataByLinks = {};
  const pages = links.map(async (l) => {
    try {
      const page = await context.newPage();
      await page.goto(l, {
        timeout: 60000
      });

      const vEls = await page.$$("a:has(> canvas)");
      const vLinks = await Promise.all(vEls.map(a => a.getAttribute('href')));

      dataByLinks[l] = vLinks;
    } catch (err) {
      console.log(`Error while handling ${l}: Error: ${err}`)
    }

  });

  await Promise.all(pages);

  console.log("dataByLinks: ", dataByLinks)
  await fetch(
    process.env.postUrl as string,
    { method: 'POST', body: JSON.stringify(dataByLinks), headers: { "Content-Type": "application/json" } })

  console.log("Done");
});
