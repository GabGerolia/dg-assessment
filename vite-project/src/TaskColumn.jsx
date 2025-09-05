import TaskCard from "./TaskCard";

function TaskColumn({ label, threeDotsIcon }) {
  return (
    <div className="task-column flex shrink-0 flex-col w-72 min-h-0 bg-[var(--bg)] rounded-xl shadow-md border border-[var(--border)]">
      {/* Column Header */}
      <div className="task-column-header flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
        <span className="font-semibold">{label}</span>
        <button className="text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition">
          {threeDotsIcon}
        </button>
      </div>

      {/* Tasks */}
      <div className="task-tasks flex-1 min-h-0 p-3 space-y-3">
        <TaskCard
          title="TEST"
          description="Example description of the task."
          threeDotsIcon={threeDotsIcon}
        />
      </div>

      {/* Add Task */}
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
