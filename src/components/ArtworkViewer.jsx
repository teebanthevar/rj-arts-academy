import {
  FaTimes,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

import "./ArtworkViewer.css";

function ArtworkViewer({
  artwork,
  onClose,
  onDelete,
}) {
  if (!artwork) return null;

  return (
    <div className="viewer-overlay">

      <div className="viewer-window">

        <button
          className="viewer-close"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <img
          src={artwork.image_url}
          alt={artwork.title}
        />

        <div className="viewer-footer">

          <div>

            <h2>{artwork.title}</h2>

            <p>
              Uploaded on{" "}
              {new Date(
                artwork.created_at
              ).toLocaleDateString()}
            </p>

          </div>

          <div className="viewer-actions">

            <a
              href={artwork.image_url}
              download
              target="_blank"
              rel="noreferrer"
            >
              <FaDownload />
            </a>

            <button
              onClick={() =>
                onDelete(artwork)
              }
            >
              <FaTrash />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ArtworkViewer;