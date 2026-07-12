import { cache } from "react";
import { createClient } from "./server";

export const getStaffContext = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, staffUser: null };
  }

  const { data: staffUser } = await supabase
    .from("staff_users")
    .select("full_name, role, must_change_password")
    .eq("id", user.id)
    .single();

  return { supabase, user, staffUser };
});
