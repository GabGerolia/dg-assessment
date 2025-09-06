import { useDraggable, useDroppable } from "@dnd-kit/core";

function TaskCard({ id, title, description, threeDotsIcon }) {
  const { attributes, listeners, setNodeRef, transform,  } =
    useDraggable({
      id,
      data: { task: { id, title, description } },
    });

  const { setNodeRef: setDropRef } = useDroppable({
    id,
    data: { taskId: id },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        setDropRef(el);
      }}
      style={style}
      {...listeners}
      {...attributes}
      className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3"
    >
      <div className="flex justify-between items-center mb-2">
        {title}
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
