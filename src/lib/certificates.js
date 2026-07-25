import { supabase } from "./supabase";

export async function getCertificates() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("student_id", user.id)
    .order("issued_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}