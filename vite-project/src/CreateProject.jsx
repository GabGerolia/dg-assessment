import { useState } from "react";

function CreateProject({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      setReminder("Project title cannot be empty.");
      return;
    }

    onCreate({ title, description });
    setTitle("");
    setDescription("");
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
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      // onClick={handleClose}
    >
      <div
        className="relative bg-[var(--bg)] text-[var(--text)] p-8 rounded-2xl shadow-lg w-96 border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] transition"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">Create Project</h1>

        {reminder && (
          <div className="text-[var(--danger)] text-sm text-center mb-4">
            {reminder}
          </div>
        )}

        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-4 py-2 mb-4 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />

        <textarea
          placeholder="Project description (optional)"
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
            onClick={handleCreate}
            className="flex-1 bg-[var(--primary)] text-[var(--bg-dark)] font-medium py-2 rounded-lg hover:opacity-90 transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateProject;
