import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@gmial.com')
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
  } else {
    console.log('Profile found:', data)
  }
}

checkAdmin()
