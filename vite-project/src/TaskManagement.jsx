import { useLayoutEffect, useRef } from "react";
import Navbar from "./Navbar";

function TaskManagement() {
//icons
const threeDotsIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
</svg>;



// THIS CODE IS TO MAKE COLUMNS RESPONSIVE HEIGHT-WISE AND STILL MAKE TASKS SCROLLABLE

  const parentRef = useRef(null);

  // recalc available space for each column's .task-tasks area
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

  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
        <h1 className="text-2xl font-bold mb-1">EXAMPLE FETCHED TITLE</h1>
        <p className="text-[var(--text-muted)] max-h-[4.5rem] overflow-y-auto leading-snug">EXAMPLE FETCHED DESCRIPTION</p>
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
      <div
        ref={parentRef}
        className="task-parent-columns flex-1 min-h-0 overflow-x-auto flex space-x-6 px-6 py-6"
      >
        {/* Single Column */}
        <div className="task-column flex shrink-0 flex-col w-72 min-h-0 bg-[var(--bg)] rounded-xl shadow-md border border-[var(--border)]">
          {/* Column Header */}
          <div className="task-column-header flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
            <span className="font-semibold">LABEL</span>
            <button className="text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition">
              {threeDotsIcon}
            </button>
          </div>

          {/* Tasks (this area will receive maxHeight and overflow toggling via JS) */}
          <div className="task-tasks flex-1 min-h-0 p-3 space-y-3">
            {/* Task Cards */}
            <div className="task-card bg-[var(--bg-light)] border border-[var(--border)] rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-center mb-2">
                TEST
                <button className="text-lg text-[var(--text-muted)] hover:text-[var(--text)] transition">
                  {threeDotsIcon}
                </button>
              </div>
              <div className="task-tasks-body text-sm text-[var(--text-muted)]">
                Example description of the task.
              </div>
            </div>
          </div>

          {/* Add Task */}
          <button
            type="button"
            className="task-addtask px-4 py-2 text-left text-[var(--secondary)] font-medium hover:underline"
          >
            + Add task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskManagement;
