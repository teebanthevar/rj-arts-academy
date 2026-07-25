import {
  FaTrash,
  FaExpand,
} from "react-icons/fa";

import "./GalleryCard.css";

function GalleryCard({
  artwork,
  onDelete,
  onView,
}) {
  return (
    <div className="gallery-card">

      {/* Status Badge */}
      {artwork.status === "Pending" && (
        <span className="status-badge pending">
          Pending Approval
        </span>
      )}

      <img
        src={artwork.image_url}
        alt={artwork.title}
      />

      <div className="gallery-overlay">

        <button
          onClick={() => onView(artwork)}
        >
          <FaExpand />
        </button>

        <button
          onClick={() => onDelete(artwork)}
        >
          <FaTrash />
        </button>

      </div>

      <div className="gallery-footer">

        <h3>{artwork.title}</h3>

        <span>
          {new Date(
            artwork.created_at
          ).toLocaleDateString()}
        </span>

      </div>

    </div>
  );
}

export default GalleryCard;