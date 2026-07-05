import { useEffect, useRef, useState } from "react";
import { songs } from "../data/songs.js";

const DEFAULT_VOLUME = 0.5;

export default function Navbar() {
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(false);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  const currentSong = songs?.[currentSongIndex] || { title: "No Track", artist: "", src: "" };

  const scrollToSection = (id) => {
    setIsNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn(`Section with id "${id}" not found.`);
    }
  };

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError("");
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Play blocked:", err);
      setIsPlaying(false);
      setError("Click to play");
    }
  }

  function pauseAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function nextSong() {
    wasPlayingRef.current = isPlaying;
    setCurrentSongIndex((index) =>
      index === songs.length - 1 ? 0 : index + 1
    );
  }

  function previousSong() {
    wasPlayingRef.current = isPlaying;
    setCurrentSongIndex((index) =>
      index === 0 ? songs.length - 1 : index - 1
    );
  }

  function retryLoad() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    playAudio();
  }

  function handleVolumeChange(event) {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.load();

    if (wasPlayingRef.current) {
      playAudio();
    }
  }, [currentSongIndex]);

  const displayText = error || currentSong.title;

  return (
    <nav className="navbar">
      <img className="nav-logo" src="/logo.png" alt="NotAlive logo" />

      <div className="nav-right">
        {/* Navigation Links */}
        <div className={`nav-links ${isNavOpen ? "open" : ""}`}>
          <button type="button" onClick={() => scrollToSection("about")}>
            About
          </button>
          <button type="button" onClick={() => scrollToSection("achievements")}>
            Achievements
          </button>
          <button type="button" onClick={() => scrollToSection("certificates")}>
            Certs
          </button>
          <button type="button" onClick={() => scrollToSection("writeups")}>
            Write-ups
          </button>
          <button type="button" onClick={() => scrollToSection("contact")}>
            Contact
          </button>
        </div>

        {/* Music Player Section - lives outside nav-links now, so it stays
            visible in the top bar (to the left of the hamburger) instead of
            collapsing into the mobile dropdown */}
        <div className="nav-music-wrapper">
          <div className="music-player">
            <audio
              ref={audioRef}
              src={currentSong.src}
              preload="metadata"
              onEnded={nextSong}
              onError={() => {
                console.error("Audio failed to load:", currentSong.src);
                setError("File missing");
                setIsPlaying(false);
              }}
            />

            <div className="music-info">
              {error === "File missing" ? (
                <button
                  type="button"
                  className="music-retry"
                  onClick={retryLoad}
                  aria-live="polite"
                >
                  {displayText} — retry
                </button>
              ) : (
                <span className="music-title" aria-live="polite">
                  {displayText}
                </span>
              )}
              <span className="music-artist">{currentSong.artist}</span>
            </div>

            <div className="music-controls" style={{ display: 'flex', gap: '4px' }}>
              <button
                className="music-button"
                type="button"
                onClick={previousSong}
                aria-label="Previous song"
              >
                ⏮
              </button>

              <button
                className="music-button music-play"
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause song" : "Play song"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                className="music-button"
                type="button"
                onClick={nextSong}
                aria-label="Next song"
              >
                ⏭
              </button>
            </div>
          </div>

          {/* Volume Pop(down)over Setup */}
          <div className="music-volume-wrapper">
            <button 
              className="music-volume-toggle"
              onClick={() => setIsVolumeOpen(!isVolumeOpen)}
              aria-label="Toggle Volume"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>

            {isVolumeOpen && (
              <div className="music-volume-popover">
                <input
                  className="music-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle Button - stays last so the music player renders
            to its left in the flex row */}
        <button 
          className={`nav-toggle ${isNavOpen ? "open" : ""}`} 
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}