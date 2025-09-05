import { useDraggable } from "@dnd-kit/core";

function TaskCard({ task, threeDotsIcon }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3"
    >
      <div className="flex justify-between items-center mb-2">
        {task.title}
        <button className="text-lg text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {threeDotsIcon}
        </button>
      </div>
      <div className="task-tasks-body text-sm text-[var(--text-muted)]">
        {task.description}
      </div>
    </div>
  );
}

export default TaskCard;
