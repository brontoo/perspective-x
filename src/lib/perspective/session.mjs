import { CONNECTION_TIMEOUT_MESSAGE } from './network.mjs';

// Only a confirmed missing/revoked session should send a learner back to sign-in.
// Transport failures and service outages must preserve the session and offer retry.
export function isMissingSession(error) {
  return !!error && (
    error.name === 'AuthSessionMissingError' ||
    error.status === 401 ||
    ['session_not_found', 'user_not_found', 'bad_jwt', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code)
  );
}

export function sessionCheckMessage(error) {
  if (isMissingSession(error)) return 'Your session has expired. Please sign in again.';
  return 'Your session could not be checked. Check your connection and try again.';
}

export function signInErrorMessage(error) {
  if (error?.message === CONNECTION_TIMEOUT_MESSAGE) return CONNECTION_TIMEOUT_MESSAGE;
  if (error?.status === 429)
    return 'Too many sign-in attempts. Please wait a little before trying again.';
  if (error?.code === 'invalid_credentials' || /invalid login credentials/i.test(error?.message || ''))
    return 'The email or password is incorrect. Check your school email and password, or use Forgot password?';
  if (error?.code === 'email_not_confirmed')
    return 'Please confirm your email using the link in your inbox before signing in.';
  if (error?.status >= 500 || error?.name === 'AuthRetryableFetchError')
    return 'The sign-in service could not be reached. Check your connection and try again.';
  return error?.message || 'Unable to sign in. Please try again.';
}
