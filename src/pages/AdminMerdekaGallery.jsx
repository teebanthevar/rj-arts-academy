import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaTrash, FaUpload } from "react-icons/fa";
import "../styles/AdminMerdekaGallery.css";

const AGE_CATEGORIES = [
  { key: "4-6", label: "4 – 6 Years" },
  { key: "7-12", label: "7 – 12 Years" },
  { key: "13-17", label: "13 – 17 Years" },
  { key: "18+", label: "18+ Years" },
];

const MAX_PER_CATEGORY = 3;
const PLACEMENT_LABELS = ["1st Place", "2nd Place", "3rd Place"];

function AdminMerdekaGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFiles, setUploadFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});

  // Winner name editing state
  const [nameInputs, setNameInputs] = useState({});
  const [savingNameId, setSavingNameId] = useState(null);
  const [nameErrors, setNameErrors] = useState({});

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

  function getCategoryItems(catKey) {
    return submissions
      .filter((s) => s.age_category === catKey)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async function handleUpload(e, catKey) {
    e.preventDefault();
    setErrorMessages((prev) => ({ ...prev, [catKey]: "" }));

    const file = uploadFiles[catKey];

    if (!file) {
      setErrorMessages((prev) => ({
        ...prev,
        [catKey]: "Please choose an image to upload.",
      }));
      return;
    }

    if (getCategoryItems(catKey).length >= MAX_PER_CATEGORY) {
      setErrorMessages((prev) => ({
        ...prev,
        [catKey]: `Maximum ${MAX_PER_CATEGORY} winners already uploaded for this category.`,
      }));
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [catKey]: true }));

      const fileExt = file.name.split(".").pop();
      const filePath = `merdeka/entry-${catKey}-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("merdeka_submissions")
        .insert([{ image_url: urlData.publicUrl, age_category: catKey }])
        .select();

      if (error) throw error;

      if (data) {
        setSubmissions((prev) => [data[0], ...prev]);
      }

      setUploadFiles((prev) => ({ ...prev, [catKey]: null }));
      const input = document.getElementById(`merdeka-file-input-${catKey}`);
      if (input) input.value = "";
    } catch (err) {
      console.error("Error uploading submission:", err);
      setErrorMessages((prev) => ({
        ...prev,
        [catKey]: "Failed to upload. Please try again.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [catKey]: false }));
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

  async function handleSaveName(item) {
    const newName = (nameInputs[item.id] ?? item.winner_name ?? "").trim();

    setNameErrors((prev) => ({ ...prev, [item.id]: "" }));

    try {
      setSavingNameId(item.id);

      const { error } = await supabase
        .from("merdeka_submissions")
        .update({ winner_name: newName })
        .eq("id", item.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, winner_name: newName } : s
        )
      );
    } catch (err) {
      console.error("Error saving winner name:", err);
      setNameErrors((prev) => ({
        ...prev,
        [item.id]: "Failed to save name. Please try again.",
      }));
    } finally {
      setSavingNameId(null);
    }
  }

  return (
    <div className="admin-merdeka-page">
      <div className="admin-merdeka-header">
        <div>
          <h1>Merdeka Colouring Competition</h1>
          <p>Upload the winning artwork for each age category (max 3 per category).</p>
        </div>
      </div>

      {loading ? (
        <p className="admin-merdeka-empty">Loading submissions...</p>
      ) : (
        AGE_CATEGORIES.map((cat) => {
          const items = getCategoryItems(cat.key);
          const isFull = items.length >= MAX_PER_CATEGORY;

          return (
            <div className="admin-merdeka-category" key={cat.key}>
              <div className="admin-merdeka-category-header">
                <h2>{cat.label}</h2>
                <span
                  className={`admin-merdeka-count ${isFull ? "is-full" : ""}`}
                >
                  {items.length}/{MAX_PER_CATEGORY}
                </span>
              </div>

              <div className="admin-merdeka-upload-card">
                <form onSubmit={(e) => handleUpload(e, cat.key)}>
                  <div className="admin-merdeka-upload-field">
                    <label htmlFor={`merdeka-file-input-${cat.key}`}>
                      Artwork Image
                    </label>

                    <input
                      id={`merdeka-file-input-${cat.key}`}
                      type="file"
                      accept="image/*"
                      disabled={isFull}
                      onChange={(e) =>
                        setUploadFiles((prev) => ({
                          ...prev,
                          [cat.key]: e.target.files[0] || null,
                        }))
                      }
                    />

                    {uploadFiles[cat.key] && (
                      <p className="admin-merdeka-file-selected">
                        Selected: {uploadFiles[cat.key].name}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="admin-merdeka-upload-btn"
                    disabled={uploading[cat.key] || isFull}
                  >
                    <FaUpload />
                    {isFull
                      ? "Category Full"
                      : uploading[cat.key]
                      ? "Uploading..."
                      : "Upload Winner"}
                  </button>

                  {errorMessages[cat.key] && (
                    <p className="admin-merdeka-error">
                      {errorMessages[cat.key]}
                    </p>
                  )}
                </form>
              </div>

              {items.length === 0 ? (
                <p className="admin-merdeka-empty">
                  No winners uploaded yet for this category.
                </p>
              ) : (
                <div className="admin-merdeka-grid">
                  {items.map((item, index) => (
                    <div className="admin-merdeka-card" key={item.id}>
                      <span className={`admin-merdeka-badge badge-${index}`}>
                        {PLACEMENT_LABELS[index]}
                      </span>

                      <img
                        src={item.image_url}
                        alt="Competition entry"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://via.placeholder.com/300x220?text=Image+unavailable";
                        }}
                      />

                      <div className="admin-merdeka-name-field">
                        <label htmlFor={`merdeka-name-${item.id}`}>
                          Winner Name
                        </label>
                        <input
                          id={`merdeka-name-${item.id}`}
                          type="text"
                          placeholder="Enter winner's name"
                          value={nameInputs[item.id] ?? item.winner_name ?? ""}
                          onChange={(e) =>
                            setNameInputs((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                        />

                        <button
                          type="button"
                          className="admin-merdeka-save-name-btn"
                          onClick={() => handleSaveName(item)}
                          disabled={savingNameId === item.id}
                        >
                          {savingNameId === item.id ? "Saving..." : "Save Name"}
                        </button>

                        {nameErrors[item.id] && (
                          <p className="admin-merdeka-error">
                            {nameErrors[item.id]}
                          </p>
                        )}
                      </div>

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
        })
      )}
    </div>
  );
}

export default AdminMerdekaGallery;