import { updateArtworkStatus } from "../../lib/updateArtworkStatus";

import "./ArtworkStatus.css";

function ArtworkStatus({ artwork, refresh }) {

  async function changeStatus(status) {

    await updateArtworkStatus(
      artwork.id,
      status
    );

    refresh();

  }

  return (

    <div className="artwork-status">

      <span className={`status ${artwork.status?.toLowerCase()}`}>
        {artwork.status || "Pending"}
      </span>

      <div className="status-buttons">

        <button
          onClick={() => changeStatus("Approved")}
        >
          ✓ Approve
        </button>

        <button
          onClick={() => changeStatus("Featured")}
        >
          ⭐ Feature
        </button>

        <button
          onClick={() => changeStatus("Rejected")}
        >
          ✖ Reject
        </button>

      </div>

    </div>

  );

}

export default ArtworkStatus;