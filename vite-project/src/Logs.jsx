import { ascendingIcon, descendingIcon, exitIcon } from "./constVars";
import { useState } from "react";

function Logs() {
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--bg)] text-[var(--text)] w-[700px] max-h-[70vh] rounded-2xl shadow-xl flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
                    <h1 className="text-xl font-semibold">Audit Logs</h1>
                    <div className="flex items-center gap-2">
                        {/* Sort toggle button with tooltip */}
                        <div className="relative group">
                            <button
                                onClick={toggleSort}
                                className="p-2 rounded hover:bg-[var(--bg-light)] transition"
                            >
                                {sortOrder === "asc" ? ascendingIcon : descendingIcon}
                            </button>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--bg-dark)] text-[var(--text)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity  delay-800">
                                {sortOrder === "asc" ? "Ascending" : "Descending"}
                            </span>
                        </div>

                        {/* Exit button with tooltip */}
                        <div className="relative group">
                            <button className="p-2 rounded hover:bg-[var(--danger)] hover:text-white transition">
                                {exitIcon}
                            </button>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--bg-dark)] text-[var(--text)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                Close
                            </span>
                        </div>
                    </div>
                </div>

                {/* Log entries */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Example log entry */}
                    <div className="p-3 rounded-lg bg-[var(--bg-light)] border border-[var(--border-muted)]">
                        <p className="text-sm">
                            User <span className="font-semibold">John</span> updated a task.
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">2025-09-11 22:30</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-light)] border border-[var(--border-muted)]">
                        <p className="text-sm">
                            Column <span className="font-semibold">To Do</span> was created.
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">2025-09-11 22:20</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logs;
