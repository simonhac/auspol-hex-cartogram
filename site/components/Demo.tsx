import type { ReactNode } from "react";

export interface DemoProps {
  title: string;
  description?: ReactNode;
  /** Controls bar (toggles, selects) shown above the live render. */
  controls?: ReactNode;
  /** Constrain the live render width (px). */
  maxWidth?: number;
  children: ReactNode;
}

/** Per-component demo wrapper: title, description, optional controls, surface. */
export function Demo({ title, description, controls, maxWidth, children }: DemoProps) {
  return (
    <section className="demo">
      <header className="demo-head">
        <h1 className="demo-title">{title}</h1>
        {description && <p className="demo-desc">{description}</p>}
      </header>
      {controls && <div className="demo-controls">{controls}</div>}
      <div className="demo-surface">
        <div className="demo-stage" style={maxWidth ? { maxWidth } : undefined}>
          {children}
        </div>
      </div>
    </section>
  );
}
