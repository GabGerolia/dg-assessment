import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { DndContext, closestCorners, DragOverlay, } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useLocation, useParams } from "react-router-dom";
import { threeDotsIcon, deleteIcon, editIcon } from "../constVars";
import axios from "axios";

import Navbar from "./Navbar";
import { useUser } from "../UserContext";
import TaskCard from "../TaskCard";
import SortableColumn from "../SortableColumn";
import CreateColumn from "../Overlay/CreateColumn";
import CreateTasks from "../Overlay/CreateTasks";
import EditProject from "../Overlay/EditProject";
import ConfirmDialog from "../Overlay/ConfirmDialog";
import Logs from "../Overlay/Logs";
import { _get, _post, _put, _delete } from '../../../server/apiClient';

function TaskManagement() {
  //get user who logged in
  const { user } = useUser();

  //state for logs modal
  const [showLogs, setShowLogs] = useState(false);

  // columns from DB
  const [columns, setColumns] = useState([]);

  //fetch project title and description 
  const { projectId } = useParams(); // comes from /TaskManagement/:projectId
  const [showCreateColumn, setShowCreateColumn] = useState(false); //creation of columns
  const [editingColumn, setEditingColumn] = useState(null); //editing of columns

  //task edit
  const [editingTask, setEditingTask] = useState(null); // task object when editing
  const [editingTaskColId, setEditingTaskColId] = useState(null); // column id of task being edited

  // currently dragged task
  const [activeTask, setActiveTask] = useState(null);
  const parentRef = useRef(null);

  //creation of tasks
  const [showCreateTasks, setShowCreateTasks] = useState(null);

  const [project, setProject] = useState(null);

  //editing project title/description
  const [showEditingProject, setShowEditingProject] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await _get(`/api/project/${projectId}`);
        if (res.data.success) {
          setProject(res.data.project);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      }
    };

    if (projectId) {
      fetchProject()
    };
  }, [projectId]);


  // helper (for later, when tasks exist)
  const findTaskIndex = (colId, taskId) => {
    const col = columns.find(c => c.id === colId);
    if (!col || !col.tasks) return -1;
    return col.tasks.findIndex((t) => t.id === taskId);
  };

  //updating project
  const handleUpdateProject = async (updatedProject) => {
    const res = await _put(`/api/projects/${project.id}`, {
      title: updatedProject.title,
      description: updatedProject.description,
      userId: user?.id,
    })
    if (res.data.success) {
      // update local state immediately
      setProject((prev) => ({
        ...prev,
        title: updatedProject.title,
        description: updatedProject.description,
      }));
      setShowEditingProject(false);
    }
  };

  // Load columns and tasks
  useEffect(() => {
    const fetchColumnsAndTasks = async () => {
      try {
        const res = await _get(`/projects/${projectId}/columns`);
        const colsWithTasks = await Promise.all(
          res.data.map(async (col) => {
            const tasksRes = await _get(`/columns/${col.id}/tasks`);
            return { ...col, tasks: tasksRes.data };
          })
        );
        setColumns(colsWithTasks);
      } catch (err) {
        console.error("Error fetching columns:", err);
      }
    };

    if (projectId) fetchColumnsAndTasks();
  }, [projectId]);


  const handleSaveColumn = async ({ id, title, color }) => {
    if (id) {
      // update
      try {
        const res = await _put(`/columns/${id}`, { title, color, userId: user?.id, })

        setColumns(prev =>
          prev.map(c => c.id === id ? { ...c, title, color } : c)
        );
        setEditingColumn(null);
        setShowCreateColumn(false);
      } catch (err) {
        console.error("Error updating column:", err);
      }
    } else {
      // create
      try {
        const res = await _post(`/projects/${projectId}/columns`, {
          title,
          color,
          position: columns.length,
          userId: user?.id,
        })
        setColumns(prev => [...prev, { ...res.data, tasks: [] }]); // always include empty tasks
        setShowCreateColumn(false);
      } catch (err) {
        console.error("Error saving column:", err);
      }
    }
  };

  //saving task
  const handleSaveTask = async (colId, { title, description }) => {
    try {
      const res = await _post(`/columns/${colId}/tasks`, {
        title,
        description,
        userId: user?.id,
      });

      setColumns(prev =>
        prev.map(col =>
          col.id === colId
            ? { ...col, tasks: [...col.tasks, res.data].sort((a, b) => a.position - b.position) }
            : col
        )
      );
      setShowCreateTasks(null);
    } catch (err) {
      console.err("Error saving task:", err);
    }
  };

  // updating task at edit
  const handleUpdateTask = async (colId, updatedTask) => {
    try {
      await _put(`/tasks/${updatedTask.id}`, {
        title: updatedTask.title,
        description: updatedTask.description,
        column_id: colId,
        userId: user?.id,
      });

      // update state immediately after success
      setColumns(prev =>
        prev.map(col =>
          col.id === colId
            ? {
              ...col,
              tasks: col.tasks.map(t =>
                t.id === updatedTask.id ? { ...t, ...updatedTask } : t
              ),
            }
            : col
        )
      );

      setEditingTask(null);
      setEditingTaskColId(null);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ===== height recalculation logic =====
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // === Column reordering ===
    if (activeType === "column" && overType === "column") {
      const oldIndex = columns.findIndex((c) => c.id.toString() === active.id);
      const newIndex = columns.findIndex((c) => c.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columns, oldIndex, newIndex);
        setColumns(reordered);

        try {
          // update all positions sequentially
          for (const [idx, col] of reordered.entries()) {
            await _put(`/columns/${col.id}/position`, { position: idx });
          }
        } catch (err) {
          console.error("Error updating column position:", err);
        }
      }
      return;
    }

    // === Task reordering / moving ===
    if (activeType === "task") {
      const sourceColId = findColumnId(active.id);

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

      // local vars to use after updating state
      let movedTask = null;
      let newCols = columns.map((c) => ({ ...c, tasks: [...c.tasks] }));

      const sourceCol = newCols.find((c) => String(c.id) === String(sourceColId));
      const destCol = newCols.find((c) => String(c.id) === String(destColId));
      if (!sourceCol || !destCol) return;

      const oldIndex = sourceCol.tasks.findIndex((t) => t.id === active.id);

      if (sourceColId === destColId) {
        // Reorder inside same column
        const newIndex = destCol.tasks.findIndex((t) => t.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          destCol.tasks = arrayMove(destCol.tasks, oldIndex, newIndex);
        }

        setColumns(newCols);

        // persist new order
        const orderedTaskIds = destCol.tasks.map((t) => t.id);
        try {
          await _put(`/columns/${destColId}/tasks/reorder`, { orderedTaskIds });
        } catch (err) {
          console.error("Error saving task order:", err);
        }
      } else {
        // Move between columns
        [movedTask] = sourceCol.tasks.splice(oldIndex, 1);

        const newIndex =
          over.data.current?.type === "task"
            ? destCol.tasks.findIndex((t) => t.id === over.id)
            : destCol.tasks.length;

        if (newIndex >= 0) {
          destCol.tasks.splice(newIndex, 0, movedTask);
        } else {
          destCol.tasks.push(movedTask);
        }

        setColumns(newCols);

        try {
          await _put(`/tasks/${movedTask.id}`, {
            title: movedTask.title,
            description: movedTask.description,
            column_id: destColId,
            position: newIndex >= 0 ? newIndex : destCol.tasks.length - 1,
          });
        } catch (err) {
          console.error("Error updating task column:", err);
        }

        // persist new order in destination column
        try {
          const orderedTaskIds = destCol.tasks.map((t) => t.id);
          await _put(`/columns/${destColId}/tasks/reorder`, { orderedTaskIds });
        } catch (err) {
          console.error("Error saving moved task order:", err);
        }
      }
    }

    setActiveTask(null);
    recalc();
  };

  //confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // delete task with confirmation
  const requestDeleteTask = (colId, taskId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      onConfirm: async () => {
        try {
          await _delete(`/tasks/${taskId}`, { data: { userId: user?.id } })

          setColumns(prev =>
            prev.map(col =>
              col.id === colId
                ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                : col
            )
          );
        } catch (err) {
          console.error("Error deleting task:", err);
        }
      },
    });
  };

  // delete column with confirmation
  const requestDeleteColumn = (colId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Column",
      message: "Deleting this column will also remove all its tasks. Are you sure?",
      onConfirm: async () => {
        try {
          await _delete(`/columns/${colId}`, { data: { userId: user?.id } })
          setColumns(prev => prev.filter(c => c.id !== colId));
        } catch (err) {
          console.error("Error deleting column:", err);
        }
      },
    });
  };

  // Move column left
  const handleMoveLeft = async (colId) => {
    const index = columns.findIndex((c) => c.id === colId);
    if (index > 0) {
      const reordered = arrayMove(columns, index, index - 1);
      setColumns(reordered);

      try {
        for (const [idx, col] of reordered.entries()) {
          await _put(`/columns/${col.id}/position`, { position: idx });
        }
      } catch (err) {
        console.error("Error updating column position:", err);
      }
    }
  };

  // Move column right
  const handleMoveRight = async (colId) => {
    const index = columns.findIndex((c) => c.id === colId);
    if (index !== -1 && index < columns.length - 1) {
      const reordered = arrayMove(columns, index, index + 1);
      setColumns(reordered);

      // Persist new positions in DB
      try {
        for (const [idx, col] of reordered.entries()) {
          await _put(`/columns/${col.id}/position`, { position: idx });
        }
      } catch (err) {
        console.error("Error updating column position:", err);
      }
    }
  };


  //to open the edit task modal
  const requestEditTask = (colId, taskId) => {
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    const task = col.tasks.find(t => t.id === taskId);
    if (!task) return;
    setEditingTask(task);
    setEditingTaskColId(colId);
  };

  const handleMoveTask = async (taskId, targetColId) => {
    // local vars to use after state update
    let movedTask, sourceCol, destCol, newPosition, sourceIds, destIds;

    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));

      sourceCol = newCols.find((c) => (c.tasks || []).some((t) => t.id === taskId));
      destCol = newCols.find((c) => String(c.id) === String(targetColId));
      if (!sourceCol || !destCol) return prev;

      const taskIndex = sourceCol.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      // add to destination at end
      destCol.tasks.push(movedTask);

      // persist DB: update task with new column + position
      newPosition = destCol.tasks.length - 1;

      // re-save positions of both columns
      sourceIds = sourceCol.tasks.map((t) => t.id);
      destIds = destCol.tasks.map((t) => t.id);

      return newCols;
    });

    try {
      await _put(`/tasks/${movedTask.id}`, {
        title: movedTask.title,
        description: movedTask.description,
        column_id: targetColId,
        position: newPosition,
        userId: user?.id,
      });
      await _put(`/columns/${sourceCol.id}/tasks/reorder`, {
        orderedTaskIds: sourceIds,
      });
      await _put(`/columns/${targetColId}/tasks/reorder`, {
        orderedTaskIds: destIds,
      });
    } catch (err) {
      console.error("Error reordering dest column:", err);
    }
  };

  return (
    <div className="task-container min-h-screen flex flex-col bg-[var(--bg-dark)] text-[var(--text)]">
      <Navbar />

      {/* Title */}
      <div className="task-title relative w-full px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-dark)]">
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
        <button type="button" className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--bg-dark)] font-medium hover:opacity-90 transition"
          onClick={() => setShowLogs(true)}
        >
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
                tasks={col.tasks || []}
                threeDotsIcon={threeDotsIcon}
                onAddTask={() => setShowCreateTasks(col.id)}
                onEdit={() => {
                  setEditingColumn(col);
                  setShowCreateColumn(true);
                }}
                onDelete={() => requestDeleteColumn(col.id)}
                onMoveLeft={() => handleMoveLeft(col.id)}
                onMoveRight={() => handleMoveRight(col.id)}
              >
                {(col.tasks || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    threeDotsIcon={threeDotsIcon}
                    columns={columns}
                    onEdit={(taskId) => requestEditTask(col.id, taskId)}   // <- use helper
                    onDelete={(taskId) => requestDeleteTask(col.id, taskId)}
                    onMove={handleMoveTask}
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
            column={editingColumn}   // pass column if editing
            onClose={() => {
              setShowCreateColumn(false);
              setEditingColumn(null);
            }}
            onSave={handleSaveColumn}
          />
        )}

      </DndContext>

      {/* Create Task Modal */}
      {showCreateTasks && (
        <CreateTasks
          onClose={() => setShowCreateTasks(null)}
          columnId={showCreateTasks}              // pass column id so server can use position/column
          onSave={(taskPayload) => handleSaveTask(showCreateTasks, taskPayload)}
        />
      )}

      {/* Edit task modal */}
      {editingTask && (
        <CreateTasks
          task={editingTask}
          columnId={editingTaskColId}
          onClose={() => {
            setEditingTask(null);
            setEditingTaskColId(null);
          }}
          onSave={(updatedPayload) => handleUpdateTask(editingTaskColId, updatedPayload)}
        />
      )}

      {/* Edit Project Modal */}
      {showEditingProject && (
        <EditProject
          project={project}
          onClose={() => setShowEditingProject(false)}
          onUpdate={handleUpdateProject}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
      {showLogs && (
        <Logs onClose={() => setShowLogs(false)} />
      )}

      {showLogs && (
        <Logs
          projectId={projectId}
          onClose={() => setShowLogs(false)}
        />
      )}

    </div>
  );
}

export default TaskManagement;
