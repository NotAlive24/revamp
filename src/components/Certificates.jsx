import { useState } from "react";

const certificates = [
  {
    title: "Industrial Intrusion",
    issuer: "TryHackMe",
    image: "/certs/THM-II.jpg",
  },
  {
    title: "Advent of Cyber 2025",
    issuer: "TryHackMe",
    image: "/certs/THM-AoC.jpg",
  },
  {
    title: "Love at first breach",
    issuer: "TryHackMe",
    image: "/certs/THM-LFB.jpg",
  },
];

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div id="certificates" className="certificates">
      <div className="certificates-header">
        <h2>Certificates</h2>
        <p>Some certifications and achievements I have earned.</p>
      </div>

      <div className="certificates-grid">
        {certificates.map((cert) => (
          <button
            className="certificate-card"
            key={cert.title}
            type="button"
            onClick={() => setSelectedCert(cert)}
          >
            <img src={cert.image} alt={cert.title} />

            <div className="certificate-info">
              <h3>{cert.title}</h3>
              <p>{cert.issuer}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedCert && (
        <div
          className="certificate-modal"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="certificate-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="certificate-close"
              type="button"
              onClick={() => setSelectedCert(null)}
            >
              ×
            </button>

            <img src={selectedCert.image} alt={selectedCert.title} />

            <h3>{selectedCert.title}</h3>
            <p>{selectedCert.issuer}</p>
          </div>
        </div>
      )}
    </div>
  );
}