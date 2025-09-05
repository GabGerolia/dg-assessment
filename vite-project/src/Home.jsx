import { useState, useEffect } from "react";
import axios from "axios";
import CreateProject from "./CreateProject";
import ConfirmDialog from "./ConfirmDialog";
import { useUser } from "./UserContext";
import Navbar from "./Navbar";

function Home() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects on load
  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:8080/api/projects/${user.id}`)
        .then((res) => {
          if (res.data.success) {
            setProjects(res.data.projects);
          }
        })
        .catch((err) => console.error("Error fetching projects:", err));
    }
  }, [user]);

  // Create or Update
  const handleCreateProject = (project) => {
    if (editingProject) {
      axios
        .put(`http://localhost:8080/api/projects/${editingProject.id}`, {
          title: project.title,
          description: project.description,
        })
        .then((res) => {
          if (res.data.success) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === editingProject.id ? { ...p, ...project } : p
              )
            );
            setEditingProject(null);
          }
        });
    } else {
      axios
        .post("http://localhost:8080/api/projects", {
          userId: user.id,
          title: project.title,
          description: project.description,
        })
        .then((res) => {
          if (res.data.success) {
            setProjects((prev) => [
              ...prev,
              { id: res.data.id, ...project },
            ]);
          }
        });
    }
    setShowModal(false);
  };

  // Delete
  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = () => {
    axios
      .delete(`http://localhost:8080/api/projects/${projectToDelete}`)
      .then((res) => {
        if (res.data.success) {
          setProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
        }
      });
    setShowConfirm(false);
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text)]">
      {/* Navbar */}
      <Navbar />

      {/* Page content with padding to avoid overlap */}
      <div className="px-6 py-10 pt-24">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--text)]">
            PROJECT MANAGEMENT TOOL
          </h1>
          {user && (
            <p className="text-[var(--text-muted)] mt-2">
              Logged in as{" "}
              <span className="text-[var(--secondary)] font-medium">
                {user.username}
              </span>
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-[var(--bg)] shadow-md rounded-xl p-6 max-w-4xl mx-auto border border-[var(--border)]">
          {/* Projects Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              YOUR PROJECTS
            </h2>
          </div>

          {/* Top Controls */}
          <div className="flex justify-start mb-4">
            <button
              type="button"
              className="bg-[var(--primary)] text-[var(--bg-light)] px-6 py-2 rounded-lg hover:opacity-90 transition"
              onClick={() => setShowModal(true)}
            >
              <b>CREATE PROJECT</b>
            </button>
          </div>

          {/* Scrollable Project List */}
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {projects.map((project, index) => (

              // created projects
              <div
                key={index}
                className="relative border border-[var(--border-muted)] rounded-lg p-4 shadow-sm hover:shadow-md transition bg-[var(--bg-light)] text-left group"
              >
                {/* Action icons */}
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                  
                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingProject({ ...project, index });
                      setShowModal(true);
                    }}
                    className="text-[var(--primary)] hover:opacity-80"
                  >
                    {/* edit icon */}
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(project.id)}
                    className="text-[var(--danger)] hover:opacity-80"
                  >
                    {/* delete icon */}
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
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>

                <h3 className="text-lg font-medium text-[var(--text)]">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-3 break-words">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <CreateProject
            onClose={() => {
              setShowModal(false);
              setEditingProject(null);
            }}
            onCreate={handleCreateProject}
            editingProject={editingProject}
          />
        )}

        {/* Confirm Delete */}
        <ConfirmDialog
          isOpen={showConfirm}
          title="Delete Project?"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </div>
  );
}

export default Home;
