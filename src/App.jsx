import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Achievements from "./components/Achievements.jsx";
import Certificates from "./components/Certificates.jsx"

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Achievements />
      <Certificates />
    </>
  );
}