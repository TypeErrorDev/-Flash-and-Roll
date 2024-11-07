const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("Test endpoint hit");
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

// Get leaderboard scores
app.get("/api/scores", (req, res) => {
  console.log("Scores endpoint hit");
  db.all(
    `SELECT username, score, datetime(date, 'localtime') as date
     FROM leaderboard 
     ORDER BY score DESC 
     LIMIT 5`,
    (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("Sending top 5 scores:", rows);
      res.json(rows);
    }
  );
});

// Submit new score
app.post("/api/scores", (req, res) => {
  console.log("Received request body:", req.body);

  const { username, score, deckName } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "Username and score are required" });
  }

  db.run(
    `INSERT INTO leaderboard (username, score) VALUES (?, ?)`,
    [username, score],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        message: "Score saved successfully",
      });
    }
  );
});

// Check if a user exists
app.get("/api/users/:username", (req, res) => {
  const { username } = req.params;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row); // User exists
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
});

// Create a new user
app.post("/api/users", (req, res) => {
  console.log("Request body:", req.body);
  const { username, displayName } = req.body;
  if (!username || !displayName) {
    return res
      .status(400)
      .json({ error: "Username and display name are required" });
  }

  console.log(`Creating user: ${username}, ${displayName}`);

  db.run(
    `INSERT INTO users (username, displayName) VALUES (?, ?)`,
    [username, displayName],
    function (err) {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`User created with ID: ${this.lastID}`);
      res.json({ id: this.lastID, message: "User created successfully" });
    }
  );
});

// Create a new deck
app.post("/api/decks", (req, res) => {
  const { userId, name, category, flashcards } = req.body;
  if (!userId || !name || !flashcards) {
    return res
      .status(400)
      .json({ error: "User ID, name, and flashcards are required" });
  }

  db.run(
    `INSERT INTO decks (userId, name, category, flashcards) VALUES (?, ?, ?, ?)`,
    [userId, name, category, JSON.stringify(flashcards)],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: "Deck created successfully" });
    }
  );
});

// Get decks for a user
app.get("/api/users/:userId/decks", (req, res) => {
  const { userId } = req.params;
  db.all(`SELECT * FROM decks WHERE userId = ?`, [userId], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(
      rows.map((row) => ({
        ...row,
        flashcards: JSON.parse(row.flashcards),
      }))
    );
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add a catch-all route for debugging
app.use((req, res) => {
  console.log("404 for route:", req.url);
  res.status(404).json({ error: "Route not found" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
