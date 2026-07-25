import { supabase } from "./supabase";

export async function updateArtworkStatus(id, status) {

  const featured = status === "Featured";

  const { error } = await supabase
    .from("artworks")
    .update({
      status,
      featured,
    })
    .eq("id", id);

  if (error) throw error;
}