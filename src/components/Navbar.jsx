import MusicPlayer from "./MusicPlayer.jsx";

export default function Navbar() {
  function scrollToSection(id) {
    const section = document.getElementById(id);
    const navbar = document.querySelector(".navbar");

    if (!section) return;

    const target = section.querySelector("h2") || section;
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const gapBelowNavbar = 24;

    const elementTopOnPage =
      target.getBoundingClientRect().top + window.scrollY;

    const scrollToY =
      elementTopOnPage - navbarHeight - gapBelowNavbar;

    window.scrollTo({
      top: scrollToY,
      behavior: "smooth",
    });
  }

  return (
    <nav className="navbar">
      <img className="nav-logo" src="/logo.png" alt="NotAlive logo" />

      <div className="nav-links">
        <button onClick={() => scrollToSection("about")}>About</button>
        <button onClick={() => scrollToSection("achievements")}>
          Achievements
        </button>
        <button onClick={() => scrollToSection("certificates")}>
          Certs
        </button>
        <button onClick={() => scrollToSection("writeups")}>
          Write-ups
        </button>
        <button onClick={() => scrollToSection("contact")}>
          Contact
        </button>
      </div>

      <MusicPlayer />
    </nav>
  );
}