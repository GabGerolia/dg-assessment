import { useState, useEffect } from "react";
import { presetColors } from "./constVars";
import { exitIcon } from "./constVars";

function CreateColumn({ onClose, onSave, column }) {
  const [title, setTitle] = useState("");
  const [reminder, setReminder] = useState("");
  const [selectedColor, setSelectedColor] = useState("var(--border)");

  useEffect(() => {
    if (column) {
      setTitle(column.title);
      setSelectedColor(column.color || "var(--border)");
    }
  }, [column]);

  const handleSave = () => {
    if (!title.trim()) {
      setReminder("Column title cannot be empty.");
      return;
    }
    if (title.length > 20) {
      setReminder("Column title cannot be longer than 20 characters.");
      return;
    }

    if (column && title === column.title && selectedColor === (column.color || "")) {
      setReminder("You didn't change anything.");
      return;
    }


    onSave({
      id: column?.id,  // include id if editing
      title,
      color: selectedColor || "var(--border)",
    });

    setTitle("");
    setSelectedColor("var(--border)");
    setReminder("");
  };

  const handleClose = () => {
    setTitle("");
    setSelectedColor("var(--border)");
    setReminder("");
    onClose();
  };

  const isEditing = Boolean(column);

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

        <h1 className="text-2xl font-bold text-center mb-4">
          {isEditing ? "Edit Column" : "Create Column"}
        </h1>

        {reminder && (
          <div className="text-[var(--danger)] text-sm text-center mb-4">
            {reminder}
          </div>
        )}

        <input
          required
          type="text"
          placeholder="Column title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[var(--border)] rounded-lg px-4 py-2 mb-4 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />

        {/* Color Picker */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2">Choose a border color:</h2>
          <div className="flex space-x-2 flex-wrap">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-lg border-2 transition ${selectedColor === color
                    ? "border-[var(--primary)] scale-110"
                    : "border-transparent"
                  }`}
              />
            ))}

            {/* Default (theme border) */}
            <button
              type="button"
              onClick={() => setSelectedColor("var(--border)")}
              style={{ backgroundColor: "var(--border)" }}
              className={`w-8 h-8 rounded-lg border-2 transition ${selectedColor === "var(--border)"
                  ? "border-[var(--primary)] scale-110"
                  : "border-transparent"
                }`}
            />
          </div>
        </div>

        {/* Actions */}
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
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateColumn;
