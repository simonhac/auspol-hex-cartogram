import { NavLink } from "react-router-dom";
import { routes } from "../routes";

export function Sidebar() {
  const overview = routes.find((r) => r.path === "/");
  // Preserve declaration order of groups.
  const groups: string[] = [];
  for (const r of routes) {
    if (r.group && !groups.includes(r.group)) groups.push(r.group);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">auspoligraphs</div>
        <div className="sidebar-sub">component gallery</div>
      </div>

      <nav className="sidebar-nav">
        {overview && (
          <NavLink to={overview.path} className="nav-link" end>
            {overview.label}
          </NavLink>
        )}

        {groups.map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-group-head">{group}</div>
            {routes
              .filter((r) => r.group === group)
              .map((r) => (
                <NavLink key={r.path} to={r.path} className="nav-link">
                  {r.label}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        Australian political graphs — React components.
      </div>
    </aside>
  );
}
