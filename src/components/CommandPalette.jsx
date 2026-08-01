import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { writeups } from "../data/writeups.js";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(event) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const combo = (isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "k";

      if (combo) {
        event.preventDefault();
        setOpen((prev) => !prev);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return writeups.slice(0, 8);
    return writeups
      .filter((w) => [w.title, w.collection, w.section].join(" ").toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function go(entrySlug) {
    setOpen(false);
    navigate(`/writeups/${entrySlug}`);
  }

  function onInputKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].slug);
    }
  }

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette" onClick={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="command-palette-input"
          placeholder="Search write-ups..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <div className="command-palette-results">
          {results.length === 0 ? (
            <p className="command-palette-empty">No matches.</p>
          ) : (
            results.map((w, i) => (
              <button
                key={w.slug}
                type="button"
                className={`command-palette-item${i === activeIndex ? " active" : ""}`}
                onClick={() => go(w.slug)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="command-palette-item-title">{w.title}</span>
                <span className="command-palette-item-meta">
                  {w.collection} / {w.section}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="command-palette-hint">
          <span>↑↓ navigate · Enter open</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}