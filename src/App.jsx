import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import About from "./components/About.jsx";
import Achievements from "./components/Achievements.jsx";
import Certificates from "./components/Certificates.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import Contact from "./components/Contact.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import StarBackground from "./components/StarBackground.jsx";
import WriteupPage from "./components/Writeuppage.jsx";
import Writeups from "./components/Writeups.jsx";
import { seo, structuredData } from "./data/seo.js";

function HomePage() {
  useEffect(() => {
    if (window.location.hash === "#writeups") {
      document.getElementById("writeups")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <div className="site-content">
      <Hero />
      <About />
      <Achievements />
      <Certificates />
      <Writeups />
      <Contact />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Helmet htmlAttributes={{ lang: seo.language }}>
        <title>{seo.title}</title>
        <meta name="title" content={seo.title} />
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords.join(", ")} />
        <meta name="author" content={seo.author} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content={seo.language} />
        <link rel="canonical" href={seo.url} />

        <meta name="theme-color" content={seo.themeColor} />
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.url} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:site_name" content={seo.siteName} />
        <meta property="og:locale" content={seo.locale} />
        <meta property="og:image" content={seo.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seo.title} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.image} />
        {seo.twitterHandle && (
          <meta name="twitter:site" content={seo.twitterHandle} />
        )}
        {seo.twitterHandle && (
          <meta name="twitter:creator" content={seo.twitterHandle} />
        )}

        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <CustomCursor />
      <StarBackground />
      <Navbar />
      <CommandPalette />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/writeups/:slug" element={<WriteupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}