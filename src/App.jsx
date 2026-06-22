import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Achievements from "./components/Achievements.jsx";
import Certificates from "./components/Certificates.jsx";
import Writeups from "./components/Writeups.jsx";
import Contact from "./components/Contact.jsx";
import StarBackground from "./components/StarBackground.jsx";

export default function App() {
  return (
    <>
      <StarBackground />

      <div className="site-content">
        <Navbar />
        <Hero />
        <About />
        <Achievements />
        <Certificates />
        <Writeups />
        <Contact />
      </div>
    </>
  );
}