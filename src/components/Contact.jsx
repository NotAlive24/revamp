import { useReveal } from "../hooks/useReveal.js";

const contacts = [
  {
    label: "Email",
    value: "admin@notalive.in",
    href: "mailto:admin@notalive.in",
    external: false,
  },
  {
    label: "GitHub",
    value: "@NotAlive24",
    href: "https://github.com/NotAlive24",
    external: true,
  },
  {
    label: "TryHackMe",
    value: "TryHackMe Profile",
    href: "https://tryhackme.com/p/NotAlive",
    external: true,
  },
  {
    label: "HackTheBox",
    value: "HackTheBox Profile",
    href: "https://profile.hackthebox.com/profile/019f9975-d51b-7271-87e8-f290fead13df",
    external: true,
  },
];

function ContactCard({ item }) {
  const [ref, isVisible] = useReveal();

  return (
    <a
      ref={ref}
      className={`contact-card reveal ${isVisible ? "reveal-visible" : ""}`}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
    >
      <span>{item.label}</span>
      <strong>{item.value}</strong>
    </a>
  );
}

export default function Contact() {
  return (
    <div id="contact" className="contact">
      <div className="contact-header">
        <h2>Contact</h2>
        <p>
          Want to connect, collaborate, or check out more of my work?
          Here are the best places to find me.
        </p>
      </div>

      <div className="contact-grid">
        {contacts.map((item) => (
          <ContactCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}