import test from 'node:test';
import assert from 'node:assert/strict';
import {isMissingSession,sessionCheckMessage,signInErrorMessage} from '../src/lib/perspective/session.mjs';
import {createRecoveryState} from '../src/lib/perspective/recovery.mjs';

test('only verified missing or revoked Auth sessions require reauthentication',()=>{
 for(const failure of [{name:'AuthSessionMissingError'},{status:401},{code:'session_not_found'},{code:'refresh_token_not_found'},{code:'bad_jwt'}])assert.equal(isMissingSession(failure),true);
 for(const failure of [null,{name:'TimeoutError'},{name:'AuthRetryableFetchError',status:0},{status:503},{status:429},{code:'42501',status:403}])assert.equal(isMissingSession(failure),false);
});
test('network and session errors lead to distinct recovery instructions',()=>{
 assert.match(sessionCheckMessage({status:503}),/connection.*try again/i);
 assert.match(sessionCheckMessage({status:401}),/expired.*sign in again/i);
});
test('bad credentials, unconfirmed email, rate limiting and outages do not share misleading advice',()=>{
 assert.match(signInErrorMessage({code:'invalid_credentials'}),/email or password/i);
 assert.match(signInErrorMessage({code:'email_not_confirmed'}),/confirm your email/i);
 assert.match(signInErrorMessage({status:429}),/wait/i);
 assert.match(signInErrorMessage({name:'AuthRetryableFetchError',status:0}),/connection/i);
 assert.match(signInErrorMessage({status:503}),/could not be reached/i);
 assert.match(signInErrorMessage({name:'AuthRetryableFetchError',message:'The connection is taking too long. Check your internet connection and try again.'}),/taking too long/i);
 assert.equal(signInErrorMessage({message:'Signed in, but your profile could not be loaded.'}),'Signed in, but your profile could not be loaded.');
});

test('recovery UI state survives delayed mounting and refresh events, and clears after completion or account change',()=>{
 const recovery=createRecoveryState();assert.equal(recovery.isPending(),false);
 recovery.onAuthChange('PASSWORD_RECOVERY');recovery.onAuthChange('INITIAL_SESSION');recovery.onAuthChange('TOKEN_REFRESHED');
 assert.equal(recovery.isPending(),true);recovery.finish();assert.equal(recovery.isPending(),false);
 recovery.onAuthChange('PASSWORD_RECOVERY');recovery.onAuthChange('SIGNED_OUT');assert.equal(recovery.isPending(),false);
 recovery.onAuthChange('PASSWORD_RECOVERY');recovery.onAuthChange('SIGNED_IN');assert.equal(recovery.isPending(),false);
});
