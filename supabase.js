// supabase.js - Supabase Client Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://ywdbeznhonlfoyyjtnwb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZGJlem5ob25sZm95eWp0bndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NTUxODQsImV4cCI6MjA5MzQzMTE4NH0.SW-_rAWug1j5eB7BImwszbokDS4bu-3o8ku8dKhWo_w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
