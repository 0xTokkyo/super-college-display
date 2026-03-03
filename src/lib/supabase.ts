import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Supabase v2+ : "Publishable key" (anciennement appelée "anon key")
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables. ' +
    'Please copy .env.example to .env and fill in your Supabase project values.'
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
