import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { DndContext, closestCorners, DragOverlay, } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

import Navbar from "./Navbar";
import TaskCard from "./TaskCard";
import SortableColumn from "./SortableColumn";
import CreateColumn from "./CreateColumn";
import CreateTasks from "./CreateTasks";
import EditProject from "./EditProject";

function TaskManagement() {
  //fetch project title and description 
  const { projectId } = useParams(); // comes from /TaskManagement/:projectId
  const [project, setProject] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/project/${projectId}`)
      .then(res => {
        if (res.data.success) {
          setProject(res.data.project);
        }
      })
      .catch(err => console.error("Error fetching project:", err));
  }, [projectId]);


  // helper (for later, when tasks exist)
  const findTaskIndex = (colId, taskId) => {
    const col = columns.find(c => c.id === colId);
    if (!col || !col.tasks) return -1;
    return col.tasks.findIndex((t) => t.id === taskId);
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
    axios.put(`http://localhost:8080/api/projects/${project.id}`, {
      title: updatedProject.title,
      description: updatedProject.description,
    })
      .then((res) => {
        if (res.data.success) {
          // update local state immediately
          setProject((prev) => ({
            ...prev,
            title: updatedProject.title,
            description: updatedProject.description,
          }));
          setShowEditingProject(false);
        }
      });
  };

  // columns from DB
  const [columns, setColumns] = useState([]);

  // Load columns from backend
  useEffect(() => {
    if (!projectId) return;
    axios.get(`http://localhost:8080/projects/${projectId}/columns`)
      .then(res => {
        setColumns(res.data); // directly store array of columns
      })
      .catch(err => console.error("Error fetching columns:", err));
  }, [projectId]);

  const [showCreateColumn, setShowCreateColumn] = useState(false); //creation of columns

  const handleSaveColumn = ({ title, color }) => {
    axios.post(`http://localhost:8080/projects/${projectId}/columns`, {
      title,
      color,
      position: columns.length, // append at end
    })
      .then(res => {
        setColumns(prev => [...prev, res.data]);
        setShowCreateColumn(false);
      })
      .catch(err => console.error("Error saving column:", err));
  };

  //When loading columns from DB, each column doesn’t have tasks yet, so make sure they at least have an empty array - gpt
  useEffect(() => {
    if (!projectId) return;
    axios.get(`http://localhost:8080/projects/${projectId}/columns`)
      .then(res => {
        const cols = res.data.map(c => ({ ...c, tasks: [] })); // add empty tasks array
        setColumns(cols);
      })
      .catch(err => console.error("Error fetching columns:", err));
  }, [projectId]);

  //creation of tasks
  const [showCreateTasks, setShowCreateTasks] = useState(null);
  const handleSaveTask = (colId, { title, description }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col
      )
    );

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
    const col = columns.find((c) => (c.tasks || []).some((t) => t.id === taskId));
    return col ? col.id : null;
  };


  const handleDragStart = (event) => {
    if (event.active.data.current?.type === "task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    //Identify what’s being dragged and what it’s dropped on
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // column reorder (unchanged)
    if (activeType === "column" && overType === "column") {
      const oldIndex = columns.findIndex((c) => c.id.toString() === active.id);
      const newIndex = columns.findIndex((c) => c.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columns, oldIndex, newIndex);
        setColumns(reordered);

        reordered.forEach((col, idx) => {
          axios.put(`http://localhost:8080/columns/${col.id}/position`, {
            position: idx,
          }).catch(err => console.error("Error updating column position:", err));
        });
      }
      return;
    }

    // task move
    if (activeType === "task") {
      // source column id computed from current state
      const sourceColId = findColumnId(active.id);

      // figure out destination column id robustly
      let destColId = null;
      if (over?.data?.current?.column?.id) {
        destColId = String(over.data.current.column.id);
      } else if (typeof over?.id === "string" && over.id.startsWith("tasks-")) {
        destColId = over.id.replace(/^tasks-/, "");
      } else {
        destColId = findColumnId(over.id);
      }

      if (!sourceColId || !destColId) {
        setActiveTask(null);
        return;
      }

      setColumns((prev) => {
        // create mutable shallow copy with new task arrays
        const newCols = prev.map((c) => ({ ...c, tasks: [...(c.tasks || [])] }));
        const sourceCol = newCols.find((c) => String(c.id) === String(sourceColId));
        const destCol = newCols.find((c) => String(c.id) === String(destColId));
        if (!sourceCol || !destCol) return prev;

        // compute fromIndex and toIndex from the local mutated copy
        const fromIndex = sourceCol.tasks.findIndex((t) => t.id === active.id);
        if (fromIndex === -1) return prev;
        const [movedTask] = sourceCol.tasks.splice(fromIndex, 1);
        if (!movedTask) return prev;

        const toIndex =
          over.data.current?.type === "task"
            ? destCol.tasks.findIndex((t) => t.id === over.id)
            : -1;

        if (toIndex >= 0) {
          destCol.tasks.splice(toIndex, 0, movedTask);
        } else {
          destCol.tasks.push(movedTask);
        }

        // persist change to backend if desired here
        // example axios.post(`/tasks/${movedTask.id}/move`, { toColumnId: destCol.id }).catch(...)

        return newCols;
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
          items={columns.map(col => col.id.toString())}
          strategy={horizontalListSortingStrategy}
        >
          <div
            ref={parentRef}
            className="task-parent-columns flex-1 min-h-0 overflow-y-hidden overflow-x-auto flex space-x-3 px-6 py-6"
          >
            {columns.map((col) => (
              <SortableColumn
                key={col.id}
                id={col.id.toString()}
                title={col.title}
                color={col.color}
                tasks={col.tasks || []}   // use tasks from state
                threeDotsIcon={threeDotsIcon}
                onAddTask={() => setShowCreateTasks(col.id)}
                onEdit={() => console.log("Edit column", col.id)}
                onDelete={() => console.log("Delete column", col.id)}
                onMoveLeft={() => console.log("Move left", col.id)}
                onMoveRight={() => console.log("Move right", col.id)}
              >
                {(col.tasks || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    threeDotsIcon={threeDotsIcon}
                    columns={columns}
                    onEdit={(taskId) => console.log("Edit task", taskId)}
                    onDelete={(taskId) => console.log("Delete task", taskId)}
                    onMove={(taskId, targetColId) =>
                      console.log("Move task", taskId, "to column", targetColId)
                    }
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
