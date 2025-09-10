import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useRef, useEffect } from "react";

function TaskColumn({
  id,
  title,
  color,
  children,
  threeDotsIcon,
  tasks,
  dragHandle, // passed from SortableColumn, usually listeners (and optionally attributes)
  onAddTask,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tasks-${id}`, // match the SortableContext id so over.data.current.column will be set
    data: { column: { id, title } },
  });
  
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

  return (
    <div
      className="task-column flex shrink-0 flex-col w-72 min-h-full bg-[var(--bg)] rounded-xl shadow-md border relative"
      style={{ borderColor: color || "var(--border)" }}
    >
      <div className="task-column-header flex items-center px-4 py-2 border-b border-[var(--border)]">
        {/* draggable area: includes title and the remaining space */}
        <div
          className="flex items-center flex-1 cursor-grab"
          {...dragHandle}
        >
          <span className="font-semibold">{title}</span>
          <div className="flex-1"></div>
        </div>

        {/* menu stays outside the drag handle so clicks are not swallowed */}
        <div ref={menuRef} className="relative z-20">
          <button
            className="text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {threeDotsIcon}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg z-30">
              <button
                className="block w-full px-4 py-2 text-left hover:bg-[var(--bg-light)]"
                onClick={() => { onEdit?.(id); setMenuOpen(false); }}
              >
                Edit
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-red-500 hover:bg-[var(--bg-light)]"
                onClick={() => { onDelete?.(id); setMenuOpen(false); }}
              >
                Delete
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-[var(--bg-light)]"
                onClick={() => { onMoveRight?.(id); setMenuOpen(false); }}
              >
                Move Right →
              </button>
              <button
                className="block w-full px-4 py-2 text-left hover:bg-[var(--bg-light)]"
                onClick={() => { onMoveLeft?.(id); setMenuOpen(false); }}
              >
                ← Move Left
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}   //  marks the column as droppable
        className={`task-tasks flex-1 min-h-0 p-3 space-y-3 bg-[var(--secondary)] ${isOver ? "bg-[var(--bg-light)]" : ""
          }`}
      >
        <SortableContext
          id={`tasks-${id}`} // make context unique per column
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </div>

      <button
        type="button"
        className="task-addtask px-4 py-2 text-left text-[var(--secondary)] font-medium hover:underline"
        onClick={() => onAddTask(id)}
      >
        + Add task
      </button>
    </div>
  );
}

export default TaskColumn;
