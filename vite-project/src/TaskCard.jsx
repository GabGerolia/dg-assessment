import { useDraggable } from "@dnd-kit/core";

function TaskCard({ id, title, description, threeDotsIcon, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { task: { id, title, description } },
    });

  // Only normal card styling
  const style = isOverlay
    ? {
        position: "fixed",      // fix overlay to viewport
        top: 0,
        left: 0,
        zIndex: 9999,
        width: 280,             // fixed width
        pointerEvents: "none",  // overlay should not block pointer
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        opacity: 0.95,
      }
    : {
        opacity: isDragging ? 0.3 : 1,  // fade out original while dragging
        transition: "opacity 0.2s ease",
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
