import {test,expect} from '@playwright/test';
import {setup} from './support/fixtures';
async function enter(page){await page.getByRole('textbox',{name:'Email',exact:true}).fill('fixture-student@example.invalid');await page.locator('input[autocomplete="current-password"]').fill('valid-password');}

test('successful sign-in routes within the SPA without reloading the whole document',async({page})=>{
  await setup(page,{guest:true});let documents=0;
  page.on('request',r=>{if(r.resourceType()==='document'&&r.isNavigationRequest())documents++;});
  await page.goto('/SignIn');await enter(page);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.waitForURL('**/Dashboard');
  await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
  expect(documents).toBe(1);
});

test('stalled profile loading ends in a recoverable error instead of an endless sign-in spinner',async({page})=>{
  await setup(page,{guest:true});await page.goto('/SignIn');await enter(page);await page.clock.install();
  let held=false;await page.route('**/rest/v1/profiles?*',()=>{held=true;});
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect.poll(()=>held).toBe(true);await page.clock.fastForward(21000);
  await expect(page.getByRole('alert')).toContainText('profile');
  await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeEnabled();
  expect(new URL(page.url()).pathname).toBe('/SignIn');
});

test('a stalled authentication request aborts and releases the form for retry',async({page})=>{
 await setup(page,{guest:true});await page.goto('/SignIn');await enter(page);await page.clock.install();
 let held=false;const block=()=>{held=true;};await page.route('**/auth/v1/token*',block);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect.poll(()=>held).toBe(true);
 await page.clock.fastForward(21000);await expect(page.getByRole('alert')).toContainText('taking too long');
 await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeEnabled();
 await page.unroute('**/auth/v1/token*',block);await page.clock.resume();
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/Dashboard');
 await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
});

test('a stalled dashboard read has a usable retry and never displays fabricated records',async({page})=>{
 await setup(page);await page.clock.install();let held=false;
 const block=()=>{held=true;};await page.route('**/rest/v1/student_progress?*',block);
 await page.goto('/Dashboard');await expect.poll(()=>held).toBe(true);await page.clock.fastForward(21000);
 await expect(page.getByRole('alert')).toContainText('taking too long');
 await page.unroute('**/rest/v1/student_progress?*',block);await page.clock.resume();
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
});

test('browser storage restrictions do not crash sign-in or discard the in-memory session during navigation',async({page})=>{
 await setup(page,{guest:true});
 await page.addInitScript(()=>{for(const method of ['getItem','setItem','removeItem'])Storage.prototype[method]=()=>{throw new DOMException('Storage unavailable','SecurityError');};});
 await page.goto('/SignIn');await enter(page);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/Dashboard');
 await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
});

test('students with editable teacher metadata still route from their actual stored student profile',async({page})=>{
 const state=await setup(page,{guest:true});state.user.user_metadata.role='teacher';
 await page.goto('/SignIn');await enter(page);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.waitForURL('**/Dashboard');await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
});

test('duplicate submit events issue one credential request',async({page})=>{
 const data=await setup(page,{guest:true});await page.goto('/SignIn');await enter(page);
 await page.locator('form').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 await page.waitForURL('**/Dashboard');
 expect(data.requests.filter(path=>path==='/auth/v1/token')).toHaveLength(1);
});

test('an optional picture finishing after the user leaves cannot bounce them back to the dashboard',async({page})=>{
 await setup(page,{guest:true});let pending;
 await page.route('**/auth/v1/user',route=>{if(route.request().method()==='PUT')pending=route;else return route.fallback();});
 await page.goto('/SignIn');await enter(page);await page.getByRole('button',{name:'Choose golden beanie avatar',exact:true}).click();
 await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect.poll(()=>!!pending).toBe(true);
 await page.getByRole('link',{name:'Home',exact:true}).click();await expect(page).toHaveURL(/\/$/);
 await pending.fallback();await expect(page.locator('body')).toContainText('Real Science.');
 await expect(page.getByRole('link',{name:/Test Learner/}).first()).toBeVisible();await expect(page).toHaveURL(/\/$/);
});

test('cold Sign-In no longer downloads chart, certificate or mission runtime libraries',async({page})=>{
 await setup(page,{guest:true});const scripts=[];const errors=[];
 page.on('request',request=>{if(request.resourceType()==='script')scripts.push(request.url());});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/SignIn');await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeVisible();
 expect(scripts.filter(url=>/pdf-vendor|chart-vendor|jspdf|html2canvas|TeacherDashboard|ScenarioPlayer|three-vendor/.test(url))).toEqual([]);
 expect(errors).toEqual([]);
});

test('lowercase and uppercase sign-in links still accept authentication',async({page})=>{
 await setup(page,{guest:true});
 for(const path of ['/signin','/SIGNIN']){
  await page.goto(path);await enter(page);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/Dashboard');
  await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
 }
});
