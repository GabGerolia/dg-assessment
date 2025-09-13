require("dotenv").config(); // Load environment variables first

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// allow JSON in requests
app.use(express.json());

// CORS
app.use(cors({ origin: ["http://localhost:5173", "https://dg-assessmentpmt.vercel.app"] }));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// // MySQL connection for localhost
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "050503",
//   database: "myDB"
// });

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

// helper to insert log entries (non-blocking)
function addLog(projectId, userId, description) {
  if (!projectId || !userId || !description) {
    console.warn("addLog missing fields:", { projectId, userId, description });
    return;
  }
  const sql = "INSERT INTO logs (project_id, user_id, description) VALUES (?, ?, ?)";
  db.query(sql, [projectId, userId, description], (err) => {
    if (err) console.error("Error inserting log:", err);
  });
}

// Get a single project by ID
app.get("/api/project/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM projects WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (results.length === 0) {
      return res.json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, project: results[0] });
  });
});



//fetch login info
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  } else if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  db.query(
    "SELECT * FROM user WHERE userName = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        res.json({
          success: true,
          message: "Login successful",
          user: {
            id: results[0].id,
            username: results[0].userName
          }
        });
      }
      else {
        // username not found
        res.json({ success: false, message: "Invalid username" });
      }
    }
  );
});

// signup
app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // check if username already exists
  db.query("SELECT * FROM user WHERE userName = ?", [username], (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      // username already exists
      return res.json({ success: false, message: "Username already taken" });
    }

    // insert new user
    db.query(
      "INSERT INTO user (userName, password) VALUES (?, ?)",
      [username, password],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "User registered successfully!" });
      }
    );
  });
});

// Create project
app.post("/api/projects", (req, res) => {
  const { userId, title, description } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = "INSERT INTO projects (user_id, title, description, created_at) VALUES (?, ?, ?, NOW())";
  db.query(sql, [userId, title, description], (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    const projectId = result.insertId;

    // Insert preset columns 
    //change colors here if main colors was change
    const presetColumns = [
      { title: "Todo", color: "hsl(350, 63%, 40%)", position: 0 },
      { title: "In Progress", color: "hsl(25 45% 40%)", position: 1 },
      { title: "Done", color: "hsl(140 35% 40%)", position: 2 },
    ];

    const columnSql = "INSERT INTO columns (project_id, title, color, position) VALUES ?";
    const columnValues = presetColumns.map(c => [projectId, c.title, c.color, c.position]);

    db.query(columnSql, [columnValues], (colErr, colResult) => {
      if (colErr) {
        console.error("Error inserting columns:", colErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      const todoColumnId = colResult.insertId; // ID of "Todo" column (first inserted)

      // Insert default sample task into Todo
      const taskSql = "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), 0)";
      db.query(taskSql, [todoColumnId, "Sample Title", "Sample Description"], (taskErr) => {
        if (taskErr) {
          console.error("Error inserting sample task:", taskErr);
          return res.status(500).json({ success: false, error: "Database error" });
        }

        res.json({ success: true, id: projectId });
      });
    });
  });
});


// Get projects by user
app.get("/api/projects/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM projects WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, projects: results });
  });
});

// Update project
app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, userId } = req.body;

  // First get the current values
  const getSql = "SELECT title, description FROM projects WHERE id = ?";
  db.query(getSql, [id], (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching old project data:", getErr);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const oldTitle = rows[0].title;
    const oldDesc = rows[0].description;

    // Update with new values
    const updateSql = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
    db.query(updateSql, [title, description, id], (updateErr, result) => {
      if (updateErr) {
        console.error("Error updating project:", updateErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // Insert log if userId is available
      if (userId) {
        const logMsg = `Updated project: title "${oldTitle}" → "${title}", description "${oldDesc}" → "${description}"`;
        addLog(id, userId, logMsg);
      } else {
        console.warn("No userId provided for project update log, skipping insert.");
      }

      res.json({ success: true });
    });
  });
});


// Delete project
app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true });
  });
});


//localhost:8080
app.listen(8080, () => {
  console.log("Server started on port 8080");
});

app.get("/projects/:projectId/columns", (req, res) => {
  const { projectId } = req.params;
  db.query(
    "SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC",
    [projectId],
    (err, results) => {
      if (err) {
        console.error("Error fetching columns:", err);
        return res.status(500).json({ success: false });
      }
      res.json(results);
    }
  );
});


//=== COLUMNS ===

// Create a new column for a project
app.post("/projects/:projectId/columns", (req, res) => {
  const { projectId } = req.params;
  const { title, color, position, userId } = req.body; // <-- include userId from frontend

  db.query(
    "INSERT INTO columns (project_id, title, color, position) VALUES (?, ?, ?, ?)",
    [projectId, title, color || null, position || 0],
    (err, result) => {
      if (err) {
        console.error("Error creating column:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Insert log (only if userId provided)
      if (userId) {
        addLog(projectId, userId, `Created new column "${title}"`);
      } else {
        console.warn("No userId provided for column create log, skipping insert.");
      }

      res.json({
        id: result.insertId,
        project_id: projectId,
        title,
        color,
        position
      });
    }
  );
});

// PUT /columns/:id/position
app.put("/columns/:id/position", (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  db.query(
    "UPDATE columns SET position = ? WHERE id = ?",
    [position, id],
    (err) => {
      if (err) {
        console.error("Error updating column position:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

// Update column
app.put("/columns/:id", (req, res) => {
  const { id } = req.params;
  const { title, color, userId } = req.body; // include userId from frontend

  // Fetch old column values
  const getOldSql = "SELECT title, color, project_id FROM columns WHERE id = ?";
  db.query(getOldSql, [id], (getErr, oldRows) => {
    if (getErr) {
      console.error("Error fetching old column:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!oldRows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const oldTitle = oldRows[0].title;
    const oldColor = oldRows[0].color;
    const projectId = oldRows[0].project_id;

    // Perform update
    db.query(
      "UPDATE columns SET title = ?, color = ? WHERE id = ?",
      [title, color, id],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating column:", updateErr);
          return res.status(500).json({ success: false });
        }

        // Insert log if userId provided
        if (userId) {
          const logMsg = `Updated column Title from "${oldTitle}" → "${title}" | (color: ${oldColor || "none"}) → (color: ${color || "none"})`;
          addLog(projectId, userId, logMsg);
        } else {
          console.warn("No userId provided for column update log, skipping insert.");
        }

        res.json({ success: true });
      }
    );
  });
});

// Delete column and its tasks
app.delete("/columns/:id", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  // Fetch column info first
  const getSql = "SELECT title, project_id FROM columns WHERE id = ?";
  db.query(getSql, [id], (getErr, rows) => {
    if (getErr) {
      console.error("Error fetching column info:", getErr);
      return res.status(500).json({ success: false });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const { title, project_id } = rows[0];

    // Delete tasks inside the column first
    db.query("DELETE FROM tasks WHERE column_id = ?", [id], (err) => {
      if (err) {
        console.error("Error deleting tasks in column:", err);
        return res.status(500).json({ success: false });
      }

      // Delete the column itself
      db.query("DELETE FROM columns WHERE id = ?", [id], (err2) => {
        if (err2) {
          console.error("Error deleting column:", err2);
          return res.status(500).json({ success: false });
        }

        // Insert log (only if userId available)
        if (userId) {
          const logMsg = `Deleted column "${title}"`;
          addLog(project_id, userId, logMsg);
        } else {
          console.warn("No userId provided for column delete log, skipping insert.");
        }

        res.json({ success: true });
      });
    });
  });
});

// === TASKS ===

// Get tasks for a column
app.get("/columns/:columnId/tasks", (req, res) => {
  const { columnId } = req.params;
  db.query(
    "SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC",
    [columnId],
    (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ success: false });
      }
      res.json(results);
    }
  );
});

// Create a new task
app.post("/columns/:columnId/tasks", (req, res) => {
  const { columnId } = req.params;
  const { title, description, userId } = req.body;

  const projectSql = "SELECT project_id FROM columns WHERE id = ?";
  db.query(projectSql, [columnId], (projErr, projRows) => {
    if (projErr) {
      console.error("Error finding project_id:", projErr);
      return res.status(500).json({ success: false });
    }
    if (!projRows.length) {
      return res.status(404).json({ success: false, message: "Column not found" });
    }

    const projectId = projRows[0].project_id;

    // Find next position in this column
    db.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS nextPos FROM tasks WHERE column_id = ?",
      [columnId],
      (err, result) => {
        if (err) return res.status(500).json({ success: false });

        const nextPos = result[0].nextPos;

        // Insert task
        db.query(
          "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), ?)",
          [columnId, title, description, nextPos],
          (err2, insertResult) => {
            if (err2) {
              console.error("Error creating task:", err2);
              return res.status(500).json({ success: false });
            }

            // Insert log if userId is available
            if (userId) {
              addLog(projectId, userId, `Created task "${title}"`);
            }

            // Respond with new task
            res.json({
              id: insertResult.insertId,
              column_id: parseInt(columnId, 10),
              title,
              description,
              created_at: new Date(),
              position: nextPos,
            });
          }
        );
      }
    );
  });
});


// Bulk update task positions in a column / update task positions after drag-and-drop:
app.put("/columns/:columnId/tasks/reorder", (req, res) => {
  const { columnId } = req.params;
  const { orderedTaskIds } = req.body;

  if (!Array.isArray(orderedTaskIds)) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }

  // Build multiple update queries
  const queries = orderedTaskIds.map((taskId, index) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE tasks SET position = ? WHERE id = ? AND column_id = ?",
        [index, taskId, columnId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(queries)
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error("Error reordering tasks:", err);
      res.status(500).json({ success: false });
    });
});


// Update task
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, column_id, position, userId } = req.body;

  const getOldSql = "SELECT title, description, column_id, position FROM tasks WHERE id = ?";
  db.query(getOldSql, [id], (getErr, oldRows) => {
    if (getErr) return res.status(500).json({ success: false });
    if (!oldRows.length) return res.status(404).json({ success: false });

    const oldTitle = oldRows[0].title;
    const oldDesc = oldRows[0].description || "";
    const oldPos = oldRows[0].position;

    db.query(
      "UPDATE tasks SET title = ?, description = ?, column_id = ?, position = ? WHERE id = ?",
      [title, description, column_id, position, id],
      (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false });

        // fetch project_id for log
        const findSql = `
          SELECT c.project_id 
          FROM tasks t
          JOIN columns c ON t.column_id = c.id
          WHERE t.id = ?
        `;
        db.query(findSql, [id], (findErr, rows) => {
          if (findErr) return res.status(500).json({ success: false });
          if (!rows.length) return res.status(404).json({ success: false });

          const projectId = rows[0].project_id;

          if (userId) {
            const logMsg = `Updated task "${oldTitle}" → "${title}", description "${oldDesc}" → "${description}"`;
            addLog(projectId, userId, logMsg);
          }

          res.json({ success: true });
        });
      }
    );
  });
});


// Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  // Accept userId either in body (preferred for DELETE) or query fallback
  const userId = req.body?.userId ?? req.query?.userId;

  // Fetch project_id and title of the task
  const findSql = `
    SELECT c.project_id, t.title
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    WHERE t.id = ?
  `;
  db.query(findSql, [id], (err, rows) => {
    if (err) {
      console.error("Error looking up task/project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { project_id: projectId, title } = rows[0];

    // Now delete the task
    db.query("DELETE FROM tasks WHERE id = ?", [id], (delErr) => {
      if (delErr) {
        console.error("Error deleting task:", delErr);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      // Insert log (only if userId provided)
      if (userId) {
        addLog(projectId, userId, `Deleted task named "${title}"`);
      } else {
        console.warn("No userId supplied for task delete log, skipping insert.");
      }

      res.json({ success: true });
    });
  });
});



//===LOGS===


// Fetch logs for a specific project
app.get("/api/logs/:projectId", (req, res) => {
  const { projectId } = req.params;
  const { sort = "desc" } = req.query; // optional sort param

  const sql = `
    SELECT logs.*, user.userName 
    FROM logs 
    JOIN user ON logs.user_id = user.id 
    WHERE logs.project_id = ? 
    ORDER BY logs.created_at ${sort.toUpperCase() === "ASC" ? "ASC" : "DESC"}
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Create a new log entry
app.post("/api/logs", (req, res) => {
  const { project_id, user_id, description } = req.body;

  if (!project_id || !user_id || !description) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = "INSERT INTO logs (project_id, user_id, description) VALUES (?, ?, ?)";
  db.query(sql, [project_id, user_id, description], (err, result) => {
    if (err) {
      console.error("Error inserting log:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ id: result.insertId, project_id, user_id, description });
  });
});
