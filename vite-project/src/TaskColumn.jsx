import { useDraggable, useDroppable } from "@dnd-kit/core";

function TaskColumn({ id, title, color, children, threeDotsIcon }) {
  // Column is a drop zone (for tasks)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id,
    data: { column: { id, title } },
  });

  // Header is the drag handle (for moving column)
  const { setNodeRef: setDragRef, listeners, attributes, isDragging } = useDraggable({
    id: `col-${id}`,
    data: { column: { id, title }, type: "column" },
  });

  return (
    <div
      ref={setDropRef}
      className={`task-column flex shrink-0 flex-col w-72 min-h-0 bg-[var(--bg)] rounded-xl shadow-md border ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{ borderColor: color || "var(--border)" }}
    >
      {/* Column Header (drag handle) */}
      <div
        ref={setDragRef}
        {...listeners}
        {...attributes}
        className="task-column-header flex items-center justify-between px-4 py-2 border-b border-[var(--border)] cursor-move"
      >
        <span className="font-semibold">{title}</span>
        <button className="text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {threeDotsIcon}
        </button>
      </div>

      {/* Tasks inside */}
      <div
        className={`task-tasks flex-1 min-h-0 p-3 space-y-3 ${
          isOver ? "bg-[var(--bg-light)]" : ""
        }`}
      >
        {children}
      </div>

      {/* Add Task button */}
      <button
        type="button"
        className="task-addtask px-4 py-2 text-left text-[var(--secondary)] font-medium hover:underline"
      >
        + Add task
      </button>
    </div>
  );
}

export default TaskColumn;
