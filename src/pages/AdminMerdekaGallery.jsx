import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaTrash, FaUpload } from "react-icons/fa";
import "../styles/AdminMerdekaGallery.css";

function AdminMerdekaGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("merdeka_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!uploadFile) {
      setErrorMessage("Please choose an image to upload.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `merdeka/entry-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, uploadFile);

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("merdeka_submissions")
        .insert([{ image_url: urlData.publicUrl }])
        .select();

      if (error) throw error;

      if (data) {
        setSubmissions((prev) => [data[0], ...prev]);
      }

      setUploadFile(null);
      document.getElementById("merdeka-file-input").value = "";
    } catch (err) {
      console.error("Error uploading submission:", err);
      setErrorMessage("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item) {
    const confirmDelete = window.confirm(
      "Remove this submission? This cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(item.id);

      const { error } = await supabase
        .from("merdeka_submissions")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setSubmissions((prev) => prev.filter((s) => s.id !== item.id));
    } catch (err) {
      console.error("Error deleting submission:", err);
      alert("Failed to remove this submission. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-merdeka-page">

      <div className="admin-merdeka-header">
        <div>
          <h1>Merdeka Colouring Competition</h1>
          <p>Upload participant artwork to display on the public gallery.</p>
        </div>
      </div>

      <div className="admin-merdeka-upload-card">
        <form onSubmit={handleUpload}>

          <div className="admin-merdeka-upload-field">
            <label htmlFor="merdeka-file-input">Artwork Image</label>

            <input
              id="merdeka-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
            />

            {uploadFile && (
              <p className="admin-merdeka-file-selected">
                Selected: {uploadFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="admin-merdeka-upload-btn"
            disabled={uploading}
          >
            <FaUpload />
            {uploading ? "Uploading..." : "Upload Artwork"}
          </button>

          {errorMessage && (
            <p className="admin-merdeka-error">{errorMessage}</p>
          )}
        </form>
      </div>

      <div className="admin-merdeka-grid-header">
        <h2>Submitted Entries ({submissions.length})</h2>
      </div>

      {loading ? (
        <p className="admin-merdeka-empty">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p className="admin-merdeka-empty">
          No submissions uploaded yet.
        </p>
      ) : (
        <div className="admin-merdeka-grid">
          {submissions.map((item) => (
            <div className="admin-merdeka-card" key={item.id}>

              <img
                src={item.image_url}
                alt="Competition entry"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/300x220?text=Image+unavailable";
                }}
              />

              <button
                type="button"
                className="admin-merdeka-delete-btn"
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? "…" : <FaTrash />}
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AdminMerdekaGallery;