import { useTheme } from "../context/ThemeContext.jsx";
import { FILTERS } from "../queue.js";
import RequestCard from "./RequestCard.jsx";

export default function RequestList({
  requests,
  filter,
  onFilterChange,
  onResolve,
  onDelete,
}) {
  const { theme } = useTheme();

  return (
    <section className={`panel theme-${theme}`} aria-labelledby="queue-heading">
      <div className="list-toolbar">
        <h2 id="queue-heading">Queue</h2>
        <div className="field inline">
          <label htmlFor="statusFilter">Show</label>
          <select
            id="statusFilter"
            value={filter}
            onChange={event => onFilterChange(event.target.value)}
          >
            {FILTERS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="empty">No requests to show.</p>
      ) : (
        <ul className="request-list">
          {requests.map(request => (
            // Stable request ID as the key (never the array index).
            <RequestCard
              key={request.id}
              request={request}
              onResolve={onResolve}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
