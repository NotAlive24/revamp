import { useEffect, useRef, useState } from "react";
import { songs } from "../data/songs.js";

export default function MusicPlayer() {
  const audioRef = useRef(null);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");

  const currentSong = songs[currentSongIndex];

  async function playAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError("");
      audio.volume = 1;
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

    audio.volume = 0.5;
    audio.load();

    if (isPlaying) {
      playAudio();
    }
  }, [currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;

    // Try autoplay once when the component loads.
    playAudio();

    // If browser blocks autoplay, this starts playback after first user interaction.
    function unlockAudio() {
      if (!audioRef.current) return;

      audioRef.current.volume = 0.5;

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError("");
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
        })
        .catch(() => {
          setError("Click to play");
        });
    }

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={currentSong.src}
        preload="metadata"
        autoPlay
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
    </div>
  );
}