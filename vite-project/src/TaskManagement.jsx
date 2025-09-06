import { useState, useRef, useLayoutEffect } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import Navbar from "./Navbar";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import CreateColumn from "./CreateColumn";
import CreateTasks from "./CreateTasks";

function TaskManagement() {
  // icons
  const threeDotsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );

  const editIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );

  // columns + tasks state
  const [columns, setColumns] = useState({
    todo: {
      id: "todo",
      title: "To Do",
      color: "hsl(140 35% 30%)",
      tasks: [
        { id: "t1", title: "Task 1", description: "Example task 1" },
        { id: "t2", title: "Task 2", description: "Example task 2" },
      ],
    },
    inprogress: {
      id: "inprogress",
      title: "In Progress",
      color: "hsl(45 40% 30%)",
      tasks: [{ id: "t3", title: "Task 3", description: "Example task 3" }],
    },
    done: {
      id: "done",
      title: "Done",
      color: "hsl(270 35% 30%)",
      tasks: [],
    },
  });

  const [activeTask, setActiveTask] = useState(null);

  // modal states
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(null);

  const parentRef = useRef(null);

  // ===== height recalculation logic (your code kept) =====
  const recalc = () => {
    const parent = parentRef.current;
    if (!parent) return;

    const columns = parent.querySelectorAll(".task-column");
    columns.forEach((col) => {
      const header = col.querySelector(".task-column-header");
      const footer = col.querySelector(".task-addtask");
      const tasks = col.querySelector(".task-tasks");
      if (!tasks) return;

      const columnInnerHeight = col.clientHeight;
      const colStyle = getComputedStyle(col);
      const paddingTop = parseFloat(colStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(colStyle.paddingBottom) || 0;
      const headerH = header ? header.offsetHeight : 0;
      const footerH = footer ? footer.offsetHeight : 0;

      let available = columnInnerHeight - headerH - footerH - (paddingTop + paddingBottom);
      available = Math.max(0, available - 4);

      tasks.style.maxHeight = `${available}px`;
      tasks.style.overflowY = tasks.scrollHeight > available ? "auto" : "hidden";
    });
  };

  useLayoutEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);

    const parent = parentRef.current;
    let mo;
    if (parent) {
      mo = new MutationObserver(() => requestAnimationFrame(recalc));
      mo.observe(parent, { childList: true, subtree: true, attributes: true });
    }
    return () => {
      window.removeEventListener("resize", recalc);
      if (mo) mo.disconnect();
    };
  }, []);

  // ===== dnd handlers =====
  const findColumnId = (taskId) => {
    return Object.keys(columns).find((colId) =>
      columns[colId].tasks.some((t) => t.id === taskId)
    );
  };

  const handleDragStart = (event) => {
    setActiveTask(event.active.data.current.task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColId = findColumnId(active.id);
    const destColId = over.data.current?.column?.id;

    if (!sourceColId || !destColId) return;

    if (sourceColId !== destColId) {
      const sourceTasks = [...columns[sourceColId].tasks];
      const destTasks = [...columns[destColId].tasks];

      const taskIndex = sourceTasks.findIndex((t) => t.id === active.id);
      const [movedTask] = sourceTasks.splice(taskIndex, 1);
      destTasks.push(movedTask);

      setColumns({
        ...columns,
        [sourceColId]: { ...columns[sourceColId], tasks: sourceTasks },
        [destColId]: { ...columns[destColId], tasks: destTasks },
      });
    }
    setActiveTask(null);
    recalc();
  };

  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title relative w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
        <h1 className="text-2xl font-bold mb-1">Example fetched Title</h1>
        <p className="text-[var(--text-muted)] max-h-[4.5rem] overflow-y-auto leading-snug">
          Example fetched descriptions.
        </p>
        <button
          type="button"
          className="absolute top-4 right-6 text-[var(--text-muted)] hover:text-[var(--primary)] transition"
        >
          {editIcon}
        </button>
      </div>

      {/* Tools */}
      <div className="task-tools flex items-center space-x-3 px-6 py-3 bg-[var(--bg)] border-b border-[var(--border)]">
        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition">
          Create Column
        </button>
        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition">
          View logs
        </button>
      </div>

      {/* Columns */}
      <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div ref={parentRef} className="task-parent-columns flex-1 min-h-0 overflow-x-auto flex space-x-3 px-6 py-6">
          {Object.values(columns).map((col) => (
            <TaskColumn key={col.id} id={col.id} title={col.title} color={col.color} threeDotsIcon={threeDotsIcon}>
              {col.tasks.map((task) => (
                <TaskCard key={task.id} id={task.id} title={task.title} description={task.description} threeDotsIcon={threeDotsIcon} />
              ))}
            </TaskColumn>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <TaskCard id={activeTask.id} title={activeTask.title} description={activeTask.description} threeDotsIcon={threeDotsIcon} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TaskManagement;
