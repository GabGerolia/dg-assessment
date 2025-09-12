import { useState, useEffect } from "react";
import axios from "axios";
import { exitIcon, ascendingIcon, descendingIcon } from "./constVars";

function Logs({ projectId, onClose }) {
  const [sortOrder, setSortOrder] = useState("desc");
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/logs/${projectId}?sort=${sortOrder}`
      );
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [projectId, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`http://localhost:8080/api/logs/${projectId}?sort=${sortOrder}`)
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Error fetching logs:", err));
  }, [projectId, sortOrder]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg)] text-[var(--text)] w-[700px] max-h-[70vh] rounded-2xl shadow-xl flex flex-col border border-[var(--border)] overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <h1 className="text-xl font-semibold">Audit Logs</h1>
          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <div className="relative group">
              <button
                onClick={toggleSort}
                className="p-2 rounded hover:bg-[var(--bg-light)] transition"
              >
                {sortOrder === "asc" ? ascendingIcon : descendingIcon}
              </button>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--bg-dark)] text-[var(--text)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity delay-800">
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </span>
            </div>

            {/* Exit button */}
            <div className="relative group">
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-[var(--danger)] hover:text-white transition"
              >
                {exitIcon}
              </button>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--bg-dark)] text-[var(--text)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                Close
              </span>
            </div>
          </div>
        </div>

        {/* Log entries */}
        <div className="bg-[var(--bg-dark)] flex-1 overflow-y-auto p-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-center text-[var(--text-muted)]">No logs yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-[var(--bg-light)] border border-[var(--border-muted)]"
              >
                <p className="text-sm truncate">
                  {/* User <span className="font-semibold">{log.userName}</span>  */} 
                  {log.description}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Logs;
