import { supabase } from "./supabase";

export async function uploadProfileImage(file) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not logged in");

  const extension = file.name.split(".").pop();

  const fileName = `${user.id}.${extension}`;

  const { error } = await supabase.storage
    .from("profile-images")
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("profile-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}