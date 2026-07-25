import "./StatsCard.css";

function StatsCard({
  title,
  value,
  icon,
  subtitle,
}) {
  return (
    <div className="stats-card">

      <div className="stats-top">

        <div className="stats-icon">
          {icon}
        </div>

      </div>

      <h2>{value}</h2>

      <h3>{title}</h3>

      <p>{subtitle}</p>

    </div>
  );
}

export default StatsCard;