import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daobsxonesvcjmnalpdr.supabase.co'
const supabaseKey = 'sb_publishable_hIGnhUuCJxMoJJmNnrmrTg_o1nFbC5C'

export const supabase = createClient(supabaseUrl, supabaseKey)
