import { useEffect, useState } from "react";

import ArtworkUpload from "../components/ArtworkUpload";
import GalleryCard from "../components/GalleryCard";
import ArtworkViewer from "../components/ArtworkViewer";

import { getArtworks } from "../lib/getArtworks";
import { deleteArtwork } from "../lib/deleteArtwork";

import {
  FaPalette,
  FaSearch,
  FaImages,
  FaSpinner,
} from "react-icons/fa";

import "./MyPortfolio.css";

function MyPortfolio() {
  const [artworks, setArtworks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    try {
      setLoading(true);

      const data = await getArtworks();

      setArtworks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(artwork) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artwork?"
    );

    if (!confirmDelete) return;

    try {
      await deleteArtwork(
        artwork.id,
        artwork.image_url
      );

      setSelectedArtwork(null);

      loadGallery();

    } catch (error) {
      console.error(error);
      alert("Unable to delete artwork.");
    }
  }

  const filtered = artworks.filter((art) =>
    art.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="portfolio-page">

      {/* Hero */}

      <section className="portfolio-hero">

        <div>

          <span className="portfolio-badge">
            🎨 RJ Arts Academy
          </span>

          <h1>My Artwork Portfolio</h1>

          <p>
            Upload, organize and showcase all your
            masterpieces in one beautiful portfolio.
          </p>

        </div>

        <div className="portfolio-stat">

          <FaPalette />

          <h2>{artworks.length}</h2>

          <span>Total Artwork</span>

        </div>

      </section>

      {/* Upload */}

      <ArtworkUpload onUploaded={loadGallery} />

      {/* Search */}

      <div className="portfolio-search">

        <FaSearch />

        <input
          type="text"
          placeholder="Search Artwork..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* Gallery */}

      <section className="gallery-grid">

        {loading ? (

          <div className="empty-gallery">

            <FaSpinner
              className="spin-loader"
            />

            <h2>Loading Portfolio...</h2>

          </div>

        ) : filtered.length === 0 ? (

          <div className="empty-gallery">

            <FaImages />

            <h2>No Artwork Yet</h2>

            <p>
              Upload your first masterpiece to begin
              your digital portfolio.
            </p>

          </div>

        ) : (

          filtered.map((art) => (

            <GalleryCard
              key={art.id}
              artwork={art}
              onView={setSelectedArtwork}
              onDelete={handleDelete}
            />

          ))

        )}

      </section>

      {/* Artwork Viewer */}

      <ArtworkViewer
        artwork={selectedArtwork}
        onClose={() =>
          setSelectedArtwork(null)
        }
        onDelete={handleDelete}
      />

    </div>
  );
}

export default MyPortfolio;