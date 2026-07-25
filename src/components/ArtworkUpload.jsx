import { useState } from "react";
import { uploadArtwork } from "../lib/artworks";

import {
  FaCloudUploadAlt,
  FaImage,
  FaCheckCircle,
} from "react-icons/fa";

import "./ArtworkUpload.css";

function ArtworkUpload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Please select an artwork.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter artwork title.");
      return;
    }

    try {
      setLoading(true);

      await uploadArtwork(file, title);

      setSuccess("Artwork uploaded successfully!");

      setTitle("");
      setFile(null);
      setPreview("");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleImage(e) {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);

    setPreview(URL.createObjectURL(selected));
  }

  return (
    <div className="upload-card">

      <h2>
        <FaCloudUploadAlt />
        Upload Artwork
      </h2>

      <input
        className="upload-title"
        type="text"
        placeholder="Artwork Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="upload-box">

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          hidden
        />

        {!preview ? (
          <div className="upload-placeholder">

            <FaImage />

            <h3>Select Artwork</h3>

            <p>Click to choose an artwork image</p>

          </div>
        ) : (
          <img
            src={preview}
            alt="Preview"
            className="preview-image"
          />
        )}

      </label>

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Artwork"}
      </button>

      {success && (
        <div className="success-box">

          <FaCheckCircle />

          {success}

        </div>
      )}

    </div>
  );
}

export default ArtworkUpload;