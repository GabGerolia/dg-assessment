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
        className="relative bg-white p-8 rounded-2xl shadow-lg w-96"
        onClick={(e) => e.stopPropagation()} // prevent backdrop close
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-4">
          {editingProject ? "Edit Project" : "Create Project"}
        </h1>

        {/* Reminder/Error message */}
        {reminder && (
          <div className="text-red-600 text-sm text-center mb-4">
            {reminder}
          </div>
        )}

        <input
          required
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Project description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {editingProject ? "Save Changes" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default CreateProject;
