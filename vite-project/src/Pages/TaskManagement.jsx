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

function TaskManagement() {
  //get user who logged in
  const { user } = useUser();

  //state for logs modal
  const [showLogs, setShowLogs] = useState(false);

  //fetch project title and description 
  const { projectId } = useParams(); // comes from /TaskManagement/:projectId
  const [project, setProject] = useState(null);

  useEffect(() => {
    axios.get(`http://dg-assessment-production.up.railway.app/api/project/${projectId}`)
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

  //editing project title/description
  const [showEditingProject, setShowEditingProject] = useState(false);
  const handleUpdateProject = (updatedProject) => {
    axios.put(`http://dg-assessment-production.up.railway.app/api/projects/${project.id}`, {
      title: updatedProject.title,
      description: updatedProject.description,
      userId: user?.id,
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

  // Load columns and tasks
  useEffect(() => {
    if (!projectId) return;
    axios.get(`http://dg-assessment-production.up.railway.app/projects/${projectId}/columns`)
      .then(async (res) => {
        // Fetch tasks for each column
        const colsWithTasks = await Promise.all(
          res.data.map(async (col) => {
            const tasksRes = await axios.get(`http://dg-assessment-production.up.railway.app/columns/${col.id}/tasks`);
            return { ...col, tasks: tasksRes.data };
          })
        );
        setColumns(colsWithTasks);
      })
      .catch(err => console.error("Error fetching columns:", err));
  }, [projectId]);

  const [showCreateColumn, setShowCreateColumn] = useState(false); //creation of columns
  const [editingColumn, setEditingColumn] = useState(null); //editing of columns

  const handleSaveColumn = ({ id, title, color }) => {
    if (id) {
      // update
      axios.put(`http://dg-assessment-production.up.railway.app/columns/${id}`, { title, color, userId: user?.id, })
        .then(() => {
          setColumns(prev =>
            prev.map(c => c.id === id ? { ...c, title, color } : c)
          );
          setEditingColumn(null);
          setShowCreateColumn(false);
        })
        .catch(err => console.error("Error updating column:", err));
    } else {
      // create
      axios.post(`http://dg-assessment-production.up.railway.app/projects/${projectId}/columns`, {
        title,
        color,
        position: columns.length,
        userId: user?.id,
      })
        .then(res => {
          setColumns(prev => [...prev, { ...res.data, tasks: [] }]); // always include empty tasks
          setShowCreateColumn(false);
        })
        .catch(err => console.error("Error saving column:", err));
    }
  };

  //When loading columns from DB, each column doesn’t have tasks yet, so make sure they at least have an empty array - gpt
  useEffect(() => {
    if (!projectId) return;
    axios.get(`http://dg-assessment-production.up.railway.app/projects/${projectId}/columns`)
      .then(res => {
        const cols = res.data.map(c => ({ ...c, tasks: [] })); // add empty tasks array
        setColumns(cols);
      })
      .catch(err => console.error("Error fetching columns:", err));
  }, [projectId]);

  const [editingTask, setEditingTask] = useState(null); // task object when editing
  const [editingTaskColId, setEditingTaskColId] = useState(null); // column id of task being edited

  //creation of tasks
  const [showCreateTasks, setShowCreateTasks] = useState(null);
  const handleSaveTask = (colId, { title, description }) => {
    axios.post(`http://dg-assessment-production.up.railway.app/columns/${colId}/tasks`, {
      title,
      description,
      userId: user?.id,
    })
      .then(res => {
        setColumns(prev =>
          prev.map(col =>
            col.id === colId
              ? {
                ...col,
                tasks: [...col.tasks, res.data].sort(
                  (a, b) => a.position - b.position
                ),
              }
              : col
          )
        );
        setShowCreateTasks(null);
      })
      .catch(err => console.error("Error saving task:", err));
  };

  // updating task at edit
  const handleUpdateTask = (colId, updatedTask) => {
    axios.put(`http://dg-assessment-production.up.railway.app/tasks/${updatedTask.id}`, {
      title: updatedTask.title,
      description: updatedTask.description,
      column_id: colId,
      userId: user?.id,
    })
      .then(() => {
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
      })
      .catch(err => console.error("Error updating task:", err));
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

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // === Column reordering (unchanged) ===
    if (activeType === "column" && overType === "column") {
      const oldIndex = columns.findIndex((c) => c.id.toString() === active.id);
      const newIndex = columns.findIndex((c) => c.id.toString() === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columns, oldIndex, newIndex);
        setColumns(reordered);

        reordered.forEach((col, idx) => {
          axios.put(`http://dg-assessment-production.up.railway.app/columns/${col.id}/position`, {
            position: idx,
          }).catch(err => console.error("Error updating column position:", err));
        });
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

      setColumns((prev) => {
        const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
        const sourceCol = newCols.find((c) => String(c.id) === String(sourceColId));
        const destCol = newCols.find((c) => String(c.id) === String(destColId));
        if (!sourceCol || !destCol) return prev;

        const oldIndex = sourceCol.tasks.findIndex((t) => t.id === active.id);

        let movedTask = null;

        if (sourceColId === destColId) {
          // Reorder inside same column
          const newIndex = destCol.tasks.findIndex((t) => t.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            destCol.tasks = arrayMove(destCol.tasks, oldIndex, newIndex);
          }

          // persist new order
          const orderedTaskIds = destCol.tasks.map((t) => t.id);
          axios.put(`http://dg-assessment-production.up.railway.app/columns/${destColId}/tasks/reorder`, {
            orderedTaskIds,
          }).catch(err => console.error("Error saving task order:", err));
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

          axios.put(`http://dg-assessment-production.up.railway.app/tasks/${movedTask.id}`, {
            title: movedTask.title,
            description: movedTask.description,
            column_id: destColId,
          }).catch(err => console.error("Error updating task column:", err));

          // persist new order in destination column
          const orderedTaskIds = destCol.tasks.map((t) => t.id);
          axios.put(`http://dg-assessment-production.up.railway.app/columns/${destColId}/tasks/reorder`, {
            orderedTaskIds,
          }).catch(err => console.error("Error saving moved task order:", err));
        }
        return newCols;
      });
    }

    setActiveTask(null);
    recalc();
  };

  // delete task
  const handleDeleteTask = (colId, taskId) => {
    axios.delete(`http://dg-assessment-production.up.railway.app/tasks/${taskId}`)
      .then(() => {
        setColumns(prev =>
          prev.map(col =>
            col.id === colId
              ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
              : col
          )
        );
      })
      .catch(err => console.error("Error deleting task:", err));
  };


  // delete column
  const handleDeleteColumn = (colId) => {
    axios.delete(`http://dg-assessment-production.up.railway.app/columns/${colId}`)
      .then(() => {
        setColumns(prev => prev.filter(c => c.id !== colId));
      })
      .catch(err => console.error("Error deleting column:", err));
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
      onConfirm: () => {
        axios.delete(`http://dg-assessment-production.up.railway.app/tasks/${taskId}`, { data: { userId: user?.id } })
          .then(() => {
            setColumns(prev =>
              prev.map(col =>
                col.id === colId
                  ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
                  : col
              )
            );
          })
          .catch(err => console.error("Error deleting task:", err));
      },
    });
  };

  // delete column with confirmation
  const requestDeleteColumn = (colId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Column",
      message: "Deleting this column will also remove all its tasks. Are you sure?",
      onConfirm: () => {
        axios.delete(`http://dg-assessment-production.up.railway.app/columns/${colId}`, { data: { userId: user?.id } })
          .then(() => {
            setColumns(prev => prev.filter(c => c.id !== colId));
          })
          .catch(err => console.error("Error deleting column:", err));
      },
    });
  };

  // Move column left
  const handleMoveLeft = (colId) => {
    setColumns((prev) => {
      const index = prev.findIndex((c) => c.id === colId);
      if (index > 0) {
        const reordered = arrayMove(prev, index, index - 1);

        // Persist new positions in DB
        reordered.forEach((col, idx) => {
          axios.put(`http://dg-assessment-production.up.railway.app/columns/${col.id}/position`, {
            position: idx,
          }).catch(err => console.error("Error updating column position:", err));
        });

        return reordered;
      }
      return prev;
    });
  };

  // Move column right
  const handleMoveRight = (colId) => {
    setColumns((prev) => {
      const index = prev.findIndex((c) => c.id === colId);
      if (index !== -1 && index < prev.length - 1) {
        const reordered = arrayMove(prev, index, index + 1);

        // Persist new positions in DB
        reordered.forEach((col, idx) => {
          axios.put(`http://dg-assessment-production.up.railway.app/columns/${col.id}/position`, {
            position: idx,
          }).catch(err => console.error("Error updating column position:", err));
        });

        return reordered;
      }
      return prev;
    });
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

  const handleMoveTask = (taskId, targetColId) => {
    setColumns((prev) => {
      const newCols = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));

      const sourceCol = newCols.find((c) => (c.tasks || []).some((t) => t.id === taskId));
      const destCol = newCols.find((c) => String(c.id) === String(targetColId));
      if (!sourceCol || !destCol) return prev;

      const taskIndex = sourceCol.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;
      const [movedTask] = sourceCol.tasks.splice(taskIndex, 1);

      // add to destination at end
      destCol.tasks.push(movedTask);

      // persist DB: update task with new column + position
      const newPosition = destCol.tasks.length - 1;
      axios.put(`http://dg-assessment-production.up.railway.app/tasks/${movedTask.id}`, {
        title: movedTask.title,
        description: movedTask.description,
        column_id: targetColId,
        position: newPosition,   // send position!
        userId: user?.id,
      }).catch(err => console.error("Error moving task:", err));

      // re-save positions of both columns
      const sourceIds = sourceCol.tasks.map((t, i) => t.id);
      const destIds = destCol.tasks.map((t, i) => t.id);

      axios.put(`http://dg-assessment-production.up.railway.app/columns/${sourceCol.id}/tasks/reorder`, {
        orderedTaskIds: sourceIds,
      }).catch(err => console.error("Error reordering source column:", err));

      axios.put(`http://dg-assessment-production.up.railway.app/columns/${targetColId}/tasks/reorder`, {
        orderedTaskIds: destIds,
      }).catch(err => console.error("Error reordering dest column:", err));

      return newCols;
    });
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
