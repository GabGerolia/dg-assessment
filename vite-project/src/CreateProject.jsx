import { useState } from "react";

function CreateProject({ onClose }) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = () => {
    console.log("Project Name:", projectName);
    setProjectName("");
    onClose(); // close modal after submit
  };

  const handleClose = () => {
    setProjectName(""); // reset input
    onClose(); // call parent to hide modal
  };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50"
            onClick={handleClose}
        >
            <div
            className="relative bg-white p-8 rounded-2xl shadow-lg w-96"
            onClick={(e) => e.stopPropagation()} // prevent card clicks from closing
            >
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
                ✕
            </button>

            <h1 className="text-2xl font-bold text-center mb-6">
                Name of Project?
            </h1>

            <input
                type="text"
                placeholder="Name of project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
                Submit
            </button>
            </div>
        </div>
    );

}

export default CreateProject;
