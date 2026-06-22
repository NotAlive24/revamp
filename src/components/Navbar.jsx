export default function Navbar() {
  function scrollToSection(id) {
  const section = document.getElementById(id);
  const navbar = document.querySelector(".navbar");

  if (!section) return;

  const target = section.querySelector("h2") || section;

  const navbarHeight = navbar ? navbar.offsetHeight : 0;
  const gapBelowNavbar = 80;

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
        <img src="/logo.png" alt="logo" className="main-logo"/>
        <div className="nav-links">
            <button onClick={() => scrollToSection("about")}>About</button>
            <button onClick={() => scrollToSection("achievements")}>Achievements</button>
            <button onClick={() => scrollToSection("certificates")}>Certificates</button>
            <button onClick={() => scrollToSection("writeups")}>Write-ups</button>
            <button onClick={() => scrollToSection("contact")}>Contact</button>
        </div>
    </nav>
  );
}