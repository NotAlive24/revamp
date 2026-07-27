import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { writeups } from "../data/writeups.js";
import { useReveal } from "../hooks/useReveal.js";

function WriteupListItem({ writeup }) {
  const [ref, isVisible] = useReveal();

  return (
    <Link
      ref={ref}
      to={`/writeups/${writeup.slug}`}
      className={`writeup-list-item reveal ${isVisible ? "reveal-visible" : ""}`}
    >
      <div>
        <h3>{writeup.title}</h3>
        <p>{writeup.section}</p>
      </div>

      <span>Read →</span>
    </Link>
  );
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

  const sectionsRef = useRef(null);

  const sections = useMemo(() => {
    const collectionWriteups = writeups.filter(
      (writeup) => writeup.collection === selectedCollection
    );

    return [
      "All",
      ...new Set(
        collectionWriteups.map((writeup) => writeup.section).filter(Boolean)
      ),
    ];
  }, [selectedCollection]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredWriteups = useMemo(() => {
    return writeups.filter((writeup) => {
      const matchesCollection = writeup.collection === selectedCollection;
      const matchesSection =
        selectedSection === "All" || writeup.section === selectedSection;

      const searchableText = [
        writeup.title,
        writeup.collection,
        writeup.section,
        writeup.path,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);

      return matchesCollection && matchesSection && matchesSearch;
    });
  }, [selectedCollection, selectedSection, normalizedSearch]);

  function selectCollection(collection) {
    setSelectedCollection(collection);
    setSelectedSection("All");
    setSearch("");
  }

  function selectSection(section) {
    setSelectedSection(section);
  }

  function scrollSectionsWithWheel(event) {
    const element = sectionsRef.current;
    if (!element) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      element.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  function clearFilters() {
    setSearch("");
    setSelectedSection("All");
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
                  <WriteupListItem key={writeup.slug} writeup={writeup} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}