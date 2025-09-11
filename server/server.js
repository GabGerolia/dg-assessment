const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();


// allow JSON in requests
app.use(express.json());

app.use(cors({ origin: ["http://localhost:5173"] }));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "050503",
  database: "myDB"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

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

  const sql = "INSERT INTO projects (user_id, title, description) VALUES (?, ?, ?)";
  db.query(sql, [userId, title, description], (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true, id: result.insertId });
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
  const { title, description } = req.body;
  const sql = "UPDATE projects SET title = ?, description = ? WHERE id = ?";
  db.query(sql, [title, description, id], (err, result) => {
    if (err) {
      console.error("Error updating project:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    res.json({ success: true });
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
  const { title, color, position } = req.body;

  db.query(
    "INSERT INTO columns (project_id, title, color, position) VALUES (?, ?, ?, ?)",
    [projectId, title, color || null, position || 0],
    (err, result) => {
      if (err) {
        console.error("Error creating column:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ id: result.insertId, project_id: projectId, title, color, position });
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
  const { title, color } = req.body;

  db.query(
    "UPDATE columns SET title = ?, color = ? WHERE id = ?",
    [title, color, id],
    (err) => {
      if (err) {
        console.error("Error updating column:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});


// Delete column and its tasks
app.delete("/columns/:id", (req, res) => {
  const { id } = req.params;

  // First delete tasks inside the column (to maintain referential integrity)
  db.query("DELETE FROM tasks WHERE column_id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting tasks in column:", err);
      return res.status(500).json({ success: false });
    }

    // Then delete the column itself
    db.query("DELETE FROM columns WHERE id = ?", [id], (err2) => {
      if (err2) {
        console.error("Error deleting column:", err2);
        return res.status(500).json({ success: false });
      }

      res.json({ success: true });
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
  const { title, description } = req.body;

  // find max position in that column
  db.query(
    "SELECT COALESCE(MAX(position), -1) + 1 AS nextPos FROM tasks WHERE column_id = ?",
    [columnId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false });

      const nextPos = result[0].nextPos;

      db.query(
        "INSERT INTO tasks (column_id, title, description, created_at, position) VALUES (?, ?, ?, NOW(), ?)",
        [columnId, title, description, nextPos],
        (err2, insertResult) => {
          if (err2) {
            console.error("Error creating task:", err2);
            return res.status(500).json({ success: false });
          }

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
  const { title, description, column_id } = req.body; // column_id optional (for moving)
  db.query(
    "UPDATE tasks SET title = ?, description = ?, column_id = ? WHERE id = ?",
    [title, description, column_id, id],
    (err) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    }
  );
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});



