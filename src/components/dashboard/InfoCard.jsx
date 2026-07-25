import "./InfoCard.css";

function InfoCard({ title, children }) {
  return (
    <div className="info-card">
      <h3>{title}</h3>

      <div className="info-content">
        {children}
      </div>
    </div>
  );
}

export default InfoCard;