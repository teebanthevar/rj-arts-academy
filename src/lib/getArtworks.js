import { supabase } from "./supabase";

export async function getArtworks() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("student_id", user.id)
    .neq("status", "Rejected") // Hides rejected items, but lets pending and approved items show
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}