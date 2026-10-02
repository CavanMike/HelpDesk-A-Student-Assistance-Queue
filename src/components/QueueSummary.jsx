import { useTheme } from "../context/ThemeContext.jsx";

export default function QueueSummary({ waiting, resolved, total }) {
  const { theme } = useTheme();

  return (
    <section className={`panel summary theme-${theme}`} aria-label="Queue summary">
      <div className="stat">
        <span className="stat-value" data-testid="waiting-count">{waiting}</span>
        <span className="stat-label">Waiting</span>
      </div>
      <div className="stat">
        <span className="stat-value" data-testid="resolved-count">{resolved}</span>
        <span className="stat-label">Resolved</span>
      </div>
      <div className="stat">
        <span className="stat-value" data-testid="total-count">{total}</span>
        <span className="stat-label">Total</span>
      </div>
    </section>
  );
}
