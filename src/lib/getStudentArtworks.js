import { supabase } from "./supabase";

export async function getStudentArtworks(studentId) {

  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data || [];

}