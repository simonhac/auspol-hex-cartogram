import { Link } from "react-router-dom";
import { routes } from "../routes";

export function HomePage() {
  const items = routes.filter((r) => r.path !== "/");
  return (
    <div className="home">
      <h1 className="home-title">auspoligraphs</h1>
      <p className="home-lede">
        A library of React components for visualising Australian politics — an
        equal-area hex cartogram of federal electorates, a parliament seat-dot
        arc, and primary-vote &amp; seats bar charts. This gallery shows each
        component live; use the A/B toggles to watch them animate.
      </p>
      <div className="home-grid">
        {items.map((r) => (
          <Link key={r.path} to={r.path} className="home-card">
            <span className="home-card-label">{r.label}</span>
            <span className="home-card-group">{r.group}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
