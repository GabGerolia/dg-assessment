import { useState, useRef, useLayoutEffect, useEffect } from "react";
import {DndContext,closestCorners,DragOverlay,} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove  } from "@dnd-kit/sortable";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Navbar from "./Navbar";
import TaskCard from "./TaskCard";
import SortableColumn from "./SortableColumn"; 
import CreateColumn from "./CreateColumn";
import CreateTasks from "./CreateTasks";
import EditProject from "./EditProject";

function TaskManagement() {
  //fetch project title and description 
const location = useLocation();
const project = location.state?.project; 


  const findTaskIndex = (colId, taskId) => {
  return columns[colId].tasks.findIndex((t) => t.id === taskId);
};

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

  //editing project title/description
  const [showEditingProject, setShowEditingProject] = useState(false);
  const handleUpdateProject = (updatedProject) => {
      axios.put(`http://localhost:8080/api/projects/${updatedProject.id}`, {
        title: updatedProject.title,
        description: updatedProject.description,
      })
      .then((res) => {
        if (res.data.success) {
          // If you have a local projects state, update it here
          // Otherwise, just update the passed-in project
          project.title = updatedProject.title;
          project.description = updatedProject.description;

          setShowEditingProject(null);
        }
      });
    project.title = updatedProject.title;
    project.description = updatedProject.description;

    setShowEditingProject(false);
  };


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
  const [showCreateColumn, setShowCreateColumn] = useState(false); //creation of columns
  const handleSaveColumn = ({ title, color }) => {
      // make safe id (lowercase, remove spaces, add timestamp)
      const newId = `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

      const newColumn = {
        id: newId,
        title,
        color,
        tasks: [],
      };

      setColumns((prev) => ({
        ...prev,
        [newId]: newColumn,
      }));

      setShowCreateColumn(false);
    };

  //creation of tasks
  const [showCreateTasks, setShowCreateTasks] = useState(null); 
  const handleSaveTask = (colId, { title, description }) => {
  const newTask = {
    id: `task-${Date.now()}`, 
    title,
    description,
  };

  setColumns((prev) => ({
    ...prev,
    [colId]: {
      ...prev[colId],
      tasks: [...prev[colId].tasks, newTask],
    },
  }));

  setShowCreateTasks(null);
};


  // currently dragged task
  const [activeTask, setActiveTask] = useState(null); 
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
      tasks.style.overflow = tasks.scrollHeight > available ? "auto" : "hidden";
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
  if (event.active.data.current?.type === "task") {
    setActiveTask(event.active.data.current.task);
  }
};

const handleDragEnd = (event) => {
  const { active, over } = event;
  if (!over) return;

  const activeType = active.data.current?.type;
  const overType = over.data.current?.type;

  // column reorder
  if (activeType === "column" && overType === "column") {
    const oldIndex = Object.keys(columns).indexOf(active.id);
    const newIndex = Object.keys(columns).indexOf(over.id);

    if (oldIndex !== newIndex) {
      const ordered = Object.fromEntries(
        arrayMove(Object.entries(columns), oldIndex, newIndex)
      );
      setColumns(ordered);
    }

    return;
  }

  // task move
  if (activeType === "task") {
    const sourceColId = findColumnId(active.id);

    // dest could be:
    // 1) a tasks droppable (over.data.current.column.id)
    // 2) the column sortable wrapper (over.id is a column id)
    // 3) a task id inside a column (findColumnId(over.id))
    const destColId =
      over.data.current?.column?.id ??
      (Object.keys(columns).includes(over.id) ? over.id : findColumnId(over.id));

    if (!sourceColId || !destColId) {
      setActiveTask(null);
      return;
    }

    // determine insertion index. if over is a task, get its index. otherwise append.
    const toIndex =
      over.data.current?.type === "task" ? findTaskIndex(destColId, over.id) : -1;

    if (sourceColId === destColId) {
      const sourceTasks = [...columns[sourceColId].tasks];
      const fromIndex = findTaskIndex(sourceColId, active.id);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const [movedTask] = sourceTasks.splice(fromIndex, 1);
        sourceTasks.splice(toIndex, 0, movedTask);

        setColumns({
          ...columns,
          [sourceColId]: { ...columns[sourceColId], tasks: sourceTasks },
        });
      }
    } else {
      const sourceTasks = [...columns[sourceColId].tasks];
      const destTasks = [...columns[destColId].tasks];

      const fromIndex = findTaskIndex(sourceColId, active.id);
      const [movedTask] = sourceTasks.splice(fromIndex, 1);

      if (toIndex >= 0) destTasks.splice(toIndex, 0, movedTask);
      else destTasks.push(movedTask);

      setColumns({
        ...columns,
        [sourceColId]: { ...columns[sourceColId], tasks: sourceTasks },
        [destColId]: { ...columns[destColId], tasks: destTasks },
      });
    }
  }

  setActiveTask(null);
  recalc();
};


  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title relative w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]">
        <h1 className="text-2xl font-bold mb-1">{project?.title || "Unfetched Title"}</h1>
        <p className="text-[var(--text-muted)] max-h-[4.5rem] overflow-y-auto leading-snug">
          {project?.description || "No description provided."}
        </p>
        <button
          type="button"
          className="absolute top-4 right-6 text-[var(--text-muted)] hover:text-[var(--primary)] transition"
          onClick={() => setShowEditingProject(true)}  
        
        >
          {editIcon}
        </button>
      </div>

      {/* Tools */}
      <div className="task-tools flex items-center space-x-3 px-6 py-3 bg-[var(--bg)] border-b border-[var(--border)]">
        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition"
          onClick={() => setShowCreateColumn(true)}>
          Create Column
        </button>
        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition">
          View logs
        </button>
      </div>

      {/* Columns */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={Object.keys(columns)} 
            strategy={horizontalListSortingStrategy}
          >
            <div
              ref={parentRef}
              className="task-parent-columns flex-1 min-h-0 overflow-y-hidden overflow-x-auto flex space-x-3 px-6 py-6"
            >
              {Object.values(columns).map((col) => (
              <SortableColumn
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                tasks={col.tasks}
                threeDotsIcon={threeDotsIcon}
                onAddTask={(colId) => setShowCreateTasks(colId)} // ✅ new
              >
                {col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    threeDotsIcon={threeDotsIcon}
                  />
                ))}
              </SortableColumn>
            ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                id={activeTask.id}
                title={activeTask.title}
                description={activeTask.description}
                threeDotsIcon={threeDotsIcon}
                isOverlay={true}
              />
            ) : null}

          </DragOverlay> {/* Create Column Modal */}
          {showCreateColumn && (
            <CreateColumn
              onClose={() => setShowCreateColumn(false)}
              onSave={handleSaveColumn}
            />
          )}
        </DndContext> {
        
        /* Create Task Modal */}
          {showCreateTasks && (
          <CreateTasks
            onClose={() => setShowCreateTasks(null)}
            onSave={(task) => handleSaveTask(showCreateTasks, task)}
          />
        )}

        {showEditingProject && ( 
          <EditProject 
            project={project}
            onClose={() => setShowEditingProject(false)}
            onUpdate={handleUpdateProject}
          />
        )}

    </div>
  );
}

export default TaskManagement;
