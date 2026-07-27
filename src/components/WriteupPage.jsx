import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function WriteupPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"

  const index = writeups.findIndex((w) => w.slug === slug);
  const writeup = index >= 0 ? writeups[index] : null;

  // Prev/next walk the full sorted writeups list (not scoped to whatever
  // collection/section filter was active on the list page, since that
  // context doesn't exist on a standalone URL) — reorder this if you'd
  // rather it stay within the same collection.
  const previousWriteup = index > 0 ? writeups[index - 1] : null;
  const nextWriteup =
    index >= 0 && index < writeups.length - 1 ? writeups[index + 1] : null;

  useEffect(() => {
    if (!writeup) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    window.scrollTo(0, 0);

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

  if (!writeup) {
    return (
      <div className="site-content">
        <div className="writeup-reader">
          <p>That write-up doesn't exist (or the link is out of date).</p>
          <Link to="/#writeups">← Back to write-ups</Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://notalive.in/writeups/${writeup.slug}`;
  const pageDescription = `${writeup.title} — ${writeup.collection}${
    writeup.section !== "General" ? ` / ${writeup.section}` : ""
  }. ${seo.description}`;

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
        <title>{`${writeup.title} | ${seo.siteName}`}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${writeup.title} | ${seo.siteName}`} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      </Helmet>

      <article className="writeup-reader">
        <Link className="writeup-back" to="/#writeups">
          ← Back to write-ups
        </Link>

        <div className="writeup-reader-meta">
          <span>{writeup.collection}</span>
          <span>{writeup.section}</span>
        </div>

        <div className="writeup-reader-title">{writeup.title}</div>

        {status === "loading" && <p>Loading…</p>}
        {status === "error" && <p>Couldn't load this write-up.</p>}

        {status === "ready" && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
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
      </article>
    </div>
  );
}
