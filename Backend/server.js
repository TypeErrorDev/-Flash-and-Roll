const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

// Database test endpoint
app.get("/api/test-db", (req, res) => {
  db.get("SELECT sqlite_version()", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "Database is connected!",
      sqliteVersion: row["sqlite_version()"],
    });
  });
});

// Add these endpoints for the leaderboard
app.get("/api/scores", (req, res) => {
  db.all(
    `SELECT username, score, date 
     FROM leaderboard 
     ORDER BY score DESC 
     LIMIT 10`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

app.post("/api/scores", (req, res) => {
  const { username, score } = req.body;

  if (!username || !score) {
    res.status(400).json({ error: "Username and score are required" });
    return;
  }

  db.run(
    `INSERT INTO leaderboard (username, score) 
     VALUES (?, ?)`,
    [username, score],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
