import { useState, useEffect } from "react";
import { exitIcon } from "./constVars";

function EditProject({ onClose, onUpdate, project }) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const handleUpdate = () => {
    if (!title.trim()) {
      setReminder("Project title cannot be empty.");
      return;
    }

    if (project && title === project.title && description === (project.description || "")) {
      setReminder("You didn't change anything.");
      return;
    }


    onUpdate({ id: project.id, title, description });
    setReminder("");
  };

  const handleClose = () => {
    setTitle(project?.title || "");
    setDescription(project?.description || "");
    setReminder("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={handleClose}
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

        <h1 className="text-2xl font-bold text-center mb-4">Edit Project</h1>

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
            onClick={handleUpdate}
            className="flex-1 bg-[var(--primary)] text-[var(--bg-dark)] font-medium py-2 rounded-lg hover:opacity-90 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProject;
