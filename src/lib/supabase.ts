import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function insertBurnRate(value: number, timestamp = Date.now()) {
  return supabase.from('burn_rates').insert({ timestamp, value })
}

export async function fetchBurnRates(start: number, end: number) {
  const { data, error } = await supabase
    .from('burn_rates')
    .select('timestamp, value')
    .gte('timestamp', start)
    .lt('timestamp', end)
  if (error) throw error
  return data as { timestamp: number; value: number }[]
}
