const writeups = [
  {
    title: "TryHackMe",
    platform: "TryHackMe",
    description: "My write-up on rooms from TryHackMe",
    url: "https://old.notalive.in/Heads/THM.html",
    tags: ["TryHackMe", "Cybersecurity"],
  },
  {
    title: "ISC2",
    platform: "ISC2",
    description: "Notes for exam prep for ISC2 Exams",
    url: "https://old.notalive.in/Heads/ISC2.html",
    tags: ["Cybersecurity", "Cert-notes"],
  },
  {
    title: "Python Mastery Path",
    platform: "Self",
    description: "Best way to learn Python for cybersecurity, with resources and tasks.",
    url: "https://old.notalive.in/posts/python_cybersecurity.html",
    tags: ["Cybersecurity", "Roadmap"],
  },
];

export default function Writeups() {
  return (
    <div id="writeups" className="writeups">
      <div className="writeups-header">
        <h2>Write-ups</h2>
        <p>Cybersecurity notes, walkthroughs, and learning logs.</p>
      </div>

      <div className="writeups-grid">
        {writeups.map((writeup) => (
          <a
            className="writeup-card"
            key={writeup.title}
            href={writeup.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="writeup-top">
              <p>{writeup.platform}</p>
              <span>↗</span>
            </div>

            <h3>{writeup.title}</h3>

            <p className="writeup-description">
              {writeup.description}
            </p>

            <div className="writeup-tags">
              {writeup.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}