import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { writeups } from "../data/writeups.js";
import { useReveal } from "../hooks/useReveal.js";

function WriteupListItem({ writeup, onOpen }) {
  const [ref, isVisible] = useReveal();

  return (
    <button
      ref={ref}
      type="button"
      className={`writeup-list-item reveal ${isVisible ? "reveal-visible" : ""}`}
      onClick={() => onOpen(writeup)}
    >
      <div>
        <h3>{writeup.title}</h3>
        <p>{writeup.section}</p>
      </div>

      <span>Read →</span>
    </button>
  );
}

function encodePath(fileName) {
  return fileName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function fixObsidianMarkdown(markdown) {
  return markdown
    .replace(/!\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, (_, fileName) => {
      const src = `/writeups/rss/${encodePath(fileName)}`;
      return `![${fileName}](${src})`;
    })
    .replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
      return label || target;
    });
}

export default function Writeups() {
  const collections = useMemo(() => {
    return [...new Set(writeups.map((writeup) => writeup.collection))];
  }, []);

  const [selectedCollection, setSelectedCollection] = useState(
    collections[0] || ""
  );

  const [selectedSection, setSelectedSection] = useState("All");
  const [search, setSearch] = useState("");
  const [activeWriteup, setActiveWriteup] = useState(null);
  const [markdown, setMarkdown] = useState("");

  const sectionsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollStartRef = useRef(0);

  const sections = useMemo(() => {
    const collectionWriteups = writeups.filter(
      (writeup) => writeup.collection === selectedCollection
    );

    return [
      "All",
      ...new Set(
        collectionWriteups
          .map((writeup) => writeup.section)
          .filter(Boolean)
      ),
    ];
  }, [selectedCollection]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredWriteups = useMemo(() => {
    return writeups.filter((writeup) => {
      const matchesCollection =
        writeup.collection === selectedCollection;

      const matchesSection =
        selectedSection === "All" ||
        writeup.section === selectedSection;

      const searchableText = [
        writeup.title,
        writeup.collection,
        writeup.section,
        writeup.path,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(normalizedSearch);

      return matchesCollection && matchesSection && matchesSearch;
    });
  }, [selectedCollection, selectedSection, normalizedSearch]);

  const activeIndex = useMemo(() => {
    if (!activeWriteup) return -1;

    return filteredWriteups.findIndex(
      (writeup) => writeup.slug === activeWriteup.slug
    );
  }, [activeWriteup, filteredWriteups]);

  const previousWriteup =
    activeIndex > 0 ? filteredWriteups[activeIndex - 1] : null;

  const nextWriteup =
    activeIndex >= 0 && activeIndex < filteredWriteups.length - 1
      ? filteredWriteups[activeIndex + 1]
      : null;

  function selectCollection(collection) {
    setSelectedCollection(collection);
    setSelectedSection("All");
    setSearch("");
    setActiveWriteup(null);
    setMarkdown("");
  }

  function selectSection(section) {
    setSelectedSection(section);
    setActiveWriteup(null);
    setMarkdown("");
  }

  function scrollSectionsWithWheel(event) {
    const element = sectionsRef.current;
    if (!element) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      element.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  function handleSectionsPointerDown(event) {
    if (event.pointerType === "touch") return;

    const element = sectionsRef.current;
    if (!element) return;

    isDraggingRef.current = true;
    dragMovedRef.current = false;
    dragStartXRef.current = event.clientX;
    dragScrollStartRef.current = element.scrollLeft;

    element.classList.add("dragging");
    element.setPointerCapture(event.pointerId);
  }

  function handleSectionsPointerMove(event) {
    if (!isDraggingRef.current) return;

    const element = sectionsRef.current;
    if (!element) return;

    const delta = event.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 4) {
      dragMovedRef.current = true;
    }

    element.scrollLeft = dragScrollStartRef.current - delta;
  }

  function endSectionsDrag(event) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const element = sectionsRef.current;
    if (!element) return;

    element.classList.remove("dragging");

    if (event?.pointerId != null) {
      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
      }
    }
  }

  function handleSectionsClickCapture(event) {
    if (dragMovedRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragMovedRef.current = false;
  }

  function clearFilters() {
    setSearch("");
    setSelectedSection("All");
  }

  async function openWriteup(writeup) {
    if (!writeup) return;

    const content = await writeup.loader();

    setActiveWriteup(writeup);
    setMarkdown(fixObsidianMarkdown(content));

    requestAnimationFrame(() => {
      document.getElementById("writeups")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function closeWriteup() {
    setActiveWriteup(null);
    setMarkdown("");
  }

  return (
    <div id="writeups" className="writeups">
      <div className="writeups-header">
        <h2>Write-ups</h2>
        <p>Cybersecurity notes, walkthroughs, and learning logs.</p>
      </div>

      {collections.length === 0 ? (
        <div className="writeups-empty">
          <p>No write-ups have been published yet — check back soon.</p>
        </div>
      ) : activeWriteup ? (
        <article className="writeup-reader">
          <button
            className="writeup-back"
            type="button"
            onClick={closeWriteup}
          >
            ← Back to write-ups
          </button>

          <div className="writeup-reader-meta">
            <span>{activeWriteup.collection}</span>
            <span>{activeWriteup.section}</span>
          </div>

          <div className="writeup-reader-title">
            {activeWriteup.title}
          </div>

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img({ src, alt }) {
                const source = src || "";
                const isVideo = source.toLowerCase().endsWith(".mp4");

                if (isVideo) {
                  return (
                    <video
                      className="writeup-media"
                      src={source}
                      controls
                    />
                  );
                }

                return (
                  <img
                    className="writeup-media"
                    src={source}
                    alt={alt || ""}
                    onLoad={(event) =>
                      event.target.classList.add("img-loaded")
                    }
                  />
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>

          <div className="writeup-reader-nav">
            <button
              type="button"
              className="writeup-nav-button"
              disabled={!previousWriteup}
              onClick={() => openWriteup(previousWriteup)}
            >
              <span>← Previous</span>
              <strong>
                {previousWriteup
                  ? previousWriteup.title
                  : "No previous write-up"}
              </strong>
            </button>

            <button
              type="button"
              className="writeup-nav-button"
              disabled={!nextWriteup}
              onClick={() => openWriteup(nextWriteup)}
            >
              <span>Next →</span>
              <strong>
                {nextWriteup ? nextWriteup.title : "No next write-up"}
              </strong>
            </button>
          </div>
        </article>
      ) : (
        <div className="writeups-layout">
          <aside className="writeups-sidebar">
            <h3>Collections</h3>

            {collections.map((collection) => (
              <button
                key={collection}
                type="button"
                className={
                  selectedCollection === collection
                    ? "writeup-sidebar-button active"
                    : "writeup-sidebar-button"
                }
                onClick={() => selectCollection(collection)}
              >
                {collection}
              </button>
            ))}
          </aside>

          <div className="writeups-main">
            <input
              className="writeup-search"
              type="search"
              placeholder="Search write-ups..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div
              className="writeup-sections"
              ref={sectionsRef}
              onWheel={scrollSectionsWithWheel}
              onPointerDown={handleSectionsPointerDown}
              onPointerMove={handleSectionsPointerMove}
              onPointerUp={endSectionsDrag}
              onPointerCancel={endSectionsDrag}
              onClickCapture={handleSectionsClickCapture}
            >
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  className={
                    selectedSection === section
                      ? "writeup-section-button active"
                      : "writeup-section-button"
                  }
                  onClick={() => selectSection(section)}
                >
                  {section}
                </button>
              ))}
            </div>

            <p className="writeup-count">
              {filteredWriteups.length} write-up
              {filteredWriteups.length === 1 ? "" : "s"}
            </p>

            {filteredWriteups.length === 0 ? (
              <div className="writeup-empty">
                <p>
                  No write-ups match{" "}
                  {search ? <strong>"{search}"</strong> : "this filter"}.
                </p>
                <button
                  type="button"
                  className="writeup-empty-reset"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="writeups-list">
                {filteredWriteups.map((writeup) => (
                  <WriteupListItem
                    key={writeup.slug}
                    writeup={writeup}
                    onOpen={openWriteup}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}