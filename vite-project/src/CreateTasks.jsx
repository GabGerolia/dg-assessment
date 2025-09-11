import { useState, useEffect } from "react";
import { exitIcon } from "./constVars";

function CreateTasks({ onClose, onSave, task = null, columnId = null }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [reminder, setReminder] = useState("");

  // keep fields in sync if task prop changes
  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setReminder("");
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) {
      setReminder("Tasks label cannot be empty.");
      return;
    }
    if (title.length > 200) {
      setReminder("Task label cannot be longer than 200 characters.");
      return;
    }

    // Build payload. When editing, include id and column_id
    const payload = { title, description };
    if (task?.id) payload.id = task.id;
    if (columnId != null) payload.column_id = columnId;

    onSave(payload);

    // If creating new, clear fields; if editing, parent will close the modal
    if (!task) {
      setTitle("");
      setDescription("");
    }
    setReminder("");
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setReminder("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-99"
    //   onClick={handleClose}
    >
      <div
        className="relative bg-[var(--bg)] text-[var(--text)] p-8 rounded-2xl shadow-lg w-96 border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] transition"
        >
          {exitIcon}
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">
          {task ? "Edit Task" : "Create Task"}
        </h1>

        {reminder && (
          <div className="text-[var(--danger)] text-sm text-center mb-4">
            {reminder}
          </div>
        )}

        <input
          required
          type="text"
          placeholder="Task label"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-4 py-2 mb-4 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />

        <textarea
          placeholder="Task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-[var(--border)] rounded-lg px-4 py-2 mb-6 resize-none bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 border border-[var(--border)] text-[var(--text)] font-medium py-2 rounded-lg hover:bg-[var(--bg-light)] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-[var(--primary)] text-[var(--bg-dark)] font-medium py-2 rounded-lg hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTasks;