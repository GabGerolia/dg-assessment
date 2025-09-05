function TaskCard({ title, description, threeDotsIcon }) {
  return (
    <div className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3">
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
