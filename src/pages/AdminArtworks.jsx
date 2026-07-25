import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ArtworkStatus from "../components/admin/ArtworkStatus";

function AdminArtworks() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArtworks = async () => {
    setLoading(true);
    // Fetch directly from artworks table without the join to test
    const { data, error } = await supabase
      .from("artworks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching artworks:", error);
    } else {
      setArtworks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading artworks...</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Student Artwork Submissions</h2>
      <p>Review and manage student portfolio pieces.</p>

      {artworks.length === 0 ? (
        <p style={{ marginTop: "20px", color: "#666" }}>No artwork submissions found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px" }}>
          {artworks.map((artwork) => (
            <div key={artwork.id} style={{ background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <img 
                src={artwork.image_url} 
                alt={artwork.title || "Artwork"} 
                style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} 
              />
              <h4 style={{ margin: "10px 0 5px 0" }}>{artwork.title || "Untitled"}</h4>
              <p style={{ fontSize: "14px", color: "#666", margin: "0 0 15px 0" }}>
                Status: <strong>{artwork.status || "Pending"}</strong>
              </p>

              {/* Using your custom ArtworkStatus component */}
              <ArtworkStatus artwork={artwork} refresh={fetchArtworks} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminArtworks;