import { supabaseAdmin } from "./src/lib/supabaseAdmin.js";

async function fixAdminRole() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role: "admin" })
    .eq("email", "admin@gmail.com");

  if (error) {
    console.error("Error fixing role:", error);
  } else {
    console.log("Success: Role restored for admin@gmail.com");
  }
}

fixAdminRole();
