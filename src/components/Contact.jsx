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
];

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
          <a
            className="contact-card"
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </a>
        ))}
      </div>
    </div>
  );
}