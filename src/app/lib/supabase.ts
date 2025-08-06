// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bpywzvxvhatpchkfbhsp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweXd6dnh2aGF0cGNoa2ZiaHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjY0NzEsImV4cCI6MjA3MDA0MjQ3MX0.NZvuYfrOaKe7blgYoI0nYY6o2Wed5aIQJBLkHbZ9pY4"

export const supabase = createClient(supabaseUrl, supabaseKey)
