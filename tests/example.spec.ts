import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

test('open page and fetch elements', async ({ page, context }) => {
  test.setTimeout(300000);
  const res = await fetch(process.env.fetchUrl as string);
  const links = await res.json() as string[];

  let dataByLinks = {};
  const pages = links.map(async (l) => {
    const page = await context.newPage();
    await page.goto(l);

    const vEls = await page.$$("a:has(> canvas)");
    const vLinks = await Promise.all(vEls.map(a => a.getAttribute('href')));

    dataByLinks[l] = vLinks;
  });

  await Promise.all(pages);

  console.log("dataByLinks: ", dataByLinks)
  await fetch(
    process.env.postUrl as string,
    { method: 'POST', body: JSON.stringify(dataByLinks), headers: { "Content-Type": "application/json" } })

  console.log("Done");
});
