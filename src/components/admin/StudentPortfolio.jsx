import { useEffect, useState } from "react";
import { getStudentArtworks } from "../../lib/getStudentArtworks";
import ArtworkStatus from "./ArtworkStatus"; // Added import
import "./StudentPortfolio.css";

function StudentPortfolio({ student }) {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    if (student) {
      loadPortfolio();
    }
  }, [student]);

  async function loadPortfolio() {
    const data = await getStudentArtworks(student.id);
    setArtworks(data);
  }

  if (!student) return null;

  if (artworks.length === 0) {
    return (
      <div className="portfolio-empty">
        🎨 No artwork uploaded.
      </div>
    );
  }

  return (
    <div className="portfolio-grid">
      {artworks.map((art) => (
        <div key={art.id} className="portfolio-card">
          <img src={art.image_url} alt={art.title} />
          <div className="portfolio-info">
            <h4>{art.title}</h4>
            <span>
              {new Date(art.created_at).toLocaleDateString()}
            </span>
            
            {/* Added ArtworkStatus component */}
            <ArtworkStatus 
              artwork={art} 
              refresh={loadPortfolio} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentPortfolio;