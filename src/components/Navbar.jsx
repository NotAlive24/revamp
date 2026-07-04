import { useEffect, useRef, useState } from "react";
import { songs } from "../data/songs.js";

const DEFAULT_VOLUME = 0.5;

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(false);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex]);

  const displayText = error || currentSong.title;

  return (
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
  );
}