import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams } from "react-router-dom";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { seo } from "../data/seo.js";
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

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripMarkdownInline(text) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function getNodeText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node?.props?.children) return getNodeText(node.props.children);
  return "";
}

const CVE_PATTERN = /CVE-\d{4}-\d+/i;

function ReadingProgressBar({ articleRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    let ticking = false;

    function updateProgress() {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(1);
      } else {
        const scrolled = -rect.top;
        setProgress(Math.min(1, Math.max(0, scrolled / total)));
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    }

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [articleRef]);

  return (
    <div className="reading-progress-track" aria-hidden="true">
      <div className="reading-progress-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

export default function WriteupPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  const index = writeups.findIndex((w) => w.slug === slug);
  const writeup = index >= 0 ? writeups[index] : null;

  const previousWriteup = index > 0 ? writeups[index - 1] : null;
  const nextWriteup =
    index >= 0 && index < writeups.length - 1 ? writeups[index + 1] : null;

  const relatedWriteups = useMemo(() => {
    if (!writeup) return [];
    return writeups
      .filter(
        (w) =>
          w.slug !== writeup.slug &&
          w.collection === writeup.collection &&
          w.section === writeup.section
      )
      .slice(0, 3);
  }, [writeup]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [writeup]);

  useEffect(() => {
    if (!writeup) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setCopied(false);

    writeup
      .loader()
      .then((content) => {
        if (cancelled) return;
        setMarkdown(fixObsidianMarkdown(content));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [writeup]);

  useEffect(() => {
    if (status === "ready" && nextWriteup) {
      nextWriteup.loader().catch(() => {});
    }
  }, [status, nextWriteup]);

  useEffect(() => {
    function onKeyDown(event) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) {
        return;
      }

      if ((event.key === "ArrowLeft" || event.key === "[") && previousWriteup) {
        navigate(`/writeups/${previousWriteup.slug}`);
      } else if ((event.key === "ArrowRight" || event.key === "]") && nextWriteup) {
        navigate(`/writeups/${nextWriteup.slug}`);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previousWriteup, nextWriteup, navigate]);

  const toc = useMemo(() => {
    if (!markdown) return [];
    const items = [];
    for (const line of markdown.split("\n")) {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = stripMarkdownInline(match[2].trim());
        items.push({ level, text, id: slugify(text) });
      }
    }
    return items;
  }, [markdown]);

  if (!writeup) {
    return (
      <div className="site-content">
        <Helmet>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="writeup-page">
          <div className="writeup-reader">
            <p>That write-up doesn't exist (or the link is out of date).</p>
            <Link to="/#writeups">← Back to write-ups</Link>
          </div>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://notalive.in/writeups/${writeup.slug}`;
  const pageDescription = `${writeup.title} — ${writeup.collection}${
    writeup.section !== "General" ? ` / ${writeup.section}` : ""
  }. ${seo.description}`;

  const wordCount = markdown ? markdown.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = markdown ? Math.max(1, Math.round(wordCount / 200)) : null;

  const cveMatch = writeup.title.match(CVE_PATTERN);

  function copyLink() {
    navigator.clipboard
      .writeText(canonicalUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: writeup.title,
    author: { "@type": "Person", name: seo.author },
    url: canonicalUrl,
    isPartOf: seo.siteName,
    about: writeup.section !== "General" ? writeup.section : writeup.collection,
  };

  return (
    <div className="site-content">
      <Helmet>
        <title>{`${writeup.title} — ${writeup.section !== "General" ? writeup.section : writeup.collection} | ${seo.siteName}`}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${writeup.title} — ${writeup.section !== "General" ? writeup.section : writeup.collection} | ${seo.siteName}`} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      </Helmet>

      {status === "ready" && (
        <ReadingProgressBar key={writeup.slug} articleRef={articleRef} />
      )}

      <div className="writeup-page">
        <div className={toc.length > 1 ? "writeup-layout" : ""}>
          {toc.length > 1 && (
            <aside className="writeup-toc">
              <h4>On this page</h4>
              <div className="writeup-toc-list">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`writeup-toc-link${item.level === 3 ? " level-3" : ""}`}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            </aside>
          )}

          <article className="writeup-reader" ref={articleRef}>
            <div className="writeup-actions">
              <Link className="writeup-back" to="/#writeups">
                ← Back to write-ups
              </Link>
              <button type="button" className="writeup-copy-link" onClick={copyLink}>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>

            <div className="writeup-reader-meta">
              <span>{writeup.collection}</span>
              <span>{writeup.section}</span>
              {readingMinutes && <span>{readingMinutes} min read</span>}
              {cveMatch && (
                <a
                  className="writeup-cve-link"
                  href={`https://nvd.nist.gov/vuln/detail/${cveMatch[0].toUpperCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cveMatch[0].toUpperCase()} on NVD ↗
                </a>
              )}
            </div>

            <div className="writeup-reader-title">{writeup.title}</div>

            {status === "loading" && <p>Loading…</p>}
            {status === "error" && <p>Couldn't load this write-up.</p>}

            {status === "ready" && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h2({ children }) {
                    const id = slugify(getNodeText(children));
                    return <h2 id={id}>{children}</h2>;
                  },
                  h3({ children }) {
                    const id = slugify(getNodeText(children));
                    return <h3 id={id}>{children}</h3>;
                  },
                  img({ src, alt }) {
                    const source = src || "";
                    const isVideo = source.toLowerCase().endsWith(".mp4");

                    if (isVideo) {
                      return <video className="writeup-media" src={source} controls />;
                    }

                    return (
                      <img
                        className="writeup-media"
                        src={source}
                        alt={alt || ""}
                        onLoad={(event) => event.target.classList.add("img-loaded")}
                      />
                    );
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            )}

            <div className="writeup-reader-nav">
              <button
                type="button"
                className="writeup-nav-button"
                disabled={!previousWriteup}
                onClick={() =>
                  previousWriteup && navigate(`/writeups/${previousWriteup.slug}`)
                }
              >
                <span>← Previous</span>
                <strong>
                  {previousWriteup ? previousWriteup.title : "No previous write-up"}
                </strong>
              </button>

              <button
                type="button"
                className="writeup-nav-button"
                disabled={!nextWriteup}
                onClick={() => nextWriteup && navigate(`/writeups/${nextWriteup.slug}`)}
              >
                <span>Next →</span>
                <strong>{nextWriteup ? nextWriteup.title : "No next write-up"}</strong>
              </button>
            </div>

            {relatedWriteups.length > 0 && (
              <div className="writeup-related">
                <h4>More in {writeup.section !== "General" ? writeup.section : writeup.collection}</h4>
                <div className="writeup-related-grid">
                  {relatedWriteups.map((r) => (
                    <Link key={r.slug} to={`/writeups/${r.slug}`} className="writeup-related-card">
                      {r.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}