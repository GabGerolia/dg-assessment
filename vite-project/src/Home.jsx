import { useState } from "react";
import CreateProject from "./CreateProject";
import ConfirmDialog from "./ConfirmDialog";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  // For delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleCreateProject = (project) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p, idx) =>
          idx === editingProject.index ? project : p
        )
      );
      setEditingProject(null);
    } else {
      setProjects((prev) => [...prev, project]);
    }
    setShowModal(false);
  };

  const handleDeleteClick = (index) => {
    setProjectToDelete(index);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setProjects((prev) =>
      prev.filter((_, idx) => idx !== projectToDelete)
    );
    setShowConfirm(false);
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          PROJECT MANAGEMENT TOOL
        </h1>
      </div>

      {/* Main Card */}
        <div className="bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto">

          {/* Projects Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">
              YOUR PROJECTS
            </h2>
          </div>

          {/* Top Controls */}
          <div className="flex justify-start mb-4">
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              onClick={() => setShowModal(true)}
            >
              CREATE PROJECT
            </button>
          </div>

          {/* Scrollable Project List */}
          <div className="max-h-[500px] overflow-y-auto space-y-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="relative border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50 text-left group"
              >
                {/* Action icons */}
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                  {/* Edit */}
                  <button
                    onClick={() => {
                      setEditingProject({ ...project, index });
                      setShowModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {/* edit icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>

                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    {/* delete icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>

                  </button>
                </div>

                <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
                {project.desc && (
                  <p className="text-sm text-gray-600 mt-1">{project.desc}</p>
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
  );
}

export default Home;
