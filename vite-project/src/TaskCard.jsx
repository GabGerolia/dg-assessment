import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef, useEffect } from "react";

function TaskCard({
  id,
  title,
  description,
  threeDotsIcon,
  isOverlay,
  onEdit,
  onDelete,
  onMove, // (taskId, targetColId)
  columns, // pass available columns so the move menu can show them
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, data: { type: "task", task: { id, title, description } } });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const style = isOverlay
    ? {
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 99,
      width: 280,
      pointerEvents: "none",
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      opacity: 0.95,
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    }
    : {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.3 : 1,
    };

  return (
    <div
      className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3  relative"
      ref={setNodeRef}
      style={style}
    >
      <div className="task-drag absolute top-0 left-0 cursor-grab h-full w-6/7"
        {...listeners}
        {...attributes}>
        {/* invisible div to handle dragging */}
      </div>
      <div className="flex justify-between items-center mb-2">
        <span>{title}</span>

        {/* menu */}
        <div ref={menuRef} className="relative z-20">
          <button
            className="text-lg text-[var(--text-muted)] hover:text-[var(--text)] transition"
            onClick={(e) => {
              e.stopPropagation(); // prevent drag start
              setMenuOpen((prev) => !prev);
            }}
          >
            {threeDotsIcon}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg z-30">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-[var(--bg-light)]"
                onClick={() => {
                  onEdit?.(id);
                  setMenuOpen(false);
                }}
              >
                Edit
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-red-500 hover:bg-[var(--bg-light)]"
                onClick={() => {
                  onDelete?.(id);
                  setMenuOpen(false);
                }}
              >
                Delete
              </button>
              <div className="border-t border-[var(--border)] my-1" />
              <div className="px-4 py-2 text-xs text-[var(--text-muted)]">
                Move to:
              </div>
              {columns &&
                columns.map((col) => (
                  <button
                    key={col.id}
                    className="block w-full px-4 py-2 text-left hover:bg-[var(--bg-light)]"
                    onClick={() => {
                      onMove?.(id, col.id);
                      setMenuOpen(false);
                    }}
                  >
                    {col.title}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="task-tasks-body text-sm text-[var(--text-muted)]">
        {description}
      </div>
    </div>
  );
}

export default TaskCard;
