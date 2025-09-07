import { useSortable,arrayMove  } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function TaskCard({ id, title, description, threeDotsIcon, isOverlay }) {
const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
useSortable({ id, data: { type: "task", task: { id, title, description } } });



  const style = isOverlay
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99,
        width: 280,
        pointerEvents: "none",
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: 0.95,
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3 cursor-grab"
    >
      <div className="flex justify-between items-center mb-2">
        <span>{title}</span>
        <button className="text-lg text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {threeDotsIcon}
        </button>
      </div>
      <div className="task-tasks-body text-sm text-[var(--text-muted)]">
        {description}
      </div>
    </div>
  );
}

export default TaskCard;
