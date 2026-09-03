import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/AdminGallery.css";

function AdminGallery() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from("gallery_images")
      .insert({
        image_url: publicUrlData.publicUrl,
        file_path: filePath,
      });

    if (insertError) {
      console.error(insertError);
      alert("Failed to save image record: " + insertError.message);
    } else {
      await fetchImages();
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (image) => {
    if (!window.confirm("Delete this image?")) return;

    const { error: storageError } = await supabase.storage
      .from("gallery")
      .remove([image.file_path]);

    if (storageError) {
      console.error(storageError);
      alert("Failed to delete file: " + storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", image.id);

    if (dbError) {
      console.error(dbError);
      alert("Failed to delete record: " + dbError.message);
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== image.id));
  };

  return (
    <div className="admin-gallery">
      <h2>Manage Gallery</h2>

      <label className="upload-btn">
        {uploading ? "Uploading..." : "Upload New Image"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          hidden
        />
      </label>

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <div className="admin-gallery-grid">
          {images.map((image) => (
            <div className="admin-gallery-card" key={image.id}>
              <img src={image.image_url} alt="Gallery upload" loading="lazy" />
              <button
                className="delete-btn"
                onClick={() => handleDelete(image)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGallery;