import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function RequestForm({ onAddRequest }) {
  const { theme } = useTheme();

  // Form inputs live here (controlled inputs).
  const [studentName, setStudentName] = useState("");
  const [concern, setConcern] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [error, setError] = useState("");

  // DOM refs used only inside effects and event handlers, never during render.
  const nameInputRef = useRef(null);
  const concernInputRef = useRef(null);

  // Focus the name field when the form mounts.
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const name = studentName.trim();
    const trimmedConcern = concern.trim();

    if (name === "") {
      setError("Please enter the student name.");
      nameInputRef.current?.focus();
      return;
    }
    if (trimmedConcern === "") {
      setError("Please describe the concern.");
      concernInputRef.current?.focus();
      return;
    }

    // ID and timestamp are created in the handler (impure work stays out of render).
    const newRequest = {
      id: crypto.randomUUID(),
      studentName: name,
      concern: trimmedConcern,
      priority,
      status: "Waiting",
      createdAt: Date.now(),
    };

    onAddRequest(newRequest);

    setStudentName("");
    setConcern("");
    setPriority("Normal");
    setError("");
    nameInputRef.current?.focus();
  }

  return (
    <section className={`panel theme-${theme}`} aria-labelledby="form-heading">
      <h2 id="form-heading">New request</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="studentName">Student name</label>
          <input
            id="studentName"
            ref={nameInputRef}
            value={studentName}
            onChange={event => setStudentName(event.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label htmlFor="concern">Concern</label>
          <textarea
            id="concern"
            ref={concernInputRef}
            rows={3}
            value={concern}
            onChange={event => setConcern(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={event => setPriority(event.target.value)}
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary">
          Add request
        </button>
      </form>
    </section>
  );
}
