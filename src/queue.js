// Pure helpers for the HelpDesk queue. No React and no side effects, so every
// function here can be reused during rendering and tested in isolation.

export const STORAGE_KEY = "helpdesk-requests";
export const PRIORITIES = ["High", "Normal"];
export const STATUSES = ["Waiting", "Resolved"];
export const FILTERS = ["All", "Waiting", "Resolved"];

// Lower number = served first.
const PRIORITY_RANK = { High: 0, Normal: 1 };

// Validates one stored record so corrupted or hand-edited localStorage data
// can never crash the UI.
export function isRequest(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.studentName === "string" &&
    typeof value.concern === "string" &&
    PRIORITIES.includes(value.priority) &&
    STATUSES.includes(value.status) &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt)
  );
}

// Used as the lazy initializer for useState in App.
export function loadRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter(isRequest) : [];
  } catch {
    return [];
  }
}

// High before Normal; within the same priority, older (smaller createdAt) first.
export function compareRequests(a, b) {
  return (
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    a.createdAt - b.createdAt
  );
}

// filter() already returns a NEW array, and sort() runs on that copy, so the
// original state array is never mutated. For the "All" filter we copy
// explicitly with the spread operator before sorting.
export function getVisibleRequests(requests, filter) {
  const matching =
    filter === "All"
      ? [...requests]
      : requests.filter(request => request.status === filter);
  return matching.sort(compareRequests);
}

export function getCounts(requests) {
  const waiting = requests.filter(r => r.status === "Waiting").length;
  const resolved = requests.filter(r => r.status === "Resolved").length;
  return { waiting, resolved, total: requests.length };
}
