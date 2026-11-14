import test from 'node:test';
import assert from 'node:assert/strict';
import {createPortalFetch,CONNECTION_TIMEOUT_MESSAGE} from '../src/lib/perspective/network.mjs';
const base='https://synthetic.supabase.invalid';
function stalled(_input,init){return new Promise((_,reject)=>{if(init.signal.aborted)reject(init.signal.reason);else init.signal.addEventListener('abort',()=>reject(init.signal.reason),{once:true});});}
test('read deadline aborts a stalled profile request and returns a useful connection error',async()=>{
 let signal;
 const fetch=createPortalFetch({timeoutMs:5,fetcher:(...args)=>{signal=args[1].signal;return stalled(...args);}});
 await assert.rejects(fetch(base+'/rest/v1/profiles'),{name:'TimeoutError',message:CONNECTION_TIMEOUT_MESSAGE});assert.equal(signal.aborted,true);
});
test('authentication POST is bounded without automatically retrying a credential submission',async()=>{
 let calls=0;const fetch=createPortalFetch({timeoutMs:5,fetcher:(...args)=>{calls++;return stalled(...args);}});
 await assert.rejects(fetch(base+'/auth/v1/token',{method:'POST',body:'synthetic'}),{name:'TimeoutError'});assert.equal(calls,1);
});
test('deadline continues through a stalled response body, not only headers',async()=>{
 const fetch=createPortalFetch({timeoutMs:5,fetcher:async(_url,{signal})=>new Response(new ReadableStream({start(controller){signal.addEventListener('abort',()=>controller.error(signal.reason),{once:true});}}))});
 await assert.rejects(fetch(base+'/rest/v1/student_progress'),{name:'TimeoutError'});
});
test('normal JSON, statuses, row counts and request authorization survive the transport',async()=>{
 let received;const fetch=createPortalFetch({fetcher:async(input,init)=>{received=init;return new Response(JSON.stringify({id:'own-user',role:'student'}),{status:206,headers:{'content-range':'0-0/1','content-type':'application/json'}});}});
 const result=await fetch(base+'/rest/v1/profiles',{headers:{authorization:'Bearer synthetic-token'}});
 assert.equal(received.headers.authorization,'Bearer synthetic-token');assert.equal(result.status,206);assert.equal(result.headers.get('content-range'),'0-0/1');assert.deepEqual(await result.json(),{id:'own-user',role:'student'});
});
test('invalid credentials remain an error response rather than a successful session',async()=>{
 const fetch=createPortalFetch({fetcher:async()=>new Response('{"message":"Invalid login credentials"}',{status:400})});
 const r=await fetch(base+'/auth/v1/token',{method:'POST'});assert.equal(r.status,400);assert.equal(r.ok,false);assert.equal((await r.json()).message,'Invalid login credentials');
});
test('caller cancellation is respected and is not misreported as a timeout',async()=>{
 const c=new AbortController(), reason=new Error('Caller canceled');
 const fetch=createPortalFetch({timeoutMs:1000,fetcher:stalled});const result=fetch(base+'/rest/v1/profiles',{signal:c.signal});c.abort(reason);await assert.rejects(result,error=>error===reason);
});
test('successful completion clears the deadline rather than aborting later work',async()=>{
 let signal;const fetch=createPortalFetch({timeoutMs:5,fetcher:async(_url,init)=>{signal=init.signal;return new Response('{}');}});
 await fetch(base+'/auth/v1/user');await new Promise(r=>setTimeout(r,15));assert.equal(signal.aborted,false);
});
test('mission writes and avatar uploads are not given a new automatic cancellation policy',async()=>{
 for(const [path,method] of [['/rest/v1/student_progress','POST'],['/rest/v1/student_progress','PATCH'],['/storage/v1/object/avatars/own-user/test.webp','POST']]){
  const opts={method,body:'synthetic'};let received;
  const response=new Response('{}');const fetch=createPortalFetch({fetcher:async(_url,init)=>{received=init;return response;}});
  assert.equal(await fetch(base+path,opts),response);assert.equal(received,opts);assert.equal(received.signal,undefined);
 }
});
test('HEAD counts and no-content responses keep their legitimate empty bodies',async()=>{
 const fetch=createPortalFetch({fetcher:async()=>new Response(null,{status:204,headers:{'content-range':'*/12'}})});
 const r=await fetch(base+'/rest/v1/profiles',{method:'HEAD'});assert.equal(r.status,204);assert.equal(r.headers.get('content-range'),'*/12');assert.equal(await r.text(),'');
});
