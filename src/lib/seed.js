const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedCharities() {
  console.log("Seeding charities to:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const charities = [
    { 
      name: "Junior Golf Academy", 
      description: "Providing golf training and education for underprivileged youth to foster discipline and sportsmanship.", 
      logo_url: "https://images.unsplash.com/photo-1544924405-4aca9a2ec405?w=500",
      is_featured: true
    },
    { 
      name: "Green Earth Golfers", 
      description: "Focused on re-wilding retired golf courses and protecting local biodiversity.", 
      logo_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500",
      is_featured: false
    },
    { 
      name: "Veterans On The Green", 
      description: "Mental health and rehabilitation through professional golf golf training for wounded veterans.", 
      logo_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500",
      is_featured: true
    },
    { 
      name: "Children's Heart Foundation", 
      description: "Funding life-saving cardiac surgeries and ongoing care for children in need.", 
      logo_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500",
      is_featured: false
    }
  ];

  const { data, error } = await supabase.from('charities').insert(charities);
  
  if (error) {
    if (error.code === '23505') {
      console.log("ℹ️ Charities already exist in your database.");
    } else {
      console.error("❌ Error seeding charities:", error.message);
      console.log("Note: Make sure you ran the SQL schema in your Supabase dashboard first!");
    }
  } else {
    console.log("✅ Success! Charities seeded to your Supabase project.");
  }
}

seedCharities();
