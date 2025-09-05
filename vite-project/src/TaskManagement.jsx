import { useLayoutEffect, useRef } from "react";
import Navbar from "./Navbar";
import TaskColumn from "./TaskColumn";

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

  const parentRef = useRef(null);

  // THIS CODE IS TO MAKE COLUMNS RESPONSIVE HEIGHT-WISE AND STILL MAKE TASKS SCROLLABLE
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
      const paddingSum = paddingTop + paddingBottom;

      const headerH = header ? header.offsetHeight : 0;
      const footerH = footer ? footer.offsetHeight : 0;

      let available = columnInnerHeight - headerH - footerH - paddingSum;
      available = Math.max(0, available - 4);

      tasks.style.maxHeight = `${available}px`;

      if (tasks.scrollHeight > available) {
        tasks.style.overflowY = "auto";
      } else {
        tasks.style.overflowY = "hidden";
      }
    });
  };

  useLayoutEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);

    const parent = parentRef.current;
    let mo;
    if (parent) {
      mo = new MutationObserver(() => {
        requestAnimationFrame(recalc);
      });
      mo.observe(parent, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener("resize", recalc);
      if (mo) mo.disconnect();
    };
  }, []);

  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
        <h1 className="text-2xl font-bold mb-1">EXAMPLE FETCHED TITLE</h1>
        <p className="text-[var(--text-muted)] max-h-[4.5rem] overflow-y-auto leading-snug">
          EXAMPLE FETCHED DESCRIPTION
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

      {/* Columns */}
      <div
        ref={parentRef}
        className="task-parent-columns flex-1 min-h-0 overflow-x-auto flex space-x-6 px-6 py-6"
      >
        <TaskColumn label="LABEL" threeDotsIcon={threeDotsIcon} />
      </div>
    </div>
  );
}

export default TaskManagement;
