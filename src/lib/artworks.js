import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export async function uploadArtwork(file, title) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not logged in.");

  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload image
  const { error: uploadError } = await supabase.storage
    .from("artworks")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage
    .from("artworks")
    .getPublicUrl(filePath);

  const imageUrl = data.publicUrl;

  // Save record
  const { error: dbError } = await supabase
    .from("artworks")
    .insert([
      {
        student_id: user.id,
        title,
        image_url: imageUrl,
      },
    ]);

  if (dbError) throw dbError;

  // Update artwork count
  const { count } = await supabase
    .from("artworks")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", user.id);

  await supabase
    .from("students")
    .update({
      artworks: count,
    })
    .eq("id", user.id);

  return imageUrl;
}