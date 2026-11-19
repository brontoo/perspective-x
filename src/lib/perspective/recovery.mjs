// Keep a recovery event until the lazy sign-in screen can receive it.
// This is only UI state; Supabase still validates the recovery token and password update.
export function createRecoveryState() {
  let pending = false;
  return {
    onAuthChange(event) {
      if (event === 'PASSWORD_RECOVERY') pending = true;
      else if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') pending = false;
    },
    isPending: () => pending,
    finish: () => { pending = false; },
  };
}
