import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <div className="site-content">
      <Helmet>
        <title>Page not found</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="writeup-page">
        <div className="writeup-reader">
          <p>This page doesn't exist.</p>
          <Link to="/">← Back home</Link>
        </div>
      </div>
    </div>
  );
}
