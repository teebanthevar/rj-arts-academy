import {
  FaAward,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";

import "./CertificateCard.css";

function CertificateCard({ certificate }) {
  return (
    <div className="certificate-card">

      <div className="certificate-icon">

        <FaAward />

      </div>

      <h2>{certificate.title}</h2>

      <p>{certificate.description}</p>

      <div className="certificate-date">

        <FaCalendarAlt />

        {certificate.issued_date}

      </div>

      <a
        href={certificate.certificate_url}
        target="_blank"
        rel="noreferrer"
        className="download-btn"
      >
        <FaDownload />

        Download Certificate

      </a>

    </div>
  );
}

export default CertificateCard;