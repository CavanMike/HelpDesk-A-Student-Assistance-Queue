import { useTheme } from "../context/ThemeContext.jsx";

export default function RequestCard({ request, onResolve, onDelete }) {
  const { theme } = useTheme();
  const { id, studentName, concern, priority, status, createdAt } = request;

  return (
    <li className={`card theme-${theme} ${status === "Resolved" ? "is-resolved" : ""}`}>
      <div className="card-top">
        <strong className="card-name">{studentName}</strong>
        <span className="badges">
          <span className={`badge priority-${priority.toLowerCase()}`}>{priority}</span>
          <span className={`badge status-${status.toLowerCase()}`}>{status}</span>
        </span>
      </div>
      <p className="card-concern">{concern}</p>
      <p className="card-time">
        Requested at {new Date(createdAt).toLocaleTimeString()}
      </p>
      <div className="card-actions">
        {status === "Waiting" && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onResolve(id)}
            aria-label={`Resolve request from ${studentName}`}
          >
            Resolve
          </button>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(id)}
          aria-label={`Delete request from ${studentName}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
