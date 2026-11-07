import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkxcwogqodwixfgmxdiy.supabase.co'
const supabaseKey = 'sb_publishable_j9ZAda484aHHJHZiq9LGSg_K7Qes9iy'

export const supabase = createClient(supabaseUrl, supabaseKey)
