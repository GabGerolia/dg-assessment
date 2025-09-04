import { useState } from "react";
import CreateProject from "./CreateProject";

function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          PROJECT MANAGEMENT TOOL
        </h1>
      </div>

      {/* Top Controls */}
      <div className="flex justify-start mb-8">
        <button
          type="button"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={() => setShowModal(true)}
        >
          CREATE PROJECT
        </button>
      </div>

      {/* Projects Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">YOUR PROJECTS</h2>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto">
        <div className="space-y-4 " >
          {/* Example Project (template for future) */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50 text-left">
            <h3 className="text-lg font-medium text-gray-800">
              EXAMPLE PROJECT
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This is an example project. Future projects will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && <CreateProject onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default Home;
