import { supabase } from "./supabase";

export async function getStudentProfile() {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth Error:", authError);
      return null;
    }

    if (!user) {
      console.log("No logged in user.");
      return null;
    }

    // Try to find existing profile
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Select Error:", error);
    }

    if (data) {
      return data;
    }

    // Create profile automatically
    // Removed 'email' to match your table columns (id, full_name, phone, student_id)
    const { data: created, error: insertError } = await supabase
      .from("students")
      .insert([
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || "New Student",
        },
      ])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("Insert Error Message:", insertError.message);
      return null;
    }

    return created;
  } catch (err) {
    console.error("Unexpected Error:", err);
    return null;
  }
}

export async function updateStudentProfile(profile) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  return await supabase
    .from("students")
    .update(profile)
    .eq("id", user.id);
}

export async function updateProfileImage(imageUrl) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return await supabase
    .from("students")
    .update({
      profile_image: imageUrl,
    })
    .eq("id", user.id);
}