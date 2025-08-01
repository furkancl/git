import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL veya KEY tanımlı değil")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

