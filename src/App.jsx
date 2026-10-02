import { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext.jsx";
import Header from "./components/Header.jsx";
import RequestForm from "./components/RequestForm.jsx";
import QueueSummary from "./components/QueueSummary.jsx";
import RequestList from "./components/RequestList.jsx";
import { STORAGE_KEY, getCounts, getVisibleRequests, loadRequests } from "./queue.js";

export default function App() {
  const { theme } = useTheme();

  // Lazy initializer: reads storage ONCE, before the saving effect first runs,
  // so an empty initial queue can never overwrite saved requests.
  const [requests, setRequests] = useState(loadRequests);
  const [filter, setFilter] = useState("All");
  const [storageWarning, setStorageWarning] = useState(false);

  // Derived values: calculated during rendering, not stored in state.
  const { waiting: waitingCount, resolved: resolvedCount, total } = getCounts(requests);
  const visibleRequests = getVisibleRequests(requests, filter);

  // Effect 1: synchronize requests -> browser storage.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [requests]);

  // Effect 2: synchronize the waiting count -> document title.
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `HelpDesk — ${waitingCount} waiting`;
    return () => {
      document.title = originalTitle;
    };
  }, [waitingCount]);

  // Event handlers: every update is immutable and functional.
  function addRequest(newRequest) {
    setRequests(previous => [...previous, newRequest]);
  }

  function resolveRequest(requestId) {
    setRequests(previous =>
      previous.map(request =>
        request.id === requestId ? { ...request, status: "Resolved" } : request
      )
    );
  }

  function deleteRequest(requestId) {
    setRequests(previous => previous.filter(request => request.id !== requestId));
  }

  return (
    <div className={`app theme-${theme}`}>
      <Header />
      <main className="container">
        {storageWarning && (
          <p className="warning" role="alert">
            Warning: browser storage is unavailable, so your requests will not
            be saved and will be lost when you refresh the page.
          </p>
        )}
        <RequestForm onAddRequest={addRequest} />
        <QueueSummary waiting={waitingCount} resolved={resolvedCount} total={total} />
        <RequestList
          requests={visibleRequests}
          filter={filter}
          onFilterChange={setFilter}
          onResolve={resolveRequest}
          onDelete={deleteRequest}
        />
      </main>
    </div>
  );
}
