import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { writeups } from "../data/writeups.js";

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

      {activeWriteup ? (
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

            <div className="writeups-list">
              {filteredWriteups.map((writeup) => (
                <button
                  key={writeup.slug}
                  type="button"
                  className="writeup-list-item"
                  onClick={() => openWriteup(writeup)}
                >
                  <div>
                    <h3>{writeup.title}</h3>
                    <p>{writeup.section}</p>
                  </div>

                  <span>Read →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}