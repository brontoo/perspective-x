import {test,expect} from '@playwright/test';
import {setup,noOverflow} from './support/fixtures';
import {mkdirSync} from 'node:fs';
const first='00000000-0000-4000-8000-000000000002',second='00000000-0000-4000-8000-000000000003';
async function teacher(page,{presets=true,photo=false,invalid=false,storage}={}){
 const rows=[
  {id:'avatar-row-a',student_id:first,scenario_id:'ionic_dessert_mystery',score:100,completed_at:'2026-11-14T10:00:00Z',answers:{exitTicket:{score:100,passed:true}}},
  {id:'avatar-row-b',student_id:second,scenario_id:'atom_dive',score:80,completed_at:'2026-11-14T09:00:00Z',answers:{exitTicket:{score:80,passed:true}}}
 ];
 const state=await setup(page,{teacher:true,seedRows:rows});
 const students=[
  {id:first,full_name:'Synthetic Learner A',email:'learner-a@example.invalid',role:'student',...(presets?{avatar_preset_id:invalid?'portrait-99':'portrait-7'}:{}),...(photo?{avatar_path:`${first}/photo.webp`,avatar_preset_id:null}:{})},
  {id:second,full_name:'Synthetic Learner B',email:'learner-b@example.invalid',role:'student',...(presets?{avatar_preset_id:'portrait-10'}:{})}
 ];
 await page.route('**/rest/v1/profiles?*',route=>{
  const url=new URL(route.request().url());
  if(url.searchParams.get('role')==='eq.student')return route.fulfill({contentType:'application/json',body:JSON.stringify(students)});
  return route.fallback();
 });
 if(storage) await page.route('**/storage/v1/**',storage);
 await page.goto('/TeacherDashboard');
 await expect(page.getByRole('heading',{name:'Latest submitted work',exact:true})).toBeVisible();
 return {state,students};
}
const row=(page,name)=>page.locator('.teacher-submission').filter({has:page.getByText(name,{exact:true})});
for(const width of [1440,390])test(`recent submissions show each student's own selected preset at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});const {state}=await teacher(page);
 const a=row(page,'Synthetic Learner A'),b=row(page,'Synthetic Learner B');
 await expect(a.locator('.px-avatar-preset')).toHaveCSS('background-position','25% 100%');
 await expect(b.locator('.px-avatar-preset')).toHaveCSS('background-position','100% 100%');
 await expect(a.getByRole('img',{name:'Synthetic Learner A avatar',exact:true})).toBeVisible();
 await expect(b.getByRole('img',{name:'Synthetic Learner B avatar',exact:true})).toBeVisible();
 // The teacher's own portrait-2 must not be substituted for the learner's portrait-7.
 await expect(page.getByRole('banner').locator('.px-avatar-preset')).toHaveCSS('background-position','25% 0%');
 await noOverflow(page);mkdirSync('docs/teacher-avatars/screenshots',{recursive:true});
 await page.locator('.px-panel').filter({has:page.getByRole('heading',{name:'Latest submitted work',exact:true})}).screenshot({path:`docs/teacher-avatars/screenshots/recent-activity-${width}.png`});
 await a.getByRole('button',{name:'Review work',exact:false}).click();
 await expect(page.getByRole('dialog')).toContainText('Synthetic Learner A');
 expect(state.writes).toEqual([]);
 expect(state.requests.filter(path=>path.includes('/auth/v1/admin'))).toEqual([]);
});

test('a schema without the new avatar field retains initials without breaking the teacher dashboard',async({page})=>{
 await teacher(page,{presets:false});const a=row(page,'Synthetic Learner A');
 await expect(a.locator('.px-avatar-preset')).toHaveCount(0);await expect(a.locator('.px-avatar')).toHaveText('SL');
 await expect(a.getByRole('button',{name:'Review work',exact:false})).toBeVisible();
});

test('invalid preset IDs are not guessed or rendered as arbitrary image URLs',async({page})=>{
 await teacher(page,{invalid:true});const a=row(page,'Synthetic Learner A');
 await expect(a.locator('.px-avatar-preset')).toHaveCount(0);await expect(a.locator('.px-avatar')).toHaveText('SL');
});

for(const allowed of [true,false])test(`uploaded student pictures use existing signed-photo permissions: allowed=${allowed}`,async({page})=>{
 const signing=[];
 const storage=route=>{
  const url=new URL(route.request().url());
  if(url.pathname.includes('/object/sign/')&&route.request().method()==='POST'){
   signing.push(url.pathname);
   return route.fulfill({status:allowed?200:403,contentType:'application/json',body:JSON.stringify(allowed?{signedURL:'/object/sign/avatars/fixture-photo.webp?token=synthetic'}:{message:'Not authorized'})});
  }
  return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64')});
 };
 await teacher(page,{photo:true,storage});
 const a=row(page,'Synthetic Learner A');
 if(allowed)await expect(a.getByRole('img',{name:'Synthetic Learner A profile',exact:true})).toBeVisible();
 else {await expect(a.locator('.px-avatar img')).toHaveCount(0);await expect(a.locator('.px-avatar')).toHaveText('SL');}
 await expect.poll(()=>signing.some(path=>path.includes(first))).toBe(true);
});

test('removing the own preset takes precedence over a stale profile cache',async({page})=>{
 const state=await setup(page);state.profile.avatar_preset_id='portrait-7';state.user.user_metadata.px_avatar_id=null;
 await page.goto('/Dashboard');
 await expect(page.getByRole('banner').locator('.px-avatar-preset')).toHaveCount(0);
 await expect(page.getByRole('banner').locator('.px-avatar')).toHaveText('TL');
});
