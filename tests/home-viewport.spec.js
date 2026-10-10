import {test,expect} from '@playwright/test';
import {setup} from './support/fixtures';
import fs from 'node:fs/promises';
for (const [width,height] of [[1676,927],[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[768,1024],[390,844],[375,667],[844,390]]) {
 test(`homepage fits one complete viewport at ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width,height});await setup(page);await page.goto('/');
  await expect(page.locator('.home-profile')).toBeVisible();
  expect(await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}))).toEqual({width,height});
  await expect(page.locator('.home-roles,.home-story')).toHaveCount(0);
  for(const selector of ['.home-nav','.home-hero h1','.home-description','.home-actions','.home-footer','.home-stats']) {
   const box=await page.locator(selector).boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(height+1);
  }
  const nav=await page.locator('.home-nav').boundingBox();const scene=await page.locator('.home-scene').boundingBox();
  expect(scene.y).toBeGreaterThanOrEqual(nav.y+nav.height-1);
  await expect(page.locator('.home-stats br')).toHaveCount(0);
  for(const label of await page.locator('.home-stats span').all()) {
   const dimensions=await label.evaluate(element=>({width:element.clientWidth,content:element.scrollWidth}));
   expect(dimensions.content).toBeLessThanOrEqual(dimensions.width+1);
  }
  const hero=await page.locator('.home-hero').boundingBox();const actions=await page.locator('.home-actions').boundingBox();const bottom=await page.locator('.home-bottom').boundingBox();
  expect(actions.y+actions.height).toBeLessThanOrEqual(bottom.y+1);
  expect((await page.locator('.home-title-rule').boundingBox()).y).toBeGreaterThanOrEqual(hero.y);
  await fs.mkdir('test-results/home-viewport',{recursive:true});await page.screenshot({path:`test-results/home-viewport/home-${width}x${height}.png`});
 });
}
test('homepage navigation works without scrolling sections',async({page})=>{
 await setup(page);await page.goto('/');await page.getByRole('button',{name:'Our Story',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await page.getByRole('link',{name:'Explore Roles',exact:true}).click();await expect(page).toHaveURL(/\/Roles$/);await expect(page.locator('.xp-role-card')).toHaveCount(9);
});
