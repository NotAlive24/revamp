import { useState } from "react";
import { useReveal } from "../hooks/useReveal.js";

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

function CertificateCard({ cert, onSelect }) {
  const [ref, isVisible] = useReveal();

  return (
    <button
      ref={ref}
      className={`certificate-card reveal ${isVisible ? "reveal-visible" : ""}`}
      type="button"
      onClick={() => onSelect(cert)}
    >
      <img
        src={cert.image}
        alt={cert.title}
        onLoad={(event) => event.target.classList.add("img-loaded")}
      />

      <div className="certificate-info">
        <h3>{cert.title}</h3>
        <p>{cert.issuer}</p>
      </div>
    </button>
  );
}

export default function Certificates() {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div id="certificates" className="certificates">
      <div>
        <h2>Certificates</h2>
        <p>Some certifications and achievements I have earned.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="certificates-empty">
          <p>Certificates coming soon.</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.title}
              cert={cert}
              onSelect={setSelectedCert}
            />
          ))}
        </div>
      )}

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

            <img
              src={selectedCert.image}
              alt={selectedCert.title}
              onLoad={(event) => event.target.classList.add("img-loaded")}
            />

            <h3>{selectedCert.title}</h3>
            <p>{selectedCert.issuer}</p>
          </div>
        </div>
      )}
    </div>
  );
}