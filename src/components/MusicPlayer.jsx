import { useEffect, useRef, useState } from "react";
import { songs } from "../data/songs.js";

const DEFAULT_VOLUME = 0.5;

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const volumePopoverRef = useRef(null);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [showVolume, setShowVolume] = useState(false);

  const currentSong = songs[currentSongIndex];

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError("");
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Autoplay/play blocked:", err);
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
    setCurrentSongIndex((index) =>
      index === songs.length - 1 ? 0 : index + 1
    );
  }

  function previousSong() {
    setCurrentSongIndex((index) =>
      index === 0 ? songs.length - 1 : index - 1
    );
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.load();

    if (isPlaying) {
      playAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex]);

  useEffect(() => {
    if (!showVolume) return;

    function handleOutsideClick(event) {
      if (
        volumePopoverRef.current &&
        !volumePopoverRef.current.contains(event.target)
      ) {
        setShowVolume(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showVolume]);

  function handleVolumeChange(event) {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }

  return (
    <div className="music-player no-style">
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

      <div className="music-info">
        <span className="music-title">
          {error || currentSong.title}
        </span>
        <span className="music-artist">{currentSong.artist}</span>
      </div>

      <div className="music-volume-wrapper" ref={volumePopoverRef}>
        <button
          className="music-button music-volume-toggle"
          type="button"
          onClick={() => setShowVolume((open) => !open)}
          aria-label="Toggle volume control"
          aria-expanded={showVolume}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="4 8 4 16 9 16 14 20 14 4 9 8 4 8" fill="currentColor" stroke="none" />
            {volume > 0 && (
              <path d="M17.5 8.5a5 5 0 0 1 0 7" />
            )}
            {volume > 0.5 && (
              <path d="M20.2 6a9 9 0 0 1 0 12" />
            )}
            {volume === 0 && (
              <>
                <line x1="17" y1="8" x2="22" y2="13" />
                <line x1="22" y1="8" x2="17" y2="13" />
              </>
            )}
          </svg>
        </button>

        {showVolume && (
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
  );
}