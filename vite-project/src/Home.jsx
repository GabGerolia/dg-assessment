import { useState } from "react";
import CreateProject from "./CreateProject";

function Home() {
  const [showModal, setShowModal] = useState(false); //createproject visibility

  return (
    <div className="home-container">
      <div className="home-title">
        <h1>PROJECT MANAGEMENT TOOL</h1>
      </div>

      <div className="home-selection">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => setShowModal(true)} // open modal
        >
          CREATE PROJECT
        </button>
      </div>

      <div className="home-projects-container">
        <h1>YOUR PROJECTS</h1>
        <div className="home-yourprojects">
          <div>EXAMPLE PROJECT</div>
        </div>
      </div>

      {/* Only show CreateProject if showModal is true */}
      {showModal && (
        <CreateProject onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default Home;
