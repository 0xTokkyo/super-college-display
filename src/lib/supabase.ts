import { createClient } from '@supabase/supabase-js'

// Clés publiques Supabase - peuvent être exposées sans risque de sécurité
const supabaseUrl = 'https://ngboqllcnrmktpqcpqek.supabase.co'
// Supabase v2+ : "Publishable key" (anciennement appelée "anon key")
const supabasePublishableKey = 'sb_publishable_ql8ENf2iNqmU1fCNyRluSQ_SScW5jB6'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
