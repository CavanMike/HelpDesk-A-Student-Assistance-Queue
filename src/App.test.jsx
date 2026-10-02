import { StrictMode } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { STORAGE_KEY, getVisibleRequests, isRequest, loadRequests } from "./queue.js";

function renderApp() {
  // Mirrors main.jsx: StrictMode > ThemeProvider > App
  return render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}

async function addRequest(user, name, concern, priority = "Normal") {
  await user.type(screen.getByLabelText("Student name"), name);
  await user.type(screen.getByLabelText("Concern"), concern);
  await user.selectOptions(screen.getByLabelText("Priority"), priority);
  await user.click(screen.getByRole("button", { name: "Add request" }));
}

const names = () =>
  screen.queryAllByRole("listitem").map(li => within(li).getByRole("strong", { hidden: true }).textContent);
const counts = () => ({
  waiting: screen.getByTestId("waiting-count").textContent,
  resolved: screen.getByTestId("resolved-count").textContent,
  total: screen.getByTestId("total-count").textContent,
});

beforeEach(() => {
  localStorage.clear();
  document.title = "HelpDesk";
});

describe("Task 6 verification table", () => {
  it("1. blank name is rejected and the name input is focused", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText("Concern"), "Help");
    await user.click(screen.getByRole("button", { name: "Add request" }));
    expect(screen.getByLabelText("Student name")).toHaveFocus();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(counts().total).toBe("0");
  });

  it("1b. whitespace-only name is rejected", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText("Student name"), "    ");
    await user.type(screen.getByLabelText("Concern"), "Help");
    await user.click(screen.getByRole("button", { name: "Add request" }));
    expect(counts().total).toBe("0");
  });

  it("2. blank concern is rejected and the textarea is focused", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText("Student name"), "Ana");
    await user.type(screen.getByLabelText("Concern"), "   ");
    await user.click(screen.getByRole("button", { name: "Add request" }));
    expect(screen.getByLabelText("Concern")).toHaveFocus();
    expect(counts().total).toBe("0");
  });

  it("3-8. ordering, resolve, filters, refresh, delete", async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await addRequest(user, "Ana", "Q1", "Normal");
    await addRequest(user, "Ben", "Q2", "High");
    await addRequest(user, "Cara", "Q3", "High");
    expect(names()).toEqual(["Ben", "Cara", "Ana"]);
    expect(counts()).toEqual({ waiting: "3", resolved: "0", total: "3" });
    expect(document.title).toBe("HelpDesk — 3 waiting");

    // 4. Resolve Ben
    await user.click(screen.getByRole("button", { name: "Resolve request from Ben" }));
    expect(counts()).toEqual({ waiting: "2", resolved: "1", total: "3" });
    expect(document.title).toBe("HelpDesk — 2 waiting");

    // 5. Waiting filter hides resolved
    await user.selectOptions(screen.getByLabelText("Show"), "Waiting");
    expect(names()).toEqual(["Cara", "Ana"]);

    // 6. Resolved filter shows only resolved
    await user.selectOptions(screen.getByLabelText("Show"), "Resolved");
    expect(names()).toEqual(["Ben"]);
    await user.selectOptions(screen.getByLabelText("Show"), "All");

    // 7. Refresh (unmount + mount again against the same localStorage)
    first.unmount();
    renderApp();
    expect(names()).toEqual(["Ben", "Cara", "Ana"]);
    expect(counts()).toEqual({ waiting: "2", resolved: "1", total: "3" });

    // 8. Delete Cara
    await user.click(screen.getByRole("button", { name: "Delete request from Cara" }));
    expect(names()).toEqual(["Ben", "Ana"]);
    expect(counts()).toEqual({ waiting: "1", resolved: "1", total: "2" });
  });

  it("10. valid submit resets inputs and focuses the name field", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByLabelText("Student name")).toHaveFocus(); // focus on mount
    await addRequest(user, "Ana", "Help me", "High");
    expect(screen.getByLabelText("Student name")).toHaveValue("");
    expect(screen.getByLabelText("Concern")).toHaveValue("");
    expect(screen.getByLabelText("Priority")).toHaveValue("Normal");
    expect(screen.getByLabelText("Student name")).toHaveFocus();
  });

  it("keyboard-only successive submissions work", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.keyboard("Ana");
    await user.tab();
    await user.keyboard("Concern one");
    await user.tab(); // priority
    await user.tab(); // submit button
    await user.keyboard("{Enter}");
    expect(counts().total).toBe("1");
    await user.keyboard("Ben"); // focus is already back in the name field
    await user.tab();
    await user.keyboard("Concern two");
    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(counts().total).toBe("2");
  });

  it("9. theme switch updates every consumer together", async () => {
    const user = userEvent.setup();
    renderApp();
    await addRequest(user, "Ana", "Help");
    const themed = () => document.querySelectorAll(".theme-dark").length;
    expect(document.querySelectorAll(".theme-dark").length).toBe(0);
    await user.click(screen.getByRole("button", { name: /switch to dark/i }));
    // app shell, header, form, summary, list and the card
    expect(themed()).toBe(6);
    expect(document.querySelectorAll(".theme-light").length).toBe(0);
    await user.click(screen.getByRole("button", { name: /switch to light/i }));
    expect(themed()).toBe(0);
  });
});

describe("persistence safety", () => {
  it("does not overwrite saved data with an empty queue on first render", () => {
    const saved = [{ id: "1", studentName: "Ana", concern: "x", priority: "High", status: "Waiting", createdAt: 1 }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    renderApp();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(saved);
    expect(names()).toEqual(["Ana"]);
  });

  it("ignores corrupted JSON and invalid records", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadRequests()).toEqual([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 5 }, null, "x"]));
    expect(loadRequests()).toEqual([]);
    expect(isRequest({ id: "a", studentName: "A", concern: "c", priority: "Urgent", status: "Waiting", createdAt: 1 })).toBe(false);
  });

  it("shows a warning when saving fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    renderApp();
    expect(screen.getByRole("alert")).toHaveTextContent(/storage is unavailable/i);
    vi.restoreAllMocks();
  });
});

describe("queue helpers", () => {
  it("sorts High first, then oldest first, without mutating the input", () => {
    const mk = (id, priority, createdAt) => ({ id, studentName: id, concern: "c", priority, status: "Waiting", createdAt });
    const input = [mk("n1", "Normal", 1), mk("h2", "High", 3), mk("h1", "High", 2), mk("n0", "Normal", 0)];
    const snapshot = JSON.stringify(input);
    const result = getVisibleRequests(input, "All");
    expect(result.map(r => r.id)).toEqual(["h1", "h2", "n0", "n1"]);
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(result).not.toBe(input);
  });
});
