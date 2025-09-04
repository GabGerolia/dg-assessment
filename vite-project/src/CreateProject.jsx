import { useState, useEffect } from "react";

function CreateProject({ onClose, onCreate, editingProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminder, setReminder] = useState(""); // error message state

  // Pre-fill inputs if editing a project
  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title || "");
      setDescription(editingProject.description || "");
    }
  }, [editingProject]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setReminder("Project title cannot be empty.");
      return;
    }

    // If editing, include the index to update in parent
    if (editingProject?.index !== undefined) {
      onCreate({ ...editingProject, title, description });
    } else {
      onCreate({ title, description });
    }

    setTitle("");
    setDescription("");
    setReminder(""); // clear reminder on success
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setReminder(""); // reset error message
    onClose();
  };

return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="relative bg-[var(--bg)] text-[var(--text)] p-8 rounded-2xl shadow-lg w-96 border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--danger)] transition"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">
          {editingProject ? "Edit Project" : "Create Project"}
        </h1>

        {/* Reminder/Error message */}
        {reminder && (
          <div className="text-[var(--danger)] text-sm text-center mb-4">
            {reminder}
          </div>
        )}

        <input
          required
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
          rows={4}
          className="w-full border border-[var(--border)] rounded-lg px-4 py-2 mb-4 resize-none bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--primary)] text-[var(--bg-dark)] font-medium py-2 rounded-lg hover:opacity-90 transition"
        >
          {editingProject ? "Save Changes" : "Submit"}
        </button>
      </div>
    </div>
  );
}


export default CreateProject;
