import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use the browser-aware client so it shares auth state via cookies/localStorage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
