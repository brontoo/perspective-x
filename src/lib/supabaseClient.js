import { createClient } from '@supabase/supabase-js'
import { createPortalFetch } from './perspective/network.mjs'
import { createRecoveryState } from './perspective/recovery.mjs'

const supabaseUrl = 'https://daobsxonesvcjmnalpdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb2JzeG9uZXN2Y2ptbmFscGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNjgsImV4cCI6MjA5MDAwOTE2OH0.bKjPmwyYLBEZbg_sxM789ODkXUiYMLZ3ghjMsSk3848'

export const supabase = createClient(supabaseUrl, supabaseKey, { global: { fetch: createPortalFetch() } })

// Subscribe at client creation, before a redirect can finish and before route chunks load.
export const passwordRecovery = createRecoveryState()
supabase.auth.onAuthStateChange(passwordRecovery.onAuthChange)
