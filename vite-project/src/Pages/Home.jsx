import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editIcon, deleteIcon } from "../constVars";
import axios from "axios";

import CreateProject from "../Overlay/CreateProject";
import ConfirmDialog from "../Overlay/ConfirmDialog";
import Navbar from "../Navbar";
import EditProject from "../Overlay/EditProject";
import { useUser } from "../UserContext";

function Home() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showCreateProject, setshowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showEditingProject, setshowEditingProject] = useState(null);
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
    if (showEditingProject) {
      axios
        .put(`http://localhost:8080/api/projects/${showEditingProject.id}`, {
          title: project.title,
          description: project.description,
          userId: user?.id,
        })
        .then((res) => {
          if (res.data.success) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === showEditingProject.id ? { ...p, ...project } : p
              )
            );
            setshowEditingProject(null);
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
    setshowCreateProject(false);
  };

  //open project
  const handleOpenProject = (project) => {
    // navigate and pass project in location.state so TaskManagement can read it
    navigate(`/TaskManagement/${project.id}`, { state: { project } });
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
      <Navbar/>


      {/* Page content with padding to avoid overlap */}
      <div className="px-6 py-10">
        {/* Page Title */}
        <div className="text-center mb-15">
          <h1 className="text-4xl font-bold text-[var(--text)]">
            PROJECT MANAGEMENT TOOL
          </h1>
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
              onClick={() => setshowCreateProject(true)}
            >
              <b>CREATE PROJECT</b>
            </button>
          </div>

          {/* Scrollable Project List */}
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {projects.map((project, index) => (
              
              // created projects
              <div
                key={project.id ?? index}
                onClick={() => handleOpenProject(project)}
                role="button"
                tabIndex={0}
                className="relative border border-[var(--border-muted)] rounded-lg p-4 shadow-sm hover:shadow-md transition bg-[var(--bg-light)] text-left group"
              >
                {/* Action icons */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  
                  {/* Edit */}
                  <button
                    onClick={() => {
                      setshowEditingProject({ ...project, index });
                    }}
                    className="text-[var(--primary)] hover:opacity-80"
                  >
                    {/* edit icon */}
                    {editIcon}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(project.id)}
                    className="text-[var(--danger)] hover:opacity-80"
                  >
                    {/* delete icon */}
                    {deleteIcon}
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
        {showCreateProject && (
          <CreateProject
            onClose={() => setshowCreateProject(false)}
            onCreate={handleCreateProject}
          />
        )}

        {showEditingProject && (
          <EditProject
            project={showEditingProject}
            onClose={() => setshowEditingProject(null)}
            onUpdate={handleCreateProject}
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
