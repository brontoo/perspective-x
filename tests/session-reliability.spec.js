import {test,expect} from '@playwright/test';
import {setup} from './support/fixtures';
import {mkdirSync} from 'node:fs';

async function credentials(page){
 await page.getByRole('textbox',{name:'Email',exact:true}).fill('fixture-student@example.invalid');
 await page.locator('input[autocomplete="current-password"]').fill('valid-password');
}
for(const path of ['/Roles','/ProfileSettings','/Dashboard','/ScenarioPlayer?scenario=ionic_dessert_mystery'])test(`temporary Auth outage on ${path} offers retry without sending a signed-in student to login`,async({page})=>{
 await setup(page);
 const outage=route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Temporary auth service outage'})});
 await page.route('**/auth/v1/user',outage);
 await page.goto(path);
 await expect(page.getByRole('alert')).toContainText(/connection|temporarily|try again/i);
 expect(new URL(page.url()).pathname+new URL(page.url()).search).toBe(path);
 expect(await page.evaluate(()=>!!localStorage.getItem('sb-daobsxonesvcjmnalpdr-auth-token'))).toBe(true);
 if(path==='/Roles'){
  mkdirSync('docs/session-reliability/screenshots',{recursive:true});
  await page.screenshot({path:'docs/session-reliability/screenshots/session-retry.png'});
 }
 await page.unroute('**/auth/v1/user',outage);
 await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect(new URL(page.url()).pathname+new URL(page.url()).search).toBe(path);
});

test('a concurrent profile creation is re-read instead of rejecting a successful login',async({page})=>{
 const state=await setup(page,{guest:true,teacher:true});
 let gets=0,inserts=0;
 await page.route('**/rest/v1/profiles?*',route=>{
  if(route.request().method()==='POST'){
   inserts++;
   return route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({code:'23505',message:'duplicate key value violates unique constraint'})});
  }
  const url=new URL(route.request().url());
  if(url.searchParams.has('id')&&gets++===0)return route.fulfill({contentType:'application/json',body:'null'});
  return route.fallback();
 });
 await page.goto('/SignIn');await credentials(page);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page).toHaveURL(/\/TeacherDashboard$/);
 await expect(page.getByRole('heading',{level:1,name:'Test Teacher!'})).toBeVisible();
 expect(inserts).toBe(1);expect(state.writes).toEqual([]);
});

test('a genuine profile permission error remains a failed setup, with no fabricated profile or role',async({page})=>{
 const state=await setup(page,{guest:true});
 await page.route('**/rest/v1/profiles?*',route=>route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({code:'42501',message:'permission denied'})}));
 await page.goto('/SignIn');await credentials(page);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText(/profile.*could not be loaded/i);
 await expect(page).toHaveURL(/\/SignIn$/);expect(state.writes).toEqual([]);
});

test('the sign-out button revokes this session without revoking the same account on other devices',async({page})=>{
 await setup(page);let scope;
 await page.route('**/auth/v1/logout*',route=>{scope=new URL(route.request().url()).searchParams.get('scope');return route.fulfill({body:'{}',contentType:'application/json'});});
 await page.goto('/Dashboard');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();
 await expect.poll(()=>scope).toBe('local');
});

for(const path of ['/Dashboard','/ScenarioPlayer?scenario=ionic_dessert_mystery'])test(`sign-out in another tab removes the signed-in view at ${path}`,async({page,context})=>{
 await setup(page);await page.goto(path);
 await expect(page.getByRole('heading').first()).toBeVisible();
 const other=await context.newPage();await setup(other,{guest:true});
 await other.goto('/Dashboard');
 await other.getByRole('button',{name:'Sign out',exact:true}).click();
 await expect(page).toHaveURL(/\/SignIn$/,{timeout:4000});
 await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeVisible();
 await other.close();
});

test('invalid credentials are explained without automatically resubmitting or opening the dashboard',async({page})=>{
 const state=await setup(page,{guest:true});
 await page.goto('/SignIn');await credentials(page);
 await page.locator('input[autocomplete="current-password"]').fill('wrong-password');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText(/email.*password/i);
 await expect(page).toHaveURL(/\/SignIn$/);
 expect(state.requests.filter(p=>p==='/auth/v1/token')).toHaveLength(1);
 expect(state.writes).toEqual([]);
});

test('signing into a different account in another tab replaces the old student view',async({page,context})=>{
 const state=await setup(page);await page.goto('/Dashboard');
 await expect(page.getByRole('banner')).toContainText('Test Learner');
 const other=await context.newPage(),next=await setup(other,{guest:true});
 const newId='00000000-0000-4000-8000-000000000099';
 for(const fixture of [state,next]){
  fixture.user.id=newId;fixture.user.email='another-learner@example.invalid';fixture.user.user_metadata.full_name='Another Learner';
  fixture.profile.id=newId;fixture.profile.full_name='Another Learner';
 }
 await other.goto('/SignIn');await credentials(other);
 await other.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(other).toHaveURL(/\/Dashboard$/);
 await expect(page.getByRole('banner')).toContainText('Another Learner');
 await expect(page.getByRole('banner')).not.toContainText('Test Learner');
 await other.close();
});

test('a rate-limited login gives wait-and-retry advice rather than saying the password is wrong',async({page})=>{
 await setup(page,{guest:true});let calls=0;
 await page.route('**/auth/v1/token*',route=>{calls++;return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({code:'over_request_rate_limit',message:'rate limit reached'})});});
 await page.goto('/SignIn');await credentials(page);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText(/wait.*trying again/i);
 await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeEnabled();expect(calls).toBe(1);
});

for(const revoked of [false,true])test(`expired sessions ${revoked?'return to login when the refresh token is revoked':'refresh normally without asking for the password again'}`,async({page})=>{
 const state=await setup(page);let refreshes=0;
 await page.addInitScript(()=>{
  const key='sb-daobsxonesvcjmnalpdr-auth-token',session=JSON.parse(localStorage.getItem(key));
  session.expires_at=Math.floor(Date.now()/1000)-120;
  localStorage.setItem(key,JSON.stringify(session));
 });
 await page.route('**/auth/v1/token*',route=>{
  const url=new URL(route.request().url());
  expect(url.searchParams.get('grant_type')).toBe('refresh_token');refreshes++;
  return route.fulfill({status:revoked?400:200,contentType:'application/json',body:JSON.stringify(revoked?
   {error_code:'refresh_token_not_found',message:'Invalid Refresh Token: Refresh Token Not Found'}:
   {access_token:'synthetic-refreshed-token',refresh_token:'synthetic-new-refresh',expires_in:3600,token_type:'bearer',user:state.user})});
 });
 await page.goto('/Dashboard');
 if(revoked){await expect(page).toHaveURL(/\/SignIn$/);await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeVisible();}
 else await expect(page.getByRole('heading',{name:/Welcome back/})).toBeVisible();
 expect(refreshes).toBe(1);expect(state.writes).toEqual([]);
});

test('password recovery still opens its form if the sign-in page chunk arrives after the Auth event',async({page})=>{
 const state=await setup(page,{guest:true});
 // On a slow connection Auth may finish processing the email link before the lazy UI loads.
 await page.route('**/assets/SignIn-*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1000));await route.continue();});
 await page.goto('/SignIn#access_token=fixture-token&refresh_token=fixture-refresh&expires_in=3600&token_type=bearer&type=recovery');
 await expect(page.getByRole('heading',{name:/Choose a new password/i})).toBeVisible();
 mkdirSync('docs/session-reliability/screenshots',{recursive:true});
 await page.screenshot({path:'docs/session-reliability/screenshots/password-recovery.png'});
 await page.locator('input[autocomplete="new-password"]').fill('new-synthetic-password');
 await page.getByRole('button',{name:'Update password',exact:true}).click();
 await expect(page.getByRole('status')).toContainText(/password was updated/i);
 expect(state.writes).toHaveLength(1);
 expect(state.writes[0]).toMatchObject({type:'metadata',body:{password:'new-synthetic-password'}});
});
