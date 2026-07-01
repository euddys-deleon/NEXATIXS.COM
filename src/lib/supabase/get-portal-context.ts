import { cache } from "react";
import { createClient } from "./server";

export const getPortalContext = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, clientUser: null };
  }

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("full_name, client_id, role")
    .eq("id", user.id)
    .single();

  return { supabase, user, clientUser };
});
