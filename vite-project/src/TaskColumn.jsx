import { useDroppable } from "@dnd-kit/core";

function TaskColumn({ id, title, color, children, threeDotsIcon }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { column: { id, title } },
  });

  return (
    <div
      className="task-column flex shrink-0 flex-col w-72 min-h-0 bg-[var(--bg)] rounded-xl shadow-md border"
      style={{ borderColor: color || "var(--border)" }}
    >
      <div className="task-column-header flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
        <span className="font-semibold">{title}</span>
        <button className="text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {threeDotsIcon}
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`task-tasks flex-1 min-h-0 p-3 space-y-3 ${isOver ? "bg-[var(--bg-light)]" : ""}`}
      >
        {children}
      </div>

      <button type="button" className="task-addtask px-4 py-2 text-left text-[var(--secondary)] font-medium hover:underline">
        + Add task
      </button>
    </div>
  );
}

export default TaskColumn;
