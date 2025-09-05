import { useState, useRef, useLayoutEffect } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import Navbar from "./Navbar";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";

function TaskManagement() {
  // icons
  const threeDotsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  );

  // board state
  const [columns, setColumns] = useState({
    todo: {
      id: "todo",
      title: "To Do",
      tasks: [
        { id: "t1", title: "Task 1", description: "Example task 1" },
        { id: "t2", title: "Task 2", description: "Example task 2" },
      ],
    },
    inprogress: {
      id: "inprogress",
      title: "In Progress",
      tasks: [{ id: "t3", title: "Task 3", description: "Example task 3" }],
    },
    done: { id: "done", title: "Done", tasks: [] },
  });

  const [activeTask, setActiveTask] = useState(null);

  const parentRef = useRef(null);

  // THIS CODE IS TO MAKE COLUMNS RESPONSIVE HEIGHT-WISE AND STILL MAKE TASKS SCROLLABLE
  const recalc = () => {
    const parent = parentRef.current;
    if (!parent) return;

    // For each column, compute available height and update task-tasks
    const columns = parent.querySelectorAll(".task-column");
    columns.forEach((col) => {
      const header = col.querySelector(".task-column-header");
      const footer = col.querySelector(".task-addtask");
      const tasks = col.querySelector(".task-tasks");
      if (!tasks) return;

      // get total inner height of the column (clientHeight includes padding)
      const columnInnerHeight = col.clientHeight;

      // compute padding of column so we can subtract it precisely
      const colStyle = getComputedStyle(col);
      const paddingTop = parseFloat(colStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(colStyle.paddingBottom) || 0;
      const paddingSum = paddingTop + paddingBottom;

      const headerH = header ? header.offsetHeight : 0;
      const footerH = footer ? footer.offsetHeight : 0;

      // available height for tasks area
      let available = columnInnerHeight - headerH - footerH - paddingSum;

      // subtract a small safety margin so things don't jump (optional)
      available = Math.max(0, available - 4);

      // apply the size
      tasks.style.maxHeight = `${available}px`;

      // decide whether to enable scroll based on content height
      if (tasks.scrollHeight > available) {
        tasks.style.overflowY = "auto";
      } else {
        tasks.style.overflowY = "hidden";
      }
    });
  };

  useLayoutEffect(() => {
    // initial calc
    recalc();

    // recalc on window resize
    window.addEventListener("resize", recalc);

    // observe DOM changes (cards added/removed/edited) and recalc
    const parent = parentRef.current;
    let mo;
    if (parent) {
      mo = new MutationObserver(() => {
        // small timeout because some mutations may batch DOM paint
        requestAnimationFrame(recalc);
      });
      mo.observe(parent, { childList: true, subtree: true, attributes: true });
    }

    // cleanup
    return () => {
      window.removeEventListener("resize", recalc);
      if (mo) mo.disconnect();
    };
  }, []); // empty deps so it hooks once; MutationObserver covers dynamic changes

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
    recalc(); // trigger recalculation after dropping
  };

  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
        <h1 className="text-2xl font-bold mb-1">Project Board</h1>
        <p className="text-[var(--text-muted)] max-h-[4.5rem] overflow-y-auto leading-snug">
          Example board with drag-and-drop.
        </p>
      </div>

      {/* Tools */}
      <div className="task-tools flex items-center space-x-3 px-6 py-3 bg-[var(--bg)] border-b border-[var(--border)]">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition"
        >
          Create Column
        </button>
      </div>

      {/* Columns - attach parentRef here */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={parentRef}
          className="task-parent-columns flex-1 min-h-0 overflow-x-auto flex space-x-6 px-6 py-6"
        >
          {Object.values(columns).map((col) => (
            <TaskColumn key={col.id} column={col} threeDotsIcon={threeDotsIcon} />
          ))}
        </div>

        {/* Drag overlay (preview while dragging) */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} threeDotsIcon={threeDotsIcon} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TaskManagement;
