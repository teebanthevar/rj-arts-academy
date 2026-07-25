import { supabase } from "./supabase";

export async function deleteArtwork(id, imageUrl) {
  try {
    console.log("Attempting to delete artwork with ID:", id, "Type:", typeof id);

    if (imageUrl) {
      const marker = "/artworks/";
      const parts = imageUrl.split(marker);
      
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from("artworks").remove([filePath]);
      }
    }

    const { data, error: dbError } = await supabase
      .from("artworks")
      .delete()
      .eq("id", id)
      .select();

    if (dbError) {
      console.error("Database delete error:", dbError.message);
      alert("Database error: " + dbError.message);
      return;
    }

    console.log("Delete result data:", data);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}