import { createClient } from '@supabase/supabase-js'
import { SUPABASE, supabaseEnabled } from './data'

// Cliente único do Supabase (null quando não configurado -> app usa fallback local)
export const supabase = supabaseEnabled()
  ? createClient(SUPABASE.url, SUPABASE.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
